/**
 * PA-API Client Implementation (T022, T023, T049)
 * 
 * Implements Amazon Product Advertising API 5.0 client with AWS Signature V4 authentication.
 * 
 * Features:
 * - AWS Signature V4 request signing using aws4fetch library
 * - GetItems API support for fetching product data
 * - Comprehensive error handling with typed error codes
 * - Request timeout handling (10 seconds default)
 * - Type-safe request/response structures
 * - Circuit breaker protection against cascade failures (T049)
 * 
 * @see https://webservices.amazon.com/paapi5/documentation/
 */

import { AwsClient } from "https://esm.sh/aws4fetch@1.0.18";

import type {
  PaapiConfig,
  PaapiGetItemsRequest,
  PaapiGetItemsResponse,
  PaapiSearchItemsRequest,
  PaapiSearchItemsResponse,
  PaapiError,
} from "./types.ts";
import { PaapiErrorCode } from "./types.ts";
import { ErrorCode } from "./errors.ts";
import { CircuitBreaker, CircuitOpenError, CircuitState } from "./circuit-breaker.ts";
import { Logger, LogLevel } from "./logger.ts";

/**
 * Export types for use in tests and other modules
 */
export type { PaapiConfig, PaapiGetItemsRequest as GetItemsRequest, PaapiGetItemsResponse as GetItemsResponse, PaapiSearchItemsRequest as SearchItemsRequest, PaapiSearchItemsResponse as SearchItemsResponse };

/**
 * Singleton circuit breaker instance for PA-API calls
 * 
 * Protects against cascade failures during PA-API outages by:
 * - Opening circuit after 5 consecutive failures
 * - Blocking requests for 5 minutes when OPEN
 * - Auto-recovery via HALF_OPEN state
 * 
 * All PA-API clients share this circuit breaker to provide
 * system-wide protection.
 */
const paapiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  cooldownTimeout: 5 * 60 * 1000, // 5 minutes
  name: "paapi-client",
});

/**
 * Get the shared PA-API circuit breaker instance
 * 
 * @returns Circuit breaker instance
 */
export function getPaapiCircuitBreaker(): CircuitBreaker {
  return paapiCircuitBreaker;
}

/**
 * PA-API Request structure for internal use
 */
interface PaapiRequestBody {
  ItemIds: string[];
  PartnerTag: string;
  PartnerType: string;
  Marketplace?: string;
  Resources: string[];
}

/**
 * Request structure for signature generation
 */
interface SignableRequest {
  method: string;
  url: string;
  headers: Headers;
  body: string;
}

/**
 * PA-API Client Error
 */
export class PaapiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "PaapiClientError";
  }
}

/**
 * PA-API Client
 * 
 * Handles authentication, request signing, and communication with Amazon Product Advertising API.
 * 
 * @example
 * ```typescript
 * const client = new PaapiClient({
 *   accessKey: "AKIAIOSFODNN7EXAMPLE",
 *   secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
 *   partnerTag: "mytag-20",
 *   marketplace: "www.amazon.com",
 *   region: "us-east-1",
 * });
 * 
 * const response = await client.getItems({
 *   itemIds: ["B08DQQ8CBP"],
 *   resources: ["ItemInfo.Title", "Offers.Listings.Price"],
 * });
 * ```
 */
export class PaapiClient {
  private readonly config: PaapiConfig;
  private readonly timeout: number;
  private readonly awsClient: AwsClient;
  private readonly logger: Logger;

  /**
   * Create a new PA-API client
   * 
   * @param config - Client configuration with credentials and marketplace settings
   * @param timeout - Request timeout in milliseconds (default: 10000)
   * @throws {PaapiClientError} If configuration is invalid
   */
  constructor(config: PaapiConfig, timeout = 10000) {
    this.validateConfig(config);
    this.config = config;
    this.timeout = timeout;
    
    // Initialize AWS client for signature V4 signing
    this.awsClient = new AwsClient({
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
      region: config.region,
      service: "ProductAdvertisingAPI",
    });

    // Initialize logger
    this.logger = new Logger({
      minLevel: LogLevel.INFO,
    });
  }

  /**
   * Validate client configuration
   * 
   * @throws {PaapiClientError} If required configuration is missing
   */
  private validateConfig(config: Partial<PaapiConfig>): void {
    const required: (keyof PaapiConfig)[] = [
      "accessKey",
      "secretKey",
      "partnerTag",
      "marketplace",
      "region",
    ];

    for (const field of required) {
      if (!config[field]) {
        throw new PaapiClientError(
          `Missing required configuration: ${field}`,
          "INVALID_CONFIG"
        );
      }
    }
  }

  /**
   * Fetch product information from PA-API using GetItems operation
   * 
   * Protected by circuit breaker to prevent cascade failures during PA-API outages.
   * 
   * @param request - GetItems request with item IDs and resources to fetch
   * @returns Promise resolving to PA-API response with product data
   * @throws {PaapiClientError} If request fails or times out
   * @throws {CircuitOpenError} If circuit breaker is OPEN
   * 
   * @example
   * ```typescript
   * const response = await client.getItems({
   *   itemIds: ["B08DQQ8CBP"],
   *   resources: [
   *     "ItemInfo.Title",
   *     "Images.Primary.Large",
   *     "Offers.Listings.Price",
   *   ],
   * });
   * ```
   */
  async getItems(request: PaapiGetItemsRequest): Promise<PaapiGetItemsResponse> {
    // Log circuit breaker state before making request
    const circuitState = paapiCircuitBreaker.getState();
    this.logger.info("PA-API request starting", {
      circuitState: circuitState.state,
      itemCount: request.itemIds.length,
      marketplace: this.config.marketplace,
    });

    // Execute request through circuit breaker
    try {
      const response = await paapiCircuitBreaker.execute(async () => {
        return await this.executeGetItems(request);
      });

      this.logger.info("PA-API request succeeded", {
        itemCount: request.itemIds.length,
        circuitState: paapiCircuitBreaker.getState().state,
      });

      return response;
    } catch (error) {
      // If circuit is open, log and re-throw
      if (error instanceof CircuitOpenError) {
        this.logger.warn("PA-API request blocked by circuit breaker", {
          circuitState: CircuitState.OPEN,
          retryAfter: error.retryAfter,
          itemCount: request.itemIds.length,
        });
        throw error;
      }

      // Log other errors
      this.logger.error("PA-API request failed", error as Error, {
        itemCount: request.itemIds.length,
        circuitState: paapiCircuitBreaker.getState().state,
      });

      throw error;
    }
  }

  /**
   * Search for products using PA-API SearchItems operation
   *
   * Protected by circuit breaker to prevent cascade failures during PA-API outages.
   *
   * @param request - SearchItems request with keywords and search parameters
   * @returns Promise resolving to PA-API response with search results
   * @throws {PaapiClientError} If request fails or times out
   * @throws {CircuitOpenError} If circuit breaker is OPEN
   *
   * @example
   * ```typescript
   * const response = await client.searchItems({
   *   Keywords: "ESP32",
   *   SearchIndex: "Electronics",
   *   ItemCount: 10,
   *   Resources: [
   *     "ItemInfo.Title",
   *     "Images.Primary.Large",
   *     "Offers.Listings.Price",
   *   ],
   * });
   * ```
   */
  async searchItems(request: PaapiSearchItemsRequest): Promise<PaapiSearchItemsResponse> {
    // Log circuit breaker state before making request
    const circuitState = paapiCircuitBreaker.getState();
    this.logger.info("PA-API search request starting", {
      circuitState: circuitState.state,
      keywords: request.Keywords,
      searchIndex: request.SearchIndex || "All",
      itemCount: request.ItemCount || 10,
      marketplace: this.config.marketplace,
    });

    // Execute request through circuit breaker
    try {
      const response = await paapiCircuitBreaker.execute(async () => {
        return await this.executeSearchItems(request);
      });

      this.logger.info("PA-API search request succeeded", {
        keywords: request.Keywords,
        resultCount: response.SearchResult?.Items?.length || 0,
        totalResults: response.SearchResult?.TotalResultCount || 0,
        circuitState: paapiCircuitBreaker.getState().state,
      });

      return response;
    } catch (error) {
      // If circuit is open, log and re-throw
      if (error instanceof CircuitOpenError) {
        this.logger.warn("PA-API search request blocked by circuit breaker", {
          circuitState: CircuitState.OPEN,
          retryAfter: error.retryAfter,
          keywords: request.Keywords,
        });
        throw error;
      }

      // Log other errors
      this.logger.error("PA-API search request failed", error as Error, {
        keywords: request.Keywords,
        circuitState: paapiCircuitBreaker.getState().state,
      });

      throw error;
    }
  }

  /**
   * Execute SearchItems request (internal method for circuit breaker wrapping)
   *
   * @param request - SearchItems request
   * @returns Promise resolving to PA-API response
   * @throws {PaapiClientError} If request fails
   */
  private async executeSearchItems(request: PaapiSearchItemsRequest): Promise<PaapiSearchItemsResponse> {
    const endpoint = this.getEndpoint("SearchItems");
    const requestBody = this.buildSearchItemsRequest(request);
    const body = JSON.stringify(requestBody);

    // Build headers for SearchItems
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
      "Content-Encoding": "amz-1.0",
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Use aws4fetch to sign and make the request
      const response = await this.awsClient.fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      // Check for errors
      if (!response.ok) {
        throw this.handlePaapiError(data, response.status);
      }

      // Validate response structure
      if (data.Errors && data.Errors.length > 0) {
        throw this.handlePaapiError(data, response.status);
      }

      return data as PaapiSearchItemsResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new PaapiClientError(
          `Search request timeout after ${this.timeout}ms`,
          "TIMEOUT"
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new PaapiClientError(
          `Network error: ${error.message}`,
          "NETWORK_ERROR",
          error
        );
      }

      // Re-throw PA-API client errors
      if (error instanceof PaapiClientError) {
        throw error;
      }

      // Handle unknown errors
      throw new PaapiClientError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        "UNKNOWN_ERROR",
        error
      );
    }
  }

  /**
   * Build SearchItems request body
   *
   * @param request - SearchItems request parameters
   * @returns Request body for PA-API
   */
  private buildSearchItemsRequest(request: PaapiSearchItemsRequest) {
    return {
      Keywords: request.Keywords,
      SearchIndex: request.SearchIndex || "All",
      ItemCount: request.ItemCount || 10,
      ItemPage: request.ItemPage || 1,
      Resources: request.Resources || [
        "ItemInfo.Title",
        "Images.Primary.Large",
        "Offers.Listings.Price",
        "CustomerReviews.StarRating",
      ],
      PartnerTag: this.config.partnerTag,
      PartnerType: "Associates",
      // Note: Marketplace is NOT included - it's determined by the endpoint domain
    };
  }

  /**
   * Execute GetItems request (internal method for circuit breaker wrapping)
   * 
   * @param request - GetItems request
   * @returns Promise resolving to PA-API response
   * @throws {PaapiClientError} If request fails
   */
  private async executeGetItems(request: PaapiGetItemsRequest): Promise<PaapiGetItemsResponse> {
    const endpoint = this.getEndpoint("GetItems");
    const requestBody = this.buildGetItemsRequest(request);
    const body = JSON.stringify(requestBody);

    // Build headers
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      "Content-Encoding": "amz-1.0",
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Use aws4fetch to sign and make the request
      // This handles all AWS Signature V4 signing automatically
      const response = await this.awsClient.fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      // Check for errors
      if (!response.ok) {
        throw this.handlePaapiError(data, response.status);
      }

      // Validate response structure
      if (data.Errors && data.Errors.length > 0) {
        throw this.handlePaapiError(data, response.status);
      }

      return data as PaapiGetItemsResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new PaapiClientError(
          `Request timeout after ${this.timeout}ms`,
          "TIMEOUT"
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new PaapiClientError(
          `Network error: ${error.message}`,
          "NETWORK_ERROR",
          error
        );
      }

      // Re-throw PA-API client errors
      if (error instanceof PaapiClientError) {
        throw error;
      }

      // Handle unknown errors
      throw new PaapiClientError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        "UNKNOWN_ERROR",
        error
      );
    }
  }

  /**
   * Build PA-API GetItems request body from simplified request
   * 
   * @param request - Simplified request with item IDs and resources
   * @returns PA-API formatted request body
   */
  buildGetItemsRequest(request: PaapiGetItemsRequest): PaapiRequestBody {
    return {
      ItemIds: request.itemIds,
      Resources: request.resources,
      PartnerTag: this.config.partnerTag,
      PartnerType: "Associates",
      Marketplace: this.config.marketplace,
    };
  }

  /**
   * Generate AWS Signature V4 for PA-API request (for testing)
   * 
   * This method is exposed for unit testing purposes.
   * In production, aws4fetch handles signing automatically via this.awsClient.fetch()
   * 
   * @param request - Request to sign
   * @returns Headers with AWS Signature V4 authorization
   */
  generateSignatureV4(request: SignableRequest): Headers {
    // For testing: simulate what aws4fetch does
    const headers = new Headers(request.headers);
    const now = new Date();
    const amzDate = this.getAmzDate(now);
    
    headers.set("X-Amz-Date", amzDate);
    headers.set("Host", new URL(request.url).host);
    
    // Add a mock authorization header for testing
    // In real usage, aws4fetch generates the actual signature
    const credentialScope = `${this.getDateStamp(now)}/${this.config.region}/ProductAdvertisingAPI/aws4_request`;
    headers.set(
      "Authorization",
      `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=test-signature`
    );
    
    return headers;
  }

  /**
   * Get PA-API endpoint URL
   * 
   * @param operation - The PA-API operation (GetItems or SearchItems)
   * @returns The full endpoint URL for the operation
   */
  private getEndpoint(operation: "GetItems" | "SearchItems" = "GetItems"): string {
    // PA-API 5.0 base endpoints by region
    const baseEndpoints: Record<string, string> = {
      "us-east-1": "https://webservices.amazon.com/paapi5",
      "eu-west-1": "https://webservices.amazon.de/paapi5",
      "us-west-2": "https://webservices.amazon.com/paapi5",
      "ap-northeast-1": "https://webservices.amazon.co.jp/paapi5",
    };

    const baseEndpoint = baseEndpoints[this.config.region] || baseEndpoints["us-east-1"]!;
    const operationPath = operation === "SearchItems" ? "searchitems" : "getitems";
    
    return `${baseEndpoint}/${operationPath}`;
  }

  /**
   * Handle PA-API error responses with comprehensive error mapping
   * 
   * Maps PA-API error codes to standardized ErrorCode enum values.
   * Preserves original PA-API error details for debugging.
   * 
   * @param data - PA-API response containing errors
   * @param status - HTTP status code from PA-API
   * @returns PaapiClientError with mapped error code
   */
  private handlePaapiError(data: { Errors?: PaapiError[] }, status: number): PaapiClientError {
    if (data.Errors && data.Errors.length > 0) {
      const error = data.Errors[0]!;
      const paapiCode = error.Code;
      const paapiMessage = error.Message || "PA-API request failed";
      
      // Log the full error details for debugging
      this.logger.error("PA-API returned error", undefined, {
        code: paapiCode,
        message: paapiMessage,
        httpStatus: status,
        fullError: error,
      });
      
      // Map PA-API error codes to standardized ErrorCode enum
      let mappedCode: string;
      let userFriendlyMessage: string;
      
      switch (paapiCode) {
        case PaapiErrorCode.ItemNotAccessible:
          mappedCode = ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE;
          userFriendlyMessage = "The requested item is not accessible or does not exist in this marketplace";
          break;
          
        case PaapiErrorCode.TooManyRequests:
        case PaapiErrorCode.RequestThrottled:
          mappedCode = ErrorCode.PAAPI_THROTTLED;
          userFriendlyMessage = "PA-API request rate limit exceeded. Please retry after some time";
          break;
          
        case PaapiErrorCode.InvalidParameterValue:
          mappedCode = ErrorCode.PAAPI_INVALID_PARAMETER;
          userFriendlyMessage = "Invalid parameter value provided to PA-API";
          break;
          
        case PaapiErrorCode.InvalidPartnerTag:
          mappedCode = ErrorCode.PAAPI_ERROR;
          userFriendlyMessage = "Invalid Amazon Partner Tag configuration";
          break;
          
        case PaapiErrorCode.InvalidSignature:
        case PaapiErrorCode.AccessDenied:
          mappedCode = ErrorCode.PAAPI_ERROR;
          userFriendlyMessage = "PA-API authentication failed. Check access credentials";
          break;
          
        case PaapiErrorCode.ResourceNotFound:
          mappedCode = ErrorCode.PAAPI_ERROR;
          userFriendlyMessage = "Requested resource not found in PA-API";
          break;
          
        default:
          mappedCode = ErrorCode.PAAPI_ERROR;
          userFriendlyMessage = paapiMessage;
      }
      
      // Return error with mapped code, user-friendly message, and original details
      return new PaapiClientError(
        userFriendlyMessage,
        mappedCode,
        {
          originalCode: paapiCode,
          originalMessage: paapiMessage,
          httpStatus: status,
          fullResponse: data,
        }
      );
    }

    // No specific error in response - return generic error
    return new PaapiClientError(
      `PA-API request failed with status ${status}`,
      ErrorCode.PAAPI_ERROR,
      { httpStatus: status, response: data }
    );
  }

  /**
   * Get ISO 8601 timestamp for X-Amz-Date header
   */
  private getAmzDate(date: Date): string {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  }

  /**
   * Get date stamp for credential scope
   */
  private getDateStamp(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
}

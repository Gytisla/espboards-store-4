/**
 * Search Products Edge Function
 *
 * POST /search-products
 *
 * Searches for products on Amazon PA-API and returns formatted results.
 *
 * Request Body:
 * {
 *   "query": "ESP32",
 *   "marketplace": "US"
 * }
 *
 * Response (Success):
 * {
 *   "results": [
 *     {
 *       "asin": "B08DQQ8CBP",
 *       "title": "ESP32 Development Board",
 *       "images": [{"url": "...", "width": 500, "height": 500}],
 *       "pricing": {"amount": 19.99, "currency": "USD", "display": "$19.99"},
 *       "rating": {"value": 4.5, "count": 128},
 *       "url": "https://amazon.com/dp/B08DQQ8CBP"
 *     }
 *   ],
 *   "correlation_id": "uuid"
 * }
 *
 * Response (Error):
 * {
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Error message",
 *     "details": {}
 *   },
 *   "correlation_id": "uuid"
 * }
 *
 * Constitution Compliance:
 * - TDD: Tests written first (T093), implementation follows
 * - API Design: RESTful, JSON, consistent error responses
 * - Code Quality: <50 lines per function, JSDoc comments
 * - Observability: Correlation IDs, structured logging
 * - Performance: <3s for search API calls with circuit breaker protection
 */

// Import shared utilities
import { Logger, generateCorrelationId, LogLevel } from "../_shared/logger.ts";
import { createErrorResponse, ErrorCode } from "../_shared/errors.ts";
import { validateSearchProducts } from "../_shared/validation.ts";
import { PaapiClient, PaapiClientError, type SearchItemsRequest } from "../_shared/paapi-client.ts";
import { CircuitOpenError } from "../_shared/circuit-breaker.ts";
import type { PaapiSearchItemsResponse, SearchProduct } from "../_shared/types.ts";

// Suppress unused import warnings - all imports now in use
// (removed void createClient as it's now being used in T094)

/**
 * CORS headers for development
 *
 * Note: In production, restrict to specific origins
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Main Edge Function handler
 *
 * Handles:
 * - OPTIONS requests (CORS preflight)
 * - POST requests (search products)
 *
 * @param req - Incoming HTTP request
 * @returns HTTP response
 */
async function handler(req: Request): Promise<Response> {
  // Generate correlation ID for request tracing
  const correlationId = generateCorrelationId();

  // Initialize logger with correlation ID
  const logger = new Logger({
    minLevel: LogLevel.INFO,
    correlationId,
  });

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    logger.warn("Method not allowed", { method: req.method });

    const errorResponse = createErrorResponse({
      code: ErrorCode.VALIDATION_ERROR,
      message: `Method ${req.method} not allowed. Use POST.`,
      correlationId,
    });

    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Allow": "POST, OPTIONS",
      },
    });
  }

  try {
    // Log request start with correlation ID
    logger.info("Search products request started", {
      method: req.method,
      url: req.url,
      correlation_id: correlationId,
    });

    // Parse request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch (error) {
      logger.warn("Failed to parse request body", {
        error: error instanceof Error ? error.message : String(error)
      });

      const errorResponse = createErrorResponse({
        code: ErrorCode.INVALID_REQUEST_BODY,
        message: "Invalid JSON in request body",
        correlationId,
        details: { error: error instanceof Error ? error.message : String(error) },
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    // Validate request body with Zod schema
    const validationResult = validateSearchProducts(requestBody);

    if (!validationResult.success) {
      logger.warn("Request validation failed", {
        error: validationResult.error,
      });

      const errorResponse = createErrorResponse({
        code: ErrorCode.VALIDATION_ERROR,
        message: validationResult.error.message,
        correlationId,
        details: {
          validationErrors: validationResult.error.details,
        },
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    // Extract validated data
    const { query, marketplace } = validationResult.data;

    // Log validated request with correlation ID
    logger.info("Request validated successfully", {
      query,
      marketplace,
      correlation_id: correlationId,
    });

    // Initialize PA-API client with credentials from environment
    const paapiAccessKey = Deno.env.get("PAAPI_ACCESS_KEY");
    const paapiSecretKey = Deno.env.get("PAAPI_SECRET_KEY");
    const paapiPartnerTag = Deno.env.get(`PAAPI_PARTNER_TAG_${marketplace}`);
    const paapiEndpoint = Deno.env.get(`PAAPI_ENDPOINT_${marketplace}`);

    // Validate PA-API credentials are present
    if (!paapiAccessKey || !paapiSecretKey || !paapiPartnerTag || !paapiEndpoint) {
      logger.error("Missing PA-API credentials", undefined, {
        hasAccessKey: !!paapiAccessKey,
        hasSecretKey: !!paapiSecretKey,
        hasPartnerTag: !!paapiPartnerTag,
        hasEndpoint: !!paapiEndpoint,
        marketplace,
      });

      const errorResponse = createErrorResponse({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "PA-API configuration error",
        correlationId,
        details: { error: "Missing PA-API credentials" },
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    // Determine region from marketplace
    const regionMap: Record<string, string> = {
      "US": "us-east-1",
      "DE": "eu-west-1",
    };
    const region = regionMap[marketplace] || "us-east-1";

    // Map marketplace code to actual Amazon marketplace domain
    const marketplaceDomainMap: Record<string, string> = {
      "US": "www.amazon.com",
      "DE": "www.amazon.de",
    };
    const marketplaceDomain = marketplaceDomainMap[marketplace] || "www.amazon.com";

    // Initialize PA-API client
    const paapiConfig = {
      accessKey: paapiAccessKey,
      secretKey: paapiSecretKey,
      partnerTag: paapiPartnerTag,
      marketplace: marketplaceDomain,
      region,
    };

    const paapiClient = new PaapiClient(paapiConfig);

    // Define Resources list for PA-API SearchItems request
    // Note: SearchItems supports fewer resources than GetItems
    const resources = [
      // Images - Primary Large image
      "Images.Primary.Large",

      // Item Information
      "ItemInfo.Title",

      // Offers and Pricing
      "Offers.Listings.Price",

      // Customer Reviews
      "CustomerReviews.StarRating",
    ];

    // Log PA-API search request start with correlation ID
    logger.info("Searching products on PA-API", {
      query,
      marketplace,
      resourceCount: resources.length,
      correlation_id: correlationId,
    });

    const searchStartTime = Date.now();

    try {
      // Call PA-API SearchItems with comprehensive Resources
      const searchRequest: SearchItemsRequest = {
        Keywords: query,
        SearchIndex: "Electronics", // Focus on electronics for ESP32 products
        ItemCount: 10, // Limit to 10 results for performance
        Resources: resources,
      };

      const paapiResponse = await paapiClient.searchItems(searchRequest);

      const searchDuration = Date.now() - searchStartTime;

      // Log PA-API search call duration and response status
      logger.info("PA-API search request completed", {
        query,
        duration_ms: searchDuration,
        hasItems: !!paapiResponse.SearchResult?.Items,
        itemCount: paapiResponse.SearchResult?.Items?.length || 0,
        totalResults: paapiResponse.SearchResult?.TotalResultCount || 0,
        correlation_id: correlationId,
        success: true,
      });

      // Transform PA-API response to standardized format
      const transformedResults = transformSearchResults(paapiResponse, marketplace);

      // Return successful response
      const response = {
        results: transformedResults,
        correlation_id: correlationId,
      };

      logger.info("Search products request completed", {
        query,
        resultCount: transformedResults.length,
        correlation_id: correlationId,
      });

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });

    } catch (error) {
      const searchDuration = Date.now() - searchStartTime;

      // Handle CircuitOpenError - circuit breaker protecting against PA-API failures
      if (error instanceof CircuitOpenError) {
        logger.warn("PA-API search request blocked by circuit breaker", {
          query,
          duration_ms: searchDuration,
          retryAfter: error.retryAfter,
          correlation_id: correlationId,
        });

        const errorResponse = createErrorResponse({
          code: ErrorCode.PAAPI_ERROR,
          message: "Service temporarily unavailable due to PA-API issues. Please try again later.",
          correlationId,
          details: {
            circuitBreakerOpen: true,
            retryAfterMs: error.retryAfter,
            retryAfterSeconds: Math.ceil(error.retryAfter / 1000),
          },
        });

        return new Response(JSON.stringify(errorResponse), {
          status: 503, // Service Unavailable
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(error.retryAfter / 1000)), // Seconds
          },
        });
      }

      // Handle PA-API client errors
      if (error instanceof PaapiClientError) {
        logger.error("PA-API search request failed", error, {
          query,
          duration_ms: searchDuration,
          errorCode: error.code,
          errorDetails: error.details,
          correlation_id: correlationId,
        });

        // Map PA-API error codes to HTTP status codes
        let statusCode = 502; // Bad Gateway (default for PA-API errors)
        let errorCode: ErrorCode = ErrorCode.PAAPI_ERROR;
        let errorMessage = error.message;

        switch (error.code) {
          case "PAAPI_INVALID_PARAMETER":
          case "InvalidParameterValue":
            statusCode = 400;
            errorCode = ErrorCode.PAAPI_INVALID_PARAMETER;
            errorMessage = `Invalid search parameter: ${error.message}`;
            break;

          case "PAAPI_THROTTLED":
          case "TooManyRequests":
            statusCode = 429;
            errorCode = ErrorCode.PAAPI_THROTTLED;
            errorMessage = "PA-API search request rate limit exceeded. Please try again later.";
            break;

          case "TIMEOUT":
            statusCode = 504; // Gateway Timeout
            errorCode = ErrorCode.PAAPI_TIMEOUT;
            errorMessage = "PA-API search request timed out. Please try again.";
            break;

          case "NETWORK_ERROR":
            statusCode = 502; // Bad Gateway
            errorCode = ErrorCode.PAAPI_ERROR;
            errorMessage = "Network error while communicating with PA-API";
            break;

          default:
            // Use error as-is for other PA-API errors
            break;
        }

        const errorResponse = createErrorResponse({
          code: errorCode,
          message: errorMessage,
          correlationId,
          details: {
            paapiError: error.code,
            paapiDetails: error.details,
            duration_ms: searchDuration,
            query,
          },
        });

        // Add Retry-After header for throttling errors
        const headers: HeadersInit = {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        };

        if (statusCode === 429) {
          headers["Retry-After"] = "60"; // Suggest retry after 60 seconds
        }

        return new Response(JSON.stringify(errorResponse), {
          status: statusCode,
          headers,
        });
      }

      // Re-throw unexpected errors to be caught by outer catch block
      throw error;
    }

  } catch (error) {
    // Catch-all error handler with full error details and stack trace
    logger.error(
      "Unexpected error in search-products function",
      error instanceof Error ? error : undefined,
      {
        errorDetails: error instanceof Error ? error.message : String(error),
        correlation_id: correlationId,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    const errorResponse = createErrorResponse({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      correlationId,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  }
}

/**
 * Transform PA-API search results to standardized format
 *
 * @param paapiResponse - Raw PA-API SearchItems response
 * @param marketplace - Marketplace code (US/DE)
 * @returns Array of standardized product objects
 */
function transformSearchResults(paapiResponse: PaapiSearchItemsResponse, marketplace: string): SearchProduct[] {
  const items = paapiResponse.SearchResult?.Items || [];

  return items.map((item) => {
    // Extract basic information
    const asin = item.ASIN;
    const title = item.ItemInfo?.Title?.DisplayValue || null;
    const detailPageUrl = item.DetailPageURL || null;

    // Extract images
    const images = item.Images?.Primary?.Large?.URL
      ? [
          {
            url: item.Images.Primary.Large.URL,
            width: item.Images.Primary.Large.Width || null,
            height: item.Images.Primary.Large.Height || null,
          },
        ]
      : null;

    // Extract pricing information
    const listing = item.Offers?.Listings?.[0];
    const currentPrice = listing?.Price?.Amount || null;
    const currency = listing?.Price?.Currency || null;

    // Format pricing for display
    let pricing = null;
    if (currentPrice && currency) {
      const formatter = new Intl.NumberFormat(
        marketplace === 'DE' ? 'de-DE' : 'en-US',
        {
          style: 'currency',
          currency: currency,
        }
      );
      pricing = {
        amount: currentPrice,
        currency,
        display: formatter.format(currentPrice),
      };
    }

    // Extract customer reviews
    const customerReviewCount = item.CustomerReviews?.Count || null;
    const starRating = item.CustomerReviews?.StarRating?.Value || null;

    // Format rating
    let rating = null;
    if (starRating) {
      rating = {
        value: starRating,
        count: customerReviewCount,
      };
    }

    return {
      asin,
      title,
      images,
      pricing,
      rating,
      url: detailPageUrl,
    };
  });
}

// Serve the function using Deno.serve (only when not in test mode)
if (import.meta.main) {
  Deno.serve(handler);
}

// Export handler for testing
export default handler;

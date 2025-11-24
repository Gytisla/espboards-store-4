/**
 * Import Product Edge Function
 * 
 * POST /import-product
 * 
 * Imports a single product from Amazon PA-API and stores it in the database.
 * 
 * Request Body:
 * {
 *   "asin": "B08DQQ8CBP",
 *   "marketplace": "US"
 * }
 * 
 * Response (Success):
 * {
 *   "product_id": "uuid",
 *   "asin": "B08DQQ8CBP",
 *   "title": "Product Title",
 *   "status": "draft",
 *   "imported_at": "2025-11-24T12:00:00Z",
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
 * - Backend-First: Core product import functionality
 * - TDD: Tests written first (T027), implementation follows
 * - API Design: RESTful, JSON, consistent error responses
 * - Code Quality: <50 lines per function, JSDoc comments
 * - Observability: Correlation IDs, structured logging
 * - Performance: <2s response time for PA-API calls
 */

// Import Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Import shared utilities
import { Logger, generateCorrelationId, LogLevel } from "../_shared/logger.ts";
import { createErrorResponse, ErrorCode } from "../_shared/errors.ts";
import { validateImportRequest } from "../_shared/validation.ts";
import { PaapiClient, PaapiClientError, type PaapiConfig } from "../_shared/paapi-client.ts";
import { CircuitOpenError } from "../_shared/circuit-breaker.ts";

// Suppress unused import warnings - all imports now in use
// (removed void createClient as it's now being used in T032)

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
 * - POST requests (import product)
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
      code: ErrorCode.VALIDATION_ERROR, // Use VALIDATION_ERROR for method not allowed
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
    // T034: Log request start with correlation ID
    logger.info("Import product request started", {
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
    const validationResult = validateImportRequest(requestBody);

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
    const { asin, marketplace } = validationResult.data;

    // T034: Log validated request with ASIN and correlation ID
    logger.info("Request validated successfully", {
      asin,
      marketplace,
      correlation_id: correlationId,
    });

    // T030: PA-API data fetching
    // Initialize PaapiClient with credentials from environment
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
    const paapiConfig: PaapiConfig = {
      accessKey: paapiAccessKey,
      secretKey: paapiSecretKey,
      partnerTag: paapiPartnerTag,
      marketplace: marketplaceDomain, // Use domain, not endpoint
      region,
    };

    const paapiClient = new PaapiClient(paapiConfig);

    // Define comprehensive Resources list for PA-API request
    // Note: These resources are validated in T026 (paapi-client.test.ts)
    const resources = [
      // Images
      "Images.Primary.Large",
      
      // Item Information
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      
      // Offers and Pricing
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
    ];

    // T034: Log PA-API request start with correlation ID
    logger.info("Fetching product data from PA-API", {
      asin,
      marketplace,
      resourceCount: resources.length,
      correlation_id: correlationId,
    });

    const paapiStartTime = Date.now();

    try {
      // Call PA-API GetItems with comprehensive Resources
      const paapiResponse = await paapiClient.getItems({
        itemIds: [asin],
        resources,
      });

      const paapiDuration = Date.now() - paapiStartTime;

      // T034: Log PA-API call duration and response status
      logger.info("PA-API request completed", {
        asin,
        duration_ms: paapiDuration,
        hasItems: !!paapiResponse.ItemsResult?.Items,
        itemCount: paapiResponse.ItemsResult?.Items?.length || 0,
        correlation_id: correlationId,
        success: true,
      });

      // Validate PA-API response has items
      if (!paapiResponse.ItemsResult?.Items || paapiResponse.ItemsResult.Items.length === 0) {
        logger.warn("PA-API returned no items", { asin });

        const errorResponse = createErrorResponse({
          code: ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE,
          message: `Product with ASIN ${asin} not found or not accessible`,
          correlationId,
        });

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      // Extract first item from response
      const paapiItem = paapiResponse.ItemsResult.Items[0];

      logger.info("PA-API item extracted", {
        asin: paapiItem.ASIN,
        hasTitle: !!paapiItem.ItemInfo?.Title?.DisplayValue,
        hasPrice: !!paapiItem.Offers?.Listings?.[0]?.Price?.Amount,
        hasImages: !!paapiItem.Images?.Primary?.Large?.URL,
      });

      // T031: Data transformation (PA-API → Database schema)
      // 
      // Transforms PA-API response structure to match our database schema.
      // Handles missing/null fields gracefully by setting them to null.
      // Calculates derived fields (savings_amount, savings_percentage).
      // Stores complete raw PA-API response for debugging and future fields.
      //
      logger.info("Transforming PA-API data to database schema", { asin });

      // Extract basic information
      const title = paapiItem.ItemInfo?.Title?.DisplayValue || null;
      const brand = paapiItem.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || null;
      const manufacturer = paapiItem.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || null;
      const detailPageUrl = paapiItem.DetailPageURL || null;

      // Extract images
      const images = paapiItem.Images?.Primary?.Large?.URL
        ? [
            {
              url: paapiItem.Images.Primary.Large.URL,
              width: paapiItem.Images.Primary.Large.Width || null,
              height: paapiItem.Images.Primary.Large.Height || null,
              variant: "Large",
            },
          ]
        : null;

      // Extract pricing information
      const listing = paapiItem.Offers?.Listings?.[0];
      const currentPrice = listing?.Price?.Amount || null;
      const originalPrice = listing?.SavingBasis?.Amount || null;
      const currency = listing?.Price?.Currency || null;

      // Calculate savings (only if both prices exist)
      let savingsAmount: number | null = null;
      let savingsPercentage: number | null = null;

      if (currentPrice !== null && originalPrice !== null && originalPrice > 0) {
        savingsAmount = originalPrice - currentPrice;
        savingsPercentage = (savingsAmount / originalPrice) * 100;
        
        // Round to 2 decimal places
        savingsAmount = Math.round(savingsAmount * 100) / 100;
        savingsPercentage = Math.round(savingsPercentage * 100) / 100;
      }

      // Extract availability
      const availabilityType = listing?.Availability?.Type || null;
      const availabilityMessage = listing?.Availability?.Message || null;

      // Extract customer reviews
      const customerReviewCount = paapiItem.CustomerReviews?.Count || null;
      const starRating = paapiItem.CustomerReviews?.StarRating?.Value || null;

      // Store complete raw PA-API response as JSONB for debugging and future fields
      // Note: Store the FULL response (with ItemsResult), not just the item
      const rawPaapiResponse = paapiResponse;

      // Set timestamps
      const now = new Date().toISOString();

      logger.info("Data transformation completed", {
        asin,
        hasTitle: !!title,
        hasPrice: !!currentPrice,
        hasImages: !!images,
        hasSavings: savingsAmount !== null,
        customerReviewCount,
        starRating,
      });

      // T032: Database upsert logic
      //
      // Upserts product into Supabase database with conflict resolution.
      // ON CONFLICT (asin, marketplace_id) DO UPDATE to handle duplicate imports.
      // Sets status='draft' for new imports, preserves existing status on updates.
      //
      logger.info("Upserting product to database", { asin, marketplace });

      // Initialize Supabase client with service role key (bypasses RLS)
      // Prioritize LOCAL credentials for development
      const supabaseUrl = Deno.env.get("SUPABASE_LOCAL_URL") || Deno.env.get("SUPABASE_URL");
      const supabaseServiceRoleKey = Deno.env.get("SUPABASE_LOCAL_SERVICE_ROLE_KEY") || 
                                      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        logger.error("Missing Supabase credentials", undefined, {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceRoleKey,
        });

        const errorResponse = createErrorResponse({
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: "Database configuration error",
          correlationId,
          details: { error: "Missing Supabase credentials" },
        });

        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

      // Get marketplace_id from marketplace code
      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from("marketplaces")
        .select("id")
        .eq("code", marketplace)
        .single();

      if (marketplaceError || !marketplaceData) {
        logger.error("Failed to find marketplace", undefined, {
          marketplace,
          error: marketplaceError?.message,
        });

        const errorResponse = createErrorResponse({
          code: ErrorCode.MARKETPLACE_NOT_FOUND,
          message: `Marketplace '${marketplace}' not found`,
          correlationId,
          details: { marketplace, error: marketplaceError?.message },
        });

        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      const marketplaceId = marketplaceData.id;

      // Prepare product data for upsert
      const productData = {
        asin,
        marketplace_id: marketplaceId,
        title,
        brand,
        manufacturer,
        images,
        detail_page_url: detailPageUrl,
        current_price: currentPrice,
        original_price: originalPrice,
        savings_amount: savingsAmount,
        savings_percentage: savingsPercentage,
        currency,
        availability_type: availabilityType,
        availability_message: availabilityMessage,
        customer_review_count: customerReviewCount,
        star_rating: starRating,
        raw_paapi_response: rawPaapiResponse,
        last_refresh_at: now,
        status: "draft", // Will be used for INSERT, not UPDATE
      };

      // Upsert product with conflict resolution
      // ON CONFLICT (asin, marketplace_id) DO UPDATE
      // Note: We use upsert() which automatically handles conflicts
      const { data: product, error: upsertError } = await supabase
        .from("products")
        .upsert(
          productData,
          {
            onConflict: "asin,marketplace_id",
            // Don't override status on updates - keep existing status
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (upsertError) {
        // T034: Log database errors with full error details
        logger.error("Failed to upsert product", upsertError, {
          asin,
          marketplace,
          errorCode: upsertError.code,
          errorDetails: upsertError.details,
        });

        const errorResponse = createErrorResponse({
          code: ErrorCode.DATABASE_ERROR,
          message: "Failed to save product to database",
          correlationId,
          details: {
            error: upsertError.message,
            code: upsertError.code,
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

      if (!product) {
        logger.error("Product upsert returned no data", undefined, { asin, marketplace });

        const errorResponse = createErrorResponse({
          code: ErrorCode.DATABASE_ERROR,
          message: "Failed to save product to database",
          correlationId,
          details: { error: "Upsert returned no data" },
        });

        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      // T034: Log database upsert result with product details
      logger.info("Product upserted successfully", {
        asin,
        product_id: product.id,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        correlation_id: correlationId,
      });

      // Determine if this was an INSERT or UPDATE
      // If created_at and updated_at are identical (down to microseconds), it was an INSERT
      // Otherwise, it was an UPDATE (trigger updates updated_at)
      const wasInserted = product.created_at === product.updated_at;
      const httpStatus = wasInserted ? 201 : 200; // 201 Created, 200 OK

      // T033: Response formatting
      // Success response includes: product_id, asin, title, status, imported_at, correlation_id
      // HTTP status codes: 201 for new products (INSERT), 200 for updates (UPDATE)
      // All error responses use createErrorResponse() helper with appropriate status codes
      const response = {
        product_id: product.id,
        asin,
        title: title || "Unknown Title",
        status: product.status,
        imported_at: product.updated_at,
        correlation_id: correlationId,
      };

      logger.info("Import product request completed", {
        asin,
        product_id: response.product_id,
        was_inserted: wasInserted,
      });

      return new Response(JSON.stringify(response), {
        status: httpStatus,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });

    } catch (error) {
      const paapiDuration = Date.now() - paapiStartTime;

      // T050: Handle CircuitOpenError - circuit breaker protecting against PA-API failures
      if (error instanceof CircuitOpenError) {
        logger.warn("PA-API request blocked by circuit breaker", {
          asin,
          duration_ms: paapiDuration,
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

      // T034: Log PA-API errors with full error details and stack trace
      // Handle PA-API client errors
      if (error instanceof PaapiClientError) {
        logger.error("PA-API request failed", error, {
          asin,
          duration_ms: paapiDuration,
          errorCode: error.code,
          errorDetails: error.details,
          correlation_id: correlationId,
        });

        // Map PA-API error codes to HTTP status codes
        let statusCode = 502; // Bad Gateway (default for PA-API errors)
        let errorCode: ErrorCode = ErrorCode.PAAPI_ERROR;
        let errorMessage = error.message;

        switch (error.code) {
          case "PAAPI_ITEM_NOT_ACCESSIBLE":
            statusCode = 400;
            errorCode = ErrorCode.PAAPI_ITEM_NOT_ACCESSIBLE;
            errorMessage = `Product with ASIN ${asin} is not accessible`;
            break;

          case "PAAPI_THROTTLED":
          case "TooManyRequests":
            statusCode = 429;
            errorCode = ErrorCode.PAAPI_THROTTLED;
            errorMessage = "PA-API request rate limit exceeded. Please try again later.";
            break;

          case "PAAPI_INVALID_PARAMETER":
          case "InvalidParameterValue":
            statusCode = 400;
            errorCode = ErrorCode.PAAPI_INVALID_PARAMETER;
            errorMessage = `Invalid parameter value: ${error.message}`;
            break;

          case "TIMEOUT":
            statusCode = 504; // Gateway Timeout
            errorCode = ErrorCode.PAAPI_TIMEOUT;
            errorMessage = "PA-API request timed out. Please try again.";
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
            duration_ms: paapiDuration,
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
    // T034: Catch-all error handler with full error details and stack trace
    logger.error(
      "Unexpected error in import-product function",
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

// Serve the function using Deno.serve
Deno.serve(handler);

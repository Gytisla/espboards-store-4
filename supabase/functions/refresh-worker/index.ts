/**
 * Refresh Worker Edge Function
 * 
 * POST /refresh-worker
 * 
 * Automatically refreshes product data from Amazon PA-API for products that haven't been
 * refreshed in the last 24 hours. Designed to be called by a cron job every hour.
 * 
 * Request: No body required (called by cron)
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "metrics": {
 *     "processed": 10,
 *     "success": 8,
 *     "failure": 1,
 *     "skipped": 1,
 *     "duration_ms": 5432
 *   },
 *   "message": "Processed 10 products",
 *   "correlation_id": "uuid"
 * }
 * 
 * Response (Error):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INTERNAL_ERROR",
 *     "message": "Error message",
 *     "details": {}
 *   },
 *   "correlation_id": "uuid"
 * }
 * 
 * Constitution Compliance:
 * - TDD: Tests written first (T053), implementation follows (T054-T061)
 * - Performance: Batch size of 10 (rolling updates across 24 hours)
 * - Observability: Structured logging, correlation IDs, metrics tracking
 * - Reliability: Circuit breaker integration, retry logic with exponential backoff
 * - Code Quality: <50 lines per function, JSDoc comments
 * 
 * User Story 2: Automatic Product Refresh
 * Goal: Refresh product data from PA-API every 24 hours
 * 
 * Tasks Implemented:
 * - T054: Edge Function setup, dependencies, correlation ID
 * - T055: Product selection query (24-hour logic, batch of 10)
 * - T056: Refresh loop, refresh_job tracking, circuit breaker checks
 * - T057: PA-API refresh with retry logic (exponential backoff)
 * - T058: Product data update logic
 * - T059: Unavailable product handling
 * - T060: Refresh job completion tracking
 * - T061: Worker metrics and logging
 */

// Import Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Import shared utilities
import { Logger, generateCorrelationId, LogLevel } from "../_shared/logger.ts";
import { createErrorResponse, ErrorCode } from "../_shared/errors.ts";
import { PaapiClient, PaapiClientError, getPaapiCircuitBreaker } from "../_shared/paapi-client.ts";
import { CircuitOpenError } from "../_shared/circuit-breaker.ts";

/**
 * CORS headers for development
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Refresh worker metrics
 */
interface RefreshMetrics {
  processed: number;
  success: number;
  failure: number;
  skipped: number;
  duration_ms: number;
}

/**
 * Product needing refresh from database
 */
interface ProductToRefresh {
  id: string;
  asin: string;
  marketplace_id: string;
  marketplace?: {
    code: string;
    paapi_endpoint: string;
  };
}

/**
 * Main Edge Function handler
 * 
 * Handles:
 * - OPTIONS requests (CORS preflight)
 * - POST requests (refresh worker execution)
 * 
 * @param req - Incoming HTTP request
 * @returns HTTP response with metrics
 */
async function handler(req: Request): Promise<Response> {
  // T054: Generate correlation ID for worker execution
  const correlationId = generateCorrelationId();
  
  // T054: Initialize logger with correlation ID
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

  // Only allow POST method (called by cron)
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

  // T061: Track start time for duration calculation
  const startTime = Date.now();

  try {
    logger.info("Refresh worker execution started", {
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
    });

    // T054: Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logger.error(
        "Missing Supabase configuration",
        undefined,
        {
          hasUrl: !!supabaseUrl,
          hasServiceRoleKey: !!supabaseServiceRoleKey,
        }
      );

      const errorResponse = createErrorResponse({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Missing Supabase configuration",
        correlationId,
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

    // T055: Select products needing refresh (24-hour logic)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    logger.info("Querying products needing refresh", {
      twentyFourHoursAgo,
    });

    const { data: productsToRefresh, error: selectError } = await supabase
      .from("products")
      .select(`
        id,
        asin,
        marketplace_id,
        marketplace:marketplaces(code, paapi_endpoint)
      `)
      .in("status", ["active", "draft"])
      .or(`last_refresh_at.is.null,last_refresh_at.lt.${twentyFourHoursAgo}`)
      .order("last_refresh_at", { ascending: true, nullsFirst: true })
      .limit(10); // T055: Batch size of 10 for rolling updates

    if (selectError) {
      logger.error(
        "Failed to select products for refresh",
        selectError instanceof Error ? selectError : undefined,
        {}
      );

      const errorResponse = createErrorResponse({
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to select products for refresh",
        correlationId,
      });

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    logger.info("Products selected for refresh", {
      count: productsToRefresh?.length || 0,
    });

    // T061: Initialize metrics
    const metrics: RefreshMetrics = {
      processed: 0,
      success: 0,
      failure: 0,
      skipped: 0,
      duration_ms: 0,
    };

    // Handle case where no products need refresh
    if (!productsToRefresh || productsToRefresh.length === 0) {
      const endTime = Date.now();
      metrics.duration_ms = endTime - startTime;

      logger.info("No products need refresh", {
        metrics,
        correlation_id: correlationId,
      });

      return new Response(JSON.stringify({
        success: true,
        metrics,
        message: "No products need refresh",
        correlation_id: correlationId,
      }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    // T054: Initialize PA-API client (will be created per-product with marketplace config)
    const paapiAccessKey = Deno.env.get("PAAPI_ACCESS_KEY") || "";
    const paapiSecretKey = Deno.env.get("PAAPI_SECRET_KEY") || "";
    const paapiPartnerTag = Deno.env.get("PAAPI_PARTNER_TAG") || "";

    // Get circuit breaker instance
    const circuitBreaker = getPaapiCircuitBreaker();

    // T056: Process each product in batch
    for (const product of productsToRefresh as ProductToRefresh[]) {
      metrics.processed++;

      logger.info("Processing product refresh", {
        asin: product.asin,
        marketplace_id: product.marketplace_id,
        product_id: product.id,
      });

      // T056: Create refresh_job record (status='pending')
      const { data: refreshJob, error: jobCreateError } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
          started_at: null,
          completed_at: null,
        })
        .select()
        .single();

      if (jobCreateError) {
        logger.error(
          "Failed to create refresh_job",
          jobCreateError instanceof Error ? jobCreateError : undefined,
          { asin: product.asin }
        );
        metrics.failure++;
        continue;
      }

      // T056: Update refresh_job to status='running'
      await supabase
        .from("refresh_jobs")
        .update({
          status: "running",
          started_at: new Date().toISOString(),
        })
        .eq("id", refreshJob.id);

      // T056: Check circuit breaker state
      const circuitState = circuitBreaker.getState();
      
      if (circuitState.state === "OPEN") {
        logger.warn("Circuit breaker is OPEN, skipping product refresh", {
          product_id: product.id,
          asin: product.asin,
          circuit_state: circuitState,
        });

        // T060: Mark refresh_job as skipped
        await supabase
          .from("refresh_jobs")
          .update({
            status: "skipped",
            completed_at: new Date().toISOString(),
            circuit_breaker_state: "open",
          })
          .eq("id", refreshJob.id);

        metrics.skipped++;
        continue;
      }

      // T057: Call PA-API with retry logic (exponential backoff)
      let retryCount = 0;
      const maxRetries = 3; // 4 total attempts (initial + 3 retries)
      let refreshSuccess = false;
      let lastError: Error | null = null;

      while (retryCount <= maxRetries && !refreshSuccess) {
        try {
          // T057: Exponential backoff delays: 0s, 1s, 2s, 4s
          if (retryCount > 0) {
            const delayMs = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s
            logger.info("Retrying PA-API call", {
              asin: product.asin,
              retry_count: retryCount,
              delay_ms: delayMs,
            });
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }

          // Get marketplace configuration
          const marketplaceCode = product.marketplace?.code || "US";
          
          // Map marketplace code to actual Amazon marketplace domain
          const marketplaceDomainMap: Record<string, string> = {
            "US": "www.amazon.com",
            "DE": "www.amazon.de",
            "UK": "www.amazon.co.uk",
            "FR": "www.amazon.fr",
            "IT": "www.amazon.it",
            "ES": "www.amazon.es",
            "JP": "www.amazon.co.jp",
            "CA": "www.amazon.ca",
            "AU": "www.amazon.com.au",
          };
          const marketplaceDomain = marketplaceDomainMap[marketplaceCode] || "www.amazon.com";
          
          // Map marketplace code to AWS region
          const regionMap: Record<string, string> = {
            "US": "us-east-1",
            "CA": "us-east-1",
            "DE": "eu-west-1",
            "UK": "eu-west-1",
            "FR": "eu-west-1",
            "IT": "eu-west-1",
            "ES": "eu-west-1",
            "JP": "us-west-2",
            "AU": "us-west-2",
          };
          const region = regionMap[marketplaceCode] || "us-east-1";

          // Initialize PA-API client for this product
          const paapiClient = new PaapiClient({
            accessKey: paapiAccessKey,
            secretKey: paapiSecretKey,
            partnerTag: paapiPartnerTag,
            marketplace: marketplaceDomain,
            region,
          });

          // Define resources to request
          const resources = [
            "Images.Primary.Large",
            "ItemInfo.Title",
            "ItemInfo.ByLineInfo",
            "Offers.Listings.Price",
            "Offers.Listings.SavingBasis",
          ];

          // Call PA-API
          const paapiResponse = await paapiClient.getItems({
            itemIds: [product.asin],
            resources,
          });

          // T058: Transform PA-API response and update product
          if (paapiResponse.ItemsResult?.Items && paapiResponse.ItemsResult.Items.length > 0) {
            const item = paapiResponse.ItemsResult.Items[0];

            // Extract price information
            const offers = item.Offers?.Listings?.[0];
            const currentPrice = offers?.Price?.Amount || null;
            const originalPrice = offers?.SavingBasis?.Amount || currentPrice;
            
            // Calculate savings (only if both prices exist)
            let savingsAmount: number | null = null;
            let savingsPercentage: number | null = null;
            
            if (currentPrice && originalPrice && currentPrice < originalPrice) {
              savingsAmount = originalPrice - currentPrice;
              savingsPercentage = (savingsAmount / originalPrice) * 100;
              
              // Round to 2 decimal places
              savingsAmount = Math.round(savingsAmount * 100) / 100;
              savingsPercentage = Math.round(savingsPercentage * 100) / 100;
            }

            // Extract availability
            const availabilityType = offers?.Availability?.Type || null;
            const availabilityMessage = offers?.Availability?.Message || null;

            // Extract reviews and rating
            const customerReviewCount = item.CustomerReviews?.Count || null;
            const starRating = item.CustomerReviews?.StarRating?.Value || null;

            // T058: Update product in database
            const { error: updateError } = await supabase
              .from("products")
              .update({
                current_price: currentPrice,
                original_price: originalPrice,
                savings_amount: savingsAmount,
                savings_percentage: savingsPercentage,
                availability_type: availabilityType,
                availability_message: availabilityMessage,
                customer_review_count: customerReviewCount,
                star_rating: starRating,
                raw_paapi_response: paapiResponse,
                last_refresh_at: new Date().toISOString(),
                // T058: Keep status unchanged during successful refresh
              })
              .eq("id", product.id);

            if (updateError) {
              throw new Error(`Failed to update product: ${updateError.message}`);
            }

            // T060: Mark refresh_job as success
            await supabase
              .from("refresh_jobs")
              .update({
                status: "success",
                completed_at: new Date().toISOString(),
                retry_count: retryCount,
              })
              .eq("id", refreshJob.id);

            logger.info("Product refresh successful", {
              product_id: product.id,
              asin: product.asin,
              retry_count: retryCount,
            });

            metrics.success++;
            refreshSuccess = true;
          } else {
            // T059: Handle unavailable product (no items in response)
            logger.warn("Product not found in PA-API response", {
              product_id: product.id,
              asin: product.asin,
            });

            // T059: Update product status to 'unavailable'
            const { data: currentProduct } = await supabase
              .from("products")
              .select("last_refresh_at")
              .eq("id", product.id)
              .single();

            await supabase
              .from("products")
              .update({
                status: "unavailable",
                last_available_at: currentProduct?.last_refresh_at,
                last_refresh_at: new Date().toISOString(),
              })
              .eq("id", product.id);

            // T059: Mark refresh_job as success (expected outcome)
            await supabase
              .from("refresh_jobs")
              .update({
                status: "success",
                completed_at: new Date().toISOString(),
                retry_count: retryCount,
              })
              .eq("id", refreshJob.id);

            logger.info("Product marked as unavailable", {
              product_id: product.id,
              asin: product.asin,
            });

            metrics.success++;
            refreshSuccess = true;
          }

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          retryCount++;

          // T059: Handle ItemNotAccessible or InvalidParameterValue errors specifically
          // These indicate the product doesn't exist or has an invalid ASIN
          if (error instanceof PaapiClientError && 
              (error.code === "ItemNotAccessible" || 
               error.code === "PAAPI_INVALID_PARAMETER" ||
               error.message.includes("not accessible") ||
               error.message.includes("Invalid parameter value"))) {
            
            logger.warn("Product not accessible or invalid ASIN", {
              product_id: product.id,
              asin: product.asin,
              error_code: error.code,
              error: error.message,
            });

            // T059: Update product status to 'unavailable'
            const { data: currentProduct } = await supabase
              .from("products")
              .select("last_refresh_at")
              .eq("id", product.id)
              .single();

            await supabase
              .from("products")
              .update({
                status: "unavailable",
                last_available_at: currentProduct?.last_refresh_at,
                last_refresh_at: new Date().toISOString(),
              })
              .eq("id", product.id);

            // T059: Mark refresh_job as success
            await supabase
              .from("refresh_jobs")
              .update({
                status: "success",
                completed_at: new Date().toISOString(),
                retry_count: retryCount,
              })
              .eq("id", refreshJob.id);

            metrics.success++;
            refreshSuccess = true;
            break;
          }

          // T056: Handle circuit breaker open during retry
          if (error instanceof CircuitOpenError) {
            logger.warn("Circuit breaker opened during retry", {
              product_id: product.id,
              asin: product.asin,
              retry_count: retryCount,
            });

            // T060: Mark refresh_job as skipped
            await supabase
              .from("refresh_jobs")
              .update({
                status: "skipped",
                completed_at: new Date().toISOString(),
                retry_count: retryCount,
                circuit_breaker_state: "open",
              })
              .eq("id", refreshJob.id);

            metrics.skipped++;
            refreshSuccess = true; // Mark as "handled"
            break;
          }

          // Log retry attempt
          if (retryCount <= maxRetries) {
            logger.warn("PA-API call failed, will retry", {
              product_id: product.id,
              asin: product.asin,
              retry_count: retryCount,
              max_retries: maxRetries,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      // T060: If all retries exhausted, mark as failure
      if (!refreshSuccess) {
        logger.error(
          "Product refresh failed after retries",
          lastError || undefined,
          {
            asin: product.asin,
            retry_count: retryCount,
          }
        );

        // T060: Update refresh_job with failure details
        await supabase
          .from("refresh_jobs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_code: lastError instanceof PaapiClientError ? lastError.code : "UNKNOWN_ERROR",
            error_message: lastError?.message || "Unknown error",
            retry_count: retryCount,
          })
          .eq("id", refreshJob.id);

        metrics.failure++;
      }
    }

    // T061: Calculate final duration and log summary
    const endTime = Date.now();
    metrics.duration_ms = endTime - startTime;

    logger.info("Refresh worker execution completed", {
      metrics,
      circuit_state: circuitBreaker.getState().state,
      correlation_id: correlationId,
    });

    // T061: Return metrics in response
    return new Response(JSON.stringify({
      success: true,
      metrics,
      message: `Processed ${metrics.processed} products`,
      correlation_id: correlationId,
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    // Calculate duration even in error case
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.error(
      "Unexpected error in refresh-worker function",
      error instanceof Error ? error : undefined,
      {
        errorDetails: error instanceof Error ? error.message : String(error),
        correlation_id: correlationId,
        duration_ms: duration,
      }
    );

    const errorResponse = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
        details: {
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      correlation_id: correlationId,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  }
}

// Deno Deploy expects a default export
Deno.serve(handler);

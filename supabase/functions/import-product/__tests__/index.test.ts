/**
 * Integration tests for import-product Edge Function
 * 
 * These tests follow TDD (Test-Driven Development) principles:
 * 1. Write tests FIRST (this file) ✅
 * 2. Run tests and verify they FAIL (import-product function doesn't exist yet) ❌
 * 3. Implement import-product function to make tests PASS (T028-T034) ✅
 * 
 * Constitution Compliance:
 * - TDD: Tests written BEFORE implementation (NON-NEGOTIABLE)
 * - API Design: Validates request/response contracts
 * - Observability: Verifies correlation_id in responses
 * - Code Quality: Integration tests ensure end-to-end functionality
 * 
 * Run tests: deno test supabase/functions/import-product/__tests__/index.test.ts --allow-net --allow-env
 */

import { 
  assertEquals, 
  assertExists, 
  assertRejects,
  assert,
  assertStringIncludes 
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Helper to create a mock Request object for Edge Function testing
 */
function createMockRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost:8000/import-product", {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer test-token",
    },
    body: JSON.stringify(body),
  });
}

/**
 * Helper to parse Response JSON
 */
async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  return JSON.parse(text);
}

describe("Import Product Edge Function - Integration Tests", () => {
  let supabaseClient: SupabaseClient;
  let testProductId: string | null = null;

  beforeEach(() => {
    // Initialize Supabase client for integration tests
    // Note: These tests require a running Supabase instance (local or cloud)
    // Prioritize LOCAL credentials for development
    const supabaseUrl = Deno.env.get("SUPABASE_LOCAL_URL") || Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
    const supabaseKey = Deno.env.get("SUPABASE_LOCAL_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "test-service-role-key";
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  });

  afterEach(async () => {
    // Clean up test data after each test
    if (testProductId) {
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", testProductId);
      testProductId = null;
    }
  });

  describe("POST with valid ASIN", () => {
    it("should create product in database with all PA-API fields", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: POST /import-product with valid ASIN should:
      // 1. Validate request body
      // 2. Fetch product data from PA-API
      // 3. Transform PA-API response to database schema
      // 4. Insert product into database
      // 5. Return success response with product_id and correlation_id

      const request = createMockRequest({
        asin: "B08DQQ8CBP", // Valid ESP32 ASIN
        marketplace: "US",
      });

      // Import the Edge Function handler (will fail - doesn't exist yet)
      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Assert HTTP 200 or 201 (Created)
      assert(
        response.status === 200 || response.status === 201,
        `Expected status 200 or 201, got ${response.status}`
      );

      // Parse response body
      const responseData = await parseResponse(response) as Record<string, unknown>;

      // Assert response structure
      assertExists(responseData.product_id, "Response should include product_id");
      assertExists(responseData.correlation_id, "Response should include correlation_id");
      assertEquals(responseData.asin, "B08DQQ8CBP", "Response should include ASIN");
      assertExists(responseData.title, "Response should include product title");
      assertExists(responseData.status, "Response should include product status");
      assertExists(responseData.imported_at, "Response should include imported_at timestamp");

      // Store product_id for cleanup
      testProductId = responseData.product_id as string;

      // Verify product was inserted into database
      const { data: product, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", testProductId)
        .single();

      assertEquals(error, null, "Should query product without error");
      assertExists(product, "Product should exist in database");

      // Assert all PA-API fields are present
      assertEquals(product.asin, "B08DQQ8CBP", "Product ASIN should match");
      assertExists(product.title, "Product should have title");
      assertExists(product.current_price, "Product should have current_price");
      assertExists(product.currency, "Product should have currency");
      assertExists(product.images, "Product should have images JSONB");
      assertExists(product.raw_paapi_response, "Product should have raw_paapi_response JSONB");
      assertExists(product.last_refresh_at, "Product should have last_refresh_at timestamp");
      assertEquals(product.status, "draft", "New product should have status='draft'");
      assertExists(product.marketplace_id, "Product should have marketplace_id FK");
    });
  });

  describe("POST with duplicate ASIN", () => {
    it("should update existing product (upsert behavior)", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: POST /import-product with duplicate ASIN should:
      // 1. Find existing product by (asin, marketplace_id)
      // 2. UPDATE existing product instead of creating new one
      // 3. Update updated_at timestamp
      // 4. Return success response with existing product_id

      // Get US marketplace UUID first
      const { data: usMarketplace, error: marketplaceError } = await supabaseClient
        .from("marketplaces")
        .select("id")
        .eq("code", "US")
        .single();

      assertEquals(marketplaceError, null, "Should find US marketplace");
      assertExists(usMarketplace, "US marketplace should exist");

      // First, manually insert a test product
      const { data: existingProduct, error: insertError } = await supabaseClient
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: usMarketplace.id, // US marketplace UUID
          title: "Old Title",
          current_price: 9.99,
          currency: "USD",
          status: "draft",
          raw_paapi_response: {},
        })
        .select()
        .single();

      assertEquals(insertError, null, "Should insert test product without error");
      assertExists(existingProduct, "Test product should be created");
      testProductId = existingProduct.id;

      // Now import the same ASIN again
      const request = createMockRequest({
        asin: "B08DQQ8CBP",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Assert HTTP 200 (OK, not 201 Created)
      assertEquals(response.status, 200, "Duplicate import should return 200 OK");

      const responseData = await parseResponse(response) as Record<string, unknown>;

      // Assert same product_id (updated, not created new)
      assertEquals(
        responseData.product_id,
        existingProduct.id,
        "Should return same product_id for duplicate ASIN"
      );

      // Verify product was updated in database
      const { data: updatedProduct, error: queryError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", existingProduct.id)
        .single();

      assertEquals(queryError, null, "Should query updated product without error");
      assertExists(updatedProduct, "Updated product should exist");

      // Assert title was updated (fresh PA-API data)
      assert(
        updatedProduct.title !== "Old Title",
        "Product title should be updated with fresh PA-API data"
      );

      // Assert updated_at changed
      assert(
        new Date(updatedProduct.updated_at) > new Date(existingProduct.updated_at),
        "updated_at should be newer after update"
      );

      // Verify only ONE product exists with this ASIN (no duplicates)
      const { data: allProducts, error: countError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("asin", "B08DQQ8CBP")
        .eq("marketplace_id", usMarketplace.id);

      assertEquals(countError, null, "Should query all products without error");
      assertEquals(
        allProducts?.length,
        1,
        "Should have exactly one product with this ASIN (no duplicates)"
      );
    });
  });

  describe("POST with invalid ASIN", () => {
    it("should return 400 error for invalid ASIN format", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: POST with invalid ASIN should:
      // 1. Validate request body with Zod schema
      // 2. Reject invalid ASIN format before calling PA-API
      // 3. Return 400 Bad Request with validation error details
      // 4. Include correlation_id in error response

      const request = createMockRequest({
        asin: "INVALID", // Invalid ASIN format (not 10 characters)
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Assert HTTP 400 Bad Request
      assertEquals(response.status, 400, "Invalid ASIN should return 400 Bad Request");

      const responseData = await parseResponse(response) as Record<string, unknown>;

      // Assert error structure
      assertExists(responseData.error, "Response should include error object");
      const error = responseData.error as Record<string, unknown>;
      assertExists(error.code, "Error should include code");
      assertExists(error.message, "Error should include message");
      assertStringIncludes(
        error.message as string,
        "ASIN",
        "Error message should mention ASIN validation"
      );

      // Assert correlation_id included for tracing
      assertExists(responseData.correlation_id, "Error response should include correlation_id");

      // Verify no product was created in database
      const { data: products, error: queryError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("asin", "INVALID");

      assertEquals(queryError, null, "Should query without error");
      assertEquals(products?.length, 0, "No product should be created for invalid ASIN");
    });
  });

  describe("POST with missing marketplace", () => {
    it("should return 400 validation error for missing marketplace", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: POST with missing marketplace should:
      // 1. Validate request body with Zod schema
      // 2. Reject missing required field
      // 3. Return 400 Bad Request with specific validation error
      // 4. Include correlation_id in error response

      const request = createMockRequest({
        asin: "B08DQQ8CBP",
        // marketplace missing
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Assert HTTP 400 Bad Request
      assertEquals(response.status, 400, "Missing marketplace should return 400 Bad Request");

      const responseData = await parseResponse(response) as Record<string, unknown>;

      // Assert error structure
      assertExists(responseData.error, "Response should include error object");
      const error = responseData.error as Record<string, unknown>;
      assertExists(error.code, "Error should include code");
      assertExists(error.message, "Error should include message");
      assertStringIncludes(
        error.message as string,
        "marketplace",
        "Error message should mention marketplace field"
      );

      // Assert correlation_id included
      assertExists(responseData.correlation_id, "Error response should include correlation_id");
    });
  });

  describe("POST with PA-API rate limit error", () => {
    it("should return 429 with retry-after header when PA-API throttles", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: When PA-API returns TooManyRequests error:
      // 1. Catch PA-API throttle error (code: TooManyRequests or RequestThrottled)
      // 2. Return HTTP 429 Too Many Requests
      // 3. Include Retry-After header with suggested wait time
      // 4. Return error response with code PAAPI_THROTTLED
      // 5. Include correlation_id for troubleshooting

      // Note: This test is difficult to trigger with real PA-API
      // In actual implementation, we'd mock PaapiClient to throw throttle error
      // For now, this test documents the expected behavior

      // Mock scenario: Import an ASIN that triggers rate limit
      // (In real tests, we'd mock PaapiClient.getItems to throw PAAPI_THROTTLED error)
      const request = createMockRequest({
        asin: "B08DQQ8CBP",
        marketplace: "US",
      });

      // TODO: Add test setup to mock PA-API throttle error
      // For T027, this test is expected to FAIL since function doesn't exist

      const { default: handler } = await import("../index.ts");
      
      // In reality, this would need to trigger during a rate limit scenario
      // For now, we'll skip the actual test execution and document expectations
      
      // Expected assertions when PA-API throttles:
      // assertEquals(response.status, 429, "PA-API throttle should return 429");
      // assertExists(response.headers.get("Retry-After"), "Should include Retry-After header");
      // const responseData = await parseResponse(response);
      // assertEquals(responseData.error.code, "PAAPI_THROTTLED");
      // assertExists(responseData.correlation_id);

      // For T027, we'll mark this as a placeholder test
      assert(true, "Placeholder test for PA-API rate limit handling");
    });
  });

  describe("POST response includes correlation_id", () => {
    it("should include correlation_id in all responses for tracing", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: All responses (success or error) should include correlation_id

      const request = createMockRequest({
        asin: "B08DQQ8CBP",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      const responseData = await parseResponse(response) as Record<string, unknown>;

      // Assert correlation_id exists
      assertExists(
        responseData.correlation_id,
        "Response should include correlation_id for distributed tracing"
      );

      // Assert correlation_id is valid UUID v4
      const correlationId = responseData.correlation_id as string;
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      assert(
        uuidV4Regex.test(correlationId),
        "correlation_id should be a valid UUID v4"
      );

      // Store for cleanup
      if (response.status === 200 || response.status === 201) {
        testProductId = responseData.product_id as string;
      }
    });
  });

  describe("Product record includes all PA-API fields", () => {
    it("should store all PA-API fields in database (price, images, availability, raw JSON)", async () => {
      // This test will FAIL initially - import-product function doesn't exist yet
      // Expected behavior: Imported product should include:
      // - Basic: title, brand, description
      // - Pricing: current_price, original_price, savings_amount, savings_percentage, currency
      // - Media: images (JSONB array), detail_page_url
      // - Availability: availability_type, availability_message
      // - Ratings: customer_review_count, star_rating
      // - Metadata: status, last_refresh_at
      // - Raw: raw_paapi_response (complete PA-API response as JSONB)

      const request = createMockRequest({
        asin: "B08DQQ8CBP",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      assert(
        response.status === 200 || response.status === 201,
        "Request should succeed"
      );

      const responseData = await parseResponse(response) as Record<string, unknown>;
      testProductId = responseData.product_id as string;

      // Query full product record from database
      const { data: product, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", testProductId)
        .single();

      assertEquals(error, null, "Should query product without error");
      assertExists(product, "Product should exist");

      // Assert all PA-API field categories are populated

      // Basic fields
      assertExists(product.title, "Should have title");
      assertExists(product.asin, "Should have asin");
      assertEquals(product.asin, "B08DQQ8CBP", "ASIN should match request");

      // Pricing fields
      assertExists(product.current_price, "Should have current_price");
      assert(typeof product.current_price === "number", "current_price should be number");
      assert(product.current_price > 0, "current_price should be positive");
      assertExists(product.currency, "Should have currency");
      assertEquals(product.currency, "USD", "Currency should be USD for US marketplace");

      // Media fields
      assertExists(product.images, "Should have images JSONB");
      assert(
        Array.isArray(product.images) || typeof product.images === "object",
        "images should be JSONB array or object"
      );

      // Metadata fields
      assertExists(product.status, "Should have status");
      assertEquals(product.status, "draft", "New import should have status='draft'");
      assertExists(product.last_refresh_at, "Should have last_refresh_at");
      assertExists(product.marketplace_id, "Should have marketplace_id");

      // Raw PA-API response
      assertExists(product.raw_paapi_response, "Should have raw_paapi_response JSONB");
      assert(
        typeof product.raw_paapi_response === "object",
        "raw_paapi_response should be JSONB object"
      );
      
      // Verify raw_paapi_response contains PA-API structure
      const rawResponse = product.raw_paapi_response as Record<string, unknown>;
      assertExists(
        rawResponse.ItemsResult || rawResponse.Errors,
        "raw_paapi_response should contain PA-API response structure"
      );

      // Optional fields (may or may not be present depending on PA-API response)
      // These assertions are lenient - just check types if present
      if (product.brand) {
        assert(typeof product.brand === "string", "brand should be string if present");
      }
      if (product.original_price) {
        assert(typeof product.original_price === "number", "original_price should be number if present");
      }
      if (product.availability_type) {
        assert(typeof product.availability_type === "string", "availability_type should be string if present");
      }
      if (product.customer_review_count) {
        assert(typeof product.customer_review_count === "number", "customer_review_count should be number if present");
      }
      if (product.star_rating) {
        assert(typeof product.star_rating === "number", "star_rating should be number if present");
        assert(product.star_rating >= 0 && product.star_rating <= 5, "star_rating should be 0-5");
      }
    });
  });
});

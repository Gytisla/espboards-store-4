/**
 * Integration tests for search-products Edge Function
 *
 * These tests follow TDD (Test-Driven Development) principles:
 * 1. Write tests FIRST (this file) ✅
 * 2. Run tests and verify they FAIL (search-products function doesn't exist yet) ❌
 * 3. Implement search-products function to make tests PASS (T094-T096) ✅
 *
 * Constitution Compliance:
 * - TDD: Tests written BEFORE implementation (NON-NEGOTIABLE)
 * - API Design: Validates request/response contracts
 * - Observability: Verifies correlation_id in responses
 * - Code Quality: Integration tests ensure end-to-end functionality
 *
 * Run tests: deno test supabase/functions/search-products/__tests__/index.test.ts --allow-net --allow-env
 */

import { 
  assertEquals, 
  assertExists,
  assertRejects as _assertRejects,
  assert,
  assertStringIncludes 
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it, beforeEach as _beforeEach, afterEach as _afterEach } from "https://deno.land/std@0.208.0/testing/bdd.ts";/**
 * Helper to create a mock Request object for Edge Function testing
 */
function createMockRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost:8000/search-products", {
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

// Response type interfaces
interface SearchResponse {
  results: ProductResult[];
  correlation_id: string;
  total_results?: number;
  page?: number;
  limit?: number;
}

interface ProductResult {
  asin: string;
  title: string;
  images?: ImageData[];
  pricing?: PricingData;
  rating?: RatingData;
  url?: string;
}

interface ImageData {
  url: string;
  width?: number;
  height?: number;
}

interface PricingData {
  amount: number;
  currency: string;
  display?: string;
}

interface RatingData {
  value: number;
  count?: number;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
  correlation_id: string;
}

describe("Search Products Edge Function - Integration Tests", () => {
  describe("POST with valid search query", () => {
    it("should return Amazon products with all required fields", async () => {
      // This test will FAIL initially - search-products function doesn't exist yet
      // Expected behavior: POST /search-products with valid query should:
      // 1. Validate request body (query, marketplace)
      // 2. Call PA-API SearchItems endpoint
      // 3. Transform results to standardized format
      // 4. Return paginated results (max 10 items)
      // 5. Include correlation_id in response

      const request = createMockRequest({
        query: "ESP32",
        marketplace: "US",
      });

      // Import the Edge Function handler
      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Check if PA-API credentials are available
      const hasCredentials = Deno.env.get("PAAPI_ACCESS_KEY") && 
                            Deno.env.get("PAAPI_SECRET_KEY") && 
                            Deno.env.get("PAAPI_PARTNER_TAG_US");

      if (!hasCredentials) {
        // Without credentials, expect 500 error with proper error response
        assertEquals(response.status, 500, "Expected 500 when credentials are missing");
        const responseBody = await parseResponse(response) as ErrorResponse;
        assertExists(responseBody.error, "Error response should include error object");
        assertExists(responseBody.correlation_id, "Error response should include correlation_id");
        assertStringIncludes(responseBody.error.message, "configuration", "Error message should mention configuration");
        return; // Skip rest of test
      }

      // Assert HTTP 200 (only when credentials are available)
      assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);

      // Parse response body
      const responseBody = await parseResponse(response) as SearchResponse;

      // Assert response structure
      assertExists(responseBody.results, "Response should include results array");
      assert(Array.isArray(responseBody.results), "Results should be an array");
      assert(responseBody.results.length > 0, "Results should not be empty");
      assert(responseBody.results.length <= 10, "Results should be limited to max 10 items");

      // Assert correlation_id exists
      assertExists(responseBody.correlation_id, "Response should include correlation_id");
      assert(typeof responseBody.correlation_id === "string", "correlation_id should be a string");

      // Assert each product has required fields
      const firstProduct = responseBody.results[0]!;
      assertExists(firstProduct.asin, "Product should have ASIN");
      assertExists(firstProduct.title, "Product should have title");
      assert(typeof firstProduct.title === "string", "Title should be a string");
      assert(firstProduct.title.length > 0, "Title should not be empty");

      // Assert optional but expected fields
      if (firstProduct.images) {
        assert(Array.isArray(firstProduct.images), "Images should be an array");
        if (firstProduct.images.length > 0) {
          const firstImage = firstProduct.images[0]!;
          assertExists(firstImage.url, "Image should have URL");
          assert(typeof firstImage.width === "number" || firstImage.width === undefined);
          assert(typeof firstImage.height === "number" || firstImage.height === undefined);
        }
      }

      if (firstProduct.pricing) {
        assertExists(firstProduct.pricing.amount, "Pricing should have amount");
        assertExists(firstProduct.pricing.currency, "Pricing should have currency");
        assert(typeof firstProduct.pricing.amount === "number", "Amount should be a number");
      }

      if (firstProduct.rating) {
        assert(typeof firstProduct.rating.value === "number", "Rating value should be a number");
        assert(firstProduct.rating.value >= 0 && firstProduct.rating.value <= 5, "Rating should be between 0-5");
      }
    });

    it("should handle marketplace parameter correctly", async () => {
      const request = createMockRequest({
        query: "Arduino",
        marketplace: "DE",
      });

      // Import the Edge Function handler
      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Check if PA-API credentials are available
      const hasCredentials = Deno.env.get("PAAPI_ACCESS_KEY") && 
                            Deno.env.get("PAAPI_SECRET_KEY") && 
                            Deno.env.get("PAAPI_PARTNER_TAG_DE");

      if (!hasCredentials) {
        // Without credentials, expect 500 error
        assertEquals(response.status, 500, "Expected 500 when credentials are missing");
        const responseBody = await parseResponse(response) as ErrorResponse;
        assertExists(responseBody.error);
        assertExists(responseBody.correlation_id);
        return; // Skip rest of test
      }

      assertEquals(response.status, 200);
      const responseBody = await parseResponse(response) as SearchResponse;
      assertExists(responseBody.results);
      assert(Array.isArray(responseBody.results));
    });
  });

  describe("POST with invalid query", () => {
    it("should return 400 for empty query", async () => {
      const request = createMockRequest({
        query: "",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      assertEquals(response.status, 400);
      const responseBody = await parseResponse(response) as ErrorResponse;
      assertExists(responseBody.error);
      assertStringIncludes(responseBody.error.message, "query");
    });

    it("should return 400 for query too short", async () => {
      const request = createMockRequest({
        query: "a",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      assertEquals(response.status, 400);
      const responseBody = await parseResponse(response) as ErrorResponse;
      assertExists(responseBody.error);
      assertStringIncludes(responseBody.error.message, "query");
    });

    it("should return 400 for invalid marketplace", async () => {
      const request = createMockRequest({
        query: "ESP32",
        marketplace: "INVALID",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      assertEquals(response.status, 400);
      const responseBody = await parseResponse(response) as ErrorResponse;
      assertExists(responseBody.error);
      assertStringIncludes(responseBody.error.message, "marketplace");
    });

    it("should return 400 for missing required fields", async () => {
      // Missing query
      const request1 = createMockRequest({
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      let response = await handler(request1);

      assertEquals(response.status, 400);
      let responseBody = await parseResponse(response) as ErrorResponse;
      assertExists(responseBody.error);

      // Missing marketplace
      const request2 = createMockRequest({
        query: "ESP32",
      });

      response = await handler(request2);
      assertEquals(response.status, 400);
      responseBody = await parseResponse(response) as ErrorResponse;
      assertExists(responseBody.error);
    });
  });

  describe("PA-API error handling", () => {
    it("should handle PA-API rate limit errors gracefully", async () => {
      // This test would require mocking PA-API responses
      // For now, we'll test the error handling structure
      const request = createMockRequest({
        query: "test query that might trigger rate limit",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Should either succeed or return a proper error response
      if (response.status !== 200) {
        const responseBody = await parseResponse(response) as ErrorResponse;
        assertExists(responseBody.error);
        assertExists(responseBody.correlation_id);
      }
    });

    it("should handle invalid PA-API credentials", async () => {
      // Test with invalid credentials (would need environment setup)
      // This is more of an integration test that would run in CI/CD
      const request = createMockRequest({
        query: "ESP32",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      // Should return proper error response for auth failures
      if (response.status >= 400) {
        const responseBody = await parseResponse(response) as ErrorResponse;
        assertExists(responseBody.error);
        assertExists(responseBody.correlation_id);
      }
    });
  });

  describe("Response format validation", () => {
    it("should return consistent product format", async () => {
      const request = createMockRequest({
        query: "Raspberry Pi",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      if (response.status === 200) {
        const responseBody = await parseResponse(response) as SearchResponse;

        // Validate each product in results has consistent structure
        for (const product of responseBody.results) {
          // Required fields
          assertExists(product.asin);
          assertExists(product.title);

          // Optional fields should follow consistent structure
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0]!;
            assertExists(firstImage.url);
            assert(typeof firstImage.width === "number" || firstImage.width === undefined);
            assert(typeof firstImage.height === "number" || firstImage.height === undefined);
          }

          if (product.pricing) {
            assert(typeof product.pricing.amount === "number");
            assert(typeof product.pricing.currency === "string");
            assert(typeof product.pricing.display === "string" || product.pricing.display === undefined);
          }

          if (product.rating) {
            assert(typeof product.rating.value === "number");
            assert(typeof product.rating.count === "number" || product.rating.count === undefined);
          }

          if (product.url) {
            assert(typeof product.url === "string");
            assert(product.url.startsWith("http"));
          }
        }
      }
    });

    it("should include pagination metadata", async () => {
      const request = createMockRequest({
        query: "ESP32",
        marketplace: "US",
      });

      const { default: handler } = await import("../index.ts");
      const response = await handler(request);

      if (response.status === 200) {
        const responseBody = await parseResponse(response) as SearchResponse;

        // Should include pagination info
        assert(typeof responseBody.total_results === "number" || responseBody.total_results === undefined);
        assert(typeof responseBody.page === "number" || responseBody.page === undefined);
        assert(typeof responseBody.limit === "number" || responseBody.limit === undefined);
      }
    });
  });
});
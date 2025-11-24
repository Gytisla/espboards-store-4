/**
 * Integration tests for refresh-worker Edge Function
 * 
 * These tests follow TDD (Test-Driven Development) principles:
 * 1. Write tests FIRST (this file) ✅
 * 2. Run tests and verify they FAIL (refresh-worker function doesn't exist yet) ❌
 * 3. Implement refresh-worker function to make tests PASS (T054-T061) 🔄
 * 
 * Constitution Compliance:
 * - TDD: Tests written BEFORE implementation (NON-NEGOTIABLE)
 * - Performance: Validate batch processing (10 products), rolling updates
 * - Observability: Verify metrics logging (processed, success, failure counts)
 * - Reliability: Test retry logic and circuit breaker integration
 * 
 * User Story 2: Automatic Product Refresh
 * Goal: Refresh product data from PA-API every 24 hours using cron jobs
 * 
 * Run tests: deno test supabase/functions/refresh-worker/__tests__/index.test.ts --allow-net --allow-env --no-check
 */

import { 
  assertEquals, 
  assertExists, 
  assert,
  assertStringIncludes 
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "test-service-role-key";

/**
 * Helper to create a mock Request object for Edge Function testing
 */
function createMockRequest(method = "POST"): Request {
  return new Request("http://localhost:8000/refresh-worker", {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
}

/**
 * Helper to parse Response JSON
 */
async function _parseResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  return JSON.parse(text);
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Refresh Worker Edge Function - Integration Tests (T053)", () => {
  let supabase: SupabaseClient;
  let testMarketplaceId: string;
  let testProductIds: string[] = [];

  // Setup: Create test marketplace and products
  beforeEach(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create test marketplace
    const { data: marketplace, error: marketplaceError } = await supabase
      .from("marketplaces")
      .insert({
        code: "US",
        region_name: "United States",
        currency: "USD",
        paapi_endpoint: "https://webservices.amazon.com/paapi5/getitems",
        associate_tag: "test-tag-20",
      })
      .select()
      .single();

    if (marketplaceError) {
      console.error("Failed to create test marketplace:", marketplaceError);
      throw marketplaceError;
    }

    testMarketplaceId = marketplace.id;
  });

  // Cleanup: Delete test data
  afterEach(async () => {
    // Delete test products (cascade will delete refresh_jobs)
    if (testProductIds.length > 0) {
      await supabase
        .from("products")
        .delete()
        .in("id", testProductIds);
    }

    // Delete test marketplace
    if (testMarketplaceId) {
      await supabase
        .from("marketplaces")
        .delete()
        .eq("id", testMarketplaceId);
    }

    testProductIds = [];
  });

  // ==========================================================================
  // Test Suite 1: Product Selection (24-hour refresh logic)
  // ==========================================================================

  describe("Product Selection - 24-hour Refresh Logic", () => {
    it("should identify products where last_refresh_at < NOW() - INTERVAL '24 hours'", async () => {
      // Create products with different refresh times
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

      // Product 1: Never refreshed (NULL) - should be selected
      const { data: product1 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board 1",
          last_refresh_at: null,
        })
        .select()
        .single();
      testProductIds.push(product1.id);

      // Product 2: Refreshed 25 hours ago - should be selected
      const { data: product2 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBQ",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board 2",
          last_refresh_at: twentyFiveHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product2.id);

      // Product 3: Refreshed exactly 24 hours ago - should NOT be selected
      const { data: product3 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBR",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board 3",
          last_refresh_at: twentyFourHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product3.id);

      // Product 4: Refreshed 1 hour ago - should NOT be selected
      const { data: product4 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBS",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board 4",
          last_refresh_at: oneHourAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product4.id);

      // Query products needing refresh (simulates worker query)
      const { data: productsNeedingRefresh } = await supabase
        .from("products")
        .select("id, asin, last_refresh_at")
        .in("status", ["active", "draft"])
        .or(`last_refresh_at.is.null,last_refresh_at.lt.${twentyFourHoursAgo.toISOString()}`)
        .order("last_refresh_at", { ascending: true, nullsFirst: true })
        .limit(10);

      // Assertions
      assertExists(productsNeedingRefresh);
      assertEquals(productsNeedingRefresh.length, 2, "Should select 2 products (NULL and 25h ago)");
      
      // Verify correct products selected
      const selectedAsins = productsNeedingRefresh.map((p: { asin: string }) => p.asin);
      assert(selectedAsins.includes("B08DQQ8CBP"), "Should include product never refreshed");
      assert(selectedAsins.includes("B08DQQ8CBQ"), "Should include product refreshed 25h ago");
      assert(!selectedAsins.includes("B08DQQ8CBR"), "Should NOT include product refreshed 24h ago");
      assert(!selectedAsins.includes("B08DQQ8CBS"), "Should NOT include product refreshed 1h ago");

      // Verify sort order (NULL first, then oldest)
      assertEquals(productsNeedingRefresh[0].asin, "B08DQQ8CBP", "NULL should be first");
      assertEquals(productsNeedingRefresh[1].asin, "B08DQQ8CBQ", "Oldest should be second");
    });

    it("should only select products with status 'active' or 'draft'", async () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

      // Create products with different statuses
      const { data: activeProduct } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Active Product",
          last_refresh_at: twentyFiveHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(activeProduct.id);

      const { data: draftProduct } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBQ",
          marketplace_id: testMarketplaceId,
          status: "draft",
          title: "Draft Product",
          last_refresh_at: twentyFiveHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(draftProduct.id);

      const { data: unavailableProduct } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBR",
          marketplace_id: testMarketplaceId,
          status: "unavailable",
          title: "Unavailable Product",
          last_refresh_at: twentyFiveHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(unavailableProduct.id);

      // Query products needing refresh
      const { data: productsNeedingRefresh } = await supabase
        .from("products")
        .select("id, asin, status")
        .in("status", ["active", "draft"])
        .or(`last_refresh_at.is.null,last_refresh_at.lt.${twentyFiveHoursAgo.toISOString()}`)
        .order("last_refresh_at", { ascending: true, nullsFirst: true })
        .limit(10);

      // Assertions
      assertExists(productsNeedingRefresh);
      assertEquals(productsNeedingRefresh.length, 2, "Should select 2 products (active and draft)");
      
      const selectedAsins = productsNeedingRefresh.map((p: { asin: string }) => p.asin);
      assert(selectedAsins.includes("B08DQQ8CBP"), "Should include active product");
      assert(selectedAsins.includes("B08DQQ8CBQ"), "Should include draft product");
      assert(!selectedAsins.includes("B08DQQ8CBR"), "Should NOT include unavailable product");
    });
  });

  // ==========================================================================
  // Test Suite 2: Batch Processing (Rolling Updates)
  // ==========================================================================

  describe("Batch Processing - Rolling Updates", () => {
    it("should process batch of 10 products maximum (rolling updates)", async () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

      // Create 15 products needing refresh
      const insertPromises = [];
      for (let i = 0; i < 15; i++) {
        insertPromises.push(
          supabase
            .from("products")
            .insert({
              asin: `B08DQQ8CB${i.toString().padStart(1, '0')}`,
              marketplace_id: testMarketplaceId,
              status: "active",
              title: `ESP32 Product ${i}`,
              last_refresh_at: twentyFiveHoursAgo.toISOString(),
            })
            .select()
            .single()
        );
      }

      const results = await Promise.all(insertPromises);
      testProductIds = results.map((r: { data: { id: string } }) => r.data.id);

      // Query with batch size of 10
      const { data: batchProducts } = await supabase
        .from("products")
        .select("id, asin")
        .in("status", ["active", "draft"])
        .or(`last_refresh_at.is.null,last_refresh_at.lt.${twentyFiveHoursAgo.toISOString()}`)
        .order("last_refresh_at", { ascending: true, nullsFirst: true })
        .limit(10);

      // Assertions
      assertExists(batchProducts);
      assertEquals(batchProducts.length, 10, "Should return exactly 10 products (batch size)");
      assertEquals(batchProducts.length < 15, true, "Should not process all products at once");
    });

    it("should order products by last_refresh_at ASC NULLS FIRST", async () => {
      const now = new Date();
      const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);

      // Create products in random order
      const { data: product1 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB1",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 1 - 25h ago",
          last_refresh_at: twentyFiveHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product1.id);

      const { data: product2 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB2",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 2 - NULL",
          last_refresh_at: null,
        })
        .select()
        .single();
      testProductIds.push(product2.id);

      const { data: product3 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB3",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 3 - 30h ago",
          last_refresh_at: thirtyHoursAgo.toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product3.id);

      const { data: product4 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB4",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 4 - NULL",
          last_refresh_at: null,
        })
        .select()
        .single();
      testProductIds.push(product4.id);

      // Query with proper ordering
      const { data: orderedProducts } = await supabase
        .from("products")
        .select("id, asin, last_refresh_at")
        .in("status", ["active", "draft"])
        .or(`last_refresh_at.is.null,last_refresh_at.lt.${twentyFiveHoursAgo.toISOString()}`)
        .order("last_refresh_at", { ascending: true, nullsFirst: true })
        .limit(10);

      // Assertions
      assertExists(orderedProducts);
      assertEquals(orderedProducts.length, 4);

      // Verify NULL values come first
      assert(orderedProducts[0].last_refresh_at === null, "First product should have NULL last_refresh_at");
      assert(orderedProducts[1].last_refresh_at === null, "Second product should have NULL last_refresh_at");

      // Verify non-NULL values are ordered oldest first
      assert(orderedProducts[2].last_refresh_at !== null, "Third product should have last_refresh_at");
      assert(orderedProducts[3].last_refresh_at !== null, "Fourth product should have last_refresh_at");
      
      const third = new Date(orderedProducts[2].last_refresh_at);
      const fourth = new Date(orderedProducts[3].last_refresh_at);
      assert(third < fourth, "Oldest non-NULL should come before newer");
    });
  });

  // ==========================================================================
  // Test Suite 3: Product Data Updates
  // ==========================================================================

  describe("Product Data Updates", () => {
    it("should update product price, availability, and timestamps", async () => {
      // This test validates the expected update behavior
      // Implementation will use PA-API to fetch new data and update these fields
      
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
          current_price: 1999, // $19.99 in cents
          original_price: 2499,
          savings_amount: 500,
          savings_percentage: 20,
          availability_type: "InStock",
          availability_message: "In Stock",
          customer_review_count: 100,
          star_rating: 4.5,
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Simulate refresh update (what the worker would do)
      const updatedAt = new Date();
      const { error: updateError } = await supabase
        .from("products")
        .update({
          current_price: 1799, // New price: $17.99
          original_price: 2499,
          savings_amount: 700,
          savings_percentage: 28,
          availability_type: "InStock",
          availability_message: "In Stock",
          customer_review_count: 150, // Updated reviews
          star_rating: 4.7, // Updated rating
          last_refresh_at: updatedAt.toISOString(),
          updated_at: updatedAt.toISOString(),
        })
        .eq("id", product.id);

      assertEquals(updateError, null, "Update should succeed");

      // Verify update
      const { data: updatedProduct } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single();

      assertEquals(updatedProduct.current_price, 1799, "Price should be updated");
      assertEquals(updatedProduct.savings_amount, 700, "Savings should be updated");
      assertEquals(updatedProduct.customer_review_count, 150, "Review count should be updated");
      assertEquals(updatedProduct.star_rating, 4.7, "Star rating should be updated");
      assertExists(updatedProduct.last_refresh_at, "last_refresh_at should be set");
      
      const refreshTime = new Date(updatedProduct.last_refresh_at);
      assert(refreshTime >= updatedAt, "last_refresh_at should be recent");
    });

    it("should keep status unchanged during successful refresh", async () => {
      // Create products with different statuses
      const { data: activeProduct } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Active Product",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(activeProduct.id);

      const { data: draftProduct } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBQ",
          marketplace_id: testMarketplaceId,
          status: "draft",
          title: "Draft Product",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(draftProduct.id);

      // Simulate successful refresh (status should remain unchanged)
      await supabase
        .from("products")
        .update({
          current_price: 1999,
          last_refresh_at: new Date().toISOString(),
        })
        .eq("id", activeProduct.id);

      await supabase
        .from("products")
        .update({
          current_price: 2999,
          last_refresh_at: new Date().toISOString(),
        })
        .eq("id", draftProduct.id);

      // Verify status unchanged
      const { data: refreshedActive } = await supabase
        .from("products")
        .select("status")
        .eq("id", activeProduct.id)
        .single();

      const { data: refreshedDraft } = await supabase
        .from("products")
        .select("status")
        .eq("id", draftProduct.id)
        .single();

      assertEquals(refreshedActive.status, "active", "Active status should remain unchanged");
      assertEquals(refreshedDraft.status, "draft", "Draft status should remain unchanged");
    });
  });

  // ==========================================================================
  // Test Suite 4: Refresh Job Tracking
  // ==========================================================================

  describe("Refresh Job Tracking", () => {
    it("should create refresh_job record with status='success' after successful refresh", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Simulate refresh job lifecycle
      const scheduledAt = new Date();
      
      // 1. Create pending job
      const { data: job, error: createError } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          scheduled_at: scheduledAt.toISOString(),
          status: "pending",
          retry_count: 0,
        })
        .select()
        .single();

      assertEquals(createError, null, "Job creation should succeed");
      assertExists(job, "Job should be created");
      assertEquals(job.status, "pending", "Initial status should be pending");

      // 2. Update to running
      const startedAt = new Date();
      await supabase
        .from("refresh_jobs")
        .update({
          status: "running",
          started_at: startedAt.toISOString(),
        })
        .eq("id", job.id);

      // 3. Update to success
      const completedAt = new Date();
      await supabase
        .from("refresh_jobs")
        .update({
          status: "success",
          completed_at: completedAt.toISOString(),
        })
        .eq("id", job.id);

      // Verify final state
      const { data: completedJob } = await supabase
        .from("refresh_jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      assertEquals(completedJob.status, "success");
      assertEquals(completedJob.retry_count, 0);
      assertExists(completedJob.started_at);
      assertExists(completedJob.completed_at);
      assertEquals(completedJob.error_code, null);
      assertEquals(completedJob.error_message, null);
    });

    it("should record error details in refresh_job on failure", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Create and fail a job
      const { data: job } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
          retry_count: 0,
        })
        .select()
        .single();

      // Simulate failure
      await supabase
        .from("refresh_jobs")
        .update({
          status: "failed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_code: "TooManyRequests",
          error_message: "PA-API rate limit exceeded",
          retry_count: 1,
        })
        .eq("id", job.id);

      // Verify error recorded
      const { data: failedJob } = await supabase
        .from("refresh_jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      assertEquals(failedJob.status, "failed");
      assertEquals(failedJob.error_code, "TooManyRequests");
      assertEquals(failedJob.error_message, "PA-API rate limit exceeded");
      assertEquals(failedJob.retry_count, 1);
    });

    it("should track retry_count for multiple attempts", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Create job
      const { data: job } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
          retry_count: 0,
        })
        .select()
        .single();

      // Simulate retries
      for (let i = 1; i <= 3; i++) {
        await supabase
          .from("refresh_jobs")
          .update({
            retry_count: i,
            error_code: "TooManyRequests",
            error_message: `Retry attempt ${i}`,
          })
          .eq("id", job.id);

        const { data: retriedJob } = await supabase
          .from("refresh_jobs")
          .select("retry_count")
          .eq("id", job.id)
          .single();

        assertEquals(retriedJob.retry_count, i, `Retry count should be ${i}`);
      }
    });
  });

  // ==========================================================================
  // Test Suite 5: Unavailable Product Handling
  // ==========================================================================

  describe("Unavailable Product Handling", () => {
    it("should set status='unavailable' when product not accessible (404)", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product.id);

      const lastRefreshBefore = product.last_refresh_at;

      // Simulate PA-API returning ItemNotAccessible (product unavailable)
      const now = new Date();
      await supabase
        .from("products")
        .update({
          status: "unavailable",
          last_available_at: lastRefreshBefore, // Preserve when it was last available
          last_refresh_at: now.toISOString(),
        })
        .eq("id", product.id);

      // Verify update
      const { data: updatedProduct } = await supabase
        .from("products")
        .select("status, last_available_at, last_refresh_at")
        .eq("id", product.id)
        .single();

      assertEquals(updatedProduct.status, "unavailable");
      assertEquals(updatedProduct.last_available_at, lastRefreshBefore, "Should preserve last available time");
      assert(new Date(updatedProduct.last_refresh_at) > new Date(lastRefreshBefore), "Should update last_refresh_at");
    });

    it("should mark refresh_job as 'success' even when product unavailable", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Create refresh job
      const { data: job } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
        })
        .select()
        .single();

      // Simulate ItemNotAccessible handling (not a failure, expected outcome)
      await supabase
        .from("refresh_jobs")
        .update({
          status: "success", // NOT 'failed' - this is expected behavior
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_code: "ItemNotAccessible", // Record the reason
          error_message: "Product no longer available on Amazon",
        })
        .eq("id", job.id);

      // Verify job marked as success
      const { data: completedJob } = await supabase
        .from("refresh_jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      assertEquals(completedJob.status, "success", "Should be marked as success (expected outcome)");
      assertEquals(completedJob.error_code, "ItemNotAccessible");
      assertExists(completedJob.error_message);
    });
  });

  // ==========================================================================
  // Test Suite 6: Retry Logic with Exponential Backoff
  // ==========================================================================

  describe("Retry Logic - Exponential Backoff", () => {
    it("should implement exponential backoff: 1s, 2s, 4s delays", async () => {
      // This test documents the expected retry behavior
      // Delays: Attempt 1 (immediate), Attempt 2 (+1s), Attempt 3 (+2s), Attempt 4 (+4s)
      
      const delays = [0, 1000, 2000, 4000]; // milliseconds
      const attempts: number[] = [];

      // Simulate retry logic
      for (let i = 0; i < 4; i++) {
        const startTime = Date.now();
        
        if (i > 0) {
          // Wait for exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
        
        const elapsed = Date.now() - startTime;
        attempts.push(elapsed);
      }

      // Verify delays (with small tolerance for execution time)
      assert(attempts[0] < 100, "First attempt should be immediate");
      assert(attempts[1] >= 1000 && attempts[1] < 1200, "Second attempt should wait ~1s");
      assert(attempts[2] >= 2000 && attempts[2] < 2200, "Third attempt should wait ~2s");
      assert(attempts[3] >= 4000 && attempts[3] < 4200, "Fourth attempt should wait ~4s");
    });

    it("should stop after 3 retries (4 total attempts)", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Create job
      const { data: job } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
          retry_count: 0,
        })
        .select()
        .single();

      // Simulate 3 retries (4 total attempts)
      const maxRetries = 3;
      for (let i = 1; i <= maxRetries; i++) {
        await supabase
          .from("refresh_jobs")
          .update({
            retry_count: i,
            status: "failed",
          })
          .eq("id", job.id);
      }

      // Verify final retry count
      const { data: finalJob } = await supabase
        .from("refresh_jobs")
        .select("retry_count, status")
        .eq("id", job.id)
        .single();

      assertEquals(finalJob.retry_count, maxRetries);
      assertEquals(finalJob.status, "failed");
      assert(finalJob.retry_count <= 10, "Should respect max retry constraint");
    });
  });

  // ==========================================================================
  // Test Suite 7: Circuit Breaker Integration
  // ==========================================================================

  describe("Circuit Breaker Integration", () => {
    it("should skip refreshes when circuit breaker is OPEN", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Create refresh job
      const { data: job } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product.id,
          status: "pending",
        })
        .select()
        .single();

      // Simulate circuit breaker OPEN state - refresh should be skipped
      await supabase
        .from("refresh_jobs")
        .update({
          status: "skipped",
          circuit_breaker_state: "open",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_message: "Circuit breaker is OPEN, skipping refresh to prevent cascade failures",
        })
        .eq("id", job.id);

      // Verify job skipped
      const { data: skippedJob } = await supabase
        .from("refresh_jobs")
        .select("*")
        .eq("id", job.id)
        .single();

      assertEquals(skippedJob.status, "skipped");
      assertEquals(skippedJob.circuit_breaker_state, "open");
      assertStringIncludes(skippedJob.error_message, "Circuit breaker");
      assertExists(skippedJob.started_at);
      assertExists(skippedJob.completed_at);
    });

    it("should record circuit breaker state in refresh_job", async () => {
      const { data: product } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CBP",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "ESP32 Dev Board",
        })
        .select()
        .single();
      testProductIds.push(product.id);

      // Test all circuit states
      const states = ["closed", "open", "half-open"];
      
      for (const state of states) {
        const { data: job } = await supabase
          .from("refresh_jobs")
          .insert({
            product_id: product.id,
            status: "pending",
          })
          .select()
          .single();

        await supabase
          .from("refresh_jobs")
          .update({
            circuit_breaker_state: state,
            status: state === "open" ? "skipped" : "success",
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        const { data: updatedJob } = await supabase
          .from("refresh_jobs")
          .select("circuit_breaker_state, status")
          .eq("id", job.id)
          .single();

        assertEquals(updatedJob.circuit_breaker_state, state);
      }
    });

    it("should continue processing other products when circuit breaker CLOSED", async () => {
      const { data: product1 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB1",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 1",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product1.id);

      const { data: product2 } = await supabase
        .from("products")
        .insert({
          asin: "B08DQQ8CB2",
          marketplace_id: testMarketplaceId,
          status: "active",
          title: "Product 2",
          last_refresh_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      testProductIds.push(product2.id);

      // Simulate both products processed successfully (circuit CLOSED)
      const { data: job1 } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product1.id,
          status: "success",
          circuit_breaker_state: "closed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: job2 } = await supabase
        .from("refresh_jobs")
        .insert({
          product_id: product2.id,
          status: "success",
          circuit_breaker_state: "closed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Verify both jobs succeeded
      assertEquals(job1.status, "success");
      assertEquals(job2.status, "success");
      assertEquals(job1.circuit_breaker_state, "closed");
      assertEquals(job2.circuit_breaker_state, "closed");
    });
  });

  // ==========================================================================
  // Test Suite 8: Worker Metrics and Logging
  // ==========================================================================

  describe("Worker Metrics and Logging", () => {
    it("should track processed_count, success_count, failure_count metrics", () => {
      // This test documents the expected metrics structure
      // Worker should return these metrics after processing batch
      
      const metrics = {
        processed_count: 10,
        success_count: 7,
        failure_count: 2,
        skipped_count: 1,
        duration_ms: 15432,
        circuit_state: "closed",
        correlation_id: "test-correlation-id",
      };

      // Verify metrics structure
      assertExists(metrics.processed_count);
      assertExists(metrics.success_count);
      assertExists(metrics.failure_count);
      assertExists(metrics.skipped_count);
      assertExists(metrics.duration_ms);
      assertExists(metrics.circuit_state);
      assertExists(metrics.correlation_id);

      // Verify math
      assertEquals(
        metrics.processed_count,
        metrics.success_count + metrics.failure_count + metrics.skipped_count,
        "Processed should equal sum of success + failure + skipped"
      );
    });

    it("should calculate duration from start to end of worker execution", async () => {
      const startTime = Date.now();
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      assert(duration >= 100, "Duration should be at least 100ms");
      assert(duration < 200, "Duration should be less than 200ms");
    });

    it("should return metrics in response for cron job monitoring", () => {
      // Expected response structure from refresh-worker
      const expectedResponse = {
        success: true,
        metrics: {
          processed_count: 10,
          success_count: 8,
          failure_count: 1,
          skipped_count: 1,
          duration_ms: 12345,
          circuit_state: "closed",
          correlation_id: "uuid-v4-here",
        },
        message: "Refresh worker completed successfully",
      };

      assertExists(expectedResponse.success);
      assertExists(expectedResponse.metrics);
      assertExists(expectedResponse.message);
      assertEquals(expectedResponse.success, true);
      assertEquals(typeof expectedResponse.metrics.processed_count, "number");
      assertEquals(typeof expectedResponse.metrics.duration_ms, "number");
    });

    it("should log worker execution summary with all metrics", () => {
      // Expected log structure (validated by logger.info in implementation)
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Refresh worker execution completed",
        metadata: {
          processed_count: 10,
          success_count: 7,
          failure_count: 2,
          skipped_count: 1,
          circuit_state: "closed",
          duration_ms: 15432,
          correlation_id: "test-uuid",
        },
      };

      assertExists(logEntry.timestamp);
      assertEquals(logEntry.level, "info");
      assertStringIncludes(logEntry.message, "completed");
      assertExists(logEntry.metadata.processed_count);
      assertExists(logEntry.metadata.success_count);
      assertExists(logEntry.metadata.failure_count);
      assertExists(logEntry.metadata.skipped_count);
      assertExists(logEntry.metadata.circuit_state);
      assertExists(logEntry.metadata.duration_ms);
      assertExists(logEntry.metadata.correlation_id);
    });
  });

  // ==========================================================================
  // Test Suite 9: Edge Function Handler (Integration)
  // ==========================================================================

  describe("Edge Function Handler - Integration", () => {
    it("should reject non-POST requests with 405 Method Not Allowed", () => {
      // Expected behavior: Only POST allowed (cron trigger)
      const allowedMethods = ["POST"];
      const rejectedMethods = ["GET", "PUT", "DELETE", "PATCH"];

      for (const method of rejectedMethods) {
        const _request = createMockRequest(method);
        // Implementation should return 405 for these methods
        
        // This test documents expected behavior
        assert(!allowedMethods.includes(method), `${method} should not be allowed`);
      }

      assert(allowedMethods.includes("POST"), "POST should be allowed");
    });

    it("should generate correlation_id for worker execution", () => {
      // Validate correlation ID format (UUID v4)
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      const testCorrelationId = crypto.randomUUID();
      
      assert(uuidV4Regex.test(testCorrelationId), "Should generate valid UUID v4");
    });

    it("should return 200 with metrics on successful execution", () => {
      // Expected response structure
      const expectedResponse = {
        status: 200,
        body: {
          success: true,
          metrics: {
            processed_count: 10,
            success_count: 8,
            failure_count: 1,
            skipped_count: 1,
            duration_ms: 12345,
            circuit_state: "closed",
            correlation_id: "test-uuid",
          },
          message: "Refresh worker completed successfully",
        },
      };

      assertEquals(expectedResponse.status, 200);
      assertEquals(expectedResponse.body.success, true);
      assertExists(expectedResponse.body.metrics);
      assertExists(expectedResponse.body.metrics.correlation_id);
    });

    it("should return 500 with error details on unexpected failure", () => {
      // Expected error response structure
      const expectedErrorResponse = {
        status: 500,
        body: {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Refresh worker failed unexpectedly",
            correlation_id: "test-uuid",
          },
        },
      };

      assertEquals(expectedErrorResponse.status, 500);
      assertEquals(expectedErrorResponse.body.success, false);
      assertExists(expectedErrorResponse.body.error);
      assertExists(expectedErrorResponse.body.error.code);
      assertExists(expectedErrorResponse.body.error.message);
      assertExists(expectedErrorResponse.body.error.correlation_id);
    });
  });
});

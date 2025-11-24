-- Migration: Add performance indexes
-- Description: Create indexes for frequently queried columns to optimize query performance
-- Dependencies: 20251124000002_create_products.sql, 20251124000003_create_refresh_jobs.sql
-- Date: 2025-11-24

-- ============================================================================
-- PRODUCTS TABLE INDEXES
-- ============================================================================
-- Purpose: Optimize common query patterns for product lookups and filtering
-- Constitution Compliance:
-- - Performance: Indexes on frequently queried columns from day 1
-- - Query Optimization: Support ASIN lookups, status filtering, refresh scheduling

-- Index: Fast ASIN lookups (most common query pattern)
-- Usage: WHERE asin = 'B08DQQ8CBP'
-- Note: Combined with marketplace_id unique constraint, this enables fast single-product queries
CREATE INDEX IF NOT EXISTS idx_products_asin 
ON products(asin);

COMMENT ON INDEX idx_products_asin IS 'Fast lookups by ASIN (Amazon Standard Identification Number)';

-- Index: Filter products by status (active/draft/unavailable)
-- Usage: WHERE status = 'active', WHERE status IN ('active', 'draft')
-- Use case: Public product listings (status='active'), admin views (all statuses)
CREATE INDEX IF NOT EXISTS idx_products_status 
ON products(status);

COMMENT ON INDEX idx_products_status IS 'Filter products by status (active, draft, unavailable)';

-- Index: Find products needing refresh (critical for refresh-worker)
-- Usage: WHERE last_refresh_at < NOW() - INTERVAL '24 hours'
-- Usage: ORDER BY last_refresh_at ASC NULLS FIRST
-- Note: Supports both filtering and sorting for refresh worker batch selection
CREATE INDEX IF NOT EXISTS idx_products_last_refresh 
ON products(last_refresh_at ASC NULLS FIRST);

COMMENT ON INDEX idx_products_last_refresh IS 'Find products needing refresh (>24h old or NULL)';

-- Index: Filter products by marketplace
-- Usage: WHERE marketplace_id = 'uuid-here'
-- Use case: Marketplace-specific product listings, stats by region
CREATE INDEX IF NOT EXISTS idx_products_marketplace 
ON products(marketplace_id);

COMMENT ON INDEX idx_products_marketplace IS 'Filter products by marketplace (US, DE, etc.)';

-- Composite Index: Status + Last Refresh (optimal for refresh-worker query)
-- Usage: WHERE status IN ('active', 'draft') AND last_refresh_at < NOW() - INTERVAL '24 hours'
-- This composite index eliminates the need for index merge and improves refresh-worker performance
CREATE INDEX IF NOT EXISTS idx_products_status_last_refresh 
ON products(status, last_refresh_at ASC NULLS FIRST) 
WHERE status IN ('active', 'draft');

COMMENT ON INDEX idx_products_status_last_refresh IS 'Optimized for refresh-worker: active/draft products needing refresh';

-- Composite Index: Marketplace + Status (for marketplace-specific active product listings)
-- Usage: WHERE marketplace_id = 'uuid' AND status = 'active'
-- Use case: Public product catalog filtered by marketplace and status
CREATE INDEX IF NOT EXISTS idx_products_marketplace_status 
ON products(marketplace_id, status) 
WHERE status = 'active';

COMMENT ON INDEX idx_products_marketplace_status IS 'Active products by marketplace (optimized for public listings)';

-- Index: Product created date (for analytics, recent products)
-- Usage: WHERE created_at > NOW() - INTERVAL '7 days'
-- Usage: ORDER BY created_at DESC
-- Use case: "Recently added products", import statistics
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

COMMENT ON INDEX idx_products_created_at IS 'Sort/filter by creation date (recent products, analytics)';

-- ============================================================================
-- REFRESH_JOBS TABLE INDEXES
-- ============================================================================
-- Purpose: Optimize refresh job queries for monitoring and analytics
-- Constitution Compliance:
-- - Observability: Fast queries for job status, monitoring dashboards

-- Composite Index: Scheduled jobs by status (critical for job processing)
-- Usage: WHERE status = 'pending' ORDER BY scheduled_at ASC
-- Usage: WHERE status IN ('pending', 'running') AND scheduled_at < NOW()
-- Use case: Find pending jobs to process, monitor running jobs
CREATE INDEX IF NOT EXISTS idx_refresh_jobs_scheduled 
ON refresh_jobs(scheduled_at ASC, status);

COMMENT ON INDEX idx_refresh_jobs_scheduled IS 'Find pending/running jobs by schedule time';

-- Index: Find jobs by product (for product refresh history)
-- Usage: WHERE product_id = 'uuid-here'
-- Use case: View refresh history for specific product
CREATE INDEX IF NOT EXISTS idx_refresh_jobs_product 
ON refresh_jobs(product_id);

COMMENT ON INDEX idx_refresh_jobs_product IS 'Refresh history for specific product';

-- Index: Filter jobs by status (for monitoring dashboards)
-- Usage: WHERE status = 'failed', WHERE status IN ('success', 'failed')
-- Use case: Monitor failed jobs, success rates
CREATE INDEX IF NOT EXISTS idx_refresh_jobs_status 
ON refresh_jobs(status);

COMMENT ON INDEX idx_refresh_jobs_status IS 'Filter jobs by status (monitoring dashboards)';

-- Index: Recent jobs by creation date (for dashboards, analytics)
-- Usage: WHERE created_at > NOW() - INTERVAL '24 hours'
-- Usage: ORDER BY created_at DESC LIMIT 100
-- Use case: Recent job history, monitoring recent activity
CREATE INDEX IF NOT EXISTS idx_refresh_jobs_created_at 
ON refresh_jobs(created_at DESC);

COMMENT ON INDEX idx_refresh_jobs_created_at IS 'Recent jobs for monitoring and analytics';

-- Composite Index: Status + Completed date (for job statistics)
-- Usage: WHERE status = 'success' AND completed_at > NOW() - INTERVAL '1 hour'
-- Use case: Calculate success rate, average duration for completed jobs
CREATE INDEX IF NOT EXISTS idx_refresh_jobs_status_completed 
ON refresh_jobs(status, completed_at DESC) 
WHERE completed_at IS NOT NULL;

COMMENT ON INDEX idx_refresh_jobs_status_completed IS 'Completed job statistics (success rate, duration)';

-- ============================================================================
-- MARKETPLACES TABLE INDEXES
-- ============================================================================
-- Note: idx_marketplaces_code already created in T011 migration
-- No additional indexes needed - marketplaces table is small and rarely queried by filters

-- ============================================================================
-- INDEX STATISTICS
-- ============================================================================
-- Total indexes created: 13
-- - Products table: 8 indexes (1 unique constraint + 7 performance indexes)
-- - Refresh_jobs table: 5 indexes
-- - Marketplaces table: 1 index (created in T011)
--
-- Estimated index overhead:
-- - Products table: ~30-40% storage overhead for indexes (acceptable for query performance)
-- - Refresh_jobs table: ~20-30% storage overhead
-- Total: Approximately 100-200 MB for 10,000 products + 100,000 refresh jobs

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migration to verify indexes created:
--
-- List all indexes on products table:
-- SELECT 
--     indexname, 
--     indexdef,
--     pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
-- FROM pg_indexes 
-- WHERE tablename = 'products'
-- ORDER BY indexname;
--
-- List all indexes on refresh_jobs table:
-- SELECT 
--     indexname, 
--     indexdef,
--     pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
-- FROM pg_indexes 
-- WHERE tablename = 'refresh_jobs'
-- ORDER BY indexname;
--
-- Check index usage statistics (run after some queries):
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans,
--     idx_tup_read as tuples_read,
--     idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
--
-- Verify index is used in query plan (example for refresh-worker query):
-- EXPLAIN ANALYZE
-- SELECT id, asin, marketplace_id 
-- FROM products 
-- WHERE status IN ('active', 'draft')
-- AND (last_refresh_at IS NULL OR last_refresh_at < NOW() - INTERVAL '24 hours')
-- ORDER BY last_refresh_at ASC NULLS FIRST
-- LIMIT 10;
-- Expected: Should use idx_products_status_last_refresh index, NOT sequential scan

-- ============================================================================
-- QUERY PERFORMANCE TARGETS
-- ============================================================================
-- With these indexes, expected query performance:
--
-- Product lookup by ASIN:
-- SELECT * FROM products WHERE asin = 'B08DQQ8CBP';
-- Target: <5ms (index scan on idx_products_asin)
--
-- Active products by marketplace:
-- SELECT * FROM products WHERE marketplace_id = 'uuid' AND status = 'active';
-- Target: <10ms for 1000 products (index scan on idx_products_marketplace_status)
--
-- Products needing refresh (refresh-worker query):
-- SELECT * FROM products 
-- WHERE status IN ('active', 'draft') 
-- AND last_refresh_at < NOW() - INTERVAL '24 hours'
-- ORDER BY last_refresh_at ASC LIMIT 10;
-- Target: <20ms (index scan on idx_products_status_last_refresh)
--
-- Recent refresh jobs:
-- SELECT * FROM refresh_jobs ORDER BY created_at DESC LIMIT 100;
-- Target: <10ms (index scan on idx_refresh_jobs_created_at)
--
-- Pending refresh jobs:
-- SELECT * FROM refresh_jobs WHERE status = 'pending' ORDER BY scheduled_at ASC;
-- Target: <10ms (index scan on idx_refresh_jobs_scheduled)

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================
-- PostgreSQL automatically maintains indexes, but for optimal performance:
--
-- Reindex periodically (especially after bulk imports):
-- REINDEX TABLE products;
-- REINDEX TABLE refresh_jobs;
--
-- Analyze tables to update statistics (helps query planner):
-- ANALYZE products;
-- ANALYZE refresh_jobs;
--
-- Vacuum to reclaim space (after many deletes/updates):
-- VACUUM ANALYZE products;
-- VACUUM ANALYZE refresh_jobs;
--
-- Check for bloated indexes:
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
--     pg_size_pretty(pg_table_size(tablename::regclass)) as table_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration manually:
-- DROP INDEX IF EXISTS idx_refresh_jobs_status_completed;
-- DROP INDEX IF EXISTS idx_refresh_jobs_created_at;
-- DROP INDEX IF EXISTS idx_refresh_jobs_status;
-- DROP INDEX IF EXISTS idx_refresh_jobs_product;
-- DROP INDEX IF EXISTS idx_refresh_jobs_scheduled;
-- DROP INDEX IF EXISTS idx_products_created_at;
-- DROP INDEX IF EXISTS idx_products_marketplace_status;
-- DROP INDEX IF EXISTS idx_products_status_last_refresh;
-- DROP INDEX IF EXISTS idx_products_marketplace;
-- DROP INDEX IF EXISTS idx_products_last_refresh;
-- DROP INDEX IF EXISTS idx_products_status;
-- DROP INDEX IF EXISTS idx_products_asin;

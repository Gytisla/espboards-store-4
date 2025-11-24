-- Migration: Create refresh_jobs table
-- Description: Tracks background refresh operations for product data updates
-- Dependencies: 20251124000002_create_products.sql (requires products table)
-- Date: 2025-11-24

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Refresh job status enum
CREATE TYPE refresh_job_status AS ENUM (
    'pending',      -- Job scheduled but not started
    'running',      -- Job currently executing
    'success',      -- Job completed successfully
    'failed',       -- Job failed (will retry)
    'skipped'       -- Job skipped (e.g., circuit breaker open)
);

-- Circuit breaker state enum (matches types.ts)
CREATE TYPE circuit_breaker_state AS ENUM (
    'closed',       -- Normal operation, requests allowed
    'open',         -- Too many failures, requests blocked
    'half-open'     -- Testing if service recovered
);

-- ============================================================================
-- TABLE: refresh_jobs
-- ============================================================================
-- Purpose: Track automatic product refresh operations from PA-API
-- Constitution Compliance:
-- - Observability: Track job status, duration, errors for monitoring
-- - Performance: Index on scheduled_at for efficient job selection
-- - Reliability: Record retry attempts and circuit breaker state

CREATE TABLE IF NOT EXISTS refresh_jobs (
    -- ========================================================================
    -- IDENTITY
    -- ========================================================================
    
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to products table
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- ========================================================================
    -- SCHEDULING
    -- ========================================================================
    
    -- When job was scheduled to run
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- When job actually started execution
    started_at TIMESTAMPTZ,
    
    -- When job completed (success or failure)
    completed_at TIMESTAMPTZ,
    
    -- ========================================================================
    -- STATUS & RESULTS
    -- ========================================================================
    
    -- Current job status
    status refresh_job_status NOT NULL DEFAULT 'pending',
    
    -- Number of retry attempts for this job
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Error code if job failed (e.g., 'ItemNotAccessible', 'TooManyRequests')
    error_code TEXT,
    
    -- Human-readable error message
    error_message TEXT,
    
    -- Circuit breaker state at time of execution (for analytics)
    circuit_breaker_state circuit_breaker_state,
    
    -- ========================================================================
    -- TIMESTAMPS
    -- ========================================================================
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================
    
    -- Retry count must be non-negative
    CONSTRAINT refresh_jobs_retry_count_check CHECK (retry_count >= 0),
    
    -- Retry count should be reasonable (max 10 retries)
    CONSTRAINT refresh_jobs_retry_count_max_check CHECK (retry_count <= 10),
    
    -- If status is 'running', started_at must be set
    CONSTRAINT refresh_jobs_running_started_check CHECK (
        status != 'running' OR started_at IS NOT NULL
    ),
    
    -- If status is 'success' or 'failed', completed_at must be set
    CONSTRAINT refresh_jobs_completed_check CHECK (
        status NOT IN ('success', 'failed') OR completed_at IS NOT NULL
    ),
    
    -- completed_at must be after started_at
    CONSTRAINT refresh_jobs_completion_order_check CHECK (
        completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
    ),
    
    -- started_at must be after or equal to scheduled_at
    CONSTRAINT refresh_jobs_start_order_check CHECK (
        started_at IS NULL OR started_at >= scheduled_at
    ),
    
    -- Error code and message should be set together for failed jobs
    CONSTRAINT refresh_jobs_error_consistency_check CHECK (
        (error_code IS NULL AND error_message IS NULL) OR
        (error_code IS NOT NULL AND error_message IS NOT NULL)
    )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE refresh_jobs IS 'Tracks background product refresh operations from PA-API';

-- Identity
COMMENT ON COLUMN refresh_jobs.id IS 'UUID primary key for refresh job';
COMMENT ON COLUMN refresh_jobs.product_id IS 'Foreign key to products table (CASCADE delete)';

-- Scheduling
COMMENT ON COLUMN refresh_jobs.scheduled_at IS 'When job was scheduled to run';
COMMENT ON COLUMN refresh_jobs.started_at IS 'When job execution started (NULL if not started)';
COMMENT ON COLUMN refresh_jobs.completed_at IS 'When job completed (success or failure)';

-- Status
COMMENT ON COLUMN refresh_jobs.status IS 'Job status: pending, running, success, failed, skipped';
COMMENT ON COLUMN refresh_jobs.retry_count IS 'Number of retry attempts (0-10)';
COMMENT ON COLUMN refresh_jobs.error_code IS 'PA-API error code if job failed';
COMMENT ON COLUMN refresh_jobs.error_message IS 'Human-readable error message';
COMMENT ON COLUMN refresh_jobs.circuit_breaker_state IS 'Circuit breaker state during execution (for analytics)';

-- Timestamps
COMMENT ON COLUMN refresh_jobs.created_at IS 'Record creation timestamp';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate job duration in seconds
CREATE OR REPLACE FUNCTION get_refresh_job_duration(job_id UUID)
RETURNS INTEGER AS $$
DECLARE
    job_started TIMESTAMPTZ;
    job_completed TIMESTAMPTZ;
BEGIN
    SELECT started_at, completed_at 
    INTO job_started, job_completed
    FROM refresh_jobs 
    WHERE id = job_id;
    
    IF job_started IS NULL OR job_completed IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN EXTRACT(EPOCH FROM (job_completed - job_started))::INTEGER;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_refresh_job_duration IS 'Calculate job duration in seconds';

-- ============================================================================
-- VIEWS FOR MONITORING
-- ============================================================================

-- View: Recent refresh jobs with product details
CREATE OR REPLACE VIEW v_recent_refresh_jobs AS
SELECT 
    rj.id,
    rj.product_id,
    p.asin,
    p.title,
    m.code as marketplace,
    rj.status,
    rj.retry_count,
    rj.scheduled_at,
    rj.started_at,
    rj.completed_at,
    EXTRACT(EPOCH FROM (rj.completed_at - rj.started_at))::INTEGER as duration_seconds,
    rj.error_code,
    rj.error_message,
    rj.circuit_breaker_state,
    rj.created_at
FROM refresh_jobs rj
JOIN products p ON rj.product_id = p.id
JOIN marketplaces m ON p.marketplace_id = m.id
ORDER BY rj.created_at DESC
LIMIT 100;

COMMENT ON VIEW v_recent_refresh_jobs IS 'Most recent 100 refresh jobs with product details';

-- View: Refresh job statistics
CREATE OR REPLACE VIEW v_refresh_job_stats AS
SELECT 
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'success') as success_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'skipped') as skipped_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'running') as running_count,
    ROUND(AVG(retry_count), 2) as avg_retry_count,
    MAX(retry_count) as max_retry_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 2) as avg_duration_seconds,
    COUNT(DISTINCT product_id) as unique_products,
    MAX(created_at) as last_job_created
FROM refresh_jobs
WHERE created_at > NOW() - INTERVAL '24 hours';

COMMENT ON VIEW v_refresh_job_stats IS 'Refresh job statistics for last 24 hours';

-- View: Products needing refresh (used by refresh-worker)
CREATE OR REPLACE VIEW v_products_needing_refresh AS
SELECT 
    p.id,
    p.asin,
    p.title,
    p.marketplace_id,
    m.code as marketplace,
    p.status,
    p.last_refresh_at,
    EXTRACT(EPOCH FROM (NOW() - p.last_refresh_at))::INTEGER as seconds_since_refresh,
    -- Check if there's a recent pending/running job
    EXISTS(
        SELECT 1 FROM refresh_jobs rj 
        WHERE rj.product_id = p.id 
        AND rj.status IN ('pending', 'running')
        AND rj.created_at > NOW() - INTERVAL '1 hour'
    ) as has_active_job
FROM products p
JOIN marketplaces m ON p.marketplace_id = m.id
WHERE p.status IN ('active', 'draft')
AND (
    p.last_refresh_at IS NULL 
    OR p.last_refresh_at < NOW() - INTERVAL '24 hours'
)
ORDER BY p.last_refresh_at ASC NULLS FIRST;

COMMENT ON VIEW v_products_needing_refresh IS 'Products that need refreshing (>24h or never refreshed)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migration to verify success:
--
-- Check table created:
-- SELECT table_name, table_type FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'refresh_jobs';
--
-- Check columns (should have 11 columns):
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'refresh_jobs' ORDER BY ordinal_position;
--
-- Check enum types created:
-- SELECT enumlabel FROM pg_enum 
-- JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
-- WHERE pg_type.typname = 'refresh_job_status';
-- Expected: pending, running, success, failed, skipped
--
-- SELECT enumlabel FROM pg_enum 
-- JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
-- WHERE pg_type.typname = 'circuit_breaker_state';
-- Expected: closed, open, half-open
--
-- Check foreign key constraint:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'refresh_jobs'::regclass AND contype = 'f';
-- Expected: product_id FK with CASCADE delete
--
-- Check check constraints (should have 7):
-- SELECT conname FROM pg_constraint 
-- WHERE conrelid = 'refresh_jobs'::regclass AND contype = 'c';
--
-- Check views created:
-- SELECT table_name FROM information_schema.views 
-- WHERE table_schema = 'public' AND table_name LIKE 'v_%refresh%';
-- Expected: v_recent_refresh_jobs, v_refresh_job_stats, v_products_needing_refresh
--
-- Check helper function:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'get_refresh_job_duration';

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
--
-- Create a pending refresh job:
-- INSERT INTO refresh_jobs (product_id, scheduled_at, status)
-- VALUES (
--     (SELECT id FROM products WHERE asin = 'B08DQQ8CBP' LIMIT 1),
--     NOW(),
--     'pending'
-- );
--
-- Start job execution:
-- UPDATE refresh_jobs 
-- SET status = 'running', started_at = NOW()
-- WHERE id = 'job-uuid-here';
--
-- Mark job as successful:
-- UPDATE refresh_jobs 
-- SET status = 'success', completed_at = NOW()
-- WHERE id = 'job-uuid-here';
--
-- Mark job as failed with error:
-- UPDATE refresh_jobs 
-- SET 
--     status = 'failed', 
--     completed_at = NOW(),
--     retry_count = retry_count + 1,
--     error_code = 'ItemNotAccessible',
--     error_message = 'Product no longer available in PA-API',
--     circuit_breaker_state = 'closed'
-- WHERE id = 'job-uuid-here';
--
-- View recent jobs:
-- SELECT * FROM v_recent_refresh_jobs LIMIT 10;
--
-- View statistics:
-- SELECT * FROM v_refresh_job_stats;
--
-- Find products needing refresh:
-- SELECT asin, title, last_refresh_at FROM v_products_needing_refresh LIMIT 10;
--
-- Calculate job duration:
-- SELECT id, get_refresh_job_duration(id) as duration_sec FROM refresh_jobs WHERE status = 'success';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration manually:
-- DROP VIEW IF EXISTS v_products_needing_refresh;
-- DROP VIEW IF EXISTS v_refresh_job_stats;
-- DROP VIEW IF EXISTS v_recent_refresh_jobs;
-- DROP FUNCTION IF EXISTS get_refresh_job_duration(UUID);
-- DROP TABLE IF EXISTS refresh_jobs CASCADE;
-- DROP TYPE IF EXISTS circuit_breaker_state;
-- DROP TYPE IF EXISTS refresh_job_status;

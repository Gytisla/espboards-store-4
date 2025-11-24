-- Migration: Create cron job for automatic product refresh
-- Task: T063 - Configure Supabase cron job with migration
-- Schedule: Every 10 minutes (*/10 * * * *)
-- Purpose: Automatically trigger refresh-worker Edge Function to keep product data fresh
-- Capacity: 10 products/batch × 6 batches/hour = 60 products/hour = 1,440 products/day

-- Enable pg_cron extension (required for cron jobs in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;
create extension if not exists "pg_net";

-- Create cron job to trigger refresh-worker Edge Function every 10 minutes
-- This calls the refresh-worker Edge Function which:
-- 1. Selects up to 10 products that need refresh (last_refresh_at > 24h or NULL)
-- 2. Calls PA-API to get updated product data
-- 3. Updates product information (price, availability, reviews, etc.)
-- 4. Tracks job status in refresh_jobs table
-- 5. Respects circuit breaker to prevent cascade failures
SELECT cron.schedule(
    'refresh-worker-every-10min',                    -- Job name (unique identifier)
    '*/5 * * * *',                                   -- Cron schedule: every 10 minutes
    $$
    SELECT net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'WORKER_URL') || '/functions/v1/refresh-worker',
        body := '{}'::jsonb,
        params := '{}'::jsonb,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'WORKER_AUTH')
        ),
        timeout_milliseconds := 300000                -- 5 minute timeout (300 seconds)
    ) as request_id;
    $$
);

-- Note: The secrets must be stored in Supabase Vault before the cron job runs
-- 
-- To set the secrets (run via Supabase dashboard SQL editor):
-- 
-- 1. Insert WORKER_URL (Supabase project URL):
-- INSERT INTO vault.secrets (name, secret)
-- VALUES (
--     'WORKER_URL',
--     'https://ogkpdelgnmttshyedtsb.supabase.co'
-- );
-- 
-- 2. Insert WORKER_AUTH (Supabase service role key):
-- INSERT INTO vault.secrets (name, secret)
-- VALUES (
--     'WORKER_AUTH',
--     'your-service-role-key-here'
-- );
--
-- The vault.decrypted_secrets view is available only to authenticated roles
-- and provides secure access to encrypted secrets stored in vault.secrets

-- Verify cron job was created successfully
-- Run this query to check:
-- SELECT * FROM cron.job WHERE jobname = 'refresh-worker-every-10min';

-- To view cron job execution history:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-worker-every-10min')
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- To manually trigger the cron job (for testing):
-- SELECT cron.schedule('test-refresh-worker', '* * * * *', $$ ... $$);
-- SELECT cron.unschedule('test-refresh-worker');

-- To unschedule the job (if needed for maintenance):
-- SELECT cron.unschedule('refresh-worker-every-10min');

-- Expected behavior:
-- - Job runs every 10 minutes starting at minute 0, 10, 20, 30, 40, 50
-- - Each execution processes up to 10 products
-- - Total capacity: 1,440 products refreshed per day (60 per hour × 24 hours)
-- - Products refresh on a 24-hour cycle (if catalog ≤ 1,440 products)
-- - Circuit breaker protection prevents cascade failures during PA-API outages
-- - All executions logged to Supabase logs and refresh_jobs table

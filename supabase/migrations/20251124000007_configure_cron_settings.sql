-- Migration: Configure cron job secrets using Supabase Vault
-- Task: T063 - Configure Supabase cron job with migration
-- Purpose: Store Supabase URL and service role key securely for cron job authentication

-- Note: Supabase Vault extension is automatically enabled in Supabase projects
-- The vault.secrets table stores encrypted secrets
-- The vault.decrypted_secrets view provides access to decrypted secrets (with proper permissions)

-- Instructions for setting up the secrets:
-- 
-- Run these commands in the Supabase Dashboard SQL Editor:
-- 
-- 1. Store the Supabase project URL:
-- INSERT INTO vault.secrets (name, secret)
-- VALUES (
--     'WORKER_URL',
--     'https://ogkpdelgnmttshyedtsb.supabase.co'
-- )
-- ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
-- 
-- 2. Store the Supabase service role key:
-- INSERT INTO vault.secrets (name, secret)
-- VALUES (
--     'WORKER_AUTH',
--     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  -- Replace with actual service_role key
-- )
-- ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
-- 
-- 3. Verify secrets are stored (only shows names, not values):
-- SELECT name, created_at, updated_at FROM vault.secrets WHERE name IN ('WORKER_URL', 'WORKER_AUTH');
-- 
-- 4. Test decryption (only accessible with proper permissions):
-- SELECT name FROM vault.decrypted_secrets WHERE name IN ('WORKER_URL', 'WORKER_AUTH');

-- Important Security Notes:
-- - Never commit actual secret values to version control
-- - The service_role key is found in Supabase Dashboard > Settings > API
-- - Vault secrets are encrypted at rest using the database master key
-- - Only postgres role and service_role can access vault.decrypted_secrets
-- - For local development, set these secrets in your local Supabase instance

-- To retrieve your service role key:
-- 1. Go to: https://supabase.com/dashboard/project/ogkpdelgnmttshyedtsb/settings/api
-- 2. Copy the "service_role" key (not the "anon" key)
-- 3. Insert it using the SQL command above

-- For local development:
-- 1. Start local Supabase: supabase start
-- 2. Get local service_role key: supabase status
-- 3. Run the INSERT statements with local values in the local SQL editor

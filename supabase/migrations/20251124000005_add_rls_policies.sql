-- Migration: Add Row Level Security (RLS) policies
-- Description: Enable RLS and create security policies for public read access and service role operations
-- Dependencies: 20251124000002_create_products.sql, 20251124000003_create_refresh_jobs.sql
-- Date: 2025-11-24

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) OVERVIEW
-- ============================================================================
-- Purpose: Control database access at the row level based on user authentication
-- Constitution Compliance:
-- - Security: Prevent unauthorized data access
-- - API Design: Public read for active products, service role for all operations
-- - Future-proof: Admin policies will be added with Supabase Auth in future iteration

-- RLS Strategy:
-- 1. Enable RLS on all tables (deny all by default)
-- 2. Allow public (anon) read access to active products only
-- 3. Allow service_role (Edge Functions) full access to all tables
-- 4. Future: Add authenticated user policies when implementing admin dashboard

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on marketplaces table
ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on refresh_jobs table
ALTER TABLE refresh_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MARKETPLACES TABLE POLICIES
-- ============================================================================
-- Security Model:
-- - Public read: Marketplaces are reference data, safe to expose
-- - Service role: Full access for Edge Functions
-- - Future: No admin write needed (marketplaces managed via migrations)

-- Policy: Allow public read access to all marketplaces
-- Use case: Frontend can query available marketplaces for dropdown/selection
CREATE POLICY "marketplaces_public_read"
ON marketplaces
FOR SELECT
TO anon, authenticated
USING (true);

COMMENT ON POLICY "marketplaces_public_read" ON marketplaces IS 
'Allow public read access to all marketplaces (reference data)';

-- Policy: Allow service_role full access
-- Use case: Edge Functions can read marketplaces for PA-API configuration
CREATE POLICY "marketplaces_service_all"
ON marketplaces
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "marketplaces_service_all" ON marketplaces IS 
'Allow Edge Functions (service_role) full access to marketplaces';

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================
-- Security Model:
-- - Public read: Only active products visible (status='active')
-- - Service role: Full access for Edge Functions (import, refresh, etc.)
-- - Future: Authenticated admin users can manage all products

-- Policy: Allow public read access to active products only
-- Use case: Public product catalog, search, product details page
-- Note: Draft and unavailable products hidden from public
CREATE POLICY "products_public_read_active"
ON products
FOR SELECT
TO anon, authenticated
USING (status = 'active');

COMMENT ON POLICY "products_public_read_active" ON products IS 
'Allow public read access to active products only (hide draft/unavailable)';

-- Policy: Allow service_role full access
-- Use case: Edge Functions can insert (import), update (refresh), and read all products
CREATE POLICY "products_service_all"
ON products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "products_service_all" ON products IS 
'Allow Edge Functions (service_role) full access to products (import, refresh, etc.)';

-- Future Policy (commented out - will be added with Supabase Auth):
-- Policy: Allow authenticated admin users full access
-- CREATE POLICY "products_admin_all"
-- ON products
-- FOR ALL
-- TO authenticated
-- USING (
--     EXISTS (
--         SELECT 1 FROM user_roles
--         WHERE user_id = auth.uid()
--         AND role IN ('admin', 'editor')
--     )
-- )
-- WITH CHECK (
--     EXISTS (
--         SELECT 1 FROM user_roles
--         WHERE user_id = auth.uid()
--         AND role IN ('admin', 'editor')
--     )
-- );

-- ============================================================================
-- REFRESH_JOBS TABLE POLICIES
-- ============================================================================
-- Security Model:
-- - Public read: Denied (internal operations only)
-- - Service role: Full access for Edge Functions (refresh-worker)
-- - Future: Authenticated admin users can view job history

-- Policy: Deny public access to refresh_jobs (internal operations only)
-- Note: No policy needed for anon/authenticated - RLS enabled means default deny

-- Policy: Allow service_role full access
-- Use case: refresh-worker Edge Function creates and updates refresh jobs
CREATE POLICY "refresh_jobs_service_all"
ON refresh_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "refresh_jobs_service_all" ON refresh_jobs IS 
'Allow Edge Functions (service_role) full access to refresh jobs';

-- Future Policy (commented out - will be added with Supabase Auth):
-- Policy: Allow authenticated admin users read access to job history
-- CREATE POLICY "refresh_jobs_admin_read"
-- ON refresh_jobs
-- FOR SELECT
-- TO authenticated
-- USING (
--     EXISTS (
--         SELECT 1 FROM user_roles
--         WHERE user_id = auth.uid()
--         AND role IN ('admin', 'viewer')
--     )
-- );

-- ============================================================================
-- SECURITY TESTING QUERIES
-- ============================================================================
-- Test policies after migration:
--
-- 1. Test public read access to active products:
-- SET ROLE anon;
-- SELECT count(*) FROM products WHERE status = 'active';
-- Expected: Returns count (success)
--
-- SELECT count(*) FROM products WHERE status = 'draft';
-- Expected: Returns 0 (draft products filtered out)
--
-- 2. Test public write denied:
-- SET ROLE anon;
-- INSERT INTO products (asin, marketplace_id, title) VALUES ('TEST123456', 'uuid', 'Test');
-- Expected: ERROR - new row violates row-level security policy
--
-- 3. Test service_role full access:
-- SET ROLE service_role;
-- SELECT count(*) FROM products;
-- Expected: Returns count of all products (including draft, unavailable)
--
-- INSERT INTO products (asin, marketplace_id, title, status) 
-- VALUES ('TEST123456', (SELECT id FROM marketplaces WHERE code = 'US'), 'Test', 'draft');
-- Expected: Success
--
-- 4. Test public read access to marketplaces:
-- SET ROLE anon;
-- SELECT count(*) FROM marketplaces;
-- Expected: Returns count (success)
--
-- 5. Test refresh_jobs denied to public:
-- SET ROLE anon;
-- SELECT count(*) FROM refresh_jobs;
-- Expected: Returns 0 (no access)
--
-- 6. Test service_role access to refresh_jobs:
-- SET ROLE service_role;
-- SELECT count(*) FROM refresh_jobs;
-- Expected: Returns count (success)
--
-- Reset role:
-- RESET ROLE;

-- ============================================================================
-- POLICY VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify policies created:
--
-- List all policies:
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual as using_expression,
--     with_check as with_check_expression
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- Expected policies:
-- - marketplaces: 2 policies (public_read, service_all)
-- - products: 2 policies (public_read_active, service_all)
-- - refresh_jobs: 1 policy (service_all)
--
-- Check RLS enabled:
-- SELECT 
--     schemaname,
--     tablename,
--     rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('marketplaces', 'products', 'refresh_jobs');
--
-- Expected: rls_enabled = true for all three tables

-- ============================================================================
-- EDGE FUNCTION USAGE
-- ============================================================================
-- Edge Functions automatically use service_role credentials:
--
-- Example: Import product Edge Function
-- import { createClient } from '@supabase/supabase-js';
--
-- const supabase = createClient(
--     Deno.env.get('SUPABASE_URL')!,
--     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // service_role bypasses RLS
-- );
--
-- // This works because service_role has full access
-- const { data, error } = await supabase
--     .from('products')
--     .insert({
--         asin: 'B08DQQ8CBP',
--         marketplace_id: marketplaceId,
--         title: 'ESP32 DevKit',
--         status: 'draft' // Even draft products can be inserted
--     });

-- ============================================================================
-- NUXT FRONTEND USAGE
-- ============================================================================
-- Frontend uses anon key, subject to RLS policies:
--
-- Example: Product listing page
-- import { createClient } from '@supabase/supabase-js';
--
-- const supabase = createClient(
--     runtimeConfig.public.supabaseUrl,
--     runtimeConfig.public.supabaseKey // anon key, RLS enforced
-- );
--
-- // This only returns active products (draft/unavailable filtered out)
-- const { data: products } = await supabase
--     .from('products')
--     .select('*')
--     .eq('marketplace_id', marketplaceId);
--
-- // This will fail (INSERT denied for anon role)
-- const { error } = await supabase
--     .from('products')
--     .insert({ asin: 'TEST123456', title: 'Test' });
-- // error: "new row violates row-level security policy"

-- ============================================================================
-- SECURITY BEST PRACTICES
-- ============================================================================
-- 1. Always use service_role key in Edge Functions (server-side only)
-- 2. Never expose service_role key to frontend (use anon key)
-- 3. Test policies with different roles before deploying
-- 4. Document policy changes in migration comments
-- 5. Add admin policies when implementing Supabase Auth
-- 6. Consider adding read-only policies for analytics/reporting users

-- ============================================================================
-- FUTURE ENHANCEMENTS
-- ============================================================================
-- When implementing admin dashboard with Supabase Auth:
--
-- 1. Create user_roles table:
-- CREATE TABLE user_roles (
--     user_id UUID REFERENCES auth.users(id),
--     role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     PRIMARY KEY (user_id, role)
-- );
--
-- 2. Add admin policies to products table:
-- - Allow admin/editor full access
-- - Allow viewer read-only access
--
-- 3. Add admin policies to refresh_jobs table:
-- - Allow admin/viewer read access for monitoring
--
-- 4. Add RLS to user_roles table:
-- - Users can read their own roles
-- - Only admins can modify roles

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration manually:
-- DROP POLICY IF EXISTS "refresh_jobs_service_all" ON refresh_jobs;
-- DROP POLICY IF EXISTS "products_service_all" ON products;
-- DROP POLICY IF EXISTS "products_public_read_active" ON products;
-- DROP POLICY IF EXISTS "marketplaces_service_all" ON marketplaces;
-- DROP POLICY IF EXISTS "marketplaces_public_read" ON marketplaces;
-- ALTER TABLE refresh_jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE marketplaces DISABLE ROW LEVEL SECURITY;

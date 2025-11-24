-- Migration: Create marketplaces table
-- Description: Stores Amazon marketplace configuration (US, DE, etc.) with PA-API endpoints
-- Dependencies: None (first migration)
-- Date: 2025-11-24

-- ============================================================================
-- TABLE: marketplaces
-- ============================================================================
-- Purpose: Store Amazon marketplace configurations for PA-API integration
-- Constitution Compliance:
-- - Backend-First: Database schema before application code
-- - Performance: UUID primary key for distributed systems
-- - API Design: Normalize marketplace data for multi-region support

CREATE TABLE IF NOT EXISTS marketplaces (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Marketplace Identification
    code TEXT NOT NULL UNIQUE, -- e.g., 'US', 'DE', 'UK', 'FR'
    region_name TEXT NOT NULL, -- e.g., 'United States', 'Germany'
    
    -- Localization
    currency TEXT NOT NULL, -- ISO 4217 currency code: 'USD', 'EUR', 'GBP'
    
    -- PA-API Configuration
    paapi_endpoint TEXT NOT NULL, -- PA-API 5.0 endpoint URL
    associate_tag TEXT NOT NULL, -- Amazon Associate Tag for this marketplace
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT marketplaces_code_check CHECK (code = UPPER(code)), -- Enforce uppercase codes
    CONSTRAINT marketplaces_code_length_check CHECK (LENGTH(code) BETWEEN 2 AND 3), -- ISO 3166-1 alpha-2/3
    CONSTRAINT marketplaces_currency_check CHECK (LENGTH(currency) = 3) -- ISO 4217 3-letter codes
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for lookup by marketplace code (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_marketplaces_code ON marketplaces(code);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE marketplaces IS 'Amazon marketplace configurations for PA-API integration';
COMMENT ON COLUMN marketplaces.id IS 'UUID primary key for marketplace';
COMMENT ON COLUMN marketplaces.code IS 'ISO 3166-1 alpha-2 country code (US, DE, etc.)';
COMMENT ON COLUMN marketplaces.region_name IS 'Human-readable marketplace name';
COMMENT ON COLUMN marketplaces.currency IS 'ISO 4217 3-letter currency code';
COMMENT ON COLUMN marketplaces.paapi_endpoint IS 'Amazon Product Advertising API 5.0 endpoint URL';
COMMENT ON COLUMN marketplaces.associate_tag IS 'Amazon Associate Tag (Partner Tag) for this marketplace';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplaces_updated_at
    BEFORE UPDATE ON marketplaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================
-- Insert initial marketplace configurations for US and DE
-- Note: PA-API endpoints are from official AWS documentation
-- Note: Associate tags are placeholders - replace with actual tags from T004 env setup

-- United States Marketplace
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES (
    'US',
    'United States',
    'USD',
    'https://webservices.amazon.com/paapi5/getitems',
    'espboards-20' -- Placeholder: Replace with actual US associate tag
) ON CONFLICT (code) DO NOTHING;

-- Germany Marketplace
INSERT INTO marketplaces (code, region_name, currency, paapi_endpoint, associate_tag)
VALUES (
    'DE',
    'Germany',
    'EUR',
    'https://webservices.amazon.de/paapi5/getitems',
    'espboards-21' -- Placeholder: Replace with actual DE associate tag
) ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migration to verify success:
-- 
-- Check table created:
-- SELECT table_name, table_type FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'marketplaces';
--
-- Check columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'marketplaces' ORDER BY ordinal_position;
--
-- Check seed data:
-- SELECT id, code, region_name, currency FROM marketplaces ORDER BY code;
--
-- Check indexes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'marketplaces';
--
-- Check constraints:
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint WHERE conrelid = 'marketplaces'::regclass;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration manually:
-- DROP TRIGGER IF EXISTS update_marketplaces_updated_at ON marketplaces;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS marketplaces CASCADE;

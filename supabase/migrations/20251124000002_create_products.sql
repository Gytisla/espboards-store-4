-- Migration: Create products table
-- Description: Stores ESP32 products imported from Amazon PA-API with comprehensive metadata
-- Dependencies: 20251124000001_create_marketplaces.sql (requires marketplaces table)
-- Date: 2025-11-24

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Product status enum
CREATE TYPE product_status AS ENUM ('draft', 'active', 'unavailable');

-- ============================================================================
-- TABLE: products
-- ============================================================================
-- Purpose: Store ESP32 products from Amazon with full PA-API metadata
-- Constitution Compliance:
-- - Backend-First: Complete schema for all PA-API fields
-- - Performance: Indexes on frequently queried columns (added in T014)
-- - API Design: JSONB for flexible image/raw data storage

CREATE TABLE IF NOT EXISTS products (
    -- ========================================================================
    -- IDENTITY
    -- ========================================================================
    
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Amazon Standard Identification Number (unique per marketplace)
    asin TEXT NOT NULL,
    
    -- Foreign key to marketplaces table
    marketplace_id UUID NOT NULL REFERENCES marketplaces(id) ON DELETE RESTRICT,
    
    -- Self-referencing FK for product variations (e.g., different colors/sizes)
    -- NULL for standalone products, points to parent for variations
    parent_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- ========================================================================
    -- BASIC INFORMATION
    -- ========================================================================
    
    -- Product title from PA-API
    title TEXT,
    
    -- Product description/features
    description TEXT,
    
    -- Brand name
    brand TEXT,
    
    -- Manufacturer name
    manufacturer TEXT,
    
    -- ========================================================================
    -- MEDIA
    -- ========================================================================
    
    -- Product images stored as JSONB array
    -- Format: [{ url: string, width?: number, height?: number, variant?: string }]
    -- PA-API provides: Primary, Secondary, Thumbnail variants
    images JSONB,
    
    -- Amazon product detail page URL
    detail_page_url TEXT,
    
    -- ========================================================================
    -- PRICING
    -- ========================================================================
    
    -- Current selling price (from Offers.Listings[0].Price.Amount)
    current_price DECIMAL(10, 2),
    
    -- Original/list price before discounts (from Offers.Listings[0].SavingBasis.Amount)
    original_price DECIMAL(10, 2),
    
    -- Calculated savings amount (original_price - current_price)
    savings_amount DECIMAL(10, 2),
    
    -- Calculated savings percentage ((savings_amount / original_price) * 100)
    savings_percentage DECIMAL(5, 2),
    
    -- Currency code (USD, EUR, GBP, etc.)
    currency TEXT,
    
    -- ========================================================================
    -- AVAILABILITY
    -- ========================================================================
    
    -- Availability type from PA-API (e.g., "Now", "PreOrder", "Backorder")
    availability_type TEXT,
    
    -- Human-readable availability message
    availability_message TEXT,
    
    -- ========================================================================
    -- RATINGS & REVIEWS
    -- ========================================================================
    
    -- Number of customer reviews
    customer_review_count INTEGER,
    
    -- Average star rating (0.0 to 5.0)
    star_rating DECIMAL(3, 2),
    
    -- ========================================================================
    -- METADATA
    -- ========================================================================
    
    -- Product status (draft = imported but not active, active = visible, unavailable = no longer available)
    status product_status NOT NULL DEFAULT 'draft',
    
    -- Last time product data was refreshed from PA-API
    last_refresh_at TIMESTAMPTZ,
    
    -- Last time product was available (used to track when products become unavailable)
    last_available_at TIMESTAMPTZ,
    
    -- ========================================================================
    -- RAW DATA
    -- ========================================================================
    
    -- Complete raw PA-API response stored as JSONB for debugging and future fields
    -- Allows us to access any PA-API fields we didn't explicitly extract
    raw_paapi_response JSONB,
    
    -- ========================================================================
    -- TIMESTAMPS
    -- ========================================================================
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================
    
    -- Each ASIN must be unique within a marketplace (same product can exist in US and DE)
    CONSTRAINT products_asin_marketplace_unique UNIQUE (asin, marketplace_id),
    
    -- ASIN format validation (10 alphanumeric characters)
    CONSTRAINT products_asin_format_check CHECK (asin ~ '^[A-Z0-9]{10}$'),
    
    -- Prices must be non-negative
    CONSTRAINT products_current_price_check CHECK (current_price >= 0),
    CONSTRAINT products_original_price_check CHECK (original_price >= 0),
    CONSTRAINT products_savings_amount_check CHECK (savings_amount >= 0),
    
    -- Savings percentage must be between 0 and 100
    CONSTRAINT products_savings_percentage_check CHECK (savings_percentage >= 0 AND savings_percentage <= 100),
    
    -- Star rating must be between 0 and 5
    CONSTRAINT products_star_rating_check CHECK (star_rating >= 0 AND star_rating <= 5),
    
    -- Review count must be non-negative
    CONSTRAINT products_review_count_check CHECK (customer_review_count >= 0),
    
    -- Currency code must be 3 uppercase letters (ISO 4217)
    CONSTRAINT products_currency_format_check CHECK (currency IS NULL OR (LENGTH(currency) = 3 AND currency = UPPER(currency)))
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE products IS 'ESP32 products imported from Amazon PA-API with comprehensive metadata';

-- Identity columns
COMMENT ON COLUMN products.id IS 'UUID primary key for product';
COMMENT ON COLUMN products.asin IS 'Amazon Standard Identification Number (10 alphanumeric characters)';
COMMENT ON COLUMN products.marketplace_id IS 'Foreign key to marketplaces table';
COMMENT ON COLUMN products.parent_id IS 'Self-referencing FK for product variations (NULL for standalone products)';

-- Basic information
COMMENT ON COLUMN products.title IS 'Product title from PA-API (ItemInfo.Title.DisplayValue)';
COMMENT ON COLUMN products.description IS 'Product description/features';
COMMENT ON COLUMN products.brand IS 'Brand name (ItemInfo.ByLineInfo.Brand.DisplayValue)';
COMMENT ON COLUMN products.manufacturer IS 'Manufacturer name (ItemInfo.ByLineInfo.Manufacturer.DisplayValue)';

-- Media
COMMENT ON COLUMN products.images IS 'Product images as JSONB array: [{ url, width, height, variant }]';
COMMENT ON COLUMN products.detail_page_url IS 'Amazon product detail page URL';

-- Pricing
COMMENT ON COLUMN products.current_price IS 'Current selling price (Offers.Listings[0].Price.Amount)';
COMMENT ON COLUMN products.original_price IS 'Original price before discounts (Offers.Listings[0].SavingBasis.Amount)';
COMMENT ON COLUMN products.savings_amount IS 'Calculated: original_price - current_price';
COMMENT ON COLUMN products.savings_percentage IS 'Calculated: (savings_amount / original_price) * 100';
COMMENT ON COLUMN products.currency IS 'ISO 4217 3-letter currency code (USD, EUR, GBP)';

-- Availability
COMMENT ON COLUMN products.availability_type IS 'PA-API availability type (Now, PreOrder, Backorder, etc.)';
COMMENT ON COLUMN products.availability_message IS 'Human-readable availability message';

-- Ratings
COMMENT ON COLUMN products.customer_review_count IS 'Number of customer reviews';
COMMENT ON COLUMN products.star_rating IS 'Average star rating (0.0 to 5.0)';

-- Metadata
COMMENT ON COLUMN products.status IS 'Product status: draft (imported), active (visible), unavailable (no longer available)';
COMMENT ON COLUMN products.last_refresh_at IS 'Timestamp of last PA-API data refresh';
COMMENT ON COLUMN products.last_available_at IS 'Last time product was available (tracks unavailability)';

-- Raw data
COMMENT ON COLUMN products.raw_paapi_response IS 'Complete PA-API GetItems response as JSONB for debugging';

-- Timestamps
COMMENT ON COLUMN products.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN products.updated_at IS 'Last update timestamp';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp on row modification
-- Note: update_updated_at_column() function created in T011 migration
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate savings amount and percentage
-- Can be called by application code or triggers
CREATE OR REPLACE FUNCTION calculate_product_savings()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate savings_amount if both prices are present
    IF NEW.original_price IS NOT NULL AND NEW.current_price IS NOT NULL THEN
        NEW.savings_amount := NEW.original_price - NEW.current_price;
        
        -- Calculate savings_percentage if original price > 0
        IF NEW.original_price > 0 THEN
            NEW.savings_percentage := ((NEW.savings_amount / NEW.original_price) * 100)::DECIMAL(5, 2);
        ELSE
            NEW.savings_percentage := 0;
        END IF;
    ELSE
        -- Clear savings if prices not available
        NEW.savings_amount := NULL;
        NEW.savings_percentage := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate savings on insert/update
CREATE TRIGGER calculate_products_savings
    BEFORE INSERT OR UPDATE OF original_price, current_price ON products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_product_savings();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after migration to verify success:
--
-- Check table created:
-- SELECT table_name, table_type FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'products';
--
-- Check columns (should have 24 columns):
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' ORDER BY ordinal_position;
--
-- Check enum type created:
-- SELECT enumlabel FROM pg_enum 
-- JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
-- WHERE pg_type.typname = 'product_status';
-- Expected: draft, active, unavailable
--
-- Check foreign key constraints:
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'products'::regclass AND contype = 'f';
-- Expected: marketplace_id FK, parent_id FK
--
-- Check unique constraint:
-- SELECT conname FROM pg_constraint 
-- WHERE conrelid = 'products'::regclass AND contype = 'u';
-- Expected: products_asin_marketplace_unique
--
-- Check check constraints (should have 8):
-- SELECT conname FROM pg_constraint 
-- WHERE conrelid = 'products'::regclass AND contype = 'c';
--
-- Check triggers:
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'products'::regclass;
-- Expected: update_products_updated_at, calculate_products_savings

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
-- 
-- Insert a product (savings calculated automatically):
-- INSERT INTO products (
--     asin, marketplace_id, title, brand, 
--     current_price, original_price, currency, status
-- ) VALUES (
--     'B08DQQ8CBP',
--     (SELECT id FROM marketplaces WHERE code = 'US'),
--     'ESP32-DevKitC-32UE Development Board',
--     'Espressif',
--     15.99, 19.99, 'USD', 'active'
-- );
-- savings_amount will be calculated as: 19.99 - 15.99 = 4.00
-- savings_percentage will be calculated as: (4.00 / 19.99) * 100 = 20.01
--
-- Query products by marketplace:
-- SELECT p.asin, p.title, p.current_price, p.currency, m.code as marketplace
-- FROM products p
-- JOIN marketplaces m ON p.marketplace_id = m.id
-- WHERE m.code = 'US' AND p.status = 'active';
--
-- Update price (savings recalculated automatically):
-- UPDATE products 
-- SET current_price = 14.99 
-- WHERE asin = 'B08DQQ8CBP';
-- savings_amount becomes: 19.99 - 14.99 = 5.00
-- savings_percentage becomes: (5.00 / 19.99) * 100 = 25.01

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback this migration manually:
-- DROP TRIGGER IF EXISTS calculate_products_savings ON products;
-- DROP TRIGGER IF EXISTS update_products_updated_at ON products;
-- DROP FUNCTION IF EXISTS calculate_product_savings();
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TYPE IF EXISTS product_status;

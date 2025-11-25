-- Migration: Add extended product fields
-- Description: Add columns for features, technical info, and enhanced image storage
-- Dependencies: 20251124000002_create_products.sql
-- Date: 2025-11-25

-- ============================================================================
-- ADD NEW COLUMNS
-- ============================================================================

-- Product features as text array (from ItemInfo.Features.DisplayValues)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Technical information as JSONB (from ItemInfo.TechnicalInfo)
-- Stores key-value pairs like dimensions, weight, connectivity, etc.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS technical_info JSONB;

-- Product information as JSONB (from ItemInfo.ProductInfo)
-- Stores additional product details like size, color, model, etc.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_info JSONB;

-- Content information as JSONB (from ItemInfo.ContentInfo)
-- Stores page count, publication date, edition, language, etc.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS content_info JSONB;

-- Manufacturing information as JSONB (from ItemInfo.ManufactureInfo)
-- Stores model, part number, warranty, etc.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS manufacture_info JSONB;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN products.features IS 'Product features as text array from ItemInfo.Features.DisplayValues';
COMMENT ON COLUMN products.technical_info IS 'Technical specifications as JSONB from ItemInfo.TechnicalInfo';
COMMENT ON COLUMN products.product_info IS 'Product information as JSONB from ItemInfo.ProductInfo (size, color, model)';
COMMENT ON COLUMN products.content_info IS 'Content information as JSONB from ItemInfo.ContentInfo (pages, edition, language)';
COMMENT ON COLUMN products.manufacture_info IS 'Manufacturing info as JSONB from ItemInfo.ManufactureInfo (model, part number, warranty)';

-- ============================================================================
-- NOTE: Images column already exists as JSONB
-- ============================================================================
-- The existing images JSONB column will be updated to store all variants:
-- {
--   primary: {
--     small: { url, width, height },
--     medium: { url, width, height },
--     large: { url, width, height },
--     highRes: { url, width, height }
--   },
--   variants: [
--     {
--       small: { url, width, height },
--       medium: { url, width, height },
--       large: { url, width, height },
--       highRes: { url, width, height }
--     }
--   ]
-- }

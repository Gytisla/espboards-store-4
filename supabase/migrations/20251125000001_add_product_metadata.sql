-- Migration: Add product metadata column
-- Description: Add JSONB metadata column to products table for technical specifications
-- User Story: US4 - Product Metadata Management
-- Task: T110
-- Dependencies: 20251124000002_create_products.sql (requires products table)
-- Date: 2025-11-25

-- ============================================================================
-- PRODUCT METADATA
-- ============================================================================
-- Purpose: Store technical specifications for products (ESP32 boards, sensors, displays, etc.)
-- Structure: Dual-structure design for efficient filtering
--   - display: Human-readable values for UI (e.g., "8MB PSRAM", "802.11 b/g/n")
--   - filters: Machine-readable values for queries (e.g., psram_mb: 8, wifi_generation: 4)
--
-- Benefits:
--   - Fast numeric range queries without string parsing
--   - Efficient array containment searches (sensor_types, wifi_standards)
--   - Type-safe boolean filters (no casting)
--   - Indexed fields for sub-millisecond queries
--
-- Constitution Compliance:
--   - Performance: GIN + expression indexes for <20ms query time
--   - Code Quality: JSON Schema validation at application layer
--   - Scalability: No migrations needed for new metadata fields

-- ============================================================================
-- ALTER TABLE: Add metadata column
-- ============================================================================

ALTER TABLE products 
ADD COLUMN metadata JSONB DEFAULT '{"display": {}, "filters": {}}'::JSONB;

-- Add check constraint to ensure metadata is a valid JSON object
ALTER TABLE products
ADD CONSTRAINT check_metadata_is_object 
CHECK (jsonb_typeof(metadata) = 'object');

-- Add check constraint to ensure metadata has display and filters keys
ALTER TABLE products
ADD CONSTRAINT check_metadata_structure
CHECK (
  metadata ? 'display' AND 
  metadata ? 'filters' AND
  jsonb_typeof(metadata->'display') = 'object' AND
  jsonb_typeof(metadata->'filters') = 'object'
);

-- ============================================================================
-- INDEXES: GIN indexes for JSONB queries
-- ============================================================================
-- Purpose: Enable fast full-text search and complex JSONB queries
-- Performance: Sub-millisecond for most queries with proper indexes

-- Full metadata GIN index (for complex queries across all fields)
CREATE INDEX idx_products_metadata_gin 
ON products USING GIN (metadata);

-- Specialized GIN index for filter fields (most common query pattern)
-- This index is smaller and faster than full metadata index
CREATE INDEX idx_products_metadata_filters_gin 
ON products USING GIN ((metadata->'filters'));

-- ============================================================================
-- INDEXES: Expression indexes for high-traffic text filters
-- ============================================================================
-- Purpose: Enable fast equality queries on common filter fields
-- Performance: Direct B-tree lookup, <1ms query time

-- Product type index (used in almost every filtered query)
CREATE INDEX idx_products_product_type 
ON products ((metadata->'filters'->>'product_type'));

-- Chip model index (most common filter for development boards)
CREATE INDEX idx_products_chip 
ON products ((metadata->'filters'->>'chip'));

-- Chip series index (enables "all ESP32-S" queries without listing S2, S3)
CREATE INDEX idx_products_chip_series 
ON products ((metadata->'filters'->>'chip_series'));

-- ============================================================================
-- INDEXES: Expression indexes for numeric range queries
-- ============================================================================
-- Purpose: Enable fast range queries (>=, <=, BETWEEN) without string parsing
-- Performance: B-tree range scan, 1-5ms query time
-- Pattern: Cast JSONB text to integer with WHERE clause to filter NULLs

-- PSRAM size index (common filter: "8MB or more PSRAM")
CREATE INDEX idx_products_psram_mb 
ON products (((metadata->'filters'->>'psram_mb')::integer))
WHERE (metadata->'filters'->>'psram_mb') IS NOT NULL;

-- Flash size index (common filter: "16MB or more Flash")
CREATE INDEX idx_products_flash_mb 
ON products (((metadata->'filters'->>'flash_mb')::integer))
WHERE (metadata->'filters'->>'flash_mb') IS NOT NULL;

-- GPIO pins index (common filter: "at least 30 GPIO pins")
CREATE INDEX idx_products_gpio_pins 
ON products (((metadata->'filters'->>'gpio_pins')::integer))
WHERE (metadata->'filters'->>'gpio_pins') IS NOT NULL;

-- ============================================================================
-- INDEXES: GIN index for array containment queries
-- ============================================================================
-- Purpose: Enable fast array containment queries (sensor_types, interfaces, etc.)
-- Performance: 2-10ms for array searches with GIN index
-- Pattern: Partial index with WHERE clause to scope to specific product types

-- Sensor types index (enables "sensors with temperature capability")
-- Scoped to sensor products only to reduce index size
CREATE INDEX idx_products_sensor_types 
ON products USING GIN ((metadata->'filters'->'sensor_types'))
WHERE metadata->'filters'->>'product_type' = 'sensor';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN products.metadata IS 
'Technical specifications in dual-structure format: 
{
  "display": {"chip": "ESP32-S3", "psram": "8MB PSRAM"},
  "filters": {"chip": "ESP32-S3", "chip_series": "ESP32-S", "psram_mb": 8}
}
Display fields are human-readable for UI, filter fields are normalized for efficient queries.';

COMMENT ON INDEX idx_products_metadata_gin IS 
'Full GIN index on metadata for complex JSONB queries across all fields. Use for unstructured searches.';

COMMENT ON INDEX idx_products_metadata_filters_gin IS 
'GIN index on filters subobject only. Faster and smaller than full metadata index. Use for structured filter queries.';

COMMENT ON INDEX idx_products_product_type IS 
'Expression index for product_type filter. Enables fast equality queries: WHERE metadata->''filters''->>''product_type'' = ''sensor''.';

COMMENT ON INDEX idx_products_chip IS 
'Expression index for chip model filter. Enables fast queries: WHERE metadata->''filters''->>''chip'' = ''ESP32-S3''.';

COMMENT ON INDEX idx_products_chip_series IS 
'Expression index for chip series filter. Enables queries like: WHERE metadata->''filters''->>''chip_series'' = ''ESP32-S'' to find all ESP32-S2 and ESP32-S3 boards.';

COMMENT ON INDEX idx_products_psram_mb IS 
'Expression index for PSRAM size with integer cast. Enables fast range queries: WHERE (metadata->''filters''->>''psram_mb'')::integer >= 8.';

COMMENT ON INDEX idx_products_flash_mb IS 
'Expression index for Flash size with integer cast. Enables fast range queries: WHERE (metadata->''filters''->>''flash_mb'')::integer >= 16.';

COMMENT ON INDEX idx_products_gpio_pins IS 
'Expression index for GPIO pin count with integer cast. Enables fast range queries: WHERE (metadata->''filters''->>''gpio_pins'')::integer BETWEEN 32 AND 50.';

COMMENT ON INDEX idx_products_sensor_types IS 
'GIN index for sensor_types array (sensor products only). Enables fast containment queries: WHERE metadata->''filters''->''sensor_types'' ? ''temperature''.';

-- ============================================================================
-- QUERY EXAMPLES
-- ============================================================================

-- Example 1: Find ESP32-S3 boards with 8MB+ PSRAM and USB-C
-- SELECT id, title, current_price, metadata->'display' as display_metadata
-- FROM products
-- WHERE metadata->'filters'->>'chip' = 'ESP32-S3'
--   AND (metadata->'filters'->>'psram_mb')::integer >= 8
--   AND metadata->'filters'->>'usb_type' = 'usb-c'
-- ORDER BY current_price ASC;

-- Example 2: Find temperature sensors with I2C interface
-- SELECT id, title, metadata->'display' as display_metadata
-- FROM products
-- WHERE metadata->'filters'->>'product_type' = 'sensor'
--   AND metadata->'filters'->'sensor_types' ? 'temperature'
--   AND metadata->'filters'->'interfaces' ? 'i2c';

-- Example 3: Find all ESP32-S series boards (S2, S3)
-- SELECT id, title, metadata->'display'->'chip' as chip_display
-- FROM products
-- WHERE metadata->'filters'->>'chip_series' = 'ESP32-S';

-- Example 4: Find boards with 32-50 GPIO pins
-- SELECT id, title, metadata->'display'->'gpio' as gpio_display
-- FROM products
-- WHERE (metadata->'filters'->>'gpio_pins')::integer BETWEEN 32 AND 50;

-- ============================================================================
-- ROLLBACK
-- ============================================================================

-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_products_sensor_types;
-- DROP INDEX IF EXISTS idx_products_gpio_pins;
-- DROP INDEX IF EXISTS idx_products_flash_mb;
-- DROP INDEX IF EXISTS idx_products_psram_mb;
-- DROP INDEX IF EXISTS idx_products_chip_series;
-- DROP INDEX IF EXISTS idx_products_chip;
-- DROP INDEX IF EXISTS idx_products_product_type;
-- DROP INDEX IF EXISTS idx_products_metadata_filters_gin;
-- DROP INDEX IF EXISTS idx_products_metadata_gin;
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS check_metadata_structure;
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS check_metadata_is_object;
-- ALTER TABLE products DROP COLUMN IF EXISTS metadata;

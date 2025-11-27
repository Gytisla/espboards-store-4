-- Add custom_parent_id column for manual product grouping
-- Keep parent_id for Amazon PA-API native variant relationships
-- This allows us to have both Amazon's variant grouping and our custom grouping

-- Add custom_parent_id column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS custom_parent_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_custom_parent_id ON products(custom_parent_id);

-- Add comment explaining the difference
COMMENT ON COLUMN products.parent_id IS 'Amazon PA-API native parent product ID for variant relationships';
COMMENT ON COLUMN products.custom_parent_id IS 'Custom/manual parent product ID for grouping duplicate products from different vendors';

-- Note: A product CAN have both parent_id (Amazon variant) and custom_parent_id (custom grouping)
-- This allows grouping Amazon variants that are duplicates across vendors
-- Example: Same product variant from 2 different sellers can be grouped

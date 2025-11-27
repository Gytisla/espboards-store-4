-- Drop the restrictive constraint that prevented both parent_id and custom_parent_id
ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_not_both_parent_types;

-- Allow products to have both parent_id (Amazon native) and custom_parent_id (manual grouping)
-- This is useful when an Amazon variant product also needs to be grouped with duplicates from other vendors

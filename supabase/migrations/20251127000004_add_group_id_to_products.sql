-- Add group_id column to products table
-- This replaces custom_parent_id with a reference to product_groups table

-- Add the new group_id column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES product_groups(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_group_id ON products(group_id);

-- Add comment
COMMENT ON COLUMN products.group_id IS 'Reference to product_groups table for manually grouped products';

-- Migrate existing custom_parent_id data to product_groups
-- For each unique custom_parent_id (parent product), create a group and update all related products

DO $$
DECLARE
    parent_record RECORD;
    new_group_id UUID;
BEGIN
    -- Find all products that are parents (have other products pointing to them via custom_parent_id)
    FOR parent_record IN 
        SELECT DISTINCT p.*
        FROM products p
        WHERE EXISTS (
            SELECT 1 FROM products child 
            WHERE child.custom_parent_id = p.id
        )
        ORDER BY p.created_at
    LOOP
        -- Create a product group for this parent
        INSERT INTO product_groups (
            marketplace_id,
            title,
            description,
            slug,
            images,
            brand,
            metadata,
            created_at
        ) VALUES (
            parent_record.marketplace_id,
            parent_record.title,
            parent_record.description,
            parent_record.slug || '-group',
            parent_record.images,
            parent_record.brand,
            jsonb_build_object(
                'original_parent_id', parent_record.id,
                'migrated_from_custom_parent_id', true
            ),
            parent_record.created_at
        )
        RETURNING id INTO new_group_id;

        -- Update all products in this group (including the parent)
        UPDATE products
        SET group_id = new_group_id
        WHERE id = parent_record.id
           OR custom_parent_id = parent_record.id;
        
        RAISE NOTICE 'Created group % for parent product %', new_group_id, parent_record.id;
    END LOOP;
END $$;

-- Note: We keep custom_parent_id for now to maintain backward compatibility
-- It can be dropped in a future migration after confirming everything works
COMMENT ON COLUMN products.custom_parent_id IS 'DEPRECATED: Use group_id instead. Kept for backward compatibility.';

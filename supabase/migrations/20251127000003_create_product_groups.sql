-- Create product_groups table
-- This table stores information about product groups (collections of similar products from different vendors)

CREATE TABLE IF NOT EXISTS product_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Marketplace association
    marketplace_id UUID NOT NULL REFERENCES marketplaces(id) ON DELETE CASCADE,
    
    -- Group metadata
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    
    -- Visual information (can use one of the products' images or custom)
    images JSONB,
    
    -- Group attributes
    brand TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: slug must be unique within a marketplace
    CONSTRAINT unique_group_slug_per_marketplace UNIQUE (marketplace_id, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_groups_marketplace_id ON product_groups(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_product_groups_slug ON product_groups(slug);
CREATE INDEX IF NOT EXISTS idx_product_groups_brand ON product_groups(brand);
CREATE INDEX IF NOT EXISTS idx_product_groups_created_at ON product_groups(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE product_groups IS 'Stores information about product groups - collections of similar products from different vendors';
COMMENT ON COLUMN product_groups.marketplace_id IS 'Marketplace this group belongs to (US, DE, etc.)';
COMMENT ON COLUMN product_groups.title IS 'Custom title for the group (can be different from individual product titles)';
COMMENT ON COLUMN product_groups.description IS 'Optional description for the group';
COMMENT ON COLUMN product_groups.slug IS 'URL-friendly slug for the group';
COMMENT ON COLUMN product_groups.images IS 'JSONB containing image data (can use one of the products'' images)';
COMMENT ON COLUMN product_groups.metadata IS 'Additional metadata for the group (price range, common features, etc.)';

-- Add RLS policies
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;

-- Public read access to active groups (through products)
CREATE POLICY "Public can view product groups"
    ON product_groups
    FOR SELECT
    USING (true);

-- Admin full access
CREATE POLICY "Admins can manage product groups"
    ON product_groups
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_groups_updated_at
    BEFORE UPDATE ON product_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_product_groups_updated_at();

-- Migration: Add slug column to products table
-- Description: Adds SEO-friendly slug field for product URLs
-- Date: 2025-11-25

-- Add slug column
ALTER TABLE products 
ADD COLUMN slug TEXT;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT, id UUID) 
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug: lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Trim leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length to 100 characters
  base_slug := substring(base_slug from 1 for 100);
  
  -- Add ID suffix for uniqueness (first 8 chars of UUID)
  final_slug := base_slug || '-' || substring(id::text from 1 for 8);
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for all existing products
UPDATE products 
SET slug = generate_slug(title, id)
WHERE slug IS NULL;

-- Make slug required and unique
ALTER TABLE products 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- Create index on slug for fast lookups
CREATE INDEX idx_products_slug ON products(slug);

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION products_generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_generate_slug
  BEFORE INSERT OR UPDATE OF title ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_generate_slug_trigger();

-- Add comment
COMMENT ON COLUMN products.slug IS 'SEO-friendly URL slug, auto-generated from title + ID';

# Product Grouping System - Architecture

## Overview

The product grouping system maintains **two separate parent-child relationship columns** to handle both Amazon's native variants and our custom manual grouping.

## Database Architecture

### Two Parent Columns

```sql
-- Amazon PA-API native variant relationships
parent_id UUID REFERENCES products(id) ON DELETE SET NULL

-- Custom manual grouping for duplicate products from different vendors  
custom_parent_id UUID REFERENCES products(id) ON DELETE SET NULL
```

### Why Two Columns?

**`parent_id` - Amazon Native Variants**
- Automatically populated from Amazon PA-API
- Represents genuine product variations (different colors, sizes, configurations)
- Example: iPhone 15 in Black, Blue, and Red
- Managed by Amazon, should not be modified manually
- Use case: Display official product variants

**`custom_parent_id` - Manual Custom Grouping**
- Manually set by store administrators
- Groups duplicate/similar products from different vendors/sellers
- Example: Same ESP32 board sold by 3 different vendors
- Fully controllable by admins
- Use case: Reduce duplicate listings, show price comparisons

### Database Constraints

```sql
-- Prevents a product from having both types of relationships
ALTER TABLE products
ADD CONSTRAINT check_not_both_parent_types
CHECK (
  NOT (parent_id IS NOT NULL AND custom_parent_id IS NOT NULL)
);
```

A product can either be:
- An Amazon native variant (has `parent_id`)
- A custom grouped variant (has `custom_parent_id`)  
- A standalone product (both NULL)
- A parent product for custom grouping (custom_parent_id NULL, but other products reference it)

But **NOT both** - this prevents confusion and maintains data integrity.

## API Endpoints

All grouping APIs use `custom_parent_id` for manual grouping:

### Admin Endpoints

**GET `/api/admin/products/groups`**
- Lists all products with variant counts
- Uses `custom_parent_id` for grouping relationships
- Returns: products with `variant_count` and `parent_title`

**PATCH `/api/admin/products/groups`**
- Creates a product group
- Sets `custom_parent_id` for selected variants
- Body: `{ parentId, variantIds[] }`

**PATCH `/api/admin/products/:id/ungroup`**
- Removes single variant from group
- Sets `custom_parent_id = NULL`

**PATCH `/api/admin/products/:id/ungroup-all`**
- Removes all variants from a parent
- Sets `custom_parent_id = NULL` for all children

### Public Endpoints

**GET `/api/products`**
- Excludes variants: `.is('custom_parent_id', null)`
- Fetches variants for each parent: `.eq('custom_parent_id', product.id)`
- Returns: products with `variants[]` and `variant_count`

**GET `/api/products/:slug`**
- Returns product details
- Fetches variants: `.eq('custom_parent_id', product.id)`
- Returns: `{ product, variants[], variant_count }`

## Frontend Components

### Admin Panel (`/admin/groups`)

**Filters:**
- All Products
- Ungrouped Only: `!custom_parent_id && variant_count === 0`
- Parent Products: `!custom_parent_id && variant_count > 0`
- Variants Only: `custom_parent_id != null`

**Display:**
- Nested hierarchical view
- Parents shown with purple gradient
- Variants nested underneath with pink borders
- Individual ungroup buttons per variant
- Bulk "Ungroup All" for parents

### Public Store

**Product Cards:**
- Shows "X options" badge when `variant_count > 0`
- Displays price range when variants have different prices
- "Compare Options" button links to `/products/[slug]/variants`

**Product Detail Page:**
- Shows "X Options Available" card when variants exist
- Links to dedicated variants comparison page

**Variants Page (`/products/[slug]/variants`):**
- Grid display of all variants
- Each variant clickable → navigates to that product's detail page
- Purple theme to differentiate from main products
- Shows prices, savings, images for easy comparison

## Use Cases

### Scenario 1: Amazon Native Variants
**ESP32-S3 DevKit C in different colors**
- Amazon automatically groups these as variants
- `parent_id` manages this relationship
- Users see "Color: Black, Blue, Red" options on Amazon
- We display as separate products (respecting Amazon's structure)

### Scenario 2: Manual Custom Grouping
**Same ESP32-S3 board from 3 different sellers**
- Admin manually groups these duplicates
- `custom_parent_id` manages this relationship
- Users see one product card with "3 options" and price range
- Can compare all options on variants page
- Each option links to specific seller's product

### Scenario 3: Both Types
**ESP32-S3 with Amazon variants AND duplicate vendors**
- Product A: Red variant (parent_id → Master Red)
- Product B: Blue variant (parent_id → Master Blue)
- Product C: Same Red from different seller
- Admin groups A + C using custom_parent_id
- Product A becomes parent (custom_parent_id = NULL)
- Product C becomes variant (custom_parent_id = A)
- Product B remains separate (different Amazon variant)

## Data Flow

### Grouping Flow
1. Admin selects 2+ products on `/admin/groups`
2. Clicks "Group Selected Products"
3. Modal shows: "Choose which product should be the parent"
4. Admin selects parent product
5. API validates:
   - Parent exists and has `custom_parent_id = NULL`
   - Variants don't have `parent_id` (not Amazon variants)
   - Variants aren't already parents of other products
6. Sets `custom_parent_id` for all variants
7. Frontend reloads and shows nested display

### Display Flow (Customer)
1. Customer browses `/products`
2. API excludes products where `custom_parent_id != NULL`
3. For each product, fetch variants: `custom_parent_id = product.id`
4. Product card shows:
   - "3 options" badge if variants exist
   - Price range: "$19.99 - $29.99"
   - "Compare Options" button
5. Customer clicks "Compare Options"
6. Opens `/products/[slug]/variants`
7. Shows all variants in grid
8. Customer clicks preferred variant
9. Opens that variant's actual product detail page
10. "View on Amazon" → customer makes purchase

## Migration

The migration adds `custom_parent_id` without affecting existing `parent_id` data:

```sql
-- Add custom_parent_id column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS custom_parent_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_custom_parent_id ON products(custom_parent_id);

-- Add documentation comments
COMMENT ON COLUMN products.parent_id IS 'Amazon PA-API native parent product ID for variant relationships';
COMMENT ON COLUMN products.custom_parent_id IS 'Custom/manual parent product ID for grouping duplicate products from different vendors';

-- Prevent products from having both types of parent relationships
ALTER TABLE products
ADD CONSTRAINT check_not_both_parent_types
CHECK (NOT (parent_id IS NOT NULL AND custom_parent_id IS NOT NULL));
```

## Testing Checklist

- [ ] Run migration successfully
- [ ] Group 2+ products in admin panel
- [ ] Verify `custom_parent_id` set in database
- [ ] Check public product listing excludes variants
- [ ] Verify product detail shows variant count
- [ ] Test variants page displays all options
- [ ] Click variant on variants page → opens correct product
- [ ] Ungroup single variant
- [ ] Ungroup all variants from parent
- [ ] Verify price ranges display correctly
- [ ] Test with products that have Amazon `parent_id`
- [ ] Ensure constraint prevents both parent types

## Benefits

✅ **Preserves Amazon data integrity** - Native variants untouched
✅ **Flexible custom grouping** - Full admin control over duplicates
✅ **Clear separation of concerns** - Two distinct use cases
✅ **Better customer experience** - No duplicate listings, easy comparison
✅ **Data safety** - Constraints prevent invalid states
✅ **Future-proof** - Can handle both Amazon and custom relationships simultaneously

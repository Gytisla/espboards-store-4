# Product Groups & Variants

## Overview

The Product Groups feature allows you to manually group duplicate products (same item from different vendors/sellers) together. This helps organize your catalog and prevent showing the same ESP32 board multiple times.

## How It Works

### Database Schema
- Products have a `parent_id` field (self-referencing foreign key)
- Parent products have `parent_id = NULL`
- Variant products have `parent_id = <uuid of parent>`
- One parent can have multiple variants

### Admin Interface

**Location:** `/admin/groups`

#### Features

1. **View All Products**
   - Grid view with product images, titles, prices
   - Shows variant counts for parent products
   - Visual badges: Purple for parents, Pink for variants

2. **Filter Options**
   - All Products
   - Ungrouped Only (products without parent or variants)
   - Parent Products (products with variants)
   - Variants Only (products linked to a parent)

3. **Search**
   - Search by title, ASIN, or brand
   - Real-time filtering

4. **Create Groups**
   - Select 2+ ungrouped products (checkbox selection)
   - Click "Group Selected Products"
   - Choose which product should be the parent
   - Others become variants automatically

5. **Manage Groups**
   - **Ungroup**: Remove a single variant from its parent
   - **Ungroup All**: Remove all variants from a parent product

## Use Cases

### Example 1: Same Board, Different Sellers
```
Product A: "ESP32 DevKitC V4" - Seller: Amazon Basics - $12.99
Product B: "ESP32 DevKitC V4" - Seller: DOIT - $11.99
Product C: "ESP32 DevKitC V4" - Seller: HiLetgo - $13.50

Action: Group them → Choose Product B as parent (lowest price)
Result: One product listing with 3 variants
```

### Example 2: Quantity Packs
```
Product A: "ESP32-WROOM-32 (1 pack)" - $9.99
Product B: "ESP32-WROOM-32 (5 pack)" - $39.99

Action: Group them → Choose Product A as parent
Result: Single product with quantity variants
```

## API Endpoints

### GET `/api/admin/products/groups`
Load all products with variant counts
- Query params: `marketplace` (US or DE)
- Returns: Array of products with `variant_count` and `parent_title`

### PATCH `/api/admin/products/groups`
Create a product group
- Body: `{ parentId: string, variantIds: string[] }`
- Sets `parent_id` for all variant products

### PATCH `/api/admin/products/[id]/ungroup`
Remove a single variant from its parent
- Sets `parent_id = null` for the product

### PATCH `/api/admin/products/[id]/ungroup-all`
Remove all variants from a parent
- Sets `parent_id = null` for all children

## Validation & Rules

1. **Parent products cannot be variants**
   - A product with variants cannot itself be a variant of another product
   
2. **Minimum 2 products required**
   - Need at least 2 products to create a group

3. **Only ungrouped products can be grouped**
   - Cannot group products that are already variants
   - Cannot group products that are already parents

4. **Safe ungrouping**
   - Ungrouping a variant makes it standalone
   - Ungrouping all variants from a parent preserves the parent

## Frontend Components

- **AdminSidebar**: Added "Product Groups" navigation item
- **groups.vue**: Main page with filtering, selection, and grouping UI
- **Group Modal**: Select parent product dialog

## Future Enhancements

Possible improvements:
- [ ] Automatic duplicate detection using AI/ML
- [ ] Bulk actions (import groups via CSV)
- [ ] Price comparison widget for variants
- [ ] Display grouped products on frontend store
- [ ] Variant selector on product detail page
- [ ] Analytics: Track which variants sell best

## Testing

Manual testing checklist:
- [ ] Load products list
- [ ] Filter by different modes
- [ ] Search products
- [ ] Select multiple products
- [ ] Create group with parent selection
- [ ] Verify variant counts update
- [ ] Ungroup a single variant
- [ ] Ungroup all variants from parent
- [ ] Verify database `parent_id` updates correctly

## Notes

- Groups are marketplace-specific (US and DE have separate groups)
- Deleting a parent product sets variants' `parent_id` to NULL (ON DELETE SET NULL)
- This feature does NOT affect the public store yet (requires frontend integration)

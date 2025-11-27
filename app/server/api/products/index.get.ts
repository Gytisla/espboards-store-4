/**
 * GET /api/products
 * Fetch products filtered by marketplace
 * Public endpoint with RLS (only returns active products)
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const marketplace = query.marketplace as string | undefined

  // Validate marketplace parameter
  if (marketplace && !['US', 'DE'].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid marketplace. Must be "US" or "DE"',
    })
  }

  try {
    const supabase = await createServerSupabaseClient(event)

    // Build query - exclude variants (only show parent products and ungrouped products)
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        asin,
        slug,
        title,
        description,
        brand,
        images,
        detail_page_url,
        current_price,
        original_price,
        savings_amount,
        savings_percentage,
        currency,
        status,
        metadata,
        raw_paapi_response,
        created_at,
        group_id,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `)
      .eq('status', 'active')
      .is('custom_parent_id', null) // Only products without custom parent (excludes manually grouped variants)
      .order('created_at', { ascending: false })

    // Filter by marketplace if specified
    if (marketplace) {
      // First, get the marketplace_id
      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from('marketplaces')
        .select('id')
        .eq('code', marketplace)
        .single()

      if (marketplaceError || !marketplaceData) {
        throw createError({
          statusCode: 404,
          message: `Marketplace "${marketplace}" not found`,
        })
      }

      productsQuery = productsQuery.eq('marketplace_id', marketplaceData.id)
    }

    const { data: products, error } = await productsQuery

    if (error) {
      console.error('Failed to fetch products:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch products',
      })
    }

    // Fetch variants for each product
    const productsWithVariants = await Promise.all(
      (products || []).map(async (product) => {
        const { data: variants, error: variantsError } = await supabase
          .from('products')
          .select('id, asin, title, current_price, original_price, savings_amount, savings_percentage, currency, images')
          .eq('custom_parent_id', product.id)
          .eq('status', 'active')
          .order('current_price', { ascending: true, nullsFirst: false })

        if (variantsError) {
          console.error('Failed to fetch variants:', variantsError)
        }

        // Fetch group information if product has group_id
        let group = null
        let groupProductCount = 0
        if (product.group_id) {
          const { data: groupData, error: groupError } = await supabase
            .from('product_groups')
            .select('id, slug, title, description')
            .eq('id', product.group_id)
            .single()

          if (!groupError && groupData) {
            group = groupData
            
            // Count all products in this group
            const { count, error: countError } = await supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', product.group_id)
              .eq('status', 'active')
            
            if (!countError && count !== null) {
              groupProductCount = count
            }
          }
        }

        // If product has a group, use the group product count, otherwise use variants count
        const totalCount = group ? groupProductCount : (variants?.length || 0)

        return {
          ...product,
          variants: variants || [],
          variant_count: totalCount,
          group,
        }
      })
    )

    return {
      products: productsWithVariants,
      count: productsWithVariants.length,
    }
  } catch (error) {
    console.error('Products API error:', error)
    throw error
  }
})

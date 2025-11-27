/**
 * GET /api/deals
 * Fetch all products with discounts (including variants)
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

    // Build query - include ALL products (parents and variants) with discounts
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
        created_at,
        group_id,
        custom_parent_id,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `)
      .eq('status', 'active')
      .not('savings_percentage', 'is', null)
      .gt('savings_percentage', 0)
      .order('savings_percentage', { ascending: false })

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
      console.error('Failed to fetch deals:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch deals',
      })
    }

    return {
      products: products || [],
    }
  } catch (error) {
    console.error('Deals API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})

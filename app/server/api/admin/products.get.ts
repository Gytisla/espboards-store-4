/**
 * GET /api/admin/products
 * Fetch all products for admin management (bypasses RLS)
 * Supports filtering by marketplace, status, and search query
 * Includes pagination
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const marketplace = query.marketplace as string | undefined
  const status = query.status as string | undefined
  const search = query.search as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  // Validate marketplace parameter
  if (marketplace && !['US', 'DE'].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid marketplace. Must be "US" or "DE"',
    })
  }

  // Validate status parameter
  if (status && !['draft', 'active', 'unavailable'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status. Must be "draft", "active", or "unavailable"',
    })
  }

  try {
    const adminClient = createServerSupabaseAdminClient()

    // Get marketplace_id if marketplace is specified
    let marketplaceId: string | undefined
    if (marketplace) {
      const { data: marketplaceData, error: marketplaceError } = await adminClient
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

      marketplaceId = marketplaceData.id
    }

    // Build query for products
    let productsQuery = adminClient
      .from('products')
      .select(`
        id,
        asin,
        title,
        description,
        brand,
        images,
        detail_page_url,
        current_price,
        original_price,
        savings_percentage,
        currency,
        status,
        last_refresh_at,
        created_at,
        updated_at,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `, { count: 'exact' })

    // Apply filters
    if (marketplaceId) {
      productsQuery = productsQuery.eq('marketplace_id', marketplaceId)
    }

    if (status) {
      productsQuery = productsQuery.eq('status', status)
    }

    if (search) {
      // Search in title, ASIN, or brand
      productsQuery = productsQuery.or(`title.ilike.%${search}%,asin.ilike.%${search}%,brand.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    productsQuery = productsQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: products, error, count } = await productsQuery

    if (error) {
      console.error('Failed to fetch products:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch products',
      })
    }

    return {
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  } catch (error) {
    console.error('Admin products API error:', error)
    throw error
  }
})

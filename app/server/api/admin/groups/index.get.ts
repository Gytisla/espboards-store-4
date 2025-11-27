import { createServerSupabaseAdminClient } from '~/server/utils/supabase'

/**
 * GET /api/admin/groups
 * List all product groups with their products
 * Query params: marketplace (optional) - filter by marketplace code (US, DE, etc.)
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const marketplaceCode = query.marketplace as string | undefined

    const supabase = createServerSupabaseAdminClient()

    // Build query for product groups
    let groupsQuery = supabase
      .from('product_groups')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by marketplace if provided
    if (marketplaceCode) {
      // Get marketplace ID first
      const { data: marketplace, error: marketplaceError } = await supabase
        .from('marketplaces')
        .select('id')
        .eq('code', marketplaceCode)
        .single()

      if (marketplaceError || !marketplace) {
        throw createError({
          statusCode: 404,
          message: 'Marketplace not found',
        })
      }

      groupsQuery = groupsQuery.eq('marketplace_id', marketplace.id)
    }

    // Fetch product groups
    const { data: groups, error: groupsError } = await groupsQuery

    if (groupsError) {
      throw groupsError
    }

    // For each group, fetch the products count and products
    const groupsWithProducts = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, asin, slug, title, brand, current_price, currency, images, status')
          .eq('group_id', group.id)
          .order('created_at', { ascending: true })

        if (productsError) {
          console.error('Error fetching products for group:', productsError)
          return {
            ...group,
            products: [],
            product_count: 0,
          }
        }

        return {
          ...group,
          products: products || [],
          product_count: products?.length || 0,
        }
      })
    )

    return {
      groups: groupsWithProducts,
      total: groupsWithProducts.length,
    }
  } catch (error: any) {
    console.error('Error fetching product groups:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch product groups',
    })
  }
})

import { createServerSupabaseAdminClient } from '~/server/utils/supabase'

/**
 * GET /api/admin/groups/:id
 * Get a single product group with its products
 */

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required',
    })
  }

  try {
    const supabase = createServerSupabaseAdminClient()

    // Fetch the group
    const { data: group, error: groupError } = await supabase
      .from('product_groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product group not found',
        })
      }
      throw groupError
    }

    // Fetch products in this group
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, asin, slug, title, brand, current_price, original_price, savings_percentage, currency, images, status, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })

    if (productsError) {
      throw productsError
    }

    return {
      group: {
        ...group,
        products: products || [],
        product_count: products?.length || 0,
      },
    }
  } catch (error: any) {
    console.error('Error fetching product group:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch product group',
    })
  }
})

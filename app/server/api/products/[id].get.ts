import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * GET /api/products/:id
 * Fetch a single product by ID
 * Public endpoint with RLS (only returns active products)
 */

export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required',
    })
  }

  try {
    const supabase = await createServerSupabaseClient(event)

    const { data: product, error } = await supabase
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
        savings_amount,
        savings_percentage,
        currency,
        status,
        metadata,
        created_at,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `)
      .eq('id', productId)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Failed to fetch product:', error)
      throw createError({
        statusCode: error.code === 'PGRST116' ? 404 : 500,
        message: error.code === 'PGRST116' ? 'Product not found' : 'Failed to fetch product',
      })
    }

    return {
      product,
    }
  } catch (error) {
    console.error('Product API error:', error)
    throw error
  }
})

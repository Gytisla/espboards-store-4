/**
 * GET /api/admin/products/:id
 * Fetch single product with all details for editing
 * Admin-only endpoint that bypasses RLS
 */

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required',
    })
  }

  try {
    const adminClient = createServerSupabaseAdminClient()

    const { data: product, error } = await adminClient
      .from('products')
      .select(`
        *,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency,
          paapi_endpoint
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Failed to fetch product:', error)
      
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product not found',
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Failed to fetch product',
      })
    }

    return {
      product,
    }
  } catch (error) {
    console.error('Get product API error:', error)
    throw error
  }
})

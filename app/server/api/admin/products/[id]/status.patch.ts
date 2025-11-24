/**
 * PATCH /api/admin/products/:id/status
 * Update product status (draft/active/unavailable)
 * Admin-only endpoint that bypasses RLS
 */

export default defineEventHandler(async (event) => {
  // Get product ID from route params
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required',
    })
  }

  // Read request body
  const body = await readBody(event)
  const { status } = body

  // Validate status
  if (!status || !['draft', 'active', 'unavailable'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status. Must be "draft", "active", or "unavailable"',
    })
  }

  try {
    const adminClient = createServerSupabaseAdminClient()

    // Update product status
    const { data: product, error } = await adminClient
      .from('products')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update product status:', error)
      
      // Check if product doesn't exist
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product not found',
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Failed to update product status',
      })
    }

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Update status API error:', error)
    throw error
  }
})

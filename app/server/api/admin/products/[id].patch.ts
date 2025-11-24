/**
 * PATCH /api/admin/products/:id
 * Update product metadata and custom fields
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

  const body = await readBody(event)
  
  // Build update object with only allowed fields
  const updates: any = {
    updated_at: new Date().toISOString(),
  }

  // Allow updating these fields
  if (body.metadata !== undefined) {
    // Validate metadata structure
    if (typeof body.metadata !== 'object' || body.metadata === null) {
      throw createError({
        statusCode: 400,
        message: 'Metadata must be an object',
      })
    }

    // Ensure metadata has the correct structure
    const metadata = {
      display: body.metadata.display || {},
      filters: body.metadata.filters || {},
    }

    updates.metadata = metadata
  }

  if (body.status !== undefined) {
    if (!['draft', 'active', 'unavailable'].includes(body.status)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid status',
      })
    }
    updates.status = body.status
  }

  // Allow updating description (custom description override)
  if (body.description !== undefined) {
    updates.description = body.description
  }

  try {
    const adminClient = createServerSupabaseAdminClient()

    const { data: product, error } = await adminClient
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `)
      .single()

    if (error) {
      console.error('Failed to update product:', error)
      
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product not found',
        })
      }

      throw createError({
        statusCode: 500,
        message: 'Failed to update product',
      })
    }

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Update product API error:', error)
    throw error
  }
})

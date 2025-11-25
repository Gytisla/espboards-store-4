export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  try {
    const adminClient = createServerSupabaseAdminClient()

    // Delete the product
    const { error: deleteError } = await adminClient
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete product',
        data: deleteError,
      })
    }

    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error: any) {
    console.error('Delete product error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete product',
    })
  }
})

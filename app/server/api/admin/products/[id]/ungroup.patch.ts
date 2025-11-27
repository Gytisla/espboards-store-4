export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      message: 'Product ID is required',
    })
  }

  try {
    const supabase = createServerSupabaseAdminClient()

    // Verify product exists and is a variant
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, custom_parent_id, title')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found',
      })
    }

    if (!product.custom_parent_id) {
      throw createError({
        statusCode: 400,
        message: 'Product is not a variant',
      })
    }

    // Remove custom_parent_id (ungroup)
    const { error: updateError } = await supabase
      .from('products')
      .update({ custom_parent_id: null })
      .eq('id', productId)

    if (updateError) {
      console.error('Failed to ungroup product:', updateError)
      throw createError({
        statusCode: 500,
        message: 'Failed to ungroup product',
      })
    }

    return {
      success: true,
      message: `Successfully ungrouped "${product.title}"`,
    }
  } catch (err: any) {
    console.error('Failed to ungroup product:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to ungroup product',
    })
  }
})

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
      .select('id, custom_parent_id, group_id, title')
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

    // Store group_id before ungrouping
    const groupIdToCheck = product.group_id

    // Remove custom_parent_id and group_id (ungroup)
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        custom_parent_id: null,
        group_id: null 
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Failed to ungroup product:', updateError)
      throw createError({
        statusCode: 500,
        message: 'Failed to ungroup product',
      })
    }

    // Check if this was the last product in the group (only 1 product remaining)
    let groupDeleted = false
    if (groupIdToCheck) {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupIdToCheck)

      // If only 1 or 0 products left in the group, delete the group and clear the remaining product's group_id
      if (count !== null && count <= 1) {
        // Clear group_id from the remaining product (if any)
        if (count === 1) {
          await supabase
            .from('products')
            .update({ group_id: null })
            .eq('group_id', groupIdToCheck)
        }

        // Delete the empty/single-product group
        await supabase
          .from('product_groups')
          .delete()
          .eq('id', groupIdToCheck)

        groupDeleted = true
      }
    }

    return {
      success: true,
      message: `Successfully ungrouped "${product.title}"`,
      groupDeleted,
    }
  } catch (err: any) {
    console.error('Failed to ungroup product:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to ungroup product',
    })
  }
})

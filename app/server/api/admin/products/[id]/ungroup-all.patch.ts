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

    // Verify product exists and is a parent
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

    if (product.custom_parent_id) {
      throw createError({
        statusCode: 400,
        message: 'Product is a variant, not a parent',
      })
    }

    // Store group_id to delete the group later
    const groupIdToDelete = product.group_id

    // Count variants
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('custom_parent_id', productId)

    if (countError) {
      console.error('Failed to count variants:', countError)
    }

    if (!count || count === 0) {
      throw createError({
        statusCode: 400,
        message: 'Product has no variants to ungroup',
      })
    }

    // Remove custom_parent_id and group_id from all variants
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        custom_parent_id: null,
        group_id: null 
      })
      .eq('custom_parent_id', productId)

    if (updateError) {
      console.error('Failed to ungroup variants:', updateError)
      throw createError({
        statusCode: 500,
        message: 'Failed to ungroup variants',
      })
    }

    // Also clear the parent product's group_id
    await supabase
      .from('products')
      .update({ group_id: null })
      .eq('id', productId)

    // If there was a group, delete it since all products are now ungrouped
    if (groupIdToDelete) {
      await supabase
        .from('product_groups')
        .delete()
        .eq('id', groupIdToDelete)
    }

    return {
      success: true,
      message: `Successfully ungrouped ${count} variant(s) from "${product.title}"`,
      ungroupedCount: count,
      groupDeleted: !!groupIdToDelete,
    }
  } catch (err: any) {
    console.error('Failed to ungroup variants:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to ungroup variants',
    })
  }
})

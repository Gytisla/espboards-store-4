import { createServerSupabaseAdminClient } from '~/server/utils/supabase'

/**
 * DELETE /api/admin/groups/:id
 * Delete a product group and ungroup all its products
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

    // First, ungroup all products in this group (clear both group_id and custom_parent_id)
    const { error: ungroupError } = await supabase
      .from('products')
      .update({ 
        group_id: null,
        custom_parent_id: null 
      })
      .eq('group_id', groupId)

    if (ungroupError) {
      throw ungroupError
    }

    // Delete the group
    const { error: deleteError } = await supabase
      .from('product_groups')
      .delete()
      .eq('id', groupId)

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product group not found',
        })
      }
      throw deleteError
    }

    return {
      message: 'Product group deleted successfully',
    }
  } catch (error: any) {
    console.error('Error deleting product group:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete product group',
    })
  }
})

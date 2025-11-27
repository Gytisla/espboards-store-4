import { createServerSupabaseAdminClient } from '~/server/utils/supabase'
import { generateUniqueGroupSlug } from '~/server/utils/slug'

/**
 * PATCH /api/admin/groups/:id
 * Update a product group
 */

interface UpdateGroupBody {
  title?: string
  description?: string
  slug?: string
  images?: any
  brand?: string
  metadata?: Record<string, any>
  parent_product_id?: string // ID of product to use as the new parent/representative
}

export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'id')

  if (!groupId) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required',
    })
  }

  try {
    const body = await readBody<UpdateGroupBody>(event)
    const supabase = createServerSupabaseAdminClient()

    // First, fetch the existing group to get marketplace_id
    const { data: existingGroup, error: fetchError } = await supabase
      .from('product_groups')
      .select('id, marketplace_id, title')
      .eq('id', groupId)
      .single()

    if (fetchError || !existingGroup) {
      throw createError({
        statusCode: 404,
        message: 'Product group not found',
      })
    }

    // Build update object (only include provided fields)
    const updates: any = {}
    let newParentProductId: string | null = null
    
    // If parent_product_id is provided, fetch that product's data to update the group
    if (body.parent_product_id) {
      const { data: parentProduct, error: parentError } = await supabase
        .from('products')
        .select('id, title, description, images, brand, metadata')
        .eq('id', body.parent_product_id)
        .eq('group_id', groupId) // Ensure the product belongs to this group
        .single()

      if (parentError || !parentProduct) {
        throw createError({
          statusCode: 400,
          message: 'Parent product not found or does not belong to this group',
        })
      }

      newParentProductId = parentProduct.id

      // Update group with parent product data
      updates.title = parentProduct.title
      updates.description = parentProduct.description
      updates.images = parentProduct.images
      updates.brand = parentProduct.brand
      
      // Regenerate slug based on new parent's title
      updates.slug = await generateUniqueGroupSlug(
        supabase,
        parentProduct.title,
        existingGroup.marketplace_id
      )
    }
    
    // Manual field overrides (these take priority over parent_product_id)
    if (body.title !== undefined) {
      updates.title = body.title
      // If title is being updated, automatically regenerate the slug
      // unless a custom slug is explicitly provided
      if (body.slug === undefined && !body.parent_product_id) {
        updates.slug = await generateUniqueGroupSlug(
          supabase,
          body.title,
          existingGroup.marketplace_id
        )
      }
    }
    if (body.description !== undefined) updates.description = body.description
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.images !== undefined) updates.images = body.images
    if (body.brand !== undefined) updates.brand = body.brand
    if (body.metadata !== undefined) updates.metadata = body.metadata

    if (Object.keys(updates).length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update',
      })
    }

    // Update the group
    const { data: group, error } = await supabase
      .from('product_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product group not found',
        })
      }
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          message: 'A group with this slug already exists',
        })
      }
      throw error
    }

    // If a new parent product was selected, update custom_parent_id for all products in the group
    if (newParentProductId) {
      // Step 1: Get all products in the group
      const { data: allGroupProducts } = await supabase
        .from('products')
        .select('id')
        .eq('group_id', groupId)

      if (allGroupProducts && allGroupProducts.length > 0) {
        // Step 2: Clear custom_parent_id for the new parent (it becomes the parent)
        await supabase
          .from('products')
          .update({ custom_parent_id: null })
          .eq('id', newParentProductId)

        // Step 3: Set custom_parent_id to the new parent for all other products in the group
        const otherProductIds = allGroupProducts
          .map(p => p.id)
          .filter(id => id !== newParentProductId)

        if (otherProductIds.length > 0) {
          await supabase
            .from('products')
            .update({ custom_parent_id: newParentProductId })
            .in('id', otherProductIds)
        }
      }
    }

    return {
      group,
      message: 'Product group updated successfully',
    }
  } catch (error: any) {
    console.error('Error updating product group:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update product group',
    })
  }
})

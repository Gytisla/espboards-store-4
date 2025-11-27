import { generateUniqueGroupSlug } from '~/server/utils/slug'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { parentId, variantIds } = body

  if (!parentId || !variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'parentId and variantIds array are required',
    })
  }

  try {
    const supabase = createServerSupabaseAdminClient()

    // Verify parent exists and is not already a variant
    const { data: parent, error: parentError } = await supabase
      .from('products')
      .select('id, custom_parent_id, group_id, marketplace_id, title, description, slug, images, brand')
      .eq('id', parentId)
      .single()

    if (parentError || !parent) {
      throw createError({
        statusCode: 404,
        message: 'Parent product not found',
      })
    }

    if (parent.custom_parent_id) {
      throw createError({
        statusCode: 400,
        message: 'Cannot use a variant as a parent product',
      })
    }

    // Check if parent already has a group, or create a new one
    let groupId = parent.group_id

    if (!groupId) {
      // Generate a unique slug for the group based on the product title
      const groupSlug = await generateUniqueGroupSlug(
        supabase,
        parent.title,
        parent.marketplace_id
      )

      // Create a new product group based on parent product
      const { data: newGroup, error: groupError } = await supabase
        .from('product_groups')
        .insert({
          marketplace_id: parent.marketplace_id,
          title: parent.title,
          description: parent.description,
          slug: groupSlug,
          images: parent.images,
          brand: parent.brand,
          metadata: {
            parent_product_id: parent.id,
            created_from_grouping: true,
          },
        })
        .select('id')
        .single()

      if (groupError) {
        console.error('Failed to create product group:', groupError)
        throw createError({
          statusCode: 500,
          message: 'Failed to create product group record',
        })
      }

      groupId = newGroup.id

      // Update parent product with the new group_id
      const { error: parentUpdateError } = await supabase
        .from('products')
        .update({ 
          group_id: groupId,
          custom_parent_id: null // Clear old parent relationship
        })
        .eq('id', parentId)

      if (parentUpdateError) {
        console.error('Failed to update parent with group_id:', parentUpdateError)
      }
    }

    // Verify all variants exist and are not already parents
    const { data: variants, error: variantsError } = await supabase
      .from('products')
      .select('id, custom_parent_id, group_id, title')
      .in('id', variantIds)

    if (variantsError || !variants) {
      throw createError({
        statusCode: 404,
        message: 'One or more variant products not found',
      })
    }

    // Check if any variant is already a parent
    const { data: existingVariants, error: checkError } = await supabase
      .from('products')
      .select('custom_parent_id')
      .in('custom_parent_id', variantIds)
      .limit(1)

    if (checkError) {
      console.error('Failed to check existing variants:', checkError)
    }

    if (existingVariants && existingVariants.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot group products that are already parents of other variants',
      })
    }

    // Update all variants to have the group_id (and keep custom_parent_id for backward compatibility)
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        group_id: groupId,
        custom_parent_id: parentId // Keep for backward compatibility
      })
      .in('id', variantIds)

    if (updateError) {
      console.error('Failed to update variants:', updateError)
      throw createError({
        statusCode: 500,
        message: 'Failed to create product group',
      })
    }

    return {
      success: true,
      message: `Successfully grouped ${variantIds.length} product(s) under "${parent.title}"`,
      parentId,
      groupId,
      variantCount: variantIds.length,
    }
  } catch (err: any) {
    console.error('Failed to create group:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to create product group',
    })
  }
})

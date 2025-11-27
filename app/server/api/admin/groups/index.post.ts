import { createServerSupabaseAdminClient } from '~/server/utils/supabase'

/**
 * POST /api/admin/groups
 * Create a new product group
 */

interface CreateGroupBody {
  marketplace_id: string
  title: string
  description?: string
  slug: string
  images?: any
  brand?: string
  metadata?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateGroupBody>(event)

    // Validate required fields
    if (!body.marketplace_id || !body.title || !body.slug) {
      throw createError({
        statusCode: 400,
        message: 'Marketplace ID, title and slug are required',
      })
    }

    const supabase = createServerSupabaseAdminClient()

    // Create the group
    const { data: group, error } = await supabase
      .from('product_groups')
      .insert({
        marketplace_id: body.marketplace_id,
        title: body.title,
        description: body.description || null,
        slug: body.slug,
        images: body.images || null,
        brand: body.brand || null,
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          message: 'A group with this slug already exists',
        })
      }
      throw error
    }

    return {
      group,
      message: 'Product group created successfully',
    }
  } catch (error: any) {
    console.error('Error creating product group:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create product group',
    })
  }
})

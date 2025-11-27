import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * GET /api/groups/:slug
 * Fetch a product group by slug with all its products
 * Public endpoint with RLS
 */

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Group slug is required',
    })
  }

  try {
    const supabase = await createServerSupabaseClient(event)

    // Fetch the group
    const { data: group, error: groupError } = await supabase
      .from('product_groups')
      .select(`
        id,
        marketplace_id,
        title,
        description,
        slug,
        images,
        brand,
        metadata,
        created_at
      `)
      .eq('slug', slug)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Product group not found',
        })
      }
      throw groupError
    }

    // Fetch all products in this group (only active products for public)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        asin,
        slug,
        title,
        description,
        brand,
        images,
        detail_page_url,
        current_price,
        original_price,
        savings_amount,
        savings_percentage,
        currency,
        status,
        metadata,
        custom_parent_id,
        raw_paapi_response,
        created_at
      `)
      .eq('group_id', group.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (productsError) {
      throw productsError
    }

    // Inherit parent metadata for variant products
    if (products && products.length > 0) {
      // Get all unique parent IDs
      const parentIds = [...new Set(
        products
          .filter(p => p.custom_parent_id)
          .map(p => p.custom_parent_id)
      )] as string[]

      // Fetch all parent metadata in one query
      let parentsMap: Map<string, any> = new Map()
      if (parentIds.length > 0) {
        const { data: parents } = await supabase
          .from('products')
          .select('id, metadata')
          .in('id', parentIds)

        if (parents) {
          parentsMap = new Map(parents.map(p => [p.id, p]))
        }
      }

      // Apply parent metadata to each variant
      products.forEach(product => {
        if (product.custom_parent_id) {
          const parent = parentsMap.get(product.custom_parent_id)
          if (parent) {
            // Merge metadata: use parent's display metadata, keep variant's filters
            const parentMetadata = parent.metadata || {}
            const variantFilters = product.metadata?.filters || {}
            
            product.metadata = {
              ...parentMetadata,
              ...product.metadata,
              display: parentMetadata.display || product.metadata?.display,
              filters: variantFilters || parentMetadata.filters,
            }
          }
        }
      })
    }

    // Calculate price range
    const prices = (products || [])
      .map(p => p.current_price)
      .filter((p): p is number => p !== null)

    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          currency: products?.[0]?.currency || 'USD',
        }
      : null

    return {
      group: {
        ...group,
        product_count: products?.length || 0,
        price_range: priceRange,
      },
      products: products || [],
    }
  } catch (error: any) {
    console.error('Error fetching product group:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch product group',
    })
  }
})

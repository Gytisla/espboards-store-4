import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * GET /api/products/:slug
 * Fetch a single product by slug
 * Public endpoint with RLS (only returns active products)
 */

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'id') // Keep param name as 'id' for route compatibility

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Product slug is required',
    })
  }

  try {
    const supabase = await createServerSupabaseClient(event)

    const { data: product, error } = await supabase
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
        created_at,
        last_refresh_at,
        features,
        product_info,
        manufacture_info,
        raw_paapi_response,
        parent_id,
        custom_parent_id,
        group_id,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Failed to fetch product:', error)
      throw createError({
        statusCode: error.code === 'PGRST116' ? 404 : 500,
        message: error.code === 'PGRST116' ? 'Product not found' : 'Failed to fetch product',
      })
    }

    // Fetch group information if product has group_id
    let group = null
    let groupProductCount = 0
    if (product && product.group_id) {
      const { data: groupData, error: groupError } = await supabase
        .from('product_groups')
        .select('id, slug, title, description')
        .eq('id', product.group_id)
        .single()

      if (!groupError && groupData) {
        group = groupData
        
        // Count all products in this group
        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', product.group_id)
          .eq('status', 'active')
        
        if (!countError && count !== null) {
          groupProductCount = count
        }
      }
    }

    // Fetch variants if this is a parent product (custom_parent_id is null and might have children)
    let variants: any[] = []
    if (product && !product.custom_parent_id) {
      const { data: variantsData, error: variantsError } = await supabase
        .from('products')
        .select(`
          id,
          asin,
          slug,
          title,
          brand,
          images,
          detail_page_url,
          current_price,
          original_price,
          savings_amount,
          savings_percentage,
          currency,
          status
        `)
        .eq('custom_parent_id', product.id)
        .eq('status', 'active')
        .order('current_price', { ascending: true, nullsFirst: false })

      if (variantsError) {
        console.error('Failed to fetch variants:', variantsError)
      } else {
        variants = variantsData || []
      }
    }

    // If product has a group, use the group product count, otherwise use variants count
    const totalCount = group ? groupProductCount : variants.length

    return {
      product,
      group,
      variants,
      variant_count: totalCount,
    }
  } catch (error) {
    console.error('Product API error:', error)
    throw error
  }
})

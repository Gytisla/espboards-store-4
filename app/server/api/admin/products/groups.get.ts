export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const marketplace = query.marketplace as string

  if (!marketplace || !['US', 'DE'].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Valid marketplace (US or DE) is required',
    })
  }

  try {
    const supabase = createServerSupabaseAdminClient()

    // Get marketplace ID
    const { data: marketplaceData, error: marketplaceError } = await supabase
      .from('marketplaces')
      .select('id')
      .eq('code', marketplace)
      .single()

    if (marketplaceError || !marketplaceData) {
      throw createError({
        statusCode: 404,
        message: 'Marketplace not found',
      })
    }

    // Get all products with variant counts
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        asin,
        title,
        brand,
        current_price,
        images,
        custom_parent_id,
        group_id,
        status,
        detail_page_url,
        created_at
      `)
      .eq('marketplace_id', marketplaceData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to load products',
      })
    }

    // Get all product groups for this marketplace
    const groupIds = [...new Set(products?.map(p => p.group_id).filter(Boolean))]
    let groups: Record<string, any> = {}

    if (groupIds.length > 0) {
      const { data: groupData, error: groupError } = await supabase
        .from('product_groups')
        .select('*')
        .in('id', groupIds)

      if (!groupError && groupData) {
        groups = Object.fromEntries(groupData.map(g => [g.id, g]))
      }
    }

    // Count variants for each parent product (using custom_parent_id for backward compatibility)
    const { data: variantCounts, error: countError } = await supabase
      .from('products')
      .select('custom_parent_id')
      .eq('marketplace_id', marketplaceData.id)
      .not('custom_parent_id', 'is', null)

    if (countError) {
      console.error('Failed to count variants:', countError)
    }

    // Create a map of custom_parent_id -> count
    const variantCountMap = new Map<string, number>()
    if (variantCounts) {
      variantCounts.forEach((row) => {
        const count = variantCountMap.get(row.custom_parent_id!) || 0
        variantCountMap.set(row.custom_parent_id!, count + 1)
      })
    }

    // Get parent titles for variants
    const parentIds = [...new Set(products?.filter(p => p.custom_parent_id).map(p => p.custom_parent_id))]
    let parentTitlesMap = new Map<string, string>()

    if (parentIds.length > 0) {
      const { data: parents } = await supabase
        .from('products')
        .select('id, title')
        .in('id', parentIds)

      if (parents) {
        parents.forEach(p => {
          parentTitlesMap.set(p.id, p.title)
        })
      }
    }

    // Enhance products with variant counts, parent titles, and group info
    const enhancedProducts = products?.map(product => ({
      ...product,
      variant_count: variantCountMap.get(product.id) || 0,
      parent_title: product.custom_parent_id ? parentTitlesMap.get(product.custom_parent_id) : null,
      group: product.group_id ? groups[product.group_id] : null,
    })) || []

    return {
      products: enhancedProducts,
    }
  } catch (err: any) {
    console.error('Failed to load products:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to load products',
    })
  }
})

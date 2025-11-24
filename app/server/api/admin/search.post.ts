export default defineEventHandler(async (event) => {
  // Validate request method
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed',
    })
  }

  // Read and validate request body
  const body = await readBody(event)
  const { query, marketplace } = body

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw createError({
      statusCode: 400,
      message: 'Search query must be at least 2 characters long',
    })
  }

  if (!marketplace || typeof marketplace !== 'string' || !['US', 'DE'].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Marketplace must be either "US" or "DE"',
    })
  }

  try {
    // Create Supabase client
    const supabase = await createServerSupabaseClient(event)

    // Call the search-products edge function
    const { data, error } = await supabase.functions.invoke('search-products', {
      body: {
        query: query.trim(),
        marketplace,
      },
    })

    if (error) {
      console.error('Edge function error:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to search products',
      })
    }

    // Extract ASINs from search results
    const results = data?.results || []
    const asins = results.map((product: any) => product.asin).filter(Boolean)

    // Check which products are already imported
    // Use admin client to bypass RLS (admin needs to see all products regardless of status)
    let importedAsins = new Set<string>()
    if (asins.length > 0) {
      const adminClient = createServerSupabaseAdminClient()
      
      console.log('Checking ASINs:', asins)
      console.log('Marketplace code:', marketplace)
      
      // First, get the marketplace_id for the given marketplace code
      const { data: marketplaceData, error: marketplaceError } = await adminClient
        .from('marketplaces')
        .select('id')
        .eq('code', marketplace)
        .single()
      
      console.log('Marketplace data:', marketplaceData)
      console.log('Marketplace error:', marketplaceError)
      
      if (!marketplaceError && marketplaceData) {
        const marketplaceId = marketplaceData.id
        console.log('Marketplace ID:', marketplaceId)
        
        // Now query products using marketplace_id (UUID) instead of marketplace (text)
        const { data: existingProducts, error: dbError } = await adminClient
          .from('products')
          .select('asin')
          .eq('marketplace_id', marketplaceId)
          .in('asin', asins)

        console.log('Database query error:', dbError)
        console.log('Existing products:', existingProducts)
        console.log('Existing products count:', existingProducts?.length)

        if (!dbError && existingProducts) {
          importedAsins = new Set(existingProducts.map(p => p.asin))
        } else if (dbError) {
          console.error('Failed to check for existing products:', dbError)
        }
      } else {
        console.error('Failed to find marketplace:', marketplace, marketplaceError)
      }
      
      console.log('Imported ASINs:', Array.from(importedAsins))
    }

    // Mark products as imported
    const resultsWithImportStatus = results.map((product: any) => ({
      ...product,
      isImported: importedAsins.has(product.asin)
    }))

    console.log('Results with import status:', resultsWithImportStatus.map((p: any) => ({ asin: p.asin, isImported: p.isImported })))

    return {
      ...data,
      results: resultsWithImportStatus
    }
  } catch (error) {
    console.error('Search API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
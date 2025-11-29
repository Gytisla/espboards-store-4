/**
 * Analytics API endpoint for Amazon click statistics
 * Requires service role authentication
 * 
 * Usage: GET /api/analytics/clicks?period=30d&groupBy=product
 */
export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const period = query.period as string || '7d' // 7d, 30d, 90d, all
    const groupBy = query.groupBy as string || 'day' // day, week, product, marketplace
    const limit = parseInt(query.limit as string) || 100

    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = null
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get Supabase admin client (for analytics access)
    const supabase = createServerSupabaseAdminClient()

    // Base query - fetch clicks first, then we'll join with products manually
    let dbQuery = supabase
      .from('amazon_clicks')
      .select('*')
      .order('clicked_at', { ascending: false })
      .limit(limit)

    // Add date filter if applicable
    if (startDate) {
      dbQuery = dbQuery.gte('clicked_at', startDate.toISOString())
    }

    const { data: clicks, error } = await dbQuery

    if (error) {
      console.error('Error fetching clicks:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch click analytics',
      })
    }

    // Get unique product slugs to fetch product details
    const productSlugs = [...new Set(clicks.map((c: any) => c.product_slug).filter(Boolean))]
    
    // Fetch product details
    let productsMap: Record<string, any> = {}
    if (productSlugs.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('slug, title, images')
        .in('slug', productSlugs)
      
      if (!productsError && products) {
        productsMap = products.reduce((acc, p) => {
          acc[p.slug] = p
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Attach product details to clicks
    const clicksWithProducts = clicks.map((click: any) => ({
      ...click,
      products: productsMap[click.product_slug] || null
    }))

    // Process data based on groupBy
    let analytics: any = {}

    switch (groupBy) {
      case 'product':
        // Group by product
        analytics = clicksWithProducts.reduce((acc: any, click: any) => {
          const key = click.product_slug || click.product_asin
          if (!acc[key]) {
            const product = click.products
            const primaryImage = product?.images?.primary?.large?.url || 
                                product?.images?.primary?.medium?.url || 
                                product?.images?.primary?.small?.url
            
            acc[key] = {
              product_slug: click.product_slug,
              product_asin: click.product_asin,
              product_title: product?.title,
              product_image: primaryImage,
              clicks: 0,
              sessions: new Set(),
            }
          }
          acc[key].clicks++
          if (click.session_id) {
            acc[key].sessions.add(click.session_id)
          }
          return acc
        }, {})
        analytics = Object.values(analytics).map((item: any) => ({
          ...item,
          sessions: item.sessions.size,
        })).sort((a: any, b: any) => b.clicks - a.clicks)
        break

      case 'marketplace':
        // Group by marketplace with product details
        analytics = clicksWithProducts.reduce((acc: any, click: any) => {
          // Create composite key with marketplace and product
          const key = `${click.marketplace_code}_${click.product_slug || click.product_asin}`
          
          if (!acc[key]) {
            const product = click.products
            const primaryImage = product?.images?.primary?.large?.url || 
                                product?.images?.primary?.medium?.url || 
                                product?.images?.primary?.small?.url
            
            acc[key] = {
              marketplace_code: click.marketplace_code,
              product_slug: click.product_slug,
              product_asin: click.product_asin,
              product_title: product?.title,
              product_image: primaryImage,
              clicks: 0,
              sessions: new Set(),
            }
          }
          acc[key].clicks++
          if (click.session_id) {
            acc[key].sessions.add(click.session_id)
          }
          return acc
        }, {})
        analytics = Object.values(analytics).map((item: any) => ({
          ...item,
          sessions: item.sessions.size,
        })).sort((a: any, b: any) => b.clicks - a.clicks)
        break

      case 'day':
      case 'week':
        // Group by time period with product details
        analytics = clicksWithProducts.reduce((acc: any, click: any) => {
          const date = new Date(click.clicked_at)
          let key: string
          
          if (groupBy === 'day') {
            key = date.toISOString().split('T')[0] // YYYY-MM-DD
          } else {
            // Week - get start of week
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = weekStart.toISOString().split('T')[0]
          }
          
          // Create a composite key with date and product for better granularity
          const compositeKey = `${key}_${click.product_slug || click.product_asin}`
          
          if (!acc[compositeKey]) {
            const product = click.products
            const primaryImage = product?.images?.primary?.large?.url || 
                                product?.images?.primary?.medium?.url || 
                                product?.images?.primary?.small?.url
            
            acc[compositeKey] = {
              date: key,
              product_slug: click.product_slug,
              product_asin: click.product_asin,
              product_title: product?.title,
              product_image: primaryImage,
              clicks: 0,
              sessions: new Set(),
            }
          }
          acc[compositeKey].clicks++
          if (click.session_id) {
            acc[compositeKey].sessions.add(click.session_id)
          }
          return acc
        }, {})
        analytics = Object.values(analytics).map((item: any) => ({
          ...item,
          sessions: item.sessions.size,
        })).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime() || b.clicks - a.clicks
        )
        break

      default:
        analytics = clicksWithProducts
    }

    // Calculate summary statistics
    const totalClicks = clicks.length
    const uniqueSessions = new Set(clicks.map((c: any) => c.session_id).filter(Boolean)).size
    const uniqueProducts = new Set(clicks.map((c: any) => c.product_asin)).size

    return {
      summary: {
        totalClicks,
        uniqueSessions,
        uniqueProducts,
        period,
        startDate: startDate?.toISOString() || null,
        endDate: now.toISOString(),
      },
      data: analytics,
    }
  } catch (error) {
    console.error('Error fetching click analytics:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch analytics',
    })
  }
})

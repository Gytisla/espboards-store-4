export default defineEventHandler(async (event) => {
  try {
    // Get request data
    const body = await readBody(event)
    const { productId, productAsin, productSlug, marketplaceCode } = body

    // Validate required fields
    if (!productAsin || !productSlug || !marketplaceCode) {
      return createError({
        statusCode: 400,
        message: 'Missing required fields: productAsin, productSlug, marketplaceCode',
      })
    }

    // Get optional tracking data from headers
    const headers = getHeaders(event)
    const referrer = headers.referer || headers.referrer || null
    const userAgent = headers['user-agent'] || null
    
    // Get IP address (through proxies if needed)
    const ipAddress = headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || headers['x-real-ip'] 
      || event.node.req.socket.remoteAddress 
      || null

    // Generate or get session ID from cookie
    const sessionId = getCookie(event, 'session_id') || generateSessionId()
    
    // Set session cookie if new (30 days)
    if (!getCookie(event, 'session_id')) {
      setCookie(event, 'session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    // Get Supabase client (use admin client to bypass RLS for tracking)
    const supabase = createServerSupabaseAdminClient()

    // Insert click tracking data
    const { error } = await supabase
      .from('amazon_clicks')
      .insert({
        product_id: productId || null,
        product_asin: productAsin,
        product_slug: productSlug,
        marketplace_code: marketplaceCode,
        session_id: sessionId,
        referrer,
        user_agent: userAgent,
        ip_address: ipAddress,
        clicked_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Failed to track Amazon click:', error)
      // Don't throw error - tracking should never block the user
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in amazon-click tracking:', error)
    // Always return success to not block user navigation
    return { success: false }
  }
})

// Helper function to generate a unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

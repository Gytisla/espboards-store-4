/**
 * API Route: Import Product
 * POST /api/products/import
 * 
 * Proxies import requests to the import-product Supabase Edge Function
 * Handles authentication and error transformation for the admin UI
 */

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event)
    const { asin, marketplace } = body

    // Validate required fields
    if (!asin || typeof asin !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Missing or invalid ASIN'
      })
    }

    if (!marketplace || !['US', 'DE'].includes(marketplace)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid marketplace. Must be US or DE'
      })
    }

    // Get Supabase configuration from runtime config
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseAnonKey = config.public.supabaseKey

    if (!supabaseUrl || !supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        message: 'Supabase configuration missing'
      })
    }

    // Call import-product Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/import-product`
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        asin,
        marketplace
      })
    })

    // Handle Edge Function response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Transform common errors into user-friendly messages
      let message = errorData.error || 'Failed to import product'
      
      if (response.status === 400) {
        message = errorData.error || 'Invalid product data'
      } else if (response.status === 404) {
        message = 'Product not found on Amazon'
      } else if (response.status === 409) {
        message = 'Product already imported'
      } else if (response.status === 503) {
        message = 'Amazon API temporarily unavailable'
      }

      throw createError({
        statusCode: response.status,
        message
      })
    }

    // Return successful import result
    const data = await response.json()
    return {
      success: true,
      product: data.product,
      message: 'Product imported successfully'
    }

  } catch (error: any) {
    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Unexpected error in import API route:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred while importing the product'
    })
  }
})

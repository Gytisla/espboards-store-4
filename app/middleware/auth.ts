export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login page to avoid infinite loops
  if (to.path === '/admin/login') {
    return
  }

  // Server-side: check auth cookie
  if (process.server) {
    const event = useRequestEvent()
    
    if (!event) {
      // No event available, redirect to login
      return navigateTo({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    }
    
    const cookieHeader = event.node.req.headers.cookie
    const authToken = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1]

    // If no auth token in cookie, redirect to login
    if (!authToken) {
      return navigateTo({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    }

    // Token exists, verify it with Supabase directly
    try {
      const supabase = await createServerSupabaseClient(event)
      const { data: { user }, error } = await supabase.auth.getUser(authToken)
      
      if (error || !user) {
        // Invalid token, redirect to login
        return navigateTo({
          path: '/admin/login',
          query: { redirect: to.fullPath }
        })
      }
      // User is authenticated, allow access
      return
    } catch (error) {
      // Error verifying token, redirect to login
      return navigateTo({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // Client-side authentication check
  const { user, initialize } = useAuth()

  // Initialize auth if not already done
  if (user.value === null) {
    try {
      await initialize()
    } catch (error) {
      console.error('Auth initialization error:', error)
      return navigateTo({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // If user is not authenticated, redirect to login with return path
  if (!user.value) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath }
    })
  }
})
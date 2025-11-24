export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (process.server) return

  // Skip middleware for login page to avoid infinite loops
  if (to.path === '/admin/login') {
    return
  }

  const { user, initialize } = useAuth()

  // Initialize auth if not already done
  if (user.value === null) {
    try {
      await initialize()
    } catch (error) {
      console.error('Auth initialization error:', error)
      return navigateTo('/admin/login')
    }
  }

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})

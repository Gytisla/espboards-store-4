import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const loading = useState<boolean>('auth-loading', () => false)
  const token = useState<string | null>('auth-token', () => null)

  const fetchUser = async () => {
    if (!token.value) {
      user.value = null
      return
    }

    loading.value = true
    try {
      const data = await $fetch('/api/auth/user', {
        headers: {
          authorization: `Bearer ${token.value}`
        }
      })
      user.value = data.user
    } catch (error) {
      console.error('Error fetching user:', error)
      user.value = null
      token.value = null
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      user.value = data.user
      token.value = data.session.access_token
      
      // Store token in both localStorage and cookie for SSR
      if (process.client) {
        localStorage.setItem('auth-token', data.session.access_token)
        // Set cookie with 7 days expiry
        document.cookie = `auth-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      
      return data
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
    
    user.value = null
    token.value = null
    
    // Clear token from both localStorage and cookie
    if (process.client) {
      localStorage.removeItem('auth-token')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    
    await navigateTo('/admin/login')
  }

  const initialize = async () => {
    // Load token from localStorage or cookie
    if (process.client) {
      token.value = localStorage.getItem('auth-token')
      
      // Fallback to cookie if localStorage is empty
      if (!token.value) {
        const cookieMatch = document.cookie.match(/auth-token=([^;]+)/)
        token.value = cookieMatch?.[1] || null
      }
    }

    if (token.value) {
      await fetchUser()
    } else {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    fetchUser,
    initialize,
  }
}

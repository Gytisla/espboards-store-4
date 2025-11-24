import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing!')
    console.error('NUXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.error('NUXT_PUBLIC_SUPABASE_KEY:', supabaseKey ? '***' + supabaseKey.slice(-10) : 'missing')
    throw new Error('Supabase URL and Key are required. Check your .env.local file.')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase,
    },
  }
})

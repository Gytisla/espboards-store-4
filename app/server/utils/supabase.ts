import type { H3Event } from 'h3'
import { createServerClient } from '@supabase/ssr'

export async function createServerSupabaseClient(event: H3Event) {
  const config = useRuntimeConfig()
  
  return createServerClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      cookies: {
        get: (name: string) => getCookie(event, name),
        set: (name: string, value: string, options?: any) => setCookie(event, name, value, options),
        remove: (name: string, options?: any) => deleteCookie(event, name, options),
      },
    }
  )
}

/**
 * Create a Supabase admin client with service role access
 * This bypasses RLS policies and should only be used in trusted server contexts
 */
export function createServerSupabaseAdminClient() {
  const config = useRuntimeConfig()
  
  // Use createServerClient with service role key instead of anon key
  // This will bypass RLS policies
  return createServerClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey, // Use service role key
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

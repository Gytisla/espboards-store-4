import { u as useRuntimeConfig, e as deleteCookie, s as setCookie, f as getCookie } from '../nitro/nitro.mjs';
import { createServerClient } from '@supabase/ssr';

async function createServerSupabaseClient(event) {
  const config = useRuntimeConfig();
  return createServerClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      cookies: {
        get: (name) => getCookie(event, name),
        set: (name, value, options) => setCookie(event, name, value, options),
        remove: (name, options) => deleteCookie(event, name, options)
      }
    }
  );
}
function createServerSupabaseAdminClient() {
  const config = useRuntimeConfig();
  return createServerClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    // Use service role key
    {
      cookies: {
        get: () => void 0,
        set: () => {
        },
        remove: () => {
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

export { createServerSupabaseClient as a, createServerSupabaseAdminClient as c };
//# sourceMappingURL=supabase.mjs.map

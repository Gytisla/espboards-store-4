import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/test-utils', '@nuxt/eslint'],
  css: ['./assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    // Private keys (only available server-side)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Public keys (available on client and server)
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },
  },
})
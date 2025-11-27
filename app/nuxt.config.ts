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
  app: {
    baseURL: '/',          // required
    cdnURL: '/',             // prevent absolute paths
    head: {
      title: 'ESPBoards Store - ESP32 Development Boards & Components',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Your one-stop shop for ESP32 development boards, sensors, displays, and IoT components. Quality products at competitive prices.' },
        { name: 'theme-color', content: '#3b82f6' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
      ],
    },
  },
  runtimeConfig: {
    // Private keys (only available server-side)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Public keys (available on client and server)
    public: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },
  },
  // Netlify deployment configuration
  nitro: {
    preset: 'netlify',
    compressPublicAssets: true,
    // Don't externalize vue-bundle-renderer - bundle it with the function
    externals: {
      inline: ['vue-bundle-renderer']
    },
  },
  // Enable SSR (Server-Side Rendering) - default is true but making it explicit
  ssr: true,
})
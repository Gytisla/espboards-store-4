<script setup lang="ts">
const currentYear = new Date().getFullYear()

const footerLinks = {
   company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: 'https://www.espboards.dev/about/#contact-us' },
    { name: 'Blog', href: 'https://www.espboards.dev/blog/' },
    { name: 'ESPBoards', href: 'https://www.espboards.dev' },
  ],
  products: [
    { name: 'Development Boards', href: '/products?type=development_board' },
    { name: 'Sensors', href: '/products?type=sensor' },
    { name: 'Displays', href: '/products?type=display' },
    { name: 'Power Modules', href: '/products?type=power' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/espboards/',
    icon: 'M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z',
    viewBox: '0 0 24 24',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/espboards/',
    icon: 'M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z',
    viewBox: '0 0 24 24',
  },
  {
    name: 'X',
    href: 'https://x.com/espboards',
    icon: 'M13.795 10.533 20.68 2h-3.073l-5.255 6.517L7.69 2H1l7.806 10.91L1.47 22h3.074l5.705-7.07L15.31 22H22l-8.205-11.467Zm-2.38 2.95L9.97 11.464 4.36 3.627h2.31l4.528 6.317 1.443 2.02 6.018 8.409h-2.31l-4.934-6.89Z',
    viewBox: '0 0 24 24',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/ESPBoards',
    icon: 'M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z',
    viewBox: '0 0 20 20',
  },
  {
    name: 'Pinterest',
    href: 'https://pin.it/7AwGDIY',
    icon: 'M51.125,0C24.469,0,11.029,19.11,11.029,35.047c0,9.649,3.653,18.232,11.487,21.432c1.286,0.525,2.438,0.019,2.812-1.403 c0.258-0.985,0.871-3.468,1.144-4.503c0.376-1.407,0.229-1.9-0.807-3.126c-2.259-2.665-3.703-6.115-3.703-11.002	c0-14.178,10.608-26.87,27.624-26.87c15.064,0,23.342,9.206,23.342,21.5c0,16.176-7.159,29.828-17.786,29.828 c-5.87,0-10.262-4.854-8.854-10.807c1.686-7.107,4.951-14.778,4.951-19.907c0-4.592-2.463-8.423-7.565-8.423 c-6,0-10.819,6.207-10.819,14.521c0,5.296,1.789,8.878,1.789,8.878s-6.141,26.015-7.215,30.571 c-2.145,9.072-0.322,20.195-0.168,21.318c0.089,0.666,0.944,0.824,1.332,0.322c0.555-0.723,7.7-9.544,10.129-18.359 c0.687-2.496,3.944-15.42,3.944-15.42c1.95,3.717,7.647,6.992,13.706,6.992c18.034,0,30.271-16.441,30.271-38.45 C86.644,15.498,72.547,0,51.125,0z',
    viewBox: '0 0 97.672 97.672',
  },
]
</script>

<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 gap-8 py-12 md:grid-cols-4 lg:gap-12">
        <!-- Column 1: Brand & Social -->
        <div>
          <!-- Logo -->
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4 transition-opacity hover:opacity-80">
            <img 
              src="/logo.png" 
              alt="ESPBoards Logo" 
              class="h-8 w-auto"
            />
            <div class="flex flex-col leading-tight">
              <span class="font-semibold text-lg text-gray-900 dark:text-white">ESPBoards</span>
              <span class="font-medium text-sm text-gray-600 dark:text-gray-400 -mt-1">Store</span>
            </div>
          </NuxtLink>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Your trusted source for ESP32 development boards and IoT components. Discover the latest boards and accessories.
          </p>

          <!-- Social Media Links -->
          <div>
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Follow Us
            </h3>
            <div class="flex items-center gap-2">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md hover:scale-105"
                :aria-label="social.name"
              >
                <svg class="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600" fill="currentColor" :viewBox="social.viewBox || '0 0 24 24'">
                  <path :d="social.icon" fill-rule="evenodd" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Column 1: About Links -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            About
          </h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.company" :key="link.name">
              <NuxtLink
                :to="link.href"
                :target="link.href.startsWith('http') ? '_blank' : '_self'"
                :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {{ link.name }}
                <svg 
                  v-if="link.href.startsWith('http')" 
                  class="h-3.5 w-3.5 opacity-50" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 2: Categories -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            Categories
          </h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.products" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 3: Legal -->
        <div>
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            Legal
          </h3>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.legal" :key="link.name">
              <NuxtLink
                :to="link.href"
                class="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Newsletter Section -->
      <!-- <div class="border-t border-gray-200 dark:border-gray-800 py-10">
        <div class="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div class="text-center md:text-left">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Stay updated with latest products
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Get notified about new ESP32 boards and exclusive deals
            </p>
          </div>
          <div class="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              class="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
            />
            <button
              class="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/10 transition-all hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-500/20"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div> -->

      <!-- Bottom Bar -->
      <div class="border-t border-gray-200 dark:border-gray-800 py-8">
        <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <!-- Copyright -->
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            © {{ currentYear }} ESPBoards. All rights reserved.
          </p>

          <!-- Amazon Disclaimer -->
          <p class="text-xs text-gray-500 dark:text-gray-500 text-center sm:text-right">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

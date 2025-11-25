<script setup lang="ts">
// Set page meta
useHead({
  title: 'About Us - ESP32 Store',
  meta: [
    { name: 'description', content: 'Learn about ESP32 Store - your trusted source for ESP32 development boards, modules, sensors, and IoT components.' }
  ]
})

// Team members or features
const features = [
  {
    icon: 'shield',
    title: 'Trusted Products',
    description: 'All products are sourced from verified sellers on Amazon with quality guarantees.'
  },
  {
    icon: 'lightning',
    title: 'Latest Technology',
    description: 'Stay up-to-date with the newest ESP32 chips including S2, S3, C3, C6, and H2 variants.'
  },
  {
    icon: 'search',
    title: 'Easy Discovery',
    description: 'Advanced filtering and search capabilities to find exactly what you need for your project.'
  },
  {
    icon: 'chart',
    title: 'Best Prices',
    description: 'Compare prices across regions and find the best deals on ESP32 components.'
  },
  {
    icon: 'community',
    title: 'Community Focused',
    description: 'Built by makers, for makers. We understand your IoT development needs.'
  },
  {
    icon: 'update',
    title: 'Always Updated',
    description: 'Our catalog is regularly updated with the latest products and pricing information.'
  }
]

// Statistics
const stats = [
  { value: '500+', label: 'Products Listed' },
  { value: '10+', label: 'Product Categories' },
  { value: '5', label: 'Global Marketplaces' },
  { value: '24/7', label: 'Price Updates' }
]

// Get icon path
const getIconPath = (iconName: string) => {
  const icons: Record<string, string> = {
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    community: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    update: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
  }
  return icons[iconName] || icons.shield
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <!-- Lighter overlay for better text visibility -->
      <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      
      <!-- Animated Dots Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0">
          <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div class="text-center">
          <!-- Icon/Logo -->
          <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-2xl shadow-blue-500/50">
            <svg class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>

          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl mb-6" style="text-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);">
            About ESP32 Store
          </h1>
          <p class="mt-6 text-xl sm:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed font-medium" style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);">
            Your one-stop destination for discovering and comparing ESP32 development boards, 
            modules, sensors, and IoT components from trusted sellers worldwide.
          </p>

          <!-- Quick Stats Pills -->
          <div class="mt-12 flex flex-wrap justify-center gap-6">
            <div class="rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-8 py-4 shadow-xl border border-white/50 dark:border-gray-700/50">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">Products</div>
            </div>
            <div class="rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-8 py-4 shadow-xl border border-white/50 dark:border-gray-700/50">
              <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">10+</div>
              <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">Categories</div>
            </div>
            <div class="rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-8 py-4 shadow-xl border border-white/50 dark:border-gray-700/50">
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">Marketplaces</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wave Divider -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB" class="dark:fill-gray-900"/>
        </svg>
      </div>
    </div>

    <!-- Mission Section -->
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <div class="space-y-4 text-lg text-gray-600 dark:text-gray-300">
            <p>
              ESP32 Store was created to solve a common problem faced by IoT developers and makers: 
              finding the right ESP32 components shouldn't be complicated or time-consuming.
            </p>
            <p>
              We aggregate products from Amazon marketplaces worldwide, providing you with 
              comprehensive information, specifications, and pricing in one convenient location.
            </p>
            <p>
              Whether you're building your first IoT project or you're an experienced developer, 
              we make it easy to discover, compare, and find the perfect ESP32 components for your needs.
            </p>
          </div>
        </div>

        <!-- Image/Illustration -->
        <div class="relative">
          <div class="rounded-2xl bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-8">
            <div class="aspect-square flex items-center justify-center">
              <svg class="w-64 h-64 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 dark:bg-yellow-600 rounded-full opacity-20 blur-2xl"></div>
          <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-2xl"></div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-white dark:bg-gray-800 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm font-medium text-gray-600 dark:text-gray-300">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose ESP32 Store?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          We're more than just a product catalog. Here's what makes us different.
        </p>
      </div>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl bg-white dark:bg-gray-800 p-8 shadow-md hover:shadow-xl transition-shadow"
        >
          <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(feature.icon)" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- What We Offer Section -->
    <div class="bg-white dark:bg-gray-800 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What We Offer
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Development Boards -->
          <div class="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Development Boards</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, and ESP32-H2 boards</p>
          </div>

          <!-- Sensors -->
          <div class="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Sensors & Modules</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Temperature, humidity, motion, distance, and more sensor types</p>
          </div>

          <!-- Displays -->
          <div class="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Displays</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">OLED, LCD, E-Ink, and TFT displays for your projects</p>
          </div>

          <!-- Communication -->
          <div class="bg-linear-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Communication</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">WiFi, Bluetooth, LoRa, Zigbee, and wireless modules</p>
          </div>

          <!-- Power -->
          <div class="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Power Solutions</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Battery management, solar chargers, and power supplies</p>
          </div>

          <!-- Accessories -->
          <div class="bg-linear-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Accessories</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Cases, cables, adapters, and development tools</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-linear-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          Ready to Start Building?
        </h2>
        <p class="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
          Explore our catalog of ESP32 products and find everything you need for your next IoT project.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/products"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-100 px-8 py-4 text-base font-semibold text-blue-600 dark:text-blue-700 shadow-lg transition-all hover:bg-blue-50 dark:hover:bg-white hover:shadow-xl"
          >
            Browse Products
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 dark:bg-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-400 dark:hover:bg-blue-600 hover:shadow-xl"
          >
            View Categories
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define product categories with metadata
const categories = [
  {
    id: 'development-board',
    name: 'Development Boards',
    description: 'ESP32 development boards for prototyping and projects',
    icon: 'chip',
    color: 'blue',
    filterValue: 'development_board',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    count: null // Will be populated from API
  },
  {
    id: 'module',
    name: 'Modules',
    description: 'Compact ESP32 modules for embedded applications',
    icon: 'cube',
    color: 'purple',
    filterValue: 'module',
    image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'sensor',
    name: 'Sensors',
    description: 'Temperature, humidity, motion, and other sensors',
    icon: 'sensor',
    color: 'green',
    filterValue: 'sensor',
    image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'display',
    name: 'Displays',
    description: 'LCD, OLED, E-ink displays and screens',
    icon: 'display',
    color: 'indigo',
    filterValue: 'display',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'camera',
    name: 'Cameras',
    description: 'Camera modules and vision sensors',
    icon: 'camera',
    color: 'pink',
    filterValue: 'camera',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'WiFi, Bluetooth, LoRa, and wireless modules',
    icon: 'wifi',
    color: 'cyan',
    filterValue: 'communication',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'power',
    name: 'Power & Battery',
    description: 'Power supplies, batteries, and charging modules',
    icon: 'battery',
    color: 'yellow',
    filterValue: 'power',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop',
    count: null
  },
  {
    id: 'accessory',
    name: 'Accessories',
    description: 'Cases, cables, adapters, and other accessories',
    icon: 'tools',
    color: 'gray',
    filterValue: 'accessory',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
    count: null
  }
]

// Navigate to products page with category filter
const navigateToCategory = (category: typeof categories[0]) => {
  // Special handling for development boards - go to dedicated landing page
  if (category.id === 'development-board') {
    navigateTo('/categories/development-boards')
    return
  }
  
  // For other categories, go directly to products with filter
  navigateTo({
    path: '/products',
    query: { type: category.filterValue }
  })
}

// Get icon component based on icon name
const getIconPath = (iconName: string) => {
  const iconPaths: Record<string, string> = {
    chip: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    cube: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    sensor: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    display: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z',
    wifi: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
    battery: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    tools: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  }
  return iconPaths[iconName] || iconPaths.chip
}

// Get color classes based on color name
const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
  }
  return colorMap[color] || colorMap.blue
}

// Set page meta
useHead({
  title: 'Product Categories - ESPBoards Store',
  meta: [
    { name: 'description', content: 'Browse ESP32 products by category - development boards, modules, sensors, displays, and more.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Product Categories
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Browse our collection of ESP32 products organized by category. Find the perfect components for your next IoT project.
        </p>
      </div>

      <!-- Categories Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="navigateToCategory(category)"
          class="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <!-- Category Image Background -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="category.image"
              :alt="category.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <!-- Gradient Overlay -->
            <div 
              class="absolute inset-0 bg-linear-to-t opacity-60"
              :class="getColorClasses(category.color)"
            ></div>
            
            <!-- Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <svg 
                  class="h-12 w-12 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    :d="getIconPath(category.icon)"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Category Info -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ category.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {{ category.description }}
            </p>
            
            <!-- Browse Button -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                Browse Products
              </span>
              <svg 
                class="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <!-- Product Count Badge (if available) -->
          <div 
            v-if="category.count"
            class="absolute top-4 right-4 rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white shadow-md"
          >
            {{ category.count }} products
          </div>
        </button>
      </div>

      <!-- All Products Link -->
      <div class="mt-12 text-center">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-xl"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          View All Products
        </NuxtLink>
      </div>

      <!-- Popular Categories Section -->
      <div class="mt-16 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-8 border border-blue-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Why Shop by Category?
        </h2>
        
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="flex items-start gap-4">
            <div class="shrink-0 rounded-lg bg-blue-100 dark:bg-blue-950 p-3">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Easy Discovery</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Find exactly what you need without searching through hundreds of products</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="shrink-0 rounded-lg bg-green-100 dark:bg-green-950 p-3">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Organized Selection</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Products grouped by type for efficient project planning</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="shrink-0 rounded-lg bg-purple-100 dark:bg-purple-950 p-3">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Quick Browsing</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Navigate categories with one click to see relevant products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

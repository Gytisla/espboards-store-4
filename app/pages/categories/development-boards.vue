<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// Categories by chip type
const chipCategories = [
  {
    id: 'esp32',
    name: 'ESP32 Classic',
    chip: 'ESP32',
    description: 'Dual-core, Wi-Fi + Bluetooth 4.2',
    icon: '🎯',
    color: 'from-blue-500 to-blue-600',
    specs: ['240 MHz', '2 Cores', 'Wi-Fi 4', 'BT 4.2'],
    popular: true,
  },
  {
    id: 'esp32-s3',
    name: 'ESP32-S3',
    chip: 'ESP32-S3',
    description: 'AI/ML focused, Camera support',
    icon: '🤖',
    color: 'from-purple-500 to-purple-600',
    specs: ['240 MHz', '2 Cores', 'AI Accel', 'PSRAM'],
    popular: true,
  },
  {
    id: 'esp32-c3',
    name: 'ESP32-C3',
    chip: 'ESP32-C3',
    description: 'RISC-V, Low cost',
    icon: '💰',
    color: 'from-green-500 to-green-600',
    specs: ['160 MHz', '1 Core', 'Wi-Fi 4', 'BT 5.0'],
    popular: true,
  },
  {
    id: 'esp32-c6',
    name: 'ESP32-C6',
    chip: 'ESP32-C6',
    description: 'Matter ready, Thread + Zigbee',
    icon: '🌐',
    color: 'from-indigo-500 to-indigo-600',
    specs: ['Wi-Fi 6', 'Thread', 'Zigbee', 'Matter'],
    popular: false,
  },
  {
    id: 'esp32-s2',
    name: 'ESP32-S2',
    chip: 'ESP32-S2',
    description: 'Wi-Fi only, USB native',
    icon: '🔌',
    color: 'from-cyan-500 to-cyan-600',
    specs: ['240 MHz', 'USB OTG', 'Wi-Fi 4', '43 GPIO'],
    popular: false,
  },
  {
    id: 'esp32-h2',
    name: 'ESP32-H2',
    chip: 'ESP32-H2',
    description: 'Thread/Zigbee only (No Wi-Fi)',
    icon: '📡',
    color: 'from-orange-500 to-orange-600',
    specs: ['Thread', 'Zigbee', 'BT 5.2', 'No Wi-Fi'],
    popular: false,
  },
]

// Feature-based categories
const featureCategories = [
  {
    id: 'camera',
    name: 'Camera Boards',
    description: 'Built-in camera or camera connector',
    icon: '📷',
    color: 'from-pink-500 to-rose-600',
    filter: { camera: true },
    count: null,
  },
  {
    id: 'display',
    name: 'Display Boards',
    description: 'Integrated display or screen',
    icon: '🖥️',
    color: 'from-violet-500 to-purple-600',
    filter: { display: true },
    count: null,
  },
  {
    id: 'battery',
    name: 'Battery Powered',
    description: 'Battery connector or charging',
    icon: '🔋',
    color: 'from-emerald-500 to-green-600',
    filter: { battery: true },
    count: null,
  },
  {
    id: 'usb-c',
    name: 'USB-C Boards',
    description: 'Modern USB-C connectivity',
    icon: '⚡',
    color: 'from-sky-500 to-blue-600',
    filter: { usb: 'usb_c' },
    count: null,
  },
  {
    id: 'wifi6',
    name: 'Wi-Fi 6 Ready',
    description: 'Latest Wi-Fi 6 (802.11ax)',
    icon: '📶',
    color: 'from-indigo-500 to-blue-600',
    filter: { wifi: '6' },
    count: null,
  },
  {
    id: 'matter',
    name: 'Matter Compatible',
    description: 'Thread + Wi-Fi for Matter',
    icon: '🏠',
    color: 'from-amber-500 to-orange-600',
    filter: { thread: true },
    count: null,
  },
]

// Navigate to filtered products
const navigateToChip = (chip: string) => {
  navigateTo(`/products?chip=${chip}&product_type=development_board`)
}

const navigateToFeature = (filter: Record<string, any>) => {
  const params = new URLSearchParams({ product_type: 'development_board' })
  Object.entries(filter).forEach(([key, value]) => {
    params.append(key, value.toString())
  })
  navigateTo(`/products?${params.toString()}`)
}

const navigateToAllBoards = () => {
  navigateTo('/products?product_type=development_board')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div class="absolute inset-0 bg-grid-white/10"></div>
      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Development Boards
          </h1>
          <p class="mt-6 text-xl text-blue-100 sm:text-2xl max-w-3xl mx-auto">
            Choose the perfect ESP32 development board for your project. From classic ESP32 to cutting-edge ESP32-S3 with AI capabilities.
          </p>
          <div class="mt-10">
            <button
              @click="navigateToAllBoards"
              class="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              <span>View All Boards</span>
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Browse by Chip Type -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Browse by Chip Type</h2>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Each ESP32 variant is optimized for different use cases and features
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="category in chipCategories"
            :key="category.id"
            @click="navigateToChip(category.chip)"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          >
            <!-- Popular badge -->
            <div v-if="category.popular" class="absolute top-4 right-4">
              <span class="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Popular
              </span>
            </div>

            <!-- Icon with gradient -->
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br text-4xl shadow-lg"
                 :class="category.color">
              {{ category.icon }}
            </div>

            <!-- Content -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {{ category.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ category.description }}
            </p>

            <!-- Specs badges -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="spec in category.specs"
                :key="spec"
                class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {{ spec }}
              </span>
            </div>

            <!-- Arrow indicator -->
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Browse by Features -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Browse by Features</h2>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Find boards with specific capabilities for your project needs
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="category in featureCategories"
            :key="category.id"
            @click="navigateToFeature(category.filter)"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          >
            <!-- Icon with gradient -->
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br text-3xl shadow-lg"
                 :class="category.color">
              {{ category.icon }}
            </div>

            <!-- Content -->
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {{ category.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ category.description }}
            </p>

            <!-- Arrow indicator -->
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Comparison -->
      <section class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 p-8 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not sure which to choose?</h2>
          <p class="text-gray-600 dark:text-gray-400">Here's a quick guide to help you decide</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-3xl mb-3">🎯</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">Just Starting?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ESP32 Classic or ESP32-C3 are perfect for beginners
            </p>
            <button
              @click="navigateToChip('ESP32')"
              class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View ESP32 boards →
            </button>
          </div>

          <div class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-3xl mb-3">📷</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">Camera Project?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ESP32-S3 has dedicated camera interface and AI features
            </p>
            <button
              @click="navigateToChip('ESP32-S3')"
              class="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              View ESP32-S3 boards →
            </button>
          </div>

          <div class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-3xl mb-3">🏠</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">Smart Home?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ESP32-C6 supports Matter, Thread, and Zigbee
            </p>
            <button
              @click="navigateToChip('ESP32-C6')"
              class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View ESP32-C6 boards →
            </button>
          </div>

          <div class="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-3xl mb-3">💰</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">Budget Friendly?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ESP32-C3 offers great features at a lower cost
            </p>
            <button
              @click="navigateToChip('ESP32-C3')"
              class="text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
            >
              View ESP32-C3 boards →
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-white\/10 {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>

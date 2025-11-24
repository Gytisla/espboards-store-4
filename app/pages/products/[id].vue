<script setup lang="ts">
const route = useRoute()
const productId = route.params.id as string

// Fetch product details from public API
const { data, pending, error } = await useFetch(`/api/products/${productId}`)

// Handle errors
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Product not found',
  })
}

// Extract product from response (with type assertion)
const product = computed(() => (data.value as any)?.product)

// Format price
const formatPrice = (price: number | null, currency: string) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

// Get main image
const mainImage = computed(() => {
  if (!product.value?.images || product.value.images.length === 0) {
    return 'https://via.placeholder.com/600x600?text=No+Image'
  }
  const img = product.value.images[0]
  return typeof img === 'string' ? img : img.url
})

// Get all images
const allImages = computed(() => {
  if (!product.value?.images) return []
  return product.value.images.map((img: any) => 
    typeof img === 'string' ? img : img.url
  )
})

// Selected image for gallery
const selectedImage = ref(mainImage.value)

watch(mainImage, (newVal) => {
  selectedImage.value = newVal
})

// Get product features
const productFeatures = computed(() => {
  if (!product.value?.metadata?.display) return []
  
  const features = []
  const display = product.value.metadata.display
  
  if (display.chip) features.push({ label: 'Chip', value: display.chip })
  if (display.connectivity) features.push({ label: 'Connectivity', value: display.connectivity })
  if (display.features) features.push({ label: 'Features', value: display.features })
  
  return features
})

// Get technical specs from filters
const technicalSpecs = computed(() => {
  if (!product.value?.metadata?.filters) return []
  
  const specs = []
  const filters = product.value.metadata.filters
  
  if (filters.chip) specs.push({ label: 'Chip Model', value: filters.chip })
  if (filters.chip_series) specs.push({ label: 'Chip Series', value: filters.chip_series })
  if (filters.psram_mb) specs.push({ label: 'PSRAM', value: `${filters.psram_mb} MB` })
  if (filters.flash_mb) specs.push({ label: 'Flash Memory', value: `${filters.flash_mb} MB` })
  if (filters.gpio_pins) specs.push({ label: 'GPIO Pins', value: filters.gpio_pins })
  if (filters.wifi_version) specs.push({ label: 'WiFi', value: `WiFi ${filters.wifi_version}` })
  if (filters.bluetooth_version) specs.push({ label: 'Bluetooth', value: `Bluetooth ${filters.bluetooth_version}` })
  if (filters.usb_type) specs.push({ label: 'USB Type', value: filters.usb_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) })
  
  return specs
})

// Get hardware features
const hardwareFeatures = computed(() => {
  if (!product.value?.metadata?.filters) return []
  
  const features = []
  const filters = product.value.metadata.filters
  
  if (filters.has_camera) features.push('Camera')
  if (filters.has_display) features.push('Display')
  if (filters.has_battery) features.push('Battery')
  if (filters.has_sd_card) features.push('SD Card')
  if (filters.has_zigbee) features.push('Zigbee')
  if (filters.has_thread) features.push('Thread')
  
  return features
})

// Set page meta
useHead({
  title: computed(() => product.value?.title || 'Product Details'),
  meta: [
    { name: 'description', content: computed(() => product.value?.description || 'Product details and specifications') },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="pending" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="animate-pulse">
        <div class="h-8 w-64 bg-gray-200 rounded mb-8"></div>
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="aspect-square bg-gray-200 rounded-lg"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-8 flex items-center gap-2 text-sm text-gray-600">
        <NuxtLink to="/" class="hover:text-gray-900">Home</NuxtLink>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink to="/products" class="hover:text-gray-900">Products</NuxtLink>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900">{{ product.title }}</span>
      </nav>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
            <img
              :src="selectedImage"
              :alt="product.title"
              class="h-full w-full object-cover object-center"
            />
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="allImages.length > 1" class="grid grid-cols-4 gap-2">
            <button
              v-for="(image, idx) in allImages"
              :key="idx"
              @click="selectedImage = image"
              class="aspect-square overflow-hidden rounded-lg border-2 transition-all"
              :class="selectedImage === image ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'"
            >
              <img
                :src="image"
                :alt="`${product.title} - Image ${idx + 1}`"
                class="h-full w-full object-cover object-center"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Brand -->
          <div v-if="product.brand">
            <span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              {{ product.brand }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900">{{ product.title }}</h1>

          <!-- Description -->
          <p v-if="product.description" class="text-gray-600">
            {{ product.description }}
          </p>

          <!-- Features Tags -->
          <div v-if="productFeatures.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="(feature, idx) in productFeatures"
              :key="idx"
              class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature.value }}
            </span>
          </div>

          <!-- Pricing -->
          <div class="border-t border-b border-gray-200 py-6">
            <div class="flex items-baseline gap-3">
              <span class="text-4xl font-bold text-gray-900">
                {{ formatPrice(product.current_price, product.currency) }}
              </span>
              <span v-if="product.original_price && product.original_price > product.current_price" class="text-xl text-gray-500 line-through">
                {{ formatPrice(product.original_price, product.currency) }}
              </span>
              <span v-if="product.savings_percentage" class="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                Save {{ Math.round(product.savings_percentage) }}%
              </span>
            </div>
            <p v-if="product.savings_amount" class="mt-2 text-sm text-green-600">
              You save {{ formatPrice(product.savings_amount, product.currency) }}
            </p>
          </div>

          <!-- CTA Button -->
          <div class="space-y-3">
            <a
              :href="product.detail_page_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View on Amazon
            </a>
            <p class="text-center text-xs text-gray-500">
              You will be redirected to Amazon to complete your purchase
            </p>
          </div>

          <!-- Marketplace Info -->
          <div v-if="product.marketplace" class="flex items-center gap-2 rounded-lg bg-gray-100 p-4">
            <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <span class="font-medium text-gray-900">Marketplace:</span>
              <span class="ml-2 text-gray-600">{{ product.marketplace.region_name }} ({{ product.marketplace.code }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications -->
      <div v-if="technicalSpecs.length > 0 || hardwareFeatures.length > 0" class="mt-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">Technical Specifications</h2>
        
        <div class="grid gap-8 lg:grid-cols-2">
          <!-- Specifications Table -->
          <div v-if="technicalSpecs.length > 0" class="rounded-lg bg-white p-6 shadow">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">Specifications</h3>
            <dl class="space-y-3">
              <div
                v-for="(spec, idx) in technicalSpecs"
                :key="idx"
                class="flex justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <dt class="font-medium text-gray-600">{{ spec.label }}</dt>
                <dd class="text-gray-900">{{ spec.value }}</dd>
              </div>
            </dl>
          </div>

          <!-- Hardware Features -->
          <div v-if="hardwareFeatures.length > 0" class="rounded-lg bg-white p-6 shadow">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">Hardware Features</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(feature, idx) in hardwareFeatures"
                :key="idx"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ feature }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Products -->
      <div class="mt-12">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

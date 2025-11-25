<script setup lang="ts">
const route = useRoute()
const productSlug = route.params.id as string // Route param is still 'id' for file naming compatibility

// Fetch product details from public API using slug
const { data, pending, error } = await useFetch(`/api/products/${productSlug}`)

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

// Get main image - prioritize large for detail page
const mainImage = computed(() => {
  if (!product.value?.images) {
    return 'https://via.placeholder.com/600x600?text=No+Image'
  }
  
  const images = product.value.images
  
  // Try to get large image first (best for detail page)
  if (images.primary?.large?.url) {
    return images.primary.large.url
  }
  
  // Fall back to highRes
  if (images.primary?.highRes?.url) {
    return images.primary.highRes.url
  }
  
  // Fall back to medium
  if (images.primary?.medium?.url) {
    return images.primary.medium.url
  }
  
  return 'https://via.placeholder.com/600x600?text=No+Image'
})

// Get all images for gallery (primary + variants)
const allImages = computed(() => {
  if (!product.value?.images) return []
  
  const imageUrls: string[] = []
  const images = product.value.images
  
  // Add primary image (prefer large/highRes)
  if (images.primary?.large?.url) {
    imageUrls.push(images.primary.large.url)
  } else if (images.primary?.highRes?.url) {
    imageUrls.push(images.primary.highRes.url)
  } else if (images.primary?.medium?.url) {
    imageUrls.push(images.primary.medium.url)
  }
  
  // Add variant images (prefer large/highRes)
  if (images.variants && Array.isArray(images.variants)) {
    images.variants.forEach((variant: any) => {
      if (variant.large?.url) {
        imageUrls.push(variant.large.url)
      } else if (variant.highRes?.url) {
        imageUrls.push(variant.highRes.url)
      } else if (variant.medium?.url) {
        imageUrls.push(variant.medium.url)
      }
    })
  }
  
  return imageUrls
})

// Selected image for gallery
const selectedImage = ref(mainImage.value)

watch(mainImage, (newVal) => {
  selectedImage.value = newVal
})

// Lightbox state
const isLightboxOpen = ref(false)

const openLightbox = () => {
  isLightboxOpen.value = true
  // Prevent body scroll when lightbox is open
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  isLightboxOpen.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

// Carousel scroll ref
const carouselRef = ref<HTMLElement | null>(null)

// Scroll carousel left/right
const scrollCarousel = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return
  const scrollAmount = 100 // pixels to scroll
  const newScrollPosition = carouselRef.value.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
  carouselRef.value.scrollTo({
    left: newScrollPosition,
    behavior: 'smooth'
  })
}

// Format Amazon API values (handles nested objects with DisplayValue, Unit, etc.)
const formatApiValue = (value: any): string => {
  if (!value) return ''
  
  // Handle objects with DisplayValue and Unit (e.g., Weight, Dimensions)
  if (typeof value === 'object' && value !== null) {
    // Check if this is a direct DisplayValue/Unit object
    if ('DisplayValue' in value && 'Unit' in value) {
      // Format with proper decimal places and unit
      const displayValue = typeof value.DisplayValue === 'number' 
        ? value.DisplayValue.toFixed(2) 
        : value.DisplayValue
      return `${displayValue} ${value.Unit}`
    }
    
    // Check if only DisplayValue exists
    if ('DisplayValue' in value) {
      return String(value.DisplayValue)
    }
    
    // Handle nested objects (e.g., ItemDimensions with Width/Height/Length)
    // Check if all values in the object have DisplayValue and Unit
    const entries = Object.entries(value)
    if (entries.length > 0 && entries.every(([_, v]: [string, any]) => 
      typeof v === 'object' && v !== null && 'DisplayValue' in v && 'Unit' in v
    )) {
      // Format each dimension
      return entries.map(([key, v]: [string, any]) => {
        const displayValue = typeof v.DisplayValue === 'number' 
          ? v.DisplayValue.toFixed(2) 
          : v.DisplayValue
        return `${key}: ${displayValue} ${v.Unit}`
      }).join(', ')
    }
    
    // If it's some other nested object, stringify it (fallback)
    return JSON.stringify(value)
  }
  
  return String(value)
}

// Get product features - prioritize new features array, fall back to metadata
const productFeatures = computed(() => {
  // Use new features array if available
  if (product.value?.features && product.value.features.length > 0) {
    return product.value.features.map((feature: string) => ({
      label: 'Feature',
      value: feature
    }))
  }
  
  // Fall back to metadata features
  if (!product.value?.metadata?.display) return []
  
  const features = []
  const display = product.value.metadata.display
  
  if (display.chip) features.push({ label: 'Chip', value: display.chip })
  if (display.connectivity) features.push({ label: 'Connectivity', value: display.connectivity })
  if (display.features) features.push({ label: 'Features', value: display.features })
  
  return features
})

// Get technical specs - prioritize new technical_info, fall back to metadata filters
const technicalSpecs = computed(() => {
  const specs = []
  
  // Use new technical_info if available
  if (product.value?.technical_info) {
    const techInfo = product.value.technical_info
    Object.entries(techInfo).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'DisplayValue' in value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: value.DisplayValue 
        })
      } else if (value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: String(value) 
        })
      }
    })
  }
  
  // Add product_info fields
  if (product.value?.product_info) {
    const prodInfo = product.value.product_info
    Object.entries(prodInfo).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'DisplayValue' in value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: value.DisplayValue 
        })
      } else if (value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: String(value) 
        })
      }
    })
  }
  
  // Add manufacture_info fields
  if (product.value?.manufacture_info) {
    const mfgInfo = product.value.manufacture_info
    Object.entries(mfgInfo).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'DisplayValue' in value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: value.DisplayValue 
        })
      } else if (value) {
        specs.push({ 
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: String(value) 
        })
      }
    })
  }
  
  // Fall back to metadata filters if no new fields available
  if (specs.length === 0 && product.value?.metadata?.filters) {
    const filters = product.value.metadata.filters
    
    if (filters.chip) specs.push({ label: 'Chip Model', value: filters.chip })
    if (filters.chip_series) specs.push({ label: 'Chip Series', value: filters.chip_series })
    if (filters.psram_mb) specs.push({ label: 'PSRAM', value: `${filters.psram_mb} MB` })
    if (filters.flash_mb) specs.push({ label: 'Flash Memory', value: `${filters.flash_mb} MB` })
    if (filters.gpio_pins) specs.push({ label: 'GPIO Pins', value: filters.gpio_pins })
    if (filters.wifi_version) specs.push({ label: 'WiFi', value: `WiFi ${filters.wifi_version}` })
    if (filters.bluetooth_version) specs.push({ label: 'Bluetooth', value: `Bluetooth ${filters.bluetooth_version}` })
    if (filters.usb_type) specs.push({ label: 'USB Type', value: filters.usb_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) })
  }
  
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

// Get technical tags from metadata for badge display
const technicalTags = computed(() => {
  if (!product.value?.metadata?.filters) return []
  
  const tags: Array<{ label: string; value: string; icon?: string; color: string }> = []
  const filters = product.value.metadata.filters
  const display = product.value.metadata.display || {}
  
  // Chip model (highest priority)
  if (filters.chip || display.chip) {
    tags.push({
      label: 'Chip',
      value: display.chip || filters.chip,
      icon: 'chip',
      color: 'blue'
    })
  }
  
  // Chip variant/series
  if (filters.chip_series) {
    tags.push({
      label: 'Series',
      value: filters.chip_series,
      color: 'indigo'
    })
  }
  
  // PSRAM
  if (filters.psram_mb) {
    tags.push({
      label: 'PSRAM',
      value: display.psram || `${filters.psram_mb} MB`,
      icon: 'memory',
      color: 'purple'
    })
  }
  
  // Flash memory
  if (filters.flash_mb) {
    tags.push({
      label: 'Flash',
      value: display.flash || `${filters.flash_mb} MB`,
      icon: 'memory',
      color: 'pink'
    })
  }
  
  // WiFi
  if (filters.has_wifi || filters.wifi_version) {
    const wifiLabel = display.wifi || (filters.wifi_version ? `WiFi ${filters.wifi_version}` : 'WiFi')
    tags.push({
      label: 'WiFi',
      value: wifiLabel,
      icon: 'wifi',
      color: 'green'
    })
  }
  
  // Bluetooth
  if (filters.has_bluetooth || filters.bluetooth_version) {
    const btLabel = display.bluetooth || (filters.bluetooth_version ? `Bluetooth ${filters.bluetooth_version}` : 'Bluetooth')
    tags.push({
      label: 'Bluetooth',
      value: btLabel,
      icon: 'bluetooth',
      color: 'blue'
    })
  }
  
  // Zigbee
  if (filters.has_zigbee) {
    tags.push({
      label: 'Protocol',
      value: 'Zigbee',
      icon: 'zigbee',
      color: 'yellow'
    })
  }
  
  // Thread
  if (filters.has_thread) {
    tags.push({
      label: 'Protocol',
      value: 'Thread',
      color: 'orange'
    })
  }
  
  // GPIO Pins
  if (filters.gpio_pins) {
    tags.push({
      label: 'GPIO',
      value: display.gpio || `${filters.gpio_pins} pins`,
      color: 'gray'
    })
  }
  
  // USB Type
  if (filters.usb_type) {
    const usbLabel = filters.usb_type.toUpperCase().replace('_', '-')
    tags.push({
      label: 'USB',
      value: usbLabel,
      color: 'slate'
    })
  }
  
  return tags
})

// Get badge color classes
const getBadgeClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    pink: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
    green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
  }
  return colorMap[color] || colorMap.gray
}

// Set page meta
useHead({
  title: computed(() => product.value?.title || 'Product Details'),
  meta: [
    { name: 'description', content: computed(() => product.value?.description || 'Product details and specifications') },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
    <!-- Loading State -->
    <div v-if="pending" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="animate-pulse">
        <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-hidden">
        <NuxtLink to="/" class="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Home</NuxtLink>
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink to="/products" class="hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Products</NuxtLink>
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900 dark:text-white truncate min-w-0" :title="product.title">{{ product.title }}</span>
      </nav>

      <div class="grid gap-6 lg:gap-8 lg:grid-cols-2 overflow-hidden">
        <!-- Image Gallery -->
        <div class="space-y-4 min-w-0">
          <!-- Main Image -->
          <div 
            class="aspect-square overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg cursor-zoom-in w-full"
            @click="openLightbox"
          >
            <img
              :src="selectedImage"
              :alt="product.title"
              class="h-full w-full object-contain object-center"
            />
          </div>

          <!-- Thumbnail Gallery -->
          <div v-if="allImages.length > 1" class="relative group">
            <!-- Left Arrow - Always visible on mobile, hover on desktop -->
            <button
              @click="scrollCarousel('left')"
              class="absolute left-0 top-10 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <svg class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <!-- Carousel Container -->
            <div 
              ref="carouselRef"
              class="flex gap-2 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 snap-x snap-mandatory"
            >
              <button
                v-for="(image, idx) in allImages"
                :key="idx"
                @click="selectedImage = image"
                class="shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition-all snap-start"
                :class="selectedImage === image ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
              >
                <img
                  :src="image"
                  :alt="`${product.title} - Image ${idx + 1}`"
                  class="h-full w-full object-cover object-center"
                />
              </button>
            </div>
            
            <!-- Right Arrow - Always visible on mobile, hover on desktop -->
            <button
              @click="scrollCarousel('right')"
              class="absolute right-0 top-10 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-full p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <svg class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <!-- Image Counter -->
            <div class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              {{ allImages.findIndex((img: string) => img === selectedImage) + 1 }} / {{ allImages.length }}
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6 min-w-0">
          <!-- Brand -->
          <div v-if="product.brand">
            <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-300">
              {{ product.brand }}
            </span>
          </div>

          <!-- Technical Tags/Badges -->
          <div v-if="technicalTags.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(tag, idx) in technicalTags"
              :key="idx"
              :class="getBadgeClasses(tag.color)"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm"
            >
              <!-- Icon for WiFi -->
              <svg v-if="tag.icon === 'wifi'" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <!-- Icon for Bluetooth -->
              <svg v-else-if="tag.icon === 'bluetooth'" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
              <!-- Icon for Chip -->
              <svg v-else-if="tag.icon === 'chip'" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <!-- Icon for Memory (PSRAM/Flash) -->
              <svg v-else-if="tag.icon === 'memory'" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <!-- Icon for Zigbee -->
              <svg v-else-if="tag.icon === 'zigbee'" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="font-mono">{{ tag.value }}</span>
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white wrap-break-word">{{ product.title }}</h1>

          <!-- Description -->
          <p v-if="product.description" class="text-gray-600 dark:text-gray-300 wrap-break-word">
            {{ product.description }}
          </p>

          <!-- Pricing -->
          <div class="border-t border-b border-gray-200 dark:border-gray-700 py-6">
            <div class="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {{ formatPrice(product.current_price, product.currency) }}
              </span>
              <span v-if="product.original_price && product.original_price > product.current_price" class="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through">
                {{ formatPrice(product.original_price, product.currency) }}
              </span>
              <span v-if="product.savings_percentage" class="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-300">
                Save {{ Math.round(product.savings_percentage) }}%
              </span>
            </div>
            <p v-if="product.savings_amount" class="mt-2 text-sm text-green-600 dark:text-green-400">
              You save {{ formatPrice(product.savings_amount, product.currency) }}
            </p>
          </div>

          <!-- CTA Button -->
          <div class="space-y-3">
            <a
              :href="product.detail_page_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-6 py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-xl"
            >
              <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="whitespace-nowrap">View on Amazon</span>
            </a>
            <p class="text-center text-xs text-gray-500 dark:text-gray-400">
              You will be redirected to Amazon to complete your purchase
            </p>
          </div>

          <!-- Marketplace Info -->
          <div v-if="product.marketplace" class="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
            <svg class="h-5 w-5 text-gray-600 dark:text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <span class="font-medium text-gray-900 dark:text-white">Marketplace:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ product.marketplace.region_name }} ({{ product.marketplace.code }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications Section -->
      <div v-if="product.metadata?.filters && Object.keys(product.metadata.filters).length > 0" class="mt-8">
        <div class="rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 border border-blue-200 dark:border-gray-700">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Technical Specifications
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <!-- Chip Details -->
            <div v-if="product.metadata.filters.chip" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chip Model</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.metadata.display?.chip || product.metadata.filters.chip }}</p>
            </div>

            <!-- PSRAM -->
            <div v-if="product.metadata.filters.psram_mb" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PSRAM</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.metadata.display?.psram || `${product.metadata.filters.psram_mb} MB` }}</p>
            </div>

            <!-- Flash Memory -->
            <div v-if="product.metadata.filters.flash_mb" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Flash Memory</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.metadata.display?.flash || `${product.metadata.filters.flash_mb} MB` }}</p>
            </div>

            <!-- GPIO Pins -->
            <div v-if="product.metadata.filters.gpio_pins" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">GPIO Pins</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.metadata.display?.gpio || `${product.metadata.filters.gpio_pins} pins` }}</p>
            </div>

            <!-- WiFi -->
            <div v-if="product.metadata.filters.has_wifi || product.metadata.filters.wifi_version" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">WiFi</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ product.metadata.display?.wifi || (product.metadata.filters.wifi_version ? `WiFi ${product.metadata.filters.wifi_version}` : 'Supported') }}
              </p>
            </div>

            <!-- Bluetooth -->
            <div v-if="product.metadata.filters.has_bluetooth || product.metadata.filters.bluetooth_version" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bluetooth</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ product.metadata.display?.bluetooth || (product.metadata.filters.bluetooth_version ? `Bluetooth ${product.metadata.filters.bluetooth_version}` : 'Supported') }}
              </p>
            </div>

            <!-- Zigbee -->
            <div v-if="product.metadata.filters.has_zigbee" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Zigbee</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Supported</p>
            </div>

            <!-- Thread -->
            <div v-if="product.metadata.filters.has_thread" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thread</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Supported</p>
            </div>

            <!-- USB Type -->
            <div v-if="product.metadata.filters.usb_type" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-4 w-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">USB Type</span>
              </div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.metadata.filters.usb_type.toUpperCase().replace('_', '-') }}</p>
            </div>

            <!-- Additional Features -->
            <div v-if="hardwareFeatures.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm lg:col-span-3">
              <div class="flex items-center gap-2 mb-2">
                <svg class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Additional Features</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(feature, idx) in hardwareFeatures"
                  :key="idx"
                  class="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-300"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Section -->
      <div v-if="product.features?.length || product.content_info || product.product_info || product.manufacture_info" class="mt-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
        
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Product Features List -->
          <div v-if="product.features && product.features.length > 0" class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow lg:col-span-2">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Features
            </h3>
            <ul class="grid gap-2 md:grid-cols-2">
              <li
                v-for="(feature, idx) in product.features"
                :key="idx"
                class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
              >
                <svg class="h-5 w-5 mt-0.5 text-green-500 dark:text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Content Information -->
          <div v-if="product.content_info && Object.keys(product.content_info).length > 0" class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Content Information
            </h3>
            <dl class="space-y-3">
              <div
                v-for="([key, value], idx) in Object.entries(product.content_info)"
                :key="idx"
                class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
              >
                <dt class="font-medium text-gray-600 dark:text-gray-400">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</dt>
                <dd class="text-gray-900 dark:text-white sm:text-right wrap-break-word">
                  {{ formatApiValue(value) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Product Information -->
          <div v-if="product.product_info && Object.keys(product.product_info).length > 0" class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Product Information
            </h3>
            <dl class="space-y-3">
              <div
                v-for="([key, value], idx) in Object.entries(product.product_info)"
                :key="idx"
                class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
              >
                <dt class="font-medium text-gray-600 dark:text-gray-400">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</dt>
                <dd class="text-gray-900 dark:text-white sm:text-right wrap-break-word">
                  {{ formatApiValue(value) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Manufacturing Information -->
          <div v-if="product.manufacture_info && Object.keys(product.manufacture_info).length > 0" class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Manufacturing Information
            </h3>
            <dl class="space-y-3">
              <div
                v-for="([key, value], idx) in Object.entries(product.manufacture_info)"
                :key="idx"
                class="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
              >
                <dt class="font-medium text-gray-600 dark:text-gray-400">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</dt>
                <dd class="text-gray-900 dark:text-white sm:text-right wrap-break-word">
                  {{ formatApiValue(value) }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Customer Reviews Section -->
      <div v-if="product.customer_review_count || product.star_rating" class="mt-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
        
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <!-- Star Rating -->
            <div v-if="product.star_rating" class="text-center">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">{{ product.star_rating }}</span>
                <svg class="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="flex items-center gap-1">
                <svg v-for="i in 5" :key="i" 
                  class="h-5 w-5" 
                  :class="i <= Math.round(product.star_rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>

            <!-- Review Count -->
            <div v-if="product.customer_review_count" class="sm:border-l border-gray-200 dark:border-gray-700 sm:pl-6">
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ product.customer_review_count.toLocaleString() }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Customer Reviews</p>
            </div>

            <!-- CTA to Amazon Reviews -->
            <div class="sm:ml-auto w-full sm:w-auto">
              <a
                :href="product.detail_page_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Read reviews on Amazon
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isLightboxOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4"
          @click="closeLightbox"
        >
          <!-- Close Button -->
          <button
            @click="closeLightbox"
            class="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors p-2 sm:p-0"
            aria-label="Close lightbox"
          >
            <svg class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Zoomed Image -->
          <div class="w-full h-full flex items-center justify-center">
            <img
              :src="selectedImage"
              :alt="product.title"
              class="max-w-full max-h-full object-contain"
              @click.stop
            />
          </div>

          <!-- Image Counter (if multiple images) -->
          <div v-if="allImages.length > 1" class="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
            {{ allImages.findIndex((img: string) => img === selectedImage) + 1 }} / {{ allImages.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

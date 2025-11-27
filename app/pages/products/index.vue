<script setup lang="ts">
const route = useRoute()
const { selectedMarketplace } = useMarketplace()

// Types
interface ImageVariant {
  url: string
  width?: number | null
  height?: number | null
}

interface ProductImages {
  primary?: {
    small?: ImageVariant
    medium?: ImageVariant
    large?: ImageVariant
    highRes?: ImageVariant
  }
  variants?: Array<{
    small?: ImageVariant
    medium?: ImageVariant
    large?: ImageVariant
    highRes?: ImageVariant
  }>
}

interface Product {
  id: string
  asin: string
  slug: string
  title: string
  description: string | null
  brand: string | null
  features?: string[] | null
  images: ProductImages | null
  detail_page_url: string
  current_price: number | null
  original_price: number | null
  savings_amount: number | null
  savings_percentage: number | null
  currency: string
  status: string
  metadata: {
    display?: Record<string, any>
    filters?: {
      product_type?: string
      [key: string]: any
    }
  } | null
  created_at: string
  marketplace: {
    id: string
    code: string
    region_name: string
    currency: string
  }[]
}

// Filters and search
const searchQuery = ref('')
const selectedType = ref<string>('all')
const sortBy = ref('newest')

// Dynamic filters based on category
const selectedChip = ref<string>('all')
const selectedWifiVersion = ref<string>('all')
const selectedBluetoothVersion = ref<string>('all')
const selectedUsbType = ref<string>('all')
const selectedFlashSize = ref<string>('all')
const selectedPsramSize = ref<string>('all')
const selectedGpioPins = ref<string>('all')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const hasCamera = ref<boolean | null>(null)
const hasDisplay = ref<boolean | null>(null)
const hasBattery = ref<boolean | null>(null)
const hasZigbee = ref<boolean | null>(null)
const hasThread = ref<boolean | null>(null)
const hasSdCard = ref<boolean | null>(null)

// Flag to prevent URL updates during initialization
const isInitializing = ref(true)

// Flag to track when component is mounted (for hydration)
const isMounted = ref(false)

// Collapse state for mobile specifications - initialize client-side only to avoid hydration mismatch
const isSpecificationsOpen = ref(false)

// Initialize specifications state on mount
onMounted(() => {
  // Mark as mounted
  isMounted.value = true
  
  // Open specifications by default on desktop (>= 1024px)
  isSpecificationsOpen.value = window.innerWidth >= 1024
  
  // Initialize filters from URL
  initializeFiltersFromURL()
  // Allow URL updates after initialization is complete
  nextTick(() => {
    isInitializing.value = false
  })
})

// Initialize filters from URL query parameters
const initializeFiltersFromURL = () => {
  if (route.query.type && typeof route.query.type === 'string') {
    selectedType.value = route.query.type
  }
  if (route.query.search && typeof route.query.search === 'string') {
    searchQuery.value = route.query.search
  }
  if (route.query.sort && typeof route.query.sort === 'string') {
    sortBy.value = route.query.sort
  }
  if (route.query.chip && typeof route.query.chip === 'string') {
    selectedChip.value = route.query.chip
  }
  if (route.query.wifi && typeof route.query.wifi === 'string') {
    selectedWifiVersion.value = route.query.wifi
  }
  if (route.query.bluetooth && typeof route.query.bluetooth === 'string') {
    selectedBluetoothVersion.value = route.query.bluetooth
  }
  if (route.query.usb && typeof route.query.usb === 'string') {
    selectedUsbType.value = route.query.usb
  }
  if (route.query.flash && typeof route.query.flash === 'string') {
    selectedFlashSize.value = route.query.flash
  }
  if (route.query.psram && typeof route.query.psram === 'string') {
    selectedPsramSize.value = route.query.psram
  }
  if (route.query.gpio && typeof route.query.gpio === 'string') {
    selectedGpioPins.value = route.query.gpio
  }
  if (route.query.minPrice && typeof route.query.minPrice === 'string') {
    minPrice.value = parseFloat(route.query.minPrice)
  }
  if (route.query.maxPrice && typeof route.query.maxPrice === 'string') {
    maxPrice.value = parseFloat(route.query.maxPrice)
  }
  if (route.query.camera === 'true') {
    hasCamera.value = true
  }
  if (route.query.display === 'true') {
    hasDisplay.value = true
  }
  if (route.query.battery === 'true') {
    hasBattery.value = true
  }
  if (route.query.zigbee === 'true') {
    hasZigbee.value = true
  }
  if (route.query.thread === 'true') {
    hasThread.value = true
  }
  if (route.query.sdcard === 'true') {
    hasSdCard.value = true
  }
}

// Update URL with current filter state
const updateURL = () => {
  // Don't update URL during initialization
  if (isInitializing.value) return
  
  const query: Record<string, string> = {}
  
  if (selectedType.value !== 'all') query.type = selectedType.value
  if (searchQuery.value) query.search = searchQuery.value
  if (sortBy.value !== 'newest') query.sort = sortBy.value
  if (selectedChip.value !== 'all') query.chip = selectedChip.value
  if (selectedWifiVersion.value !== 'all') query.wifi = selectedWifiVersion.value
  if (selectedBluetoothVersion.value !== 'all') query.bluetooth = selectedBluetoothVersion.value
  if (selectedUsbType.value !== 'all') query.usb = selectedUsbType.value
  if (selectedFlashSize.value !== 'all') query.flash = selectedFlashSize.value
  if (selectedPsramSize.value !== 'all') query.psram = selectedPsramSize.value
  if (selectedGpioPins.value !== 'all') query.gpio = selectedGpioPins.value
  if (minPrice.value !== null) query.minPrice = minPrice.value.toString()
  if (maxPrice.value !== null) query.maxPrice = maxPrice.value.toString()
  if (hasCamera.value === true) query.camera = 'true'
  if (hasDisplay.value === true) query.display = 'true'
  if (hasBattery.value === true) query.battery = 'true'
  if (hasZigbee.value === true) query.zigbee = 'true'
  if (hasThread.value === true) query.thread = 'true'
  if (hasSdCard.value === true) query.sdcard = 'true'
  
  navigateTo({ query }, { replace: true })
}

// Watch all filters and update URL
watch([searchQuery, selectedType, sortBy, selectedChip, selectedWifiVersion, selectedBluetoothVersion, selectedUsbType, selectedFlashSize, selectedPsramSize, selectedGpioPins, minPrice, maxPrice, hasCamera, hasDisplay, hasBattery, hasZigbee, hasThread, hasSdCard], () => {
  updateURL()
})

// Reset filters when category changes
watch(selectedType, (newType, oldType) => {
  // Only reset if not initial load and category actually changed
  if (!isInitializing.value && oldType !== undefined && oldType !== newType) {
    selectedChip.value = 'all'
    selectedWifiVersion.value = 'all'
    selectedBluetoothVersion.value = 'all'
    selectedUsbType.value = 'all'
    selectedFlashSize.value = 'all'
    selectedPsramSize.value = 'all'
    selectedGpioPins.value = 'all'
    minPrice.value = null
    maxPrice.value = null
    hasCamera.value = null
    hasDisplay.value = null
    hasBattery.value = null
    hasZigbee.value = null
    hasThread.value = null
    hasSdCard.value = null
  }
})

// Fetch products - no await for instant navigation
const { data: productsData, pending, refresh } = useFetch('/api/products', {
  query: {
    marketplace: selectedMarketplace,
  },
  watch: [selectedMarketplace],
})

// Product types for filtering
const productTypes = [
  { value: 'all', label: 'All Products' },
  { value: 'development_board', label: 'Development Boards' },
  { value: 'sensor', label: 'Sensors', disabled: true, comingSoon: true },
  { value: 'display', label: 'Displays', disabled: true, comingSoon: true },
  { value: 'power', label: 'Power Modules', disabled: true, comingSoon: true },
  { value: 'communication', label: 'Communication', disabled: true, comingSoon: true },
  { value: 'motor_driver', label: 'Motor Drivers', disabled: true, comingSoon: true },
  { value: 'breakout', label: 'Breakout Boards', disabled: true, comingSoon: true },
  { value: 'accessory', label: 'Accessories', disabled: true, comingSoon: true },
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'savings', label: 'Best Savings' },
]

// Filter options for development boards
const chipOptions = [
  { value: 'all', label: 'All Chips' },
  { value: 'ESP32', label: 'ESP32' },
  { value: 'ESP32-S2', label: 'ESP32-S2' },
  { value: 'ESP32-S3', label: 'ESP32-S3' },
  { value: 'ESP32-C3', label: 'ESP32-C3' },
  { value: 'ESP32-C6', label: 'ESP32-C6' },
  { value: 'ESP32-H2', label: 'ESP32-H2' },
]

const wifiVersionOptions = [
  { value: 'all', label: 'All WiFi' },
  { value: 'no', label: 'No WiFi' },
  { value: '4', label: 'WiFi 4' },
  { value: '5', label: 'WiFi 5' },
  { value: '6', label: 'WiFi 6' },
]

const bluetoothVersionOptions = [
  { value: 'all', label: 'All Bluetooth' },
  { value: 'no', label: 'No Bluetooth' },
  { value: '4.2', label: 'Bluetooth 4.2' },
  { value: '5.0', label: 'Bluetooth 5.0' },
  { value: '5.1', label: 'Bluetooth 5.1' },
  { value: '5.2', label: 'Bluetooth 5.2' },
  { value: '5.3', label: 'Bluetooth 5.3' },
  { value: '5.4', label: 'Bluetooth 5.4' },
]

const usbTypeOptions = [
  { value: 'all', label: 'All USB' },
  { value: 'no', label: 'No USB' },
  { value: 'micro_usb', label: 'Micro USB' },
  { value: 'usb_c', label: 'USB-C' },
  { value: 'usb_a', label: 'USB-A' },
]

const flashOptions = [
  { value: 'all', label: 'All Flash' },
  { value: '4', label: '4MB' },
  { value: '8', label: '8MB' },
  { value: '16', label: '16MB+' },
]

const psramOptions = [
  { value: 'all', label: 'All PSRAM' },
  { value: 'none', label: 'No PSRAM' },
  { value: '2', label: '2MB' },
  { value: '8', label: '8MB+' },
]

const gpioPinOptions = [
  { value: 'all', label: 'All GPIO' },
  { value: '20', label: '20+ pins' },
  { value: '30', label: '30+ pins' },
  { value: '40', label: '40+ pins' },
]

// Determine which filters to show based on selected category
const showDevelopmentBoardFilters = computed(() => 
  selectedType.value === 'development_board' || selectedType.value === 'all'
)

const showSensorFilters = computed(() => 
  selectedType.value === 'sensor'
)

const showDisplayFilters = computed(() => 
  selectedType.value === 'display'
)

// Computed filtered and sorted products
const filteredProducts = computed(() => {
  if (!productsData.value?.products) return []

  let products = [...productsData.value.products] as Product[]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
    )
  }

  // Filter by product type
  if (selectedType.value !== 'all') {
    products = products.filter(
      (p) => p.metadata?.filters?.product_type === selectedType.value
    )
  }

  // Apply dynamic filters based on category
  // Chip filter (for development boards)
  if (selectedChip.value !== 'all') {
    products = products.filter(
      (p) => p.metadata?.filters?.chip === selectedChip.value
    )
  }

  // WiFi version filter
  if (selectedWifiVersion.value !== 'all') {
    products = products.filter(
      (p) => p.metadata?.filters?.wifi_version === selectedWifiVersion.value
    )
  }

  // Bluetooth version filter
  if (selectedBluetoothVersion.value !== 'all') {
    products = products.filter(
      (p) => p.metadata?.filters?.bluetooth_version === selectedBluetoothVersion.value
    )
  }

  // USB type filter
  if (selectedUsbType.value !== 'all') {
    products = products.filter(
      (p) => p.metadata?.filters?.usb_type === selectedUsbType.value
    )
  }

  // Hardware feature filters
  if (hasCamera.value !== null) {
    products = products.filter(
      (p) => p.metadata?.filters?.has_camera === hasCamera.value
    )
  }

  if (hasDisplay.value !== null) {
    products = products.filter(
      (p) => p.metadata?.filters?.has_display === hasDisplay.value
    )
  }

  if (hasBattery.value !== null) {
    products = products.filter((p) => {
      // Check for has_battery_pins (the actual field name in the database)
      if (typeof p.metadata?.filters?.has_battery_pins === 'boolean') {
        return p.metadata?.filters?.has_battery_pins === hasBattery.value
      }
      // Also check for has_battery for backwards compatibility
      if (typeof p.metadata?.filters?.has_battery === 'boolean') {
        return p.metadata?.filters?.has_battery === hasBattery.value
      }
      return false
    })
  }

  if (hasZigbee.value !== null) {
    products = products.filter(
      (p) => p.metadata?.filters?.has_zigbee === hasZigbee.value
    )
  }

  if (hasThread.value !== null) {
    products = products.filter(
      (p) => p.metadata?.filters?.has_thread === hasThread.value
    )
  }

  if (hasSdCard.value !== null) {
    products = products.filter(
      (p) => p.metadata?.filters?.has_sd_card === hasSdCard.value
    )
  }

  // Flash size filter
  if (selectedFlashSize.value !== 'all') {
    const flashSize = parseInt(selectedFlashSize.value)
    products = products.filter((p) => {
      const productFlash = p.metadata?.filters?.flash_size
      if (!productFlash) return false
      const productFlashMB = parseInt(String(productFlash))
      return productFlashMB >= flashSize
    })
  }

  // PSRAM size filter
  if (selectedPsramSize.value !== 'all') {
    if (selectedPsramSize.value === 'none') {
      products = products.filter((p) => !p.metadata?.filters?.psram_size)
    } else {
      const psramSize = parseInt(selectedPsramSize.value)
      products = products.filter((p) => {
        const productPsram = p.metadata?.filters?.psram_size
        if (!productPsram) return false
        const productPsramMB = parseInt(String(productPsram))
        return productPsramMB >= psramSize
      })
    }
  }

  // GPIO pins filter
  if (selectedGpioPins.value !== 'all') {
    const gpioCount = parseInt(selectedGpioPins.value)
    products = products.filter((p) => {
      const productGpio = p.metadata?.filters?.gpio_count
      if (!productGpio) return false
      const productGpioCount = parseInt(String(productGpio))
      return productGpioCount >= gpioCount
    })
  }

  // Price range filter
  if (minPrice.value !== null) {
    products = products.filter((p) => (p.current_price || 0) >= minPrice.value!)
  }

  if (maxPrice.value !== null) {
    products = products.filter((p) => (p.current_price || 0) <= maxPrice.value!)
  }

  // Sort products
  switch (sortBy.value) {
    case 'newest':
      products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'price_low':
      products.sort((a, b) => (a.current_price || 0) - (b.current_price || 0))
      break
    case 'price_high':
      products.sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
      break
    case 'savings':
      products.sort((a, b) => (b.savings_percentage || 0) - (a.savings_percentage || 0))
      break
  }

  return products
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(12) // 12 products per page (4x3 grid on desktop)

// Calculate pagination
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

// Reset to page 1 when filters change
watch([searchQuery, selectedType, selectedChip, selectedWifiVersion, selectedBluetoothVersion, 
       selectedUsbType, selectedFlashSize, selectedPsramSize, selectedGpioPins, 
       minPrice, maxPrice, hasCamera, hasDisplay, hasBattery, hasZigbee, hasThread, hasSdCard, sortBy], () => {
  currentPage.value = 1
})

// Scroll to products section when page changes
watch(currentPage, (newPage, oldPage) => {
  // Only scroll if this is a user-initiated page change (not initial load)
  if (oldPage !== undefined) {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
})

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Get page numbers to display (with ellipsis)
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    // Show pages around current page
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(total)
  }
  
  return pages
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    selectedType.value !== 'all' ||
    sortBy.value !== 'newest' ||
    selectedChip.value !== 'all' ||
    selectedWifiVersion.value !== 'all' ||
    selectedBluetoothVersion.value !== 'all' ||
    selectedUsbType.value !== 'all' ||
    selectedFlashSize.value !== 'all' ||
    selectedPsramSize.value !== 'all' ||
    selectedGpioPins.value !== 'all' ||
    minPrice.value !== null ||
    maxPrice.value !== null ||
    hasCamera.value !== null ||
    hasDisplay.value !== null ||
    hasBattery.value !== null ||
    hasZigbee.value !== null ||
    hasThread.value !== null ||
    hasSdCard.value !== null
})

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'all'
  sortBy.value = 'newest'
  selectedChip.value = 'all'
  selectedWifiVersion.value = 'all'
  selectedBluetoothVersion.value = 'all'
  selectedUsbType.value = 'all'
  selectedFlashSize.value = 'all'
  selectedPsramSize.value = 'all'
  selectedGpioPins.value = 'all'
  minPrice.value = null
  maxPrice.value = null
  hasCamera.value = null
  hasDisplay.value = null
  hasBattery.value = null
  hasZigbee.value = null
  hasThread.value = null
  hasSdCard.value = null
}

// Share current filter configuration
const shareFilters = async () => {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    // You could add a toast notification here
    alert('Link copied to clipboard! Share this URL to show these exact filters.')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Set page meta
useHead({
  title: 'Products - ESPBoards Store',
  meta: [
    { name: 'description', content: 'Browse our selection of ESP32 development boards, sensors, displays, and accessories.' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-linear-to-br from-blue-500 via-blue-600 to-blue-800 dark:from-blue-700 dark:via-blue-900 dark:to-blue-950">
      <!-- Animated Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>
      
      <div class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div class="text-center">
          <!-- Icon -->
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>

          <h1 class="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Discover ESP32 Products
          </h1>
          <p class="mt-2 text-sm text-blue-100 sm:text-base">
            Browse our curated selection of development boards, sensors, and IoT components
          </p>
          
          <!-- Product Count -->
          <div v-if="productsData?.count" class="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-white shadow-lg">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-xs font-semibold sm:text-sm">
              {{ filteredProducts.length }} of {{ productsData.count }} products
            </span>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap justify-center gap-2">
            <span v-if="selectedType !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ productTypes.find((t: any) => t.value === selectedType)?.label }}
            </span>
            <span v-if="selectedChip !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              {{ chipOptions.find((c: any) => c.value === selectedChip)?.label }}
            </span>
            <span v-if="selectedWifiVersion !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              WiFi {{ selectedWifiVersion }}
            </span>
            <span v-if="selectedBluetoothVersion !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
              BT {{ selectedBluetoothVersion }}
            </span>
            <span v-if="selectedUsbType !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              {{ usbTypeOptions.find((u: any) => u.value === selectedUsbType)?.label }}
            </span>
            <span v-if="hasCamera === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Camera
            </span>
            <span v-if="hasDisplay === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Display
            </span>
            <span v-if="hasBattery === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Battery
            </span>
            <span v-if="hasZigbee === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Zigbee
            </span>
            <span v-if="hasThread === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Thread
            </span>
            <span v-if="hasSdCard === true" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              SD Card
            </span>
            <span v-if="selectedFlashSize !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Flash: {{ flashOptions.find(o => o.value === selectedFlashSize)?.label }}
            </span>
            <span v-if="selectedPsramSize !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              PSRAM: {{ psramOptions.find(o => o.value === selectedPsramSize)?.label }}
            </span>
            <span v-if="selectedGpioPins !== 'all'" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              GPIO: {{ gpioPinOptions.find(o => o.value === selectedGpioPins)?.label }}
            </span>
            <span v-if="minPrice !== null || maxPrice !== null" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span v-if="minPrice !== null && maxPrice !== null">
                ${{ minPrice }} - ${{ maxPrice }}
              </span>
              <span v-else-if="minPrice !== null">
                ${{ minPrice }}+
              </span>
              <span v-else>
                Up to ${{ maxPrice }}
              </span>
            </span>
            <span v-if="searchQuery" class="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              "{{ searchQuery }}"
            </span>
          </div>

          <!-- Action Buttons -->
          <div v-if="hasActiveFilters" class="mt-4 flex justify-center gap-2">
            <button
              @click="shareFilters"
              class="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-white/20 hover:shadow-xl"
              title="Share this filtered view"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share View
            </button>
            
            <button
              @click="clearAllFilters"
              class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-105"
              title="Clear all filters"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <ClientOnly>
      <template #fallback>
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          </div>
        </div>
      </template>
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-3">
            
            <!-- Search -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <label class="mb-1.5 block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Search
              </label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <!-- Category and Sort -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div>
                <label class="mb-1.5 block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </label>
                <select
                  v-model="selectedType"
                  class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                >
                  <option v-for="type in productTypes" :key="type.value" :value="type.value" :disabled="type.disabled">
                    {{ type.label }}{{ type.comingSoon ? ' (Coming Soon)' : '' }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1.5 block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  v-model="sortBy"
                  class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Advanced Filters (Development Boards) -->
            <div v-if="showDevelopmentBoardFilters" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <div class="flex items-center justify-between mb-2">
                <button
                  @click="isSpecificationsOpen = !isSpecificationsOpen"
                  class="flex items-center justify-between flex-1 text-xs font-semibold text-gray-900 dark:text-white lg:cursor-default"
                >
                  <span>Specifications</span>
                  <svg
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-180': isSpecificationsOpen }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  v-if="selectedChip !== 'all' || selectedWifiVersion !== 'all' || selectedBluetoothVersion !== 'all' || selectedUsbType !== 'all' || selectedFlashSize !== 'all' || selectedPsramSize !== 'all' || selectedGpioPins !== 'all' || minPrice !== null || maxPrice !== null || hasCamera !== null || hasDisplay !== null || hasBattery !== null || hasZigbee !== null || hasThread !== null || hasSdCard !== null"
                  @click="selectedChip = 'all'; selectedWifiVersion = 'all'; selectedBluetoothVersion = 'all'; selectedUsbType = 'all'; selectedFlashSize = 'all'; selectedPsramSize = 'all'; selectedGpioPins = 'all'; minPrice = null; maxPrice = null; hasCamera = null; hasDisplay = null; hasBattery = null; hasZigbee = null; hasThread = null; hasSdCard = null"
                  class="text-[10px] text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-2"
                >
                  Clear
                </button>
              </div>

              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[3000px]"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 max-h-[3000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="isSpecificationsOpen" class="overflow-hidden">
                  <div class="space-y-2.5">
                <!-- Chip Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Chip Model
                  </label>
                  <select
                    v-model="selectedChip"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="chip in chipOptions" :key="chip.value" :value="chip.value">
                      {{ chip.label }}
                    </option>
                  </select>
                </div>

                <!-- WiFi Version Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    WiFi Version
                  </label>
                  <select
                    v-model="selectedWifiVersion"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="wifi in wifiVersionOptions" :key="wifi.value" :value="wifi.value">
                      {{ wifi.label }}
                    </option>
                  </select>
                </div>

                <!-- Bluetooth Version Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Bluetooth
                  </label>
                  <select
                    v-model="selectedBluetoothVersion"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="bt in bluetoothVersionOptions" :key="bt.value" :value="bt.value">
                      {{ bt.label }}
                    </option>
                  </select>
                </div>

                <!-- USB Type Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    USB Type
                  </label>
                  <select
                    v-model="selectedUsbType"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="usb in usbTypeOptions" :key="usb.value" :value="usb.value">
                      {{ usb.label }}
                    </option>
                  </select>
                </div>

                <!-- Flash Size Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Flash Size
                  </label>
                  <select
                    v-model="selectedFlashSize"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="flash in flashOptions" :key="flash.value" :value="flash.value">
                      {{ flash.label }}
                    </option>
                  </select>
                </div>

                <!-- PSRAM Size Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    PSRAM Size
                  </label>
                  <select
                    v-model="selectedPsramSize"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="psram in psramOptions" :key="psram.value" :value="psram.value">
                      {{ psram.label }}
                    </option>
                  </select>
                </div>

                <!-- GPIO Pins Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    GPIO Pins
                  </label>
                  <select
                    v-model="selectedGpioPins"
                    class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option v-for="gpio in gpioPinOptions" :key="gpio.value" :value="gpio.value">
                      {{ gpio.label }}
                    </option>
                  </select>
                </div>

                <!-- Price Range Filter -->
                <div>
                  <label class="mb-1 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Price Range
                  </label>
                  <div class="space-y-1.5">
                    <div class="relative">
                      <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 dark:text-gray-400">$</span>
                      <input
                        v-model.number="minPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Min"
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-5 pr-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div class="relative">
                      <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 dark:text-gray-400">$</span>
                      <input
                        v-model.number="maxPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Max"
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-5 pr-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hardware Feature Toggles -->
              <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label class="mb-2 block text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Hardware Features
                </label>
                <div class="space-y-1.5">
                  <button
                    @click="hasCamera = hasCamera === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasCamera === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Camera
                  </button>

                  <button
                    @click="hasDisplay = hasDisplay === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasDisplay === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Display
                  </button>

                  <button
                    @click="hasBattery = hasBattery === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasBattery === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Battery
                  </button>

                  <button
                    @click="hasZigbee = hasZigbee === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasZigbee === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    Zigbee
                  </button>

                  <button
                    @click="hasThread = hasThread === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasThread === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Thread
                  </button>

                  <button
                    @click="hasSdCard = hasSdCard === true ? null : true"
                    class="w-full inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all"
                    :class="hasSdCard === true 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    SD Card
                  </button>
                </div>
              </div>
                </div>
              </transition>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main id="products-section" class="flex-1 min-w-0">
          <!-- Results Header with Top Pagination -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Products
                  <span v-if="productsData?.count" class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({{ filteredProducts.length }} of {{ productsData.count }})
                  </span>
                </h2>
              </div>
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            </div>

            <!-- Top Pagination (shown when there are products and multiple pages) -->
            <div v-if="!pending && filteredProducts.length > 0 && totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <!-- Page Info -->
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Page {{ currentPage }} of {{ totalPages }}
              </p>

              <!-- Pagination Controls -->
              <nav class="flex items-center gap-2" aria-label="Pagination">
                <!-- Previous Button -->
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span class="hidden sm:inline">Previous</span>
                </button>

                <!-- Page Numbers (compact for top) -->
                <div class="hidden md:flex items-center gap-1">
                  <button
                    v-for="(page, idx) in visiblePages.slice(0, 5)"
                    :key="idx"
                    @click="typeof page === 'number' ? goToPage(page) : null"
                    :disabled="page === '...'"
                    :class="[
                      'min-w-8 h-8 rounded-lg text-sm font-medium transition-all',
                      currentPage === page
                        ? 'bg-blue-600 dark:bg-blue-600 text-white'
                        : page === '...'
                        ? 'cursor-default text-gray-400 dark:text-gray-500'
                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]"
                  >
                    {{ page }}
                  </button>
                </div>

                <!-- Next Button -->
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="hidden sm:inline">Next</span>
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="pending" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="i in 6" :key="i" class="animate-pulse">
              <div class="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              <div class="mt-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>

          <!-- No Products - Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="py-16">
            <div class="mx-auto max-w-md text-center">
              <!-- Illustration -->
          <div class="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
            <svg class="h-16 w-16 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Heading -->
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          
          <!-- Description -->
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            We couldn't find any products matching your search criteria.
          </p>
          
          <!-- Active Filters Info -->
          <div v-if="hasActiveFilters" class="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900">
            <p class="text-sm text-blue-800 dark:text-blue-200 mb-3 font-medium">
              Active filters may be limiting results
            </p>
            <div class="flex flex-wrap justify-center gap-2 text-xs">
              <span v-if="searchQuery" class="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-blue-700 dark:text-blue-300">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                "{{ searchQuery }}"
              </span>
              <span v-if="selectedType !== 'all'" class="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-blue-700 dark:text-blue-300">
                {{ productTypes.find((t: any) => t.value === selectedType)?.label }}
              </span>
              <span v-if="selectedChip !== 'all'" class="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-blue-700 dark:text-blue-300">
                {{ selectedChip }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              @click="clearAllFilters"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/10 transition-all hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-500/20 hover:scale-105"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All Filters
            </button>

            <NuxtLink
              to="/products"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              View All Products
            </NuxtLink>
          </div>

          <!-- Suggestions -->
          <div class="mt-8 rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-left">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Try these suggestions:
            </h4>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use broader search terms or fewer filters
              </li>
              <li class="flex items-start gap-2">
                <svg class="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check your spelling and try again
              </li>
              <li class="flex items-start gap-2">
                <svg class="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Browse different product categories
              </li>
            </ul>
          </div>
        </div>
          </div>

          <!-- Products Grid -->
          <div v-else class="space-y-12">
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard
                v-for="product in paginatedProducts"
                :key="product.id"
                :product="product"
                :hide-brand="!!product.group"
              />
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="flex flex-col items-center gap-4">
              <!-- Page Info -->
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} products
              </p>

              <!-- Pagination Buttons -->
              <nav class="flex items-center gap-2" aria-label="Pagination">
                <!-- Previous Button -->
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span class="hidden sm:inline">Previous</span>
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center gap-1">
                  <button
                    v-for="(page, idx) in visiblePages"
                    :key="idx"
                    @click="typeof page === 'number' ? goToPage(page) : null"
                    :disabled="page === '...'"
                    :class="[
                      'min-w-10 h-10 rounded-lg text-sm font-medium transition-all',
                      currentPage === page
                        ? 'bg-blue-600 dark:bg-blue-600 text-white'
                        : page === '...'
                        ? 'cursor-default text-gray-400 dark:text-gray-500'
                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]"
                  >
                    {{ page }}
                  </button>
                </div>

                <!-- Next Button -->
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <span class="hidden sm:inline">Next</span>
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>

              <!-- Quick Jump (optional, for large datasets) -->
              <div v-if="totalPages > 10" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Jump to page:</span>
                <input
                  type="number"
                  :value="currentPage"
                  @input="goToPage(parseInt(($event.target as HTMLInputElement).value))"
                  :min="1"
                  :max="totalPages"
                  class="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-center text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ClientOnly>
  </div>
</template>

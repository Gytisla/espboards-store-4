<script setup lang="ts">
const route = useRoute()
const { selectedMarketplace } = useMarketplace()

// Types
interface Product {
  id: string
  asin: string
  title: string
  description: string | null
  brand: string | null
  images: Array<{ url: string; width?: number; height?: number; variant?: string }> | null
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

// Initialize selectedType from URL query parameter
onMounted(() => {
  if (route.query.type && typeof route.query.type === 'string') {
    selectedType.value = route.query.type
  }
})

// Fetch products
const { data: productsData, pending, refresh } = await useFetch('/api/products', {
  query: {
    marketplace: selectedMarketplace,
  },
  watch: [selectedMarketplace],
})

// Product types for filtering
const productTypes = [
  { value: 'all', label: 'All Products' },
  { value: 'development_board', label: 'Development Boards' },
  { value: 'sensor', label: 'Sensors' },
  { value: 'display', label: 'Displays' },
  { value: 'power', label: 'Power Modules' },
  { value: 'communication', label: 'Communication' },
  { value: 'motor_driver', label: 'Motor Drivers' },
  { value: 'breakout', label: 'Breakout Boards' },
  { value: 'accessory', label: 'Accessories' },
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'savings', label: 'Best Savings' },
]

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

// Set page meta
useHead({
  title: 'Products - ESP32 Store',
  meta: [
    { name: 'description', content: 'Browse our selection of ESP32 development boards, sensors, displays, and accessories.' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Products</h1>
        <p class="mt-2 text-sm text-gray-600">
          Browse our selection of ESP32 boards and components
          <span v-if="productsData?.count" class="ml-2 font-medium text-gray-900">
            ({{ filteredProducts.length }} of {{ productsData.count }} products)
          </span>
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Search -->
        <div class="flex-1 lg:max-w-md">
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <!-- Product Type Filter -->
          <select
            v-model="selectedType"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="type in productTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>

          <!-- Sort By -->
          <select
            v-model="sortBy"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="aspect-square rounded-lg bg-gray-200"></div>
          <div class="mt-4 h-4 rounded bg-gray-200"></div>
          <div class="mt-2 h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
      </div>

      <!-- No Products -->
      <div v-else-if="filteredProducts.length === 0" class="py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        <button
          @click="searchQuery = ''; selectedType = 'all'"
          class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

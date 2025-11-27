<script setup lang="ts">
const route = useRoute()
const groupSlug = route.params.slug as string

// Fetch group and its products
const { data, pending, error } = await useFetch(`/api/groups/${groupSlug}`, {
  key: `group-${groupSlug}`,
})

// Handle errors
if (error.value) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    message: error.value?.message || 'Product group not found',
  })
}

const group = computed(() => (data.value as any)?.group)
const products = computed(() => (data.value as any)?.products || [])

// Format price
const formatPrice = (price: number | null, currency: string) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

// Get product image
const getProductImage = (images: any) => {
  if (!images) return 'https://via.placeholder.com/300x300?text=No+Image'
  
  if (images.primary?.large?.url) return images.primary.large.url
  if (images.primary?.medium?.url) return images.primary.medium.url
  if (images.primary?.small?.url) return images.primary.small.url
  
  return 'https://via.placeholder.com/300x300?text=No+Image'
}

// Sorting
const sortBy = ref<'default' | 'price-low' | 'price-high' | 'savings'>('default')

const sortedProducts = computed(() => {
  const items = [...products.value]
  
  if (sortBy.value === 'default') {
    return items
  }
  
  if (sortBy.value === 'price-low') {
    items.sort((a: any, b: any) => {
      const priceA = a.current_price || Infinity
      const priceB = b.current_price || Infinity
      return priceA - priceB
    })
  } else if (sortBy.value === 'price-high') {
    items.sort((a: any, b: any) => {
      const priceA = a.current_price || 0
      const priceB = b.current_price || 0
      return priceB - priceA
    })
  } else if (sortBy.value === 'savings') {
    items.sort((a: any, b: any) => {
      const savingsA = a.savings_percentage || 0
      const savingsB = b.savings_percentage || 0
      return savingsB - savingsA
    })
  }
  
  return items
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Loading State -->
    <div v-if="pending" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-2/3 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 6" :key="i" class="h-64 rounded-xl bg-gray-200 dark:bg-gray-800"></div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="group" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Breadcrumb Navigation -->
      <nav class="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <NuxtLink 
          to="/" 
          class="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Home
        </NuxtLink>
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink 
          to="/products" 
          class="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Products
        </NuxtLink>
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-medium text-gray-900 dark:text-white">{{ group.title }}</span>
      </nav>

      <!-- Header -->
      <div class="mb-8 rounded-2xl bg-linear-to-br from-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl">
        <div class="flex flex-col gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h1 class="text-2xl sm:text-3xl font-bold">{{ group.title }}</h1>
            </div>
            <p v-if="group.description" class="text-purple-100 dark:text-purple-200 line-clamp-2">
              {{ group.description }}
            </p>
          </div>
          <div class="flex items-center gap-4 text-sm sm:text-base">
            <div>
              <span class="opacity-90">{{ group.product_count }} Options</span>
            </div>
            <div v-if="group.price_range" class="font-bold">
              {{ formatPrice(group.price_range.min, group.price_range.currency) }} - 
              {{ formatPrice(group.price_range.max, group.price_range.currency) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="mb-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div class="flex gap-3">
          <svg class="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1 text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium mb-1">Compare prices from different vendors</p>
            <p class="text-blue-600 dark:text-blue-300">These are similar products available from multiple sellers. Click any option to view its full details and purchase.</p>
          </div>
        </div>
      </div>

      <!-- Sort Control -->
      <div v-if="products && products.length > 1" class="mb-6 flex items-center justify-between gap-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ products.length }} option{{ products.length === 1 ? '' : 's' }}
        </div>
        <div class="flex items-center gap-2">
          <label for="sort-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            id="sort-select"
            v-model="sortBy"
            class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="default">Default Order</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="savings">Highest Savings</option>
          </select>
        </div>
      </div>

      <!-- No Products State -->
      <div v-if="!products || products.length === 0" class="text-center py-16">
        <svg class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Products Available</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">This group doesn't have any active products at the moment.</p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-700"
        >
          Browse All Products
        </NuxtLink>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in sortedProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

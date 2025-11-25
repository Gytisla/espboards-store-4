<template>
  <div class="py-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Manage your product catalog</p>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Search by title, ASIN, or brand..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          @change="loadProducts"
          class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="loadProducts"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && products.length === 0" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-medium text-red-900 dark:text-red-200">Error loading products</p>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No products found</h3>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'Import some products to get started' }}
      </p>
      <NuxtLink
        to="/admin/search"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Products
      </NuxtLink>
    </div>

    <!-- Products Table -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Product
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                ASIN
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Marketplace
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Price
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Refreshed
              </th>
              <th scope="col" class="sticky right-0 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr
              v-for="product in products"
              :key="product.id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <!-- Product Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img
                      v-if="product.images?.primary?.small?.url || product.images?.primary?.medium?.url || product.images?.primary?.large?.url"
                      :src="product.images?.primary?.small?.url || product.images?.primary?.medium?.url || product.images?.primary?.large?.url"
                      :alt="product.title"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" :title="product.title">
                      {{ product.title }}
                    </p>
                    <p v-if="product.brand" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ product.brand }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- ASIN -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ product.asin }}</span>
              </td>

              <!-- Marketplace -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ product.marketplace.code === 'US' ? '🇺🇸' : '🇩🇪' }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ product.marketplace.code }}</span>
                </div>
              </td>

              <!-- Price -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm">
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ product.current_price ? formatPrice(product.current_price, product.currency) : 'N/A' }}
                  </p>
                  <p v-if="product.original_price && product.current_price !== product.original_price" class="text-xs text-gray-500 dark:text-gray-400 line-through">
                    {{ formatPrice(product.original_price, product.currency) }}
                  </p>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="product.status"
                  @change="updateProductStatus(product.id, ($event.target as HTMLSelectElement).value)"
                  :disabled="updatingStatus.has(product.id)"
                  class="rounded-lg border-0 py-1 pl-3 pr-8 text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                  :class="getStatusClass(product.status)"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </td>

              <!-- Created Date -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(product.created_at).split(' ').slice(0, 3).join(' ') }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(product.created_at).split(' ').slice(3).join(' ') }}</div>
              </td>

              <!-- Updated Date -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(product.last_refresh_at).split(' ').slice(0, 3).join(' ') }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(product.last_refresh_at).split(' ').slice(3).join(' ') }}</div>
              </td>

              <!-- Actions -->
              <td class="sticky right-0 bg-white dark:bg-gray-800 px-6 py-4 whitespace-nowrap text-right text-sm shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/products/${product.id}/edit`"
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit product"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </NuxtLink>
                  <a
                    :href="product.detail_page_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="View on Amazon"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
            {{ pagination.total }} products
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 1 || isLoading"
              class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages || isLoading"
              class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Use marketplace composable for global marketplace state
const { selectedMarketplace } = useMarketplace()

// State
const products = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})
const updatingStatus = ref<Set<string>>(new Set())

// Load products
const loadProducts = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/admin/products', {
      query: {
        marketplace: selectedMarketplace.value,
        status: statusFilter.value || undefined,
        search: searchQuery.value || undefined,
        page: currentPage.value,
        limit: pagination.value.limit,
      },
    })

    products.value = response.products
    pagination.value = response.pagination
  } catch (err: any) {
    console.error('Failed to load products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    isLoading.value = false
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 500)
}

// Update product status
const updateProductStatus = async (productId: string, newStatus: string) => {
  updatingStatus.value.add(productId)

  try {
    await $fetch(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      body: { status: newStatus },
    })

    // Update local product status
    const product = products.value.find(p => p.id === productId)
    if (product) {
      product.status = newStatus
    }
  } catch (err: any) {
    console.error('Failed to update status:', err)
    alert(`Failed to update status: ${err.message}`)
    // Reload to revert
    await loadProducts()
  } finally {
    updatingStatus.value.delete(productId)
  }
}

// Pagination
const goToPage = (page: number) => {
  currentPage.value = page
  loadProducts()
}

// Format price
const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.toFixed(2)}`
}

// Format date with time (space-efficient)
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
  return `${month} ${day}, ${year} ${time}`
}

// Get status class for styling
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 focus:ring-green-500'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
    case 'unavailable':
      return 'bg-red-100 text-red-800 focus:ring-red-500'
    default:
      return 'bg-gray-100 text-gray-800 focus:ring-gray-500'
  }
}

// Watch marketplace changes and reload
watch(selectedMarketplace, () => {
  currentPage.value = 1
  loadProducts()
})

// Load products on mount
onMounted(() => {
  loadProducts()
})
</script>

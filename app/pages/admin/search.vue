<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Use marketplace composable for global marketplace state
const { selectedMarketplace, marketplace } = useMarketplace()

// Reactive state
const searchQuery = ref('')
const isLoading = ref(false)
const searchResults = ref<any[]>([])
const error = ref('')
const importingAsins = ref<Set<string>>(new Set())
const importedAsins = ref<Set<string>>(new Set())
const importErrors = ref<Map<string, string>>(new Map())
const successMessage = ref('')

// Bulk import state
const selectedAsins = ref<Set<string>>(new Set())
const isBulkImporting = ref(false)
const showBulkModal = ref(false)
const bulkImportProgress = ref({
  total: 0,
  completed: 0,
  successful: 0,
  failed: 0,
  results: [] as Array<{ asin: string; title: string; success: boolean; error?: string }>
})

// Check if a product is selected
const isSelected = (asin: string) => selectedAsins.value.has(asin)

// Check if all products are selected
const allSelected = computed(() => {
  if (searchResults.value.length === 0) return false
  return searchResults.value.every(product => isSelected(product.asin))
})

// Check if any products are selected
const hasSelection = computed(() => selectedAsins.value.size > 0)

// Toggle product selection
const toggleSelection = (asin: string) => {
  if (selectedAsins.value.has(asin)) {
    selectedAsins.value.delete(asin)
  } else {
    selectedAsins.value.add(asin)
  }
}

// Toggle select all
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedAsins.value.clear()
  } else {
    searchResults.value.forEach(product => {
      if (!isImported(product.asin)) {
        selectedAsins.value.add(product.asin)
      }
    })
  }
}

// Check if a product is currently being imported
const isImporting = (asin: string) => importingAsins.value.has(asin)

// Check if a product has been imported
const isImported = (asin: string) => importedAsins.value.has(asin)

// Get import error for a product
const getImportError = (asin: string) => importErrors.value.get(asin)

// Watch for marketplace changes and re-search if we have results
watch(selectedMarketplace, (newMarketplace) => {
  // If we have search results, automatically re-search with the new marketplace
  if (searchResults.value.length > 0 && searchQuery.value.trim()) {
    performSearch()
  }
})

// Search function
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    error.value = 'Please enter a search query'
    return
  }

  isLoading.value = true
  error.value = ''
  
  // Clear selections when performing new search
  selectedAsins.value.clear()

  try {
    const response = await $fetch('/api/admin/search', {
      method: 'POST',
      body: {
        query: searchQuery.value.trim(),
        marketplace: selectedMarketplace.value
      }
    })

    searchResults.value = response.results || []
    
    // Mark already imported products in our local state
    searchResults.value.forEach(product => {
      if (product.isImported) {
        importedAsins.value.add(product.asin)
      }
    })
  } catch (err: any) {
    error.value = err.message || 'Search failed. Please try again.'
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// Import product function
const importProduct = async (product: any) => {
  const asin = product.asin
  
  // Clear any previous error for this product
  importErrors.value.delete(asin)
  successMessage.value = ''
  
  // Add to importing set
  importingAsins.value.add(asin)
  
  try {
    const response = await $fetch('/api/products/import', {
      method: 'POST',
      body: {
        asin,
        marketplace: selectedMarketplace.value
      }
    })

    // Mark as imported
    importedAsins.value.add(asin)
    
    // Show success message
    successMessage.value = `Successfully imported "${product.title}"`
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      if (successMessage.value === `Successfully imported "${product.title}"`) {
        successMessage.value = ''
      }
    }, 5000)
    
  } catch (err: any) {
    // Store error for this specific product
    const errorMessage = err.data?.message || err.message || 'Import failed'
    importErrors.value.set(asin, errorMessage)
    
    // Auto-clear error after 10 seconds
    setTimeout(() => {
      importErrors.value.delete(asin)
    }, 10000)
  } finally {
    // Remove from importing set
    importingAsins.value.delete(asin)
  }
}

// Bulk import function
const bulkImportProducts = async () => {
  const selectedProducts = searchResults.value.filter(p => selectedAsins.value.has(p.asin))
  
  if (selectedProducts.length === 0) {
    return
  }
  
  // Initialize progress
  bulkImportProgress.value = {
    total: selectedProducts.length,
    completed: 0,
    successful: 0,
    failed: 0,
    results: []
  }
  
  // Show modal and start importing
  showBulkModal.value = true
  isBulkImporting.value = true
  
  // Import products sequentially to avoid overwhelming the API
  for (const product of selectedProducts) {
    const asin = product.asin
    
    try {
      await $fetch('/api/products/import', {
        method: 'POST',
        body: {
          asin,
          marketplace: selectedMarketplace.value
        }
      })
      
      // Mark as imported
      importedAsins.value.add(asin)
      selectedAsins.value.delete(asin)
      
      // Record success
      bulkImportProgress.value.successful++
      bulkImportProgress.value.results.push({
        asin,
        title: product.title,
        success: true
      })
      
    } catch (err: any) {
      // Record failure
      const errorMessage = err.data?.message || err.message || 'Import failed'
      bulkImportProgress.value.failed++
      bulkImportProgress.value.results.push({
        asin,
        title: product.title,
        success: false,
        error: errorMessage
      })
    } finally {
      bulkImportProgress.value.completed++
    }
  }
  
  // Finished importing
  isBulkImporting.value = false
}

// Close bulk import modal
const closeBulkModal = () => {
  if (!isBulkImporting.value) {
    showBulkModal.value = false
    bulkImportProgress.value = {
      total: 0,
      completed: 0,
      successful: 0,
      failed: 0,
      results: []
    }
  }
}

// Handle form submission
const handleSubmit = (e: Event) => {
  e.preventDefault()
  performSearch()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl shadow-blue-500/20">
      <h1 class="text-2xl font-bold">Product Search 🔍</h1>
      <p class="mt-2 text-blue-100">Search and import products from Amazon</p>
    </div>

    <!-- Search Form -->
    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <form @submit="handleSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-3">
          <!-- Search Input -->
          <div class="md:col-span-3">
            <label for="search" class="block text-sm font-semibold text-gray-900 mb-2">
              Search Query
            </label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                required
                class="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="Search Amazon products..."
                :disabled="isLoading"
              />
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isLoading || !searchQuery.trim()"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {{ isLoading ? 'Searching...' : 'Search Products' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Error Alert -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-red-900">Search Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
          <button
            @click="error = ''"
            class="shrink-0 text-red-600 transition-colors hover:text-red-700"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Success Alert -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="successMessage"
        class="rounded-xl border border-green-200 bg-green-50 p-4"
      >
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-green-900">Success</h3>
            <p class="mt-1 text-sm text-green-700">{{ successMessage }}</p>
          </div>
          <button
            @click="successMessage = ''"
            class="shrink-0 text-green-600 transition-colors hover:text-green-700"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="space-y-4">
      <!-- Results Header with Select All -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-gray-900">
            Search Results ({{ searchResults.length }})
          </h2>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <span class="text-sm text-gray-600">Select all</span>
          </label>
        </div>
        
        <!-- Bulk Actions -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <button
            v-if="hasSelection"
            @click="bulkImportProducts"
            :disabled="isBulkImporting"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Selected ({{ selectedAsins.size }})
          </button>
        </Transition>
      </div>

      <!-- Results Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="product in searchResults"
          :key="product.asin"
          class="rounded-2xl border transition-all"
          :class="{
            'border-blue-500 shadow-lg': isSelected(product.asin),
            'border-gray-200 shadow-sm hover:shadow-lg': !isSelected(product.asin)
          }"
        >
          <div class="p-6">
            <!-- Selection Checkbox and Status -->
            <div class="mb-3 flex items-start justify-between gap-2">
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="isSelected(product.asin)"
                  @change="toggleSelection(product.asin)"
                  :disabled="isImported(product.asin)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                />
              </label>
              <div class="flex flex-col items-end gap-1">
                <span class="text-xs font-mono text-gray-400">{{ product.asin }}</span>
                <span
                  v-if="isImported(product.asin)"
                  class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Imported
                </span>
              </div>
            </div>
            
            <!-- Product Image -->
            <div class="aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100">
              <img
                v-if="product.images?.[0]?.url"
                :src="product.images[0].url"
                :alt="product.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-gray-400">
                <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Product Info -->
            <div class="space-y-2">
              <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
                {{ product.title }}
              </h3>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <svg class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm text-gray-600">
                    {{ product.starRating || 'N/A' }}
                  </span>
                </div>
                <span class="text-sm text-gray-400">•</span>
                <span class="text-sm text-gray-600">
                  {{ product.customerReviewCount || 0 }} reviews
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-gray-900">
                  {{ product.currentPrice ? `$${product.currentPrice}` : 'Price N/A' }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ marketplace.flag }}
                </span>
              </div>
            </div>

            <!-- Import Button -->
            <div class="mt-4 space-y-2">
              <!-- Import Error for this product -->
              <div
                v-if="getImportError(product.asin)"
                class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {{ getImportError(product.asin) }}
              </div>
              
              <!-- Import Button -->
              <button
                @click="importProduct(product)"
                :disabled="isImporting(product.asin) || isImported(product.asin)"
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'bg-green-600 text-white hover:bg-green-700 focus:ring-green-100': !isImported(product.asin),
                  'bg-gray-100 text-gray-600': isImported(product.asin)
                }"
              >
                <!-- Loading spinner -->
                <svg v-if="isImporting(product.asin)" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                
                <!-- Success checkmark -->
                <svg v-else-if="isImported(product.asin)" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                
                <!-- Plus icon -->
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                
                <!-- Button text -->
                <span v-if="isImporting(product.asin)">Importing...</span>
                <span v-else-if="isImported(product.asin)">Imported</span>
                <span v-else>Import to Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="!isLoading && searchQuery && !error" class="rounded-2xl border border-gray-200 bg-white p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
      <p class="mt-2 text-gray-600">Try adjusting your search query or selecting a different marketplace.</p>
    </div>

    <!-- Bulk Import Progress Modal -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showBulkModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeBulkModal"
      >
        <div class="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <!-- Modal Header -->
          <div class="border-b border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Bulk Import Progress</h2>
              <button
                v-if="!isBulkImporting"
                @click="closeBulkModal"
                class="text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-gray-700">
                  {{ bulkImportProgress.completed }} / {{ bulkImportProgress.total }} products processed
                </span>
                <span class="text-gray-600">
                  {{ Math.round((bulkImportProgress.completed / bulkImportProgress.total) * 100) }}%
                </span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full transition-all duration-300"
                  :class="{
                    'bg-blue-600': isBulkImporting,
                    'bg-green-600': !isBulkImporting && bulkImportProgress.failed === 0,
                    'bg-yellow-600': !isBulkImporting && bulkImportProgress.failed > 0
                  }"
                  :style="{ width: `${(bulkImportProgress.completed / bulkImportProgress.total) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4">
              <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                <div class="text-2xl font-bold text-gray-900">{{ bulkImportProgress.total }}</div>
                <div class="text-xs text-gray-600">Total</div>
              </div>
              <div class="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <div class="text-2xl font-bold text-green-900">{{ bulkImportProgress.successful }}</div>
                <div class="text-xs text-green-600">Successful</div>
              </div>
              <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <div class="text-2xl font-bold text-red-900">{{ bulkImportProgress.failed }}</div>
                <div class="text-xs text-red-600">Failed</div>
              </div>
            </div>

            <!-- Results List -->
            <div v-if="bulkImportProgress.results.length > 0" class="space-y-2">
              <h3 class="text-sm font-semibold text-gray-900">Import Results</h3>
              <div class="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div
                  v-for="result in bulkImportProgress.results"
                  :key="result.asin"
                  class="flex items-start gap-3 rounded-lg bg-white p-3 text-sm"
                >
                  <!-- Success/Failure Icon -->
                  <svg
                    v-if="result.success"
                    class="h-5 w-5 shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5 shrink-0 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>

                  <!-- Product Info -->
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 line-clamp-1">{{ result.title }}</div>
                    <div class="text-xs text-gray-500">{{ result.asin }}</div>
                    <div v-if="!result.success && result.error" class="mt-1 text-xs text-red-600">
                      {{ result.error }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isBulkImporting" class="flex items-center justify-center gap-3 py-4">
              <svg class="h-6 w-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Importing products...</span>
            </div>
          </div>

          <!-- Modal Footer -->
          <div v-if="!isBulkImporting" class="border-t border-gray-200 p-6">
            <button
              @click="closeBulkModal"
              class="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:ring-4 focus:ring-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
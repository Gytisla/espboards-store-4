<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600">Loading product...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-medium text-red-900">Error loading product</p>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="product">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/admin/products"
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p class="mt-1 text-sm text-gray-600">{{ product.asin }} • {{ product.marketplace.code }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <a
            :href="product.detail_page_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Amazon
          </a>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-medium text-green-900">{{ successMessage }}</p>
        </div>
      </div>

      <form @submit.prevent="saveProduct" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Left Column: Product Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <!-- Product Image -->
              <div class="mb-6">
                <div class="aspect-square w-full max-w-md overflow-hidden rounded-lg bg-gray-100">
                  <img
                    v-if="product.images?.[0]"
                    :src="product.images[0].url"
                    :alt="product.title"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <svg class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Title (Read-only) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  :value="product.title"
                  disabled
                  class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900"
                />
              </div>

              <!-- Brand (Read-only) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  :value="product.brand || 'N/A'"
                  disabled
                  class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900"
                />
              </div>

              <!-- Custom Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <span class="text-gray-500 font-normal">(Optional override)</span>
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  rows="4"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter custom description or leave blank to use Amazon's"
                ></textarea>
              </div>
            </div>

            <!-- Technical Metadata Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
              
              <!-- Product Type -->
              <div class="mb-4">
                <label for="product_type" class="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <select
                  id="product_type"
                  v-model="formData.metadata.filters.product_type"
                  @change="updateDisplayField('product_type')"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select type...</option>
                  <option value="development_board">Development Board</option>
                  <option value="sensor">Sensor</option>
                  <option value="display">Display</option>
                  <option value="power">Power Module</option>
                  <option value="wireless">Wireless Module</option>
                  <option value="breakout">Breakout Board</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>

              <!-- ESP32 Chip (for development boards) -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="chip" class="block text-sm font-medium text-gray-700 mb-2">Chip Model</label>
                <select
                  id="chip"
                  v-model="formData.metadata.filters.chip"
                  @change="updateDisplayField('chip')"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select chip...</option>
                  <option value="ESP32">ESP32</option>
                  <option value="ESP32-S2">ESP32-S2</option>
                  <option value="ESP32-S3">ESP32-S3</option>
                  <option value="ESP32-C3">ESP32-C3</option>
                  <option value="ESP32-C6">ESP32-C6</option>
                  <option value="ESP32-H2">ESP32-H2</option>
                </select>
              </div>

              <!-- PSRAM -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="psram_mb" class="block text-sm font-medium text-gray-700 mb-2">PSRAM (MB)</label>
                <input
                  id="psram_mb"
                  v-model.number="formData.metadata.filters.psram_mb"
                  @input="updateDisplayField('psram_mb')"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 8"
                />
              </div>

              <!-- Flash Memory -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="flash_mb" class="block text-sm font-medium text-gray-700 mb-2">Flash Memory (MB)</label>
                <input
                  id="flash_mb"
                  v-model.number="formData.metadata.filters.flash_mb"
                  @input="updateDisplayField('flash_mb')"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 16"
                />
              </div>

              <!-- GPIO Pins -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="gpio_pins" class="block text-sm font-medium text-gray-700 mb-2">GPIO Pins</label>
                <input
                  id="gpio_pins"
                  v-model.number="formData.metadata.filters.gpio_pins"
                  @input="updateDisplayField('gpio_pins')"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g., 45"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Status & Actions -->
          <div class="space-y-6">
            <!-- Status Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>
              
              <div class="mb-4">
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
                <select
                  id="status"
                  v-model="formData.status"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <p class="mt-2 text-xs text-gray-500">
                  Only "Active" products are visible on the storefront
                </p>
              </div>

              <!-- Save Button -->
              <button
                type="submit"
                :disabled="isSaving"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <!-- Product Info Card -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Product Info</h2>
              
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-gray-500">ASIN:</span>
                  <span class="ml-2 font-mono text-gray-900">{{ product.asin }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Marketplace:</span>
                  <span class="ml-2 text-gray-900">{{ product.marketplace.region_name }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Price:</span>
                  <span class="ml-2 font-semibold text-gray-900">
                    {{ product.current_price ? formatPrice(product.current_price, product.currency) : 'N/A' }}
                  </span>
                </div>
                <div v-if="product.star_rating">
                  <span class="text-gray-500">Rating:</span>
                  <span class="ml-2 text-gray-900">⭐ {{ product.star_rating }}/5</span>
                </div>
                <div>
                  <span class="text-gray-500">Created:</span>
                  <span class="ml-2 text-gray-900">{{ formatDate(product.created_at) }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Updated:</span>
                  <span class="ml-2 text-gray-900">{{ formatDate(product.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string

// State
const product = ref<any>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')

// Form data
const formData = ref({
  description: '',
  status: 'draft',
  metadata: {
    display: {} as Record<string, string>,
    filters: {} as Record<string, any>,
  },
})

// Load product
const loadProduct = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response: any = await $fetch(`/api/admin/products/${productId}`)
    product.value = response.product

    // Initialize form data
    formData.value.description = product.value.description || ''
    formData.value.status = product.value.status || 'draft'
    formData.value.metadata = product.value.metadata || { display: {}, filters: {} }
  } catch (err: any) {
    console.error('Failed to load product:', err)
    error.value = err.message || 'Failed to load product'
  } finally {
    isLoading.value = false
  }
}

// Save product
const saveProduct = async () => {
  isSaving.value = true
  successMessage.value = ''
  error.value = ''

  try {
    await $fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      body: {
        description: formData.value.description || null,
        status: formData.value.status,
        metadata: formData.value.metadata,
      },
    })

    successMessage.value = 'Product updated successfully!'
    
    // Reload product data
    await loadProduct()

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: any) {
    console.error('Failed to save product:', err)
    error.value = err.message || 'Failed to save product'
  } finally {
    isSaving.value = false
  }
}

// Update display field when filter changes
const updateDisplayField = (field: string) => {
  const value = formData.value.metadata.filters[field]
  
  if (value === null || value === undefined || value === '') {
    delete formData.value.metadata.display[field]
    return
  }

  switch (field) {
    case 'product_type':
      formData.value.metadata.display[field] = value.replace('_', ' ')
      break
    case 'chip':
      formData.value.metadata.display[field] = value
      // Set chip series
      if (value.startsWith('ESP32-S')) {
        formData.value.metadata.filters.chip_series = 'ESP32-S'
      } else if (value.startsWith('ESP32-C')) {
        formData.value.metadata.filters.chip_series = 'ESP32-C'
      } else if (value.startsWith('ESP32-H')) {
        formData.value.metadata.filters.chip_series = 'ESP32-H'
      } else {
        formData.value.metadata.filters.chip_series = 'ESP32'
      }
      break
    case 'psram_mb':
      formData.value.metadata.display[field] = value ? `${value}MB PSRAM` : ''
      break
    case 'flash_mb':
      formData.value.metadata.display[field] = value ? `${value}MB Flash` : ''
      break
    case 'gpio_pins':
      formData.value.metadata.display[field] = value ? `${value} GPIO pins` : ''
      break
    default:
      formData.value.metadata.display[field] = String(value)
  }
}

// Format price
const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.toFixed(2)}`
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Load product on mount
onMounted(() => {
  loadProduct()
})
</script>

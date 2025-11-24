<script setup lang="ts">
interface ProductImage {
  url: string
  width?: number
  height?: number
  variant?: string
}

interface ProductMetadata {
  display?: Record<string, any>
  filters?: {
    product_type?: string
    [key: string]: any
  }
}

interface Product {
  id: string
  asin: string
  title: string
  description: string | null
  brand: string | null
  images: ProductImage[] | null
  detail_page_url: string
  current_price: number | null
  original_price: number | null
  savings_amount: number | null
  savings_percentage: number | null
  currency: string
  status: string
  metadata: ProductMetadata | null
  created_at: string
}

const props = defineProps<{
  product: Product
}>()

// Get product image
const getProductImage = (images: ProductImage[] | null) => {
  if (!images || images.length === 0) {
    return 'https://via.placeholder.com/300x300?text=No+Image'
  }
  // Handle both string array and object array formats
  if (typeof images[0] === 'string') {
    return images[0]
  }
  // Handle object format with url property
  return images[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'
}

// Format price
const formatPrice = (price: number | null, currency: string) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

// Get product features from metadata
const getProductFeatures = (metadata: ProductMetadata | null) => {
  if (!metadata?.display) return []
  
  const features = []
  
  if (metadata.display.chip) features.push(metadata.display.chip)
  if (metadata.display.connectivity) features.push(metadata.display.connectivity)
  if (metadata.display.features) features.push(metadata.display.features)
  
  return features.filter(Boolean)
}

const productImage = computed(() => getProductImage(props.product.images))
const features = computed(() => getProductFeatures(props.product.metadata))
</script>

<template>
  <NuxtLink
    :to="`/products/${product.id}`"
    class="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-lg"
  >
    <!-- Product Image -->
    <div class="aspect-video overflow-hidden bg-gray-100">
      <img
        :src="productImage"
        :alt="product.title"
        class="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <!-- Product Info -->
    <div class="flex flex-1 flex-col p-3">
      <!-- Brand -->
      <p v-if="product.brand" class="text-xs font-medium text-gray-500 uppercase">
        {{ product.brand }}
      </p>

      <!-- Title -->
      <h3 class="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
        {{ product.title }}
      </h3>

      <!-- Features/Tags -->
      <div v-if="features.length > 0" class="mt-1.5 flex flex-wrap gap-1">
        <span
          v-for="(feature, idx) in features.slice(0, 2)"
          :key="idx"
          class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
        >
          {{ feature }}
        </span>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Pricing -->
      <div class="mt-2">
        <div class="flex items-baseline gap-2">
          <span class="text-base font-bold text-gray-900">
            {{ formatPrice(product.current_price, product.currency) }}
          </span>
          <span v-if="product.original_price && product.original_price > product.current_price" class="text-xs text-gray-500 line-through">
            {{ formatPrice(product.original_price, product.currency) }}
          </span>
        </div>

        <!-- Savings Badge -->
        <span v-if="product.savings_percentage" class="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Save {{ Math.round(product.savings_percentage) }}%
        </span>
      </div>

      <!-- View Details Button -->
      <div class="mt-2">
        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
          <span class="font-medium">View Details</span>
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
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
  metadata: ProductMetadata | null
  raw_paapi_response?: any
  created_at: string
}

const props = defineProps<{
  product: Product
}>()

// Get product image - prioritize medium, then large, then small
const getProductImage = (images: ProductImages | null) => {
  if (!images) {
    return 'https://via.placeholder.com/300x300?text=No+Image'
  }
  
  // Try to get large image first (best for card display)
  if (images.primary?.large?.url) {
    return images.primary.large.url
  }

  // Fall back to large
  if (images.primary?.medium?.url) {
    return images.primary.medium.url
  }
  
  // Fall back to small
  if (images.primary?.small?.url) {
    return images.primary.small.url
  }
  
  return 'https://via.placeholder.com/300x300?text=No+Image'
}

// Format price
const formatPrice = (price: number | null, currency: string) => {
  if (!price) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

// Get product features - prioritize the new features array
const getProductFeatures = (product: Product) => {
  // Use new features array if available
  if (product.features && product.features.length > 0) {
    return product.features
  }
  
  // Fall back to metadata features
  if (!product.metadata?.display) return []
  
  const features = []
  
  if (product.metadata.display.chip) features.push(product.metadata.display.chip)
  if (product.metadata.display.connectivity) features.push(product.metadata.display.connectivity)
  if (product.metadata.display.features) features.push(product.metadata.display.features)
  
  return features.filter(Boolean)
}

// Check if product is Prime eligible
const isPrimeEligible = computed(() => {
  if (!props.product.raw_paapi_response) return false
  
  try {
    const itemsResult = props.product.raw_paapi_response.ItemsResult
    const item = itemsResult?.Items?.[0]
    const listing = item?.Offers?.Listings?.[0]
    return listing?.DeliveryInfo?.IsPrimeEligible === true
  } catch (error) {
    return false
  }
})

const productImage = computed(() => getProductImage(props.product.images))
const features = computed(() => getProductFeatures(props.product))
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-lg dark:hover:shadow-gray-900/50"
  >
    <!-- Product Image -->
    <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img
        :src="productImage"
        :alt="product.title"
        class="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        loading="lazy"
      />
      
      <!-- Prime Badge -->
      <div v-if="isPrimeEligible" class="absolute top-2 right-2 flex items-center gap-1 bg-linear-to-r from-blue-500 to-cyan-400 px-2 py-1 rounded-md shadow-lg">
        <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.613 17.12c-2.088 1.535-5.12 2.355-7.728 2.355-3.656 0-6.944-1.352-9.432-3.6-.195-.18-.02-.425.214-.285 2.656 1.545 5.952 2.475 9.352 2.475 2.292 0 4.812-.475 7.132-1.46.35-.148.644.23.312.515zm.87-.987c-.266-.342-1.767-.162-2.44-.082-.205.025-.237-.153-.052-.282 1.195-.84 3.156-.597 3.383-.316.228.285-.06 2.26-1.19 3.206-.173.145-.338.068-.262-.124.252-.63.817-2.043.552-2.386z"/>
        </svg>
        <span class="text-[10px] font-bold text-white tracking-tight">prime</span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex flex-1 flex-col p-3">
      <!-- Brand -->
      <p v-if="product.brand" class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
        {{ product.brand }}
      </p>

      <!-- Title -->
      <h3 class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {{ product.title }}
      </h3>

      <!-- Features/Tags -->
      <div v-if="features.length > 0" class="mt-1.5 flex flex-wrap gap-1">
        <span
          v-for="(feature, idx) in features.slice(0, 2)"
          :key="idx"
          class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
        >
          {{ feature }}
        </span>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Pricing -->
      <div class="mt-2">
        <div class="flex items-baseline gap-2">
          <span class="text-base font-bold text-gray-900 dark:text-white">
            {{ formatPrice(product.current_price, product.currency) }}
          </span>
          <span v-if="product.original_price && product.original_price > product.current_price" class="text-xs text-gray-500 dark:text-gray-400 line-through">
            {{ formatPrice(product.original_price, product.currency) }}
          </span>
        </div>

        <!-- Savings Badge -->
        <span v-if="product.savings_percentage" class="mt-1 inline-flex items-center rounded-full bg-green-50 dark:bg-green-950 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
          Save {{ Math.round(product.savings_percentage) }}%
        </span>
      </div>

      <!-- View Details Button -->
      <div class="mt-2">
        <div class="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          <span class="font-medium">View Details</span>
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

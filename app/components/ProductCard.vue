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
  variants?: Array<{
    id: string
    asin: string
    title: string
    current_price: number | null
    original_price: number | null
    savings_amount: number | null
    savings_percentage: number | null
    currency: string
    images: ProductImages | null
  }>
  variant_count?: number
  group?: {
    id: string
    slug: string
    title: string
    description?: string | null
  } | null
}

const props = withDefaults(defineProps<{
  product: Product
  hideBrand?: boolean
}>(), {
  hideBrand: false
})

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

// Get best discount from parent and variants
const bestDiscount = computed(() => {
  const discounts = []
  
  // Add parent product discount
  if (props.product.savings_percentage && props.product.savings_percentage > 0) {
    discounts.push(props.product.savings_percentage)
  }
  
  // Add variant discounts
  if (props.product.variants && props.product.variants.length > 0) {
    props.product.variants.forEach(variant => {
      if (variant.savings_percentage && variant.savings_percentage > 0) {
        discounts.push(variant.savings_percentage)
      }
    })
  }
  
  // Return the highest discount
  return discounts.length > 0 ? Math.max(...discounts) : null
})

// Get price range for variants
const priceRange = computed(() => {
  if (!props.product.variants || props.product.variants.length === 0) {
    return null
  }

  const prices = props.product.variants
    .map(v => v.current_price)
    .filter((p): p is number => p !== null)

  if (prices.length === 0) return null

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return { minPrice, maxPrice }
})

// Display price - show range if variants exist
const displayPrice = computed(() => {
  const mainPrice = props.product.current_price
  const range = priceRange.value

  if (range && range.minPrice !== range.maxPrice) {
    // Show price range
    return {
      text: `${formatPrice(range.minPrice, props.product.currency)} - ${formatPrice(range.maxPrice, props.product.currency)}`,
      isRange: true,
    }
  } else if (mainPrice) {
    // Show single price
    return {
      text: formatPrice(mainPrice, props.product.currency),
      isRange: false,
    }
  } else {
    return {
      text: 'N/A',
      isRange: false,
    }
  }
})

// Card link - go to group page if product has a group, otherwise go to product detail
const cardLink = computed(() => {
  // Debug: log what we're getting
  if (props.product.variant_count && props.product.variant_count > 0) {
    console.log('Product with options:', {
      title: props.product.title,
      slug: props.product.slug,
      hasGroup: !!props.product.group,
      groupSlug: props.product.group?.slug,
      variantCount: props.product.variant_count
    })
  }
  
  // Priority 1: If product belongs to a group, ALWAYS link to the group comparison page
  if (props.product.group?.slug) {
    return `/groups/${props.product.group.slug}`
  }
  
  // Priority 2: If product has a group_id but we don't have the slug yet, still try to use group
  // This shouldn't happen but is a safety check
  if (props.product.group && !props.product.group.slug) {
    console.warn('Product has group but no slug:', props.product.id, props.product.group)
  }
  
  // Priority 3: Legacy support - if variant_count exists but no group (old data)
  if (props.product.variant_count && props.product.variant_count > 0) {
    return `/products/${props.product.slug}/variants`
  }
  
  // Priority 4: Default to individual product detail page
  return `/products/${props.product.slug}`
})
</script>

<template>
  <NuxtLink
    :to="cardLink"
    class="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800"
  >
    <!-- Product Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
      <img
        :src="productImage"
        :alt="product.title"
        class="h-full w-full object-contain object-center p-4 transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      <!-- Prime Badge -->
      <div v-if="isPrimeEligible" class="absolute top-3 right-3 flex items-center gap-1 bg-linear-to-r from-blue-500 to-cyan-400 px-2.5 py-1.5 rounded-lg shadow-lg">
        <span class="text-xs font-bold text-white tracking-tight">prime</span>
      </div>

      <!-- Savings Badge - Shows best discount from parent or variants -->
      <div v-if="bestDiscount" class="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1.5 rounded-lg shadow-lg">
        <span class="text-xs font-bold">-{{ Math.round(bestDiscount) }}%</span>
      </div>

      <!-- Overlay Gradient on Hover -->
      <div class="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <!-- Product Info -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Brand -->
      <p v-if="!hideBrand && product.brand" class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
        {{ product.brand }}
      </p>
      <!-- Group Badge -->
      <div v-else-if="hideBrand && product.brand">
        <span class="text-xs font-bold text-purple-700 dark:text-purple-500 uppercase">Various Manufacturers</span>
      </div>

      <!-- Title -->
      <h3 class="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {{ product.group?.title || product.title }}
      </h3>

      <!-- Features/Tags -->
      <div v-if="features.length > 0" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="(feature, idx) in features.slice(0, 2)"
          :key="idx"
          class="inline-flex items-center rounded-md bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
        >
          {{ feature }}
        </span>
        <span v-if="features.length > 2" class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">
          +{{ features.length - 2 }}
        </span>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Pricing -->
      <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <!-- Variant Count Badge -->
        <div v-if="product.variant_count && product.variant_count > 0" class="mb-2 inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {{ product.variant_count }} option{{ product.variant_count === 1 ? '' : 's' }}
        </div>

        <div class="flex items-baseline gap-2">
          <span class="text-xl font-bold text-gray-900 dark:text-white" :class="{ 'text-base': displayPrice.isRange }">
            {{ displayPrice.text }}
          </span>
          <span v-if="!displayPrice.isRange && product.original_price && product.original_price > product.current_price" class="text-sm text-gray-500 dark:text-gray-400 line-through">
            {{ formatPrice(product.original_price, product.currency) }}
          </span>
        </div>

        <!-- Savings Info - Shows best discount available -->
        <div v-if="bestDiscount" class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-300">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Save up to {{ Math.round(bestDiscount) }}%
        </div>
      </div>

      <!-- View Details/Compare Button -->
      <div class="mt-2.5">
        <div 
          v-if="product.group || (product.variant_count && product.variant_count > 0)"
          class="flex items-center justify-between rounded-lg bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-300 transition-all group-hover:from-purple-50 group-hover:to-purple-100 dark:group-hover:from-purple-800 dark:group-hover:to-purple-900 border border-purple-100 dark:border-purple-900"
        >
          <span>Compare {{ (product.variant_count || 0) }} option{{ ((product.variant_count || 0) + 1) === 1 ? '' : 's' }}</span>
          <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div 
          v-else
          class="flex items-center justify-between rounded-lg bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 transition-all group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-800 dark:group-hover:to-blue-900 border border-blue-100 dark:border-blue-900"
        >
          <span>View Details</span>
          <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

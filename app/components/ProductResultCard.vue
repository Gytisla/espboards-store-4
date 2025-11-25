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

interface Product {
  asin: string
  title: string
  images?: ProductImages
  currentPrice?: number
  starRating?: number
  customerReviewCount?: number
  detailPageUrl?: string
}

interface Props {
  product: Product
  marketplace: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  import: [product: Product]
}>()

const handleImport = () => {
  emit('import', props.product)
}

const openAmazonPage = () => {
  if (props.product.detailPageUrl) {
    window.open(props.product.detailPageUrl, '_blank')
  }
}

// Get product image - prioritize medium for search results
const getProductImageUrl = (images?: ProductImages) => {
  if (!images) return null
  
  return images.primary?.medium?.url || 
         images.primary?.large?.url || 
         images.primary?.small?.url || 
         null
}

const imageUrl = computed(() => getProductImageUrl(props.product.images))
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
    <!-- Product Image -->
    <div class="aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100 cursor-pointer" @click="openAmazonPage">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="product.title"
        class="h-full w-full object-cover transition-transform hover:scale-105"
      />
      <div v-else class="flex h-full items-center justify-center text-gray-400">
        <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600" @click="openAmazonPage">
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
          {{ marketplace === 'US' ? '🇺🇸' : '🇩🇪' }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 space-y-2">
      <button
        @click="handleImport"
        class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus:ring-4 focus:ring-green-100"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Import to Store
      </button>

      <button
        v-if="product.detailPageUrl"
        @click="openAmazonPage"
        class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-4 focus:ring-gray-100"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        View on Amazon
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
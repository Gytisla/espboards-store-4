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
  id: string
  asin: string
  slug: string
  title: string
  description: string | null
  brand: string | null
  images: ProductImages | null
  detail_page_url: string
  current_price: number | null
  original_price: number | null
  savings_amount: number | null
  savings_percentage: number | null
  currency: string
  status: string
  metadata: any
  created_at: string
  group_id: string | null
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
}

const { selectedMarketplace } = useMarketplace()

// Fetch all deal products (including variants) directly from deals API
const { data: productsData, pending: loadingProducts } = await useFetch<{ products: Product[] }>('/api/deals', {
  query: {
    marketplace: selectedMarketplace,
  },
})

// Deal products are already filtered and sorted by the API
const dealProducts = computed(() => {
  return productsData.value?.products || []
})

// Stats
const totalDeals = computed(() => dealProducts.value.length)
const averageSavings = computed(() => {
  if (dealProducts.value.length === 0) return 0
  const total = dealProducts.value.reduce((sum, p) => sum + (p.savings_percentage || 0), 0)
  return Math.round(total / dealProducts.value.length)
})
const maxSavings = computed(() => {
  if (dealProducts.value.length === 0) return 0
  return Math.round(Math.max(...dealProducts.value.map(p => p.savings_percentage || 0)))
})

useSeoMeta({
  title: 'Hot Deals - ESP32 Boards & Components on Sale',
  description: `Save big on ESP32 development boards, sensors, and components. Browse ${totalDeals.value}+ products with discounts up to ${maxSavings.value}% off.`,
  ogTitle: 'Hot Deals - ESP32 Boards & Components on Sale',
  ogDescription: `Save big on ESP32 development boards, sensors, and components. Browse ${totalDeals.value}+ products with discounts up to ${maxSavings.value}% off.`,
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950 py-16 md:py-20">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-200/30 dark:bg-red-500/10 blur-3xl"></div>
        <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-200/30 dark:bg-orange-500/10 blur-3xl"></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <!-- Hot Deals Badge -->
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-500/30">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Hot Deals
          </div>

          <!-- Heading -->
          <h1 class="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Save Big on
            <span class="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              ESP32 Components
            </span>
          </h1>

          <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            Browse our best deals on development boards, sensors, displays, and more. 
            Limited time offers with up to {{ maxSavings }}% off!
          </p>

          <!-- Stats -->
          <div v-if="!loadingProducts" class="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-6 md:gap-8">
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4">
              <div class="text-3xl font-bold text-red-500">{{ totalDeals }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Active Deals</div>
            </div>
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4">
              <div class="text-3xl font-bold text-orange-500">{{ maxSavings }}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Max Discount</div>
            </div>
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4">
              <div class="text-3xl font-bold text-yellow-500">{{ averageSavings }}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Avg. Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Marketplace Selector Section -->
    <section class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center">
          <div class="inline-flex flex-col items-center gap-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Select your Amazon marketplace</span>
            <MarketplaceSelector />
          </div>
        </div>
      </div>
    </section>

    <!-- Deals Grid Section -->
    <section class="py-12 md:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loadingProducts" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="i in 12" :key="i" class="animate-pulse">
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div class="mb-4 aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <!-- Deals Grid -->
        <div v-else-if="dealProducts.length > 0">
          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              All Deals ({{ totalDeals }})
            </h2>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Sorted by highest discount
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ProductCard
              v-for="product in dealProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>

        <!-- No Deals State -->
        <div v-else class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <svg class="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No deals available right now</h3>
          <p class="mb-6 text-gray-600 dark:text-gray-400">Check back soon for new discounts and special offers!</p>
          <NuxtLink
            to="/products"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all"
          >
            Browse All Products
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="dealProducts.length > 0" class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-20 md:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-500 to-orange-500 dark:from-red-800 dark:to-orange-900 p-12 text-center shadow-2xl shadow-red-500/30 dark:shadow-red-500/10">
          <!-- Background decoration -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
            <div class="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
          </div>

          <div class="relative">
            <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">
              Don't Miss Out!
            </h2>
            <p class="mx-auto mb-8 max-w-2xl text-lg text-red-100">
              These deals won't last forever. Stock up on components for your next IoT project today!
            </p>
            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#deals"
                @click.prevent="window.scrollTo({ top: 0, behavior: 'smooth' })"
                class="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-8 py-4 text-base font-semibold text-red-600 transition-all hover:bg-red-50"
              >
                Back to Top
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </a>
              <NuxtLink
                to="/products"
                class="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                Browse All Products
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

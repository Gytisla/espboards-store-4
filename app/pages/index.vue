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

// Fetch featured products (latest 8 active products)
const { data: featuredProductsData, pending: loadingProducts } = await useFetch<{ products: Product[] }>('/api/products', {
  query: {
    marketplace: selectedMarketplace,
  },
})

const featuredProducts = computed(() => {
  return featuredProductsData.value?.products?.slice(0, 8) || []
})

// Fetch deal products from dedicated deals API (includes all products with discounts)
const { data: dealsData, pending: loadingDeals } = await useFetch<{ products: Product[] }>('/api/deals', {
  query: {
    marketplace: selectedMarketplace,
  },
})

const dealProducts = computed(() => {
  return dealsData.value?.products?.slice(0, 6) || []
})

const features = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Latest ESP32 Boards',
    description: 'Wide selection of ESP32-S3, ESP32-C3, and other cutting-edge development boards',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Quality Guaranteed',
    description: 'All products tested and verified for reliability and performance',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Best Prices',
    description: 'Competitive pricing on all components with regular deals and discounts',
  },
  {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Expert Support',
    description: 'Comprehensive documentation and responsive customer support team',
  },
]

const productCategories = [
  {
    name: 'Development Boards',
    description: 'ESP32 boards with WiFi, Bluetooth, and more',
    image: '🔌',
    count: '50+ products',
    href: '/products?type=development_board',
    gradient: 'from-blue-500 to-cyan-500',
  },
  // Temporarily disabled categories
  // {
  //   name: 'Sensors',
  //   description: 'Temperature, humidity, motion, and more',
  //   image: '📡',
  //   count: '30+ products',
  //   href: '/products?type=sensor',
  //   gradient: 'from-purple-500 to-pink-500',
  // },
  // {
  //   name: 'Displays',
  //   description: 'OLED, LCD, and e-paper displays',
  //   image: '📺',
  //   count: '25+ products',
  //   href: '/products?type=display',
  //   gradient: 'from-green-500 to-emerald-500',
  // },
  // {
  //   name: 'Power Modules',
  //   description: 'Battery chargers and voltage regulators',
  //   image: '🔋',
  //   count: '15+ products',
  //   href: '/products?type=power',
  //   gradient: 'from-orange-500 to-red-500',
  // },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 py-16 md:py-24">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 dark:bg-blue-500/10 blur-3xl"></div>
        <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 dark:bg-purple-500/10 blur-3xl"></div>
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <!-- Heading -->
          <h1 class="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl">
            Discover Best
            <span class="bg-linear-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              ESP32 Boards
            </span>
            & Components
          </h1>

          <p class="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl">
            From powerful development boards to sensors and displays — find everything you need to build your next IoT project.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NuxtLink
              to="/products"
              class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Browse Products
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/categories"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
            >
              Explore Categories
            </NuxtLink>
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

    <!-- Deals Section -->
    <section v-if="dealProducts.length > 0 || loadingDeals" class="border-t border-gray-200 dark:border-gray-800 bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950 py-16 md:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Hot Deals
          </div>
          <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Best Deals Right Now
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Save big on top ESP32 components with our current best discounts
          </p>
        </div>

        <div v-if="loadingDeals" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div class="mb-4 aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            v-for="product in dealProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <div class="mt-12 text-center">
          <NuxtLink
            to="/deals"
            class="inline-flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-8 py-4 text-base font-semibold text-white transition-all shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 hover:-translate-y-0.5"
          >
            View All Deals
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 py-20 md:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Featured Products
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Check out our latest and most popular ESP32 components
          </p>
        </div>

        <div v-if="loadingProducts" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 8" :key="i" class="animate-pulse">
            <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div class="mb-4 aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-8 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <div v-else-if="featuredProducts.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <div v-else class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
          <svg class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No products available</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Check back soon for new products!</p>
        </div>

        <div class="mt-12 text-center">
          <NuxtLink
            to="/products"
            class="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
          >
            View All Products
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Product Categories -->
    <!-- <section class="py-20 md:py-24 bg-white dark:bg-gray-900">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Shop by Category
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Find exactly what you need for your next project
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="category in productCategories"
            :key="category.name"
            :to="category.href"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 transition-all hover:border-transparent hover:shadow-2xl hover:-translate-y-1"
          >
            <div 
              class="absolute inset-0 bg-linear-to-br opacity-0 transition-opacity group-hover:opacity-5 dark:group-hover:opacity-10"
              :class="category.gradient"
            ></div>
            
            <div class="relative">
              <div class="mb-4 text-5xl">{{ category.image }}</div>
              
              <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                {{ category.name }}
              </h3>
              <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {{ category.description }}
              </p>
              
              <div class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {{ category.count }}
                <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section> -->

    <!-- Features Section -->
    <section class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-20 md:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Why Choose ESPBoards Store?
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            We're committed to providing the best experience for makers and developers
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 transition-shadow hover:shadow-lg dark:hover:shadow-gray-900/50"
          >
            <!-- Icon -->
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon" />
              </svg>
            </div>
            
            <!-- Content -->
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 md:py-24 bg-gray-50 dark:bg-gray-950">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 p-12 text-center shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/10">
          <!-- Background decoration -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
            <div class="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
          </div>

          <div class="relative">
            <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Start Building?
            </h2>
            <p class="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              Join thousands of makers and developers who trust ESPBoards Store for their IoT projects
            </p>
            <NuxtLink
              to="/products"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-8 py-4 text-base font-semibold text-blue-600 transition-all hover:bg-blue-50"
            >
              Shop Now
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

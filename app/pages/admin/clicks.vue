<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Add client-only guard
const { user, loading, initialize } = useAuth()
const isReady = ref(false)

onMounted(async () => {
  await initialize()
  isReady.value = true
  await fetchClickData()
})

// State
const selectedPeriod = ref('7d')
const selectedGroupBy = ref('day')
const clickData = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Period options
const periodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
]

// Group by options
const groupByOptions = [
  { value: 'day', label: 'By Day' },
  { value: 'week', label: 'By Week' },
  { value: 'product', label: 'By Product' },
  { value: 'marketplace', label: 'By Marketplace' },
]

// Fetch click data
const fetchClickData = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const data = await $fetch('/api/analytics/clicks', {
      query: {
        period: selectedPeriod.value,
        groupBy: selectedGroupBy.value,
        limit: 100,
      },
    })
    
    clickData.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch click data'
    console.error('Failed to fetch analytics:', err)
  } finally {
    isLoading.value = false
  }
}

// Watch for filter changes
watch([selectedPeriod, selectedGroupBy], () => {
  fetchClickData()
})

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

// Format date based on groupBy
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  
  const date = new Date(dateStr)
  
  if (selectedGroupBy.value === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } else if (selectedGroupBy.value === 'week') {
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  
  return date.toLocaleDateString('en-US')
}

// Calculate CTR if needed (placeholder - would need impressions data)
const calculateCTR = (clicks: number, impressions: number = 1000) => {
  if (!impressions) return '0%'
  return `${((clicks / impressions) * 100).toFixed(2)}%`
}
</script>

<template>
  <ClientOnly>
    <div v-if="!isReady || loading" class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="rounded-2xl bg-linear-to-r from-orange-500 to-red-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 dark:shadow-orange-500/10">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold">Amazon Click Tracking</h2>
            <p class="text-sm sm:text-base text-orange-100 dark:text-orange-200">Monitor affiliate link performance and user engagement</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Period Filter -->
          <div class="flex-1">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</label>
            <select
              v-model="selectedPeriod"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option v-for="option in periodOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Group By Filter -->
          <div class="flex-1">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Group By</label>
            <select
              v-model="selectedGroupBy"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option v-for="option in groupByOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-red-900 dark:text-red-200">{{ error }}</p>
      </div>

      <!-- Summary Stats -->
      <div v-else-if="clickData" class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</h3>
            <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(clickData.summary.totalClicks) }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Sessions</h3>
            <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(clickData.summary.uniqueSessions) }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
          <div class="flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Products Clicked</h3>
            <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(clickData.summary.uniqueProducts) }}</p>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="clickData && clickData.data.length > 0" class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Click Analytics
            <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ clickData.data.length }} records)
            </span>
          </h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <!-- Dynamic headers based on groupBy -->
                <th v-if="selectedGroupBy === 'day' || selectedGroupBy === 'week'" class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th v-if="selectedGroupBy === 'marketplace'" class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Marketplace
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Clicks
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sessions
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg per Session
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(row, index) in clickData.data" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <!-- Date column -->
                <td v-if="selectedGroupBy === 'day' || selectedGroupBy === 'week'" class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(row.date || row.clicked_at) }}
                </td>
                
                <!-- Product column - always show -->
                <td class="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div class="flex items-start gap-3">
                    <!-- Product image if available -->
                    <img 
                      v-if="row.product_image" 
                      :src="row.product_image" 
                      :alt="row.product_title || row.product_slug"
                      class="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="max-w-sm truncate font-medium" :title="row.product_title || row.product_slug">
                        {{ row.product_title || row.product_slug || 'Unknown Product' }}
                      </div>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          ASIN: {{ row.product_asin || 'N/A' }}
                        </span>
                        <span v-if="row.product_slug" class="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <NuxtLink 
                          v-if="row.product_slug"
                          :to="`/products/${row.product_slug}`"
                          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                        >
                          View Product →
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Marketplace column -->
                <td v-if="selectedGroupBy === 'marketplace'" class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {{ row.marketplace_code || 'N/A' }}
                  </span>
                </td>
                
                <!-- Clicks -->
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatNumber(row.clicks) }}
                </td>
                
                <!-- Sessions -->
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ formatNumber(row.sessions) }}
                </td>
                
                <!-- Average -->
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ (row.clicks / row.sessions).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="clickData && clickData.data.length === 0" class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No click data yet</h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start tracking when users click on Amazon product links.
        </p>
      </div>

      <!-- Info Box -->
      <div class="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6">
        <div class="flex gap-3">
          <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-900 dark:text-blue-200">
            <p class="font-medium mb-1">About Click Tracking</p>
            <p>This dashboard shows analytics for Amazon affiliate link clicks. Data includes click counts, unique sessions, and performance metrics grouped by time, product, or marketplace.</p>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

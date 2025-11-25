<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

// Set page meta based on error
useHead({
  title: props.error?.statusCode === 404 
    ? '404 - Page Not Found | ESPBoards Store' 
    : 'Error | ESPBoards Store',
  meta: [
    { 
      name: 'description', 
      content: props.error?.statusCode === 404 
        ? 'The page you are looking for could not be found.' 
        : 'An error occurred while processing your request.'
    }
  ]
})

const suggestedPages = [
  {
    title: 'Browse Products',
    description: 'Explore our full catalog of ESP32 boards and components',
    href: '/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  },
  {
    title: 'View Categories',
    description: 'Shop by product type and find what you need',
    href: '/categories',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    title: 'About Us',
    description: 'Learn more about ESPBoards Store',
    href: '/about',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Home',
    description: 'Return to the homepage',
    href: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  }
]

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div class="max-w-4xl w-full text-center">
        <!-- Error Illustration -->
        <div class="mb-8">
          <div class="inline-flex flex-col items-center justify-center gap-4">
            <!-- Error Code on Top -->
            <h1 class="text-9xl font-extrabold text-gray-900 dark:text-white">
              {{ error?.statusCode || 500 }}
            </h1>
          </div>
        </div>

        <!-- Error Message -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ error?.statusCode === 404 ? 'Oops! Page Not Found' : 'Something Went Wrong' }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ error?.statusCode === 404 
              ? "The page you're looking for seems to have disconnected. Maybe it's time to reconnect with our ESP32 products instead?" 
              : error?.message || 'An unexpected error occurred. Please try again later.' 
            }}
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="mb-12 flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </NuxtLink>
          <button
            @click="handleError"
            class="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-4 text-base font-semibold text-gray-900 dark:text-white transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>

        <!-- Suggested Pages (only for 404) -->
        <div v-if="error?.statusCode === 404">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Or explore these pages:
          </h3>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              v-for="page in suggestedPages"
              :key="page.href"
              :to="page.href"
              class="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
            >
              <!-- Icon -->
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
                <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="page.icon" />
                </svg>
              </div>
              <!-- Content -->
              <h4 class="mb-1 text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ page.title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ page.description }}
              </p>
            </NuxtLink>
          </div>
        </div>

        <!-- Help Text -->
        <div class="mt-12 text-sm text-gray-500 dark:text-gray-500">
          <p>
            Still can't find what you're looking for? 
            <a href="https://www.espboards.dev/about/#contact-us" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const cookieConsent = ref<string | null>(null)
const showBanner = ref(false)

onMounted(() => {
  // Check if user has already given consent
  const consent = localStorage.getItem('cookie-consent')
  cookieConsent.value = consent
  
  // Show banner if no consent has been given
  if (!consent) {
    // Small delay to avoid showing immediately on page load
    setTimeout(() => {
      showBanner.value = true
    }, 1000)
  }
  
  // Listen for custom event to reopen the banner
  window.addEventListener('open-cookie-consent', openBanner)
})

onUnmounted(() => {
  window.removeEventListener('open-cookie-consent', openBanner)
})

const openBanner = () => {
  showBanner.value = true
}

const acceptAll = () => {
  localStorage.setItem('cookie-consent', 'all')
  cookieConsent.value = 'all'
  showBanner.value = false
  
  // Here you can initialize analytics/tracking scripts
  initializeTracking()
}

const acceptNecessary = () => {
  localStorage.setItem('cookie-consent', 'necessary')
  cookieConsent.value = 'necessary'
  showBanner.value = false
}

const initializeTracking = () => {
  // Initialize your tracking scripts here (Google Analytics, etc.)
  console.log('Tracking initialized')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showBanner"
        class="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      >
        <div class="mx-auto max-w-7xl">
          <div class="rounded-lg bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🍪 We use cookies
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies. 
                  <a href="/cookies" class="text-blue-600 dark:text-blue-400 hover:underline">Learn more</a>
                </p>
              </div>
              
              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                <button
                  @click="acceptNecessary"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                >
                  Necessary Only
                </button>
                <button
                  @click="acceptAll"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors whitespace-nowrap shadow-lg"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

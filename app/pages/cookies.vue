<script setup lang="ts">
useHead({
  title: 'Cookie Policy - ESPBoards Store',
  meta: [
    { name: 'description', content: 'Learn about how we use cookies on ESPBoards Store to improve your browsing experience.' },
  ],
})

const lastUpdated = 'November 25, 2025'

const openCookieSettings = () => {
  // Clear the consent to allow re-selection
  localStorage.removeItem('cookie-consent')
  // Dispatch custom event to reopen the banner
  window.dispatchEvent(new Event('open-cookie-consent'))
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Cookie Policy
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {{ lastUpdated }}
        </p>
      </div>

      <!-- Content -->
      <div class="space-y-8 text-gray-700 dark:text-gray-300">
        <!-- Introduction -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What Are Cookies?
          </h2>
          <p class="mb-4">
            Cookies are small text files that are placed on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and 
            understanding how you use our site.
          </p>
          <p>
            We use both session cookies (which expire when you close your browser) and persistent cookies 
            (which remain on your device until deleted or expired).
          </p>
        </section>

        <!-- Types of Cookies -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Types of Cookies We Use
          </h2>

          <!-- Necessary Cookies -->
          <div class="mb-6">
            <div class="flex items-start gap-3 mb-3">
              <div class="shrink-0 mt-1">
                <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  1. Strictly Necessary Cookies
                </h3>
                <p class="mb-3">
                  These cookies are essential for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility.
                </p>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">Examples:</p>
                  <ul class="text-sm space-y-1 list-disc list-inside">
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">cookie-consent</code> - Stores your cookie preferences</li>
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">theme</code> - Remembers your dark/light mode preference</li>
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">marketplace</code> - Stores your selected Amazon marketplace</li>
                  </ul>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    <strong>Purpose:</strong> Essential site functionality<br>
                    <strong>Duration:</strong> Persistent (1 year)<br>
                    <strong>Can be disabled:</strong> No - required for the site to work
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics Cookies -->
          <div class="mb-6">
            <div class="flex items-start gap-3 mb-3">
              <div class="shrink-0 mt-1">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2. Analytics & Performance Cookies
                </h3>
                <p class="mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. We use Google Analytics to analyze site traffic and improve our services.
                </p>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">Google Analytics Cookies:</p>
                  <ul class="text-sm space-y-1 list-disc list-inside">
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">_ga</code> - Distinguishes unique users</li>
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">_ga_*</code> - Used to persist session state</li>
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">_gid</code> - Distinguishes users</li>
                    <li><code class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">_gat</code> - Used to throttle request rate</li>
                  </ul>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    <strong>Purpose:</strong> Website analytics and performance measurement<br>
                    <strong>Duration:</strong> 2 years (_ga), 24 hours (_gid), 1 minute (_gat)<br>
                    <strong>Can be disabled:</strong> Yes - you can opt out via cookie settings<br>
                    <strong>Third-party:</strong> Google LLC
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Functional Cookies -->
          <div>
            <div class="flex items-start gap-3 mb-3">
              <div class="shrink-0 mt-1">
                <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  3. Functional Cookies
                </h3>
                <p class="mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your 
                  preferences and settings.
                </p>
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">Examples:</p>
                  <ul class="text-sm space-y-1 list-disc list-inside">
                    <li>Display preferences (grid/list view)</li>
                    <li>Filter and sorting preferences</li>
                    <li>Language and region settings</li>
                  </ul>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    <strong>Purpose:</strong> Enhanced user experience and personalization<br>
                    <strong>Duration:</strong> Persistent (30 days - 1 year)<br>
                    <strong>Can be disabled:</strong> Yes - site will still work but without personalization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Amazon Affiliate -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Amazon Affiliate Cookies
          </h2>
          <p class="mb-4">
            As an Amazon Associate, when you click on product links to Amazon, cookies may be set by Amazon 
            to track your visit and any qualifying purchases. These cookies are controlled by Amazon and are 
            subject to Amazon's Privacy Policy.
          </p>
          <p class="text-sm">
            We earn from qualifying purchases made through our affiliate links. This helps us maintain and 
            improve our service at no additional cost to you.
          </p>
        </section>

        <!-- Managing Cookies -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How to Manage Cookies
          </h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cookie Settings
              </h3>
              <p class="mb-3">
                You can manage your cookie preferences using our cookie consent banner. Click the button below 
                to update your preferences at any time:
              </p>
              <button
                @click="openCookieSettings"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Cookie Preferences
              </button>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Browser Settings
              </h3>
              <p class="mb-3">
                Most web browsers allow you to control cookies through their settings preferences. However, 
                limiting cookies may impact your experience on our website.
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Learn how to manage cookies in popular browsers:
              </p>
              <ul class="mt-2 space-y-1 text-sm">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                    Google Chrome →
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                    Mozilla Firefox →
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                    Safari →
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                    Microsoft Edge →
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Google Analytics Opt-Out
              </h3>
              <p class="mb-2">
                You can opt out of Google Analytics tracking by installing the 
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </div>
          </div>
        </section>

        <!-- Contact -->
        <section class="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Questions About Our Cookie Policy?
          </h2>
          <p class="mb-4">
            If you have any questions about how we use cookies or this Cookie Policy, please contact us.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            This Cookie Policy may be updated from time to time to reflect changes in our practices or for 
            other operational, legal, or regulatory reasons. Please check this page periodically for updates.
          </p>
        </section>
      </div>

      <!-- Back to Home -->
      <div class="mt-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy Policy - ESPBoards Store',
  meta: [
    { name: 'description', content: 'Learn how ESPBoards Store collects, uses, and protects your personal information.' },
  ],
})

const lastUpdated = 'November 25, 2025'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
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
            Introduction
          </h2>
          <p class="mb-4">
            Welcome to ESPBoards Store. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our 
            website and tell you about your privacy rights and how the law protects you.
          </p>
          <p>
            ESPBoards Store is a product discovery platform that helps users find ESP32 and related development boards 
            available on Amazon. We act as an Amazon Associate and may earn from qualifying purchases.
          </p>
        </section>

        <!-- Information We Collect -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Information We Collect
          </h2>

          <div class="space-y-4">
            <!-- Automatically Collected -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Automatically Collected Information
              </h3>
              <p class="mb-3">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                <li><strong>Referral Data:</strong> Website that referred you to our site</li>
              </ul>
            </div>

            <!-- User Preferences -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg class="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                User Preferences
              </h3>
              <p class="mb-3">
                We store certain preferences locally on your device to enhance your experience:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li><strong>Theme Preference:</strong> Dark/light mode selection</li>
                <li><strong>Marketplace Selection:</strong> Your preferred Amazon marketplace region</li>
                <li><strong>Cookie Consent:</strong> Your cookie preference choices</li>
                <li><strong>Display Preferences:</strong> Grid/list view and filter settings</li>
              </ul>
            </div>

            <!-- No Personal Information -->
            <div class="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                    We Do NOT Collect Personal Information
                  </h4>
                  <p class="text-sm">
                    ESPBoards Store does not collect, store, or process any personally identifiable information (PII) 
                    such as names, email addresses, physical addresses, or payment information. We do not require 
                    user accounts or registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- How We Use Information -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How We Use Your Information
          </h2>
          <p class="mb-4">
            We use the information we collect to:
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Improve our website:</strong> Analyze usage patterns to enhance user experience and functionality</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Personalize content:</strong> Remember your preferences and settings across sessions</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Measure performance:</strong> Understand which products and features are most popular</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Optimize product catalog:</strong> Determine which products to feature and update</span>
            </li>
          </ul>
        </section>

        <!-- Third-Party Services -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Third-Party Services
          </h2>

          <div class="space-y-6">
            <!-- Google Analytics -->
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                  <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Google Analytics</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Website analytics and insights</p>
                </div>
              </div>
              <p class="mb-3">
                We use Google Analytics to understand how visitors interact with our website. Google Analytics 
                collects information anonymously and reports website trends without identifying individual visitors.
              </p>
              <p class="text-sm">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                  View Google's Privacy Policy →
                </a>
              </p>
            </div>

            <!-- Amazon Associates -->
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center shrink-0">
                  <svg class="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Amazon Associates Program</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Affiliate marketing platform</p>
                </div>
              </div>
              <p class="mb-3">
                As an Amazon Associate, we earn from qualifying purchases. When you click on product links and 
                visit Amazon, cookies may be set by Amazon to track referrals and purchases. These cookies are 
                controlled by Amazon.
              </p>
              <p class="text-sm">
                <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                  View Amazon's Privacy Notice →
                </a>
              </p>
            </div>

            <!-- Amazon PA-API -->
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Amazon Product Advertising API</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Product data provider</p>
                </div>
              </div>
              <p class="mb-3">
                We use Amazon's Product Advertising API to fetch product information, prices, images, and 
                availability. This data is refreshed periodically to keep our catalog up to date.
              </p>
            </div>
          </div>
        </section>

        <!-- Cookies -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Cookies and Tracking Technologies
          </h2>
          <p class="mb-4">
            We use cookies and similar tracking technologies to track activity on our website and store certain 
            information. You can instruct your browser to refuse all cookies or to indicate when a cookie is 
            being sent.
          </p>
          <p class="mb-4">
            For detailed information about the cookies we use and how to manage them, please read our 
            <NuxtLink to="/cookies" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Cookie Policy
            </NuxtLink>.
          </p>
        </section>

        <!-- Data Storage and Security -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Storage and Security
          </h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Where We Store Your Data
              </h3>
              <p class="mb-3">
                Your preferences are stored locally in your browser's local storage. We do not store any 
                personal data on our servers. Analytics data is processed by Google Analytics according to 
                their data processing terms.
              </p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Security Measures
              </h3>
              <p>
                We implement appropriate technical and organizational security measures to protect your 
                information. Our website uses HTTPS encryption to secure data transmission. However, no method 
                of transmission over the Internet is 100% secure.
              </p>
            </div>
          </div>
        </section>

        <!-- Your Rights -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Privacy Rights
          </h2>
          <p class="mb-4">
            Depending on your location, you may have the following rights regarding your data:
          </p>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Right to Access:</strong> You can access your locally stored preferences through your browser settings
              </div>
            </div>
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Right to Erasure:</strong> You can clear your browser's local storage and cookies at any time
              </div>
            </div>
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Right to Object:</strong> You can opt out of analytics tracking through our cookie consent banner
              </div>
            </div>
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Right to Data Portability:</strong> Since data is stored locally, you have full control over it
              </div>
            </div>
          </div>
        </section>

        <!-- Children's Privacy -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Children's Privacy
          </h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us.
          </p>
        </section>

        <!-- International Users -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            International Data Transfers
          </h2>
          <p class="mb-4">
            Our website can be accessed from around the world. If you are visiting from regions with laws 
            governing data collection and use that may differ from your country's law, please note that you 
            are transferring your data to regions where we operate.
          </p>
          <p>
            We comply with applicable data protection laws, including GDPR for European users and CCPA for 
            California residents.
          </p>
        </section>

        <!-- Changes to Policy -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Changes to This Privacy Policy
          </h2>
          <p class="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
            Policy are effective when they are posted on this page.
          </p>
        </section>

        <!-- Contact -->
        <section class="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          <p class="mb-4">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us.
          </p>
          <div class="space-y-2 text-sm">
            <p>
              <strong class="text-gray-900 dark:text-white">Related Policies:</strong>
            </p>
            <ul class="space-y-1 ml-4">
              <li>
                <NuxtLink to="/cookies" class="text-blue-600 dark:text-blue-400 hover:underline">
                  Cookie Policy →
                </NuxtLink>
              </li>
            </ul>
          </div>
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

<script setup lang="ts">
useHead({
  title: 'Terms of Service - ESPBoards Store',
  meta: [
    { name: 'description', content: 'Terms and conditions for using ESPBoards Store product discovery platform.' },
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
          Terms of Service
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
            Welcome to ESPBoards Store. These Terms of Service ("Terms") govern your use of our website and services. 
            By accessing or using ESPBoards Store, you agree to be bound by these Terms.
          </p>
          <p>
            ESPBoards Store is a product discovery platform that aggregates information about ESP32 and related 
            development boards available on Amazon. We are participants in the Amazon Associates Program and 
            may earn commissions from qualifying purchases.
          </p>
        </section>

        <!-- Acceptance of Terms -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Acceptance of Terms
          </h2>
          <p class="mb-4">
            By accessing and using this website, you accept and agree to be bound by the terms and provision 
            of this agreement. If you do not agree to these Terms, please do not use our website.
          </p>
          <p>
            We reserve the right to update, change, or replace any part of these Terms at any time. It is your 
            responsibility to check this page periodically for changes. Your continued use of the website 
            following the posting of any changes constitutes acceptance of those changes.
          </p>
        </section>

        <!-- Description of Service -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Description of Service
          </h2>
          <p class="mb-4">
            ESPBoards Store provides:
          </p>
          <ul class="space-y-2 ml-6 list-disc">
            <li>Product discovery and search functionality for ESP32 and related development boards</li>
            <li>Product information aggregated from Amazon via the Amazon Product Advertising API</li>
            <li>Price comparisons and product specifications</li>
            <li>Links to Amazon product pages where purchases can be made</li>
            <li>Technical filtering and categorization of products</li>
          </ul>
        </section>

        <!-- Data Accuracy Disclaimer -->
        <section class="rounded-lg bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 p-6 shadow-sm">
          <div class="flex items-start gap-3 mb-4">
            <svg class="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Product Information & Data Accuracy Disclaimer
              </h2>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Third-Party Data Source
              </h3>
              <p class="mb-3">
                <strong>All product information displayed on ESPBoards Store is sourced exclusively from the Amazon 
                Product Advertising API (PA-API).</strong> We do not create, verify, or independently validate 
                this product information.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Warranty of Accuracy
              </h3>
              <p class="mb-3">
                <strong>We make no representations or warranties regarding the accuracy, completeness, 
                reliability, or timeliness of any product information displayed on our website.</strong> This includes but is not limited to:
              </p>
              <ul class="space-y-2 ml-6 list-disc text-sm">
                <li>Product prices and availability</li>
                <li>Product descriptions and specifications</li>
                <li>Product images and technical details</li>
                <li>Stock availability and delivery information</li>
                <li>Product ratings and reviews</li>
                <li>Product features and compatibility information</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Data Refresh and Timeliness
              </h3>
              <p class="mb-3">
                While we periodically refresh product data from Amazon's API, there may be delays between 
                updates. <strong>Product information, especially prices and availability, may change on Amazon 
                without being immediately reflected on our website.</strong>
              </p>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verification Required
              </h3>
              <p>
                <strong>You must verify all product information, prices, and availability directly on Amazon 
                before making any purchase decision.</strong> The final price, availability, and product details 
                shown on Amazon at the time of purchase will govern your transaction.
              </p>
            </div>
          </div>
        </section>

        <!-- Limitation of Liability -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Limitation of Liability
          </h2>
          <div class="space-y-4">
            <p>
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESPBoards Store AND ITS OPERATORS SHALL NOT BE LIABLE 
              FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM:</strong>
            </p>
            <ul class="space-y-2 ml-6 list-disc">
              <li>Your use or inability to use our website or services</li>
              <li>Any inaccurate, incomplete, or outdated product information</li>
              <li>Price discrepancies between our website and Amazon</li>
              <li>Product availability changes or stock shortages</li>
              <li>Errors in product descriptions or specifications</li>
              <li>Any purchases made through Amazon based on information from our website</li>
              <li>Any technical issues, interruptions, or errors in our service</li>
              <li>Any reliance on product information displayed on our website</li>
            </ul>
            <p class="mt-4">
              <strong>You acknowledge and agree that your use of ESPBoards Store is at your sole risk and that you 
              will be solely responsible for verifying all product information before making any purchase.</strong>
            </p>
          </div>
        </section>

        <!-- Amazon Relationship -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Amazon Associates Disclosure
          </h2>
          <div class="space-y-4">
            <p>
              <strong>ESPBoards Store is a participant in the Amazon Associates Program,</strong> an affiliate 
              advertising program designed to provide a means for sites to earn advertising fees by advertising 
              and linking to Amazon and affiliated Amazon marketplaces.
            </p>
            <p>
              As an Amazon Associate, we earn from qualifying purchases. This means that when you click on a 
              product link and make a purchase on Amazon, we may receive a commission at no additional cost to you.
            </p>
            <p>
              <strong>We are not Amazon, nor are we affiliated with, endorsed by, or sponsored by Amazon 
              beyond the Amazon Associates Program.</strong> All purchases are made directly with Amazon, and 
              all sales transactions are between you and Amazon.
            </p>
          </div>
        </section>

        <!-- No Sales Transactions -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            No Sales or Transactions
          </h2>
          <p class="mb-4">
            <strong>ESPBoards Store does not sell products, process payments, or handle any aspect of product 
            fulfillment.</strong> We are purely an information and discovery platform.
          </p>
          <div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p class="text-sm">
              <strong>When you click on a product link:</strong>
            </p>
            <ul class="mt-2 space-y-1 text-sm ml-6 list-disc">
              <li>You will be redirected to Amazon.com or an affiliated Amazon marketplace</li>
              <li>Your purchase will be made directly with Amazon</li>
              <li>Amazon's terms of service and return policies will apply</li>
              <li>Amazon will handle payment processing, shipping, and customer service</li>
              <li>We have no access to your payment information or personal purchase data</li>
            </ul>
          </div>
        </section>

        <!-- User Conduct -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            User Conduct
          </h2>
          <p class="mb-4">
            You agree to use ESPBoards Store only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul class="space-y-2 ml-6 list-disc">
            <li>Use the website in any way that violates any applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to our systems or data</li>
            <li>Use automated systems (bots, scrapers, etc.) to access or collect data from our website without permission</li>
            <li>Interfere with or disrupt the operation of the website</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
            <li>Use the website for any commercial purposes without our express written consent</li>
          </ul>
        </section>

        <!-- Intellectual Property -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Intellectual Property
          </h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Our Content
              </h3>
              <p>
                The ESPBoards Store website design, layout, functionality, and original content (excluding Amazon-sourced 
                product data) are owned by ESPBoards Store and protected by copyright and other intellectual property laws.
              </p>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Third-Party Content
              </h3>
              <p class="mb-3">
                Product information, images, descriptions, and related content are provided by Amazon via the 
                Amazon Product Advertising API and remain the property of Amazon and the respective product 
                manufacturers and sellers.
              </p>
              <p>
                Amazon, Amazon.com, and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. 
                ESP32, and related product names may be trademarks of their respective owners.
              </p>
            </div>
          </div>
        </section>

        <!-- Service Availability -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Service Availability
          </h2>
          <p class="mb-4">
            <strong>We do not guarantee that our website will be available at all times or that it will be 
            uninterrupted or error-free.</strong> We reserve the right to:
          </p>
          <ul class="space-y-2 ml-6 list-disc">
            <li>Modify, suspend, or discontinue any aspect of our service at any time</li>
            <li>Restrict access to parts or all of the website for maintenance or updates</li>
            <li>Change the features, functionality, or content of the website</li>
            <li>Terminate access to the website without notice</li>
          </ul>
        </section>

        <!-- Links to Third Parties -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Links to Third-Party Websites
          </h2>
          <p class="mb-4">
            Our website contains links to Amazon and potentially other third-party websites. We are not 
            responsible for the content, policies, or practices of any third-party websites.
          </p>
          <p>
            <strong>When you click on a link to Amazon or any other third-party website, you leave ESPBoards Store 
            and are subject to the terms and conditions and privacy policies of those websites.</strong> We 
            encourage you to review the policies of any website you visit.
          </p>
        </section>

        <!-- Privacy -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy
          </h2>
          <p class="mb-4">
            Your use of ESPBoards Store is also governed by our Privacy Policy. Please review our 
            <NuxtLink to="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Privacy Policy
            </NuxtLink> 
            to understand our practices regarding your data.
          </p>
          <p>
            We do not collect personal information, but we do use cookies and analytics. See our 
            <NuxtLink to="/cookies" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Cookie Policy
            </NuxtLink> 
            for more information.
          </p>
        </section>

        <!-- Disclaimer of Warranties -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Disclaimer of Warranties
          </h2>
          <p class="mb-4">
            <strong>ESPBoards Store IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED.</strong>
          </p>
          <p class="mb-4">
            We specifically disclaim all warranties, including but not limited to:
          </p>
          <ul class="space-y-2 ml-6 list-disc">
            <li>Warranties of merchantability and fitness for a particular purpose</li>
            <li>Warranties regarding accuracy, reliability, or completeness of information</li>
            <li>Warranties that the service will be uninterrupted, timely, secure, or error-free</li>
            <li>Warranties regarding the results that may be obtained from use of the service</li>
          </ul>
        </section>

        <!-- Indemnification -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Indemnification
          </h2>
          <p>
            You agree to indemnify, defend, and hold harmless ESPBoards Store, its operators, affiliates, and partners 
            from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
          </p>
          <ul class="space-y-2 ml-6 list-disc mt-3">
            <li>Your use of the website</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Any content you submit or transmit through the website</li>
          </ul>
        </section>

        <!-- Governing Law -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard 
            to conflict of law principles. Any disputes arising from these Terms or your use of the website 
            shall be resolved in accordance with the applicable jurisdiction.
          </p>
        </section>

        <!-- Severability -->
        <section class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Severability
          </h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision will be 
            limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in 
            full force and effect and enforceable.
          </p>
        </section>

        <!-- Contact -->
        <section class="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-6">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h2>
          <p class="mb-4">
            If you have any questions about these Terms of Service, please contact us.
          </p>
          <div class="space-y-2 text-sm">
            <p>
              <strong class="text-gray-900 dark:text-white">Related Policies:</strong>
            </p>
            <ul class="space-y-1 ml-4">
              <li>
                <NuxtLink to="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy →
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/cookies" class="text-blue-600 dark:text-blue-400 hover:underline">
                  Cookie Policy →
                </NuxtLink>
              </li>
            </ul>
          </div>
        </section>

        <!-- Acknowledgment -->
        <section class="rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-6">
          <p class="text-center font-medium text-gray-900 dark:text-white">
            By using ESPBoards Store, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

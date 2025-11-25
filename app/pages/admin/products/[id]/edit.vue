<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-medium text-red-900 dark:text-red-200">Error loading product</p>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="product">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/admin/products"
              class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ product.asin }} • {{ product.marketplace.code }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="showDeleteConfirm = true"
            class="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Product
          </button>
          <a
            :href="product.detail_page_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Amazon
          </a>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-medium text-green-900 dark:text-green-200">{{ successMessage }}</p>
        </div>
      </div>

      <form @submit.prevent="saveProduct" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Left Column: Product Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information Card -->
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              
              <div class="flex flex-col sm:flex-row gap-6">
                <!-- Product Image -->
                <div class="shrink-0">
                  <div class="aspect-square w-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img
                      v-if="product.images?.primary?.large?.url || product.images?.primary?.medium?.url || product.images?.primary?.small?.url"
                      :src="product.images?.primary?.large?.url || product.images?.primary?.medium?.url || product.images?.primary?.small?.url"
                      :alt="product.title"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Input Fields -->
                <div class="flex-1 space-y-4">
                  <!-- Title (Read-only) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      :value="product.title"
                      disabled
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <!-- Brand (Read-only) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                    <input
                      type="text"
                      :value="product.brand || 'N/A'"
                      disabled
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-300"
                    />
                  </div>

                  <!-- Custom Description -->
                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                      <span class="text-gray-500 dark:text-gray-400 font-normal">(Optional override)</span>
                    </label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="4"
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                      placeholder="Enter custom description or leave blank to use Amazon's"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical Metadata Card -->
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Specifications</h2>
              
              <!-- Product Type -->
              <div class="mb-4">
                <label for="product_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Type</label>
                <select
                  id="product_type"
                  v-model="formData.metadata.filters.product_type"
                  @change="updateDisplayField('product_type')"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                >
                  <option value="">Select type...</option>
                  <option value="development_board">Development Board</option>
                  <option value="sensor">Sensor</option>
                  <option value="display">Display</option>
                  <option value="power">Power Module</option>
                  <option value="wireless">Wireless Module</option>
                  <option value="breakout">Breakout Board</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>

              <!-- ESP32 Chip (for development boards) -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="chip" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chip Model</label>
                <select
                  id="chip"
                  v-model="formData.metadata.filters.chip"
                  @change="updateDisplayField('chip')"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                >
                  <option value="">Select chip...</option>
                  <option value="ESP32">ESP32</option>
                  <option value="ESP32-S2">ESP32-S2</option>
                  <option value="ESP32-S3">ESP32-S3</option>
                  <option value="ESP32-C3">ESP32-C3</option>
                  <option value="ESP32-C6">ESP32-C6</option>
                  <option value="ESP32-H2">ESP32-H2</option>
                </select>
              </div>

              <!-- PSRAM -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="psram_mb" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PSRAM (MB)</label>
                <input
                  id="psram_mb"
                  v-model.number="formData.metadata.filters.psram_mb"
                  @input="updateDisplayField('psram_mb')"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                  placeholder="e.g., 8"
                />
              </div>

              <!-- Flash Memory -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="flash_mb" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flash Memory (MB)</label>
                <input
                  id="flash_mb"
                  v-model.number="formData.metadata.filters.flash_mb"
                  @input="updateDisplayField('flash_mb')"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                  placeholder="e.g., 16"
                />
              </div>

              <!-- GPIO Pins -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="gpio_pins" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GPIO Pins</label>
                <input
                  id="gpio_pins"
                  v-model.number="formData.metadata.filters.gpio_pins"
                  @input="updateDisplayField('gpio_pins')"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                  placeholder="e.g., 45"
                />
              </div>

              <!-- Connectivity Features -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Connectivity</label>
                
                <!-- WiFi -->
                <div class="mb-3">
                  <label class="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_wifi"
                      @change="updateConnectivityDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">WiFi</span>
                  </label>
                  <div v-if="formData.metadata.filters.has_wifi" class="ml-6">
                    <select
                      v-model="formData.metadata.filters.wifi_version"
                      @change="updateConnectivityDisplay"
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                    >
                      <option value="">Select version...</option>
                      <option value="4">WiFi 4 (802.11n)</option>
                      <option value="5">WiFi 5 (802.11ac)</option>
                      <option value="6">WiFi 6 (802.11ax)</option>
                    </select>
                  </div>
                </div>

                <!-- Bluetooth -->
                <div class="mb-3">
                  <label class="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_bluetooth"
                      @change="updateConnectivityDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Bluetooth</span>
                  </label>
                  <div v-if="formData.metadata.filters.has_bluetooth" class="ml-6">
                    <select
                      v-model="formData.metadata.filters.bluetooth_version"
                      @change="updateConnectivityDisplay"
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                    >
                      <option value="">Select version...</option>
                      <option value="4.2">Bluetooth 4.2</option>
                      <option value="5.0">Bluetooth 5.0 (LE)</option>
                      <option value="5.1">Bluetooth 5.1 (LE)</option>
                      <option value="5.2">Bluetooth 5.2 (LE)</option>
                      <option value="5.3">Bluetooth 5.3 (LE)</option>
                      <option value="5.4">Bluetooth 5.4 (LE)</option>
                    </select>
                  </div>
                </div>

                <!-- Zigbee -->
                <div class="mb-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_zigbee"
                      @change="updateConnectivityDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Zigbee</span>
                  </label>
                </div>

                <!-- Thread -->
                <div>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_thread"
                      @change="updateConnectivityDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Thread</span>
                  </label>
                </div>
              </div>

              <!-- USB Port Type -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'" class="mb-4">
                <label for="usb_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">USB Port</label>
                <select
                  id="usb_type"
                  v-model="formData.metadata.filters.usb_type"
                  @change="updateFeaturesDisplay"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                >
                  <option value="">No USB</option>
                  <option value="micro_usb">Micro USB</option>
                  <option value="usb_c">USB-C</option>
                  <option value="usb_a">USB-A</option>
                </select>
              </div>

              <!-- Hardware Features -->
              <div v-if="formData.metadata.filters.product_type === 'development_board'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hardware Features</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_camera"
                      @change="updateFeaturesDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Camera Support</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_display"
                      @change="updateFeaturesDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Built-in Display</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_battery_pins"
                      @change="updateFeaturesDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Battery Connector</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="formData.metadata.filters.has_sd_card"
                      @change="updateFeaturesDisplay"
                      class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">SD Card Slot</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Status & Actions -->
          <div class="space-y-6">
            <!-- Status Card -->
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
              
              <div class="mb-4">
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Status</label>
                <select
                  id="status"
                  v-model="formData.status"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Only "Active" products are visible on the storefront
                </p>
              </div>

              <!-- Save Button -->
              <button
                type="submit"
                :disabled="isSaving"
                class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <!-- Product Info Card -->
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Info</h2>
              
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">ASIN:</span>
                  <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">{{ product.asin }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Marketplace:</span>
                  <span class="ml-2 text-gray-900 dark:text-gray-100">{{ product.marketplace.region_name }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Price:</span>
                  <span class="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                    {{ product.current_price ? formatPrice(product.current_price, product.currency) : 'N/A' }}
                  </span>
                </div>
                <div v-if="product.star_rating">
                  <span class="text-gray-500 dark:text-gray-400">Rating:</span>
                  <span class="ml-2 text-gray-900 dark:text-gray-100">⭐ {{ product.star_rating }}/5</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Created:</span>
                  <span class="ml-2 text-gray-900 dark:text-gray-100">{{ formatDate(product.created_at) }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Updated:</span>
                  <span class="ml-2 text-gray-900 dark:text-gray-100">{{ formatDate(product.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      @click.self="showDeleteConfirm = false"
    >
      <div class="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete Product</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p class="mb-6 text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <strong>{{ product?.title }}</strong>? This will permanently remove the product from your store.
        </p>

        <div class="flex gap-3">
          <button
            type="button"
            @click="showDeleteConfirm = false"
            :disabled="isDeleting"
            class="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="deleteProduct"
            :disabled="isDeleting"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 dark:bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 dark:hover:bg-red-700 disabled:opacity-50"
          >
            <svg v-if="isDeleting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string

// State
const product = ref<any>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const error = ref('')
const successMessage = ref('')

// Form data
const formData = ref({
  description: '',
  status: 'draft',
  metadata: {
    display: {} as Record<string, string>,
    filters: {} as Record<string, any>,
  },
})

// Load product
const loadProduct = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response: any = await $fetch(`/api/admin/products/${productId}`)
    product.value = response.product

    // Initialize form data
    formData.value.description = product.value.description || ''
    formData.value.status = product.value.status || 'draft'
    formData.value.metadata = product.value.metadata || { display: {}, filters: {} }
  } catch (err: any) {
    console.error('Failed to load product:', err)
    error.value = err.message || 'Failed to load product'
  } finally {
    isLoading.value = false
  }
}

// Save product
const saveProduct = async () => {
  isSaving.value = true
  successMessage.value = ''
  error.value = ''

  try {
    await $fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      body: {
        description: formData.value.description || null,
        status: formData.value.status,
        metadata: formData.value.metadata,
      },
    })

    successMessage.value = 'Product updated successfully!'
    
    // Reload product data
    await loadProduct()

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err: any) {
    console.error('Failed to save product:', err)
    error.value = err.message || 'Failed to save product'
  } finally {
    isSaving.value = false
  }
}

// Delete product
const deleteProduct = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    })

    // Redirect to products list after successful deletion
    await router.push('/admin/products')
  } catch (err: any) {
    console.error('Failed to delete product:', err)
    error.value = err.message || 'Failed to delete product'
    showDeleteConfirm.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isDeleting.value = false
  }
}

// Update display field when filter changes
const updateDisplayField = (field: string) => {
  const value = formData.value.metadata.filters[field]
  
  if (value === null || value === undefined || value === '') {
    delete formData.value.metadata.display[field]
    return
  }

  switch (field) {
    case 'product_type':
      formData.value.metadata.display[field] = value.replace('_', ' ')
      break
    case 'chip':
      formData.value.metadata.display[field] = value
      // Set chip series
      if (value.startsWith('ESP32-S')) {
        formData.value.metadata.filters.chip_series = 'ESP32-S'
      } else if (value.startsWith('ESP32-C')) {
        formData.value.metadata.filters.chip_series = 'ESP32-C'
      } else if (value.startsWith('ESP32-H')) {
        formData.value.metadata.filters.chip_series = 'ESP32-H'
      } else {
        formData.value.metadata.filters.chip_series = 'ESP32'
      }
      break
    case 'psram_mb':
      formData.value.metadata.display[field] = value ? `${value}MB PSRAM` : ''
      break
    case 'flash_mb':
      formData.value.metadata.display[field] = value ? `${value}MB Flash` : ''
      break
    case 'gpio_pins':
      formData.value.metadata.display[field] = value ? `${value} GPIO pins` : ''
      break
    default:
      formData.value.metadata.display[field] = String(value)
  }
}

// Update connectivity display
const updateConnectivityDisplay = () => {
  const connectivity = []
  
  if (formData.value.metadata.filters.has_wifi) {
    const version = formData.value.metadata.filters.wifi_version
    connectivity.push(version ? `WiFi ${version}` : 'WiFi')
  }
  
  if (formData.value.metadata.filters.has_bluetooth) {
    const version = formData.value.metadata.filters.bluetooth_version
    connectivity.push(version ? `Bluetooth ${version}` : 'Bluetooth')
  }
  
  if (formData.value.metadata.filters.has_zigbee) connectivity.push('Zigbee')
  if (formData.value.metadata.filters.has_thread) connectivity.push('Thread')
  
  if (connectivity.length > 0) {
    formData.value.metadata.display.connectivity = connectivity.join(', ')
  } else {
    delete formData.value.metadata.display.connectivity
  }
}

// Update features display
const updateFeaturesDisplay = () => {
  const features = []
  if (formData.value.metadata.filters.has_camera) features.push('Camera')
  if (formData.value.metadata.filters.has_display) features.push('Display')
  if (formData.value.metadata.filters.has_battery_pins) features.push('Battery')
  if (formData.value.metadata.filters.has_sd_card) features.push('SD Card')
  
  // Add USB type
  const usbType = formData.value.metadata.filters.usb_type
  if (usbType) {
    const usbDisplay = usbType === 'usb_c' ? 'USB-C' : usbType === 'micro_usb' ? 'Micro USB' : 'USB-A'
    features.push(usbDisplay)
    formData.value.metadata.display.usb_type = usbDisplay
  } else {
    delete formData.value.metadata.display.usb_type
  }
  
  if (features.length > 0) {
    formData.value.metadata.display.features = features.join(', ')
  } else {
    delete formData.value.metadata.display.features
  }
}

// Format price
const formatPrice = (price: number, currency: string) => {
  const symbol = currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.toFixed(2)}`
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Load product on mount
onMounted(() => {
  loadProduct()
})
</script>

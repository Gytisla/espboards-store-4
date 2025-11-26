<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const categoriesDropdownOpen = ref(false)
const mobileCategoriesOpen = ref(false)
const { theme, cycleTheme } = useTheme()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const categories = [
  { name: 'Development Boards', href: '/categories/development-boards', icon: '🔷' },
  { name: 'Sensors', href: '/products?type=sensor', icon: '🌡️' },
  { name: 'Displays', href: '/products?type=display', icon: '🖥️' },
  { name: 'Power & Battery', href: '/products?type=power', icon: '🔋' },
  { name: 'Communication', href: '/products?type=communication', icon: '📡' },
  { name: 'Accessories', href: '/products?type=accessory', icon: '🔧' },
  { name: 'View All Categories', href: '/categories', icon: '📂', divider: true },
]

const closeDropdown = () => {
  categoriesDropdownOpen.value = false
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/20'
        : 'bg-white/80 dark:bg-gray-900/95 backdrop-blur-sm'
    ]"
  >
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img 
              src="/logo.png" 
              alt="ESPBoards Logo" 
              class="h-8 w-auto"
            />
            <div class="flex flex-col leading-tight">
              <span class="font-semibold text-lg text-gray-900 dark:text-white">ESPBoards</span>
              <span class="font-medium text-sm text-gray-600 dark:text-gray-400 -mt-1">Store</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:gap-1">
          <!-- Products Link -->
          <NuxtLink
            to="/products"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
            active-class="!bg-blue-50 dark:!bg-blue-950 !text-blue-600 dark:!text-blue-400"
          >
            Products
          </NuxtLink>
          
          <!-- Categories Dropdown -->
          <div class="relative" @mouseleave="closeDropdown">
            <button
              @mouseenter="categoriesDropdownOpen = true"
              @click="categoriesDropdownOpen = !categoriesDropdownOpen"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
              :class="{ 'bg-blue-50! dark:bg-blue-950! text-blue-600! dark:text-blue-400!': categoriesDropdownOpen }"
            >
              Categories
              <svg 
                class="h-4 w-4 transition-transform" 
                :class="{ 'rotate-180': categoriesDropdownOpen }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="categoriesDropdownOpen"
                @mouseenter="categoriesDropdownOpen = true"
                class="absolute top-full left-0 pt-2 w-64"
              >
                <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                  <div class="py-2">
                    <template v-for="category in categories" :key="category.name">
                      <div v-if="category.divider" class="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>
                      <NuxtLink
                        :to="category.href"
                        @click="closeDropdown"
                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        :class="{ 'font-semibold': category.divider }"
                      >
                        <span class="text-lg">{{ category.icon }}</span>
                        <span>{{ category.name }}</span>
                      </NuxtLink>
                    </template>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          
          <!-- About Link -->
          <NuxtLink
            to="/about"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
            active-class="!bg-blue-50 dark:!bg-blue-950 !text-blue-600 dark:!text-blue-400"
          >
            About
          </NuxtLink>
          
          <!-- ESPBoards Link -->
          <NuxtLink
            to="https://www.espboards.dev"
            target="_blank"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5"
          >
            ESPBoards
            <svg class="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
          <!-- Theme Picker (Desktop Only) -->
          <button
            @click="cycleTheme"
            class="hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
            :title="`Theme: ${theme}`"
          >
            <!-- Light Mode Icon -->
            <svg v-if="theme === 'light'" class="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Dark Mode Icon -->
            <svg v-else-if="theme === 'dark'" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <!-- System Mode Icon -->
            <svg v-else class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <!-- Marketplace Selector -->
          <MarketplaceSelector />

          <!-- Search Button -->
          <!-- <button
            class="hidden md:flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-500 transition-all hover:border-gray-300 hover:shadow-md"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
            <kbd class="ml-2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button> -->

          <!-- Cart Button -->
          <button
            class="relative hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
          >
            <svg class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-lg">
              0
            </span>
          </button>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <svg v-if="!mobileMenuOpen" class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="mobileMenuOpen"
          class="md:hidden absolute left-0 right-0 top-full mt-2 mx-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl"
        >
          <div class="flex flex-col p-2">
            <!-- Products Link -->
            <NuxtLink
              to="/products"
              @click="closeMobileMenu"
              class="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              active-class="bg-blue-50! dark:bg-blue-950! text-blue-600! dark:text-blue-400!"
            >
              Products
            </NuxtLink>
            
            <!-- Categories Section -->
            <button
              @click="mobileCategoriesOpen = !mobileCategoriesOpen"
              class="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center justify-between"
            >
              <span>Categories</span>
              <svg 
                class="h-4 w-4 transition-transform" 
                :class="{ 'rotate-180': mobileCategoriesOpen }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Categories List -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="mobileCategoriesOpen" class="overflow-hidden">
                <div class="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                  <template v-for="category in categories" :key="category.name">
                    <div v-if="category.divider" class="my-2"></div>
                    <NuxtLink
                      :to="category.href"
                      @click="closeMobileMenu"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      :class="{ 'font-semibold': category.divider }"
                    >
                      <span class="text-base">{{ category.icon }}</span>
                      <span>{{ category.name }}</span>
                    </NuxtLink>
                  </template>
                </div>
              </div>
            </Transition>
            
            <!-- About Link -->
            <NuxtLink
              to="/about"
              @click="closeMobileMenu"
              class="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              active-class="bg-blue-50! dark:bg-blue-950! text-blue-600! dark:text-blue-400!"
            >
              About
            </NuxtLink>
            
            <!-- ESPBoards Link -->
            <NuxtLink
              to="https://www.espboards.dev"
              target="_blank"
              @click="closeMobileMenu"
              class="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
            >
              ESPBoards
              <svg class="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </NuxtLink>
            
            <div class="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>
            <button
              @click="cycleTheme"
              class="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="flex items-center gap-2">
                <svg v-if="theme === 'light'" class="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else-if="theme === 'dark'" class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else class="h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Theme
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ theme }}</span>
            </button>
            <button
              class="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

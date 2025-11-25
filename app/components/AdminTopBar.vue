<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)

const { user, signOut } = useAuth()
const { theme, cycleTheme } = useTheme()

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

const notifications = [
  { id: 1, title: 'New order received', message: 'Order #1234 from John Doe', time: '2 min ago', unread: true },
  { id: 2, title: 'Low stock alert', message: 'ESP32-S3 DevKit - Only 5 left', time: '1 hour ago', unread: true },
  { id: 3, title: 'Product review', message: 'New 5-star review on ESP32-C3', time: '3 hours ago', unread: false },
]

const unreadCount = notifications.filter(n => n.unread).length
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8">
    <!-- Left: Breadcrumbs / Page Title -->
    <div class="flex items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <nav class="hidden items-center gap-2 text-sm text-gray-600 dark:text-gray-400 md:flex">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-400 dark:text-gray-500">Overview</span>
      </nav>
    </div>

    <!-- Right: Search, Notifications, User Menu -->
    <div class="flex items-center gap-3">
      <!-- Marketplace Selector -->
      <MarketplaceSelector />

      <!-- Mobile Search Button -->
      <button class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 lg:hidden">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Theme Switcher -->
      <button
        @click="cycleTheme"
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
        aria-label="Toggle theme"
      >
        <!-- Sun Icon (Light Mode) -->
        <svg v-if="theme === 'light'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <!-- Moon Icon (Dark Mode) -->
        <svg v-else-if="theme === 'dark'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <!-- Monitor Icon (System Mode) -->
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      <!-- Notifications -->
      <div class="relative">
        <!-- <button
          @click="notificationsOpen = !notificationsOpen"
          class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            v-if="unreadCount > 0"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white"
          >
            {{ unreadCount }}
          </span>
        </button> -->

        <!-- Notifications Dropdown -->
        <!-- <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="notificationsOpen"
            v-click-outside="() => notificationsOpen = false"
            class="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 class="font-semibold text-gray-900">Notifications</h3>
              <button class="text-xs font-medium text-blue-600 hover:text-blue-700">Mark all read</button>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <button
                v-for="notification in notifications"
                :key="notification.id"
                class="flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                :class="{ 'bg-blue-50/50': notification.unread }"
              >
                <div class="shrink-0">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-semibold text-gray-900">{{ notification.title }}</p>
                    <span v-if="notification.unread" class="h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>
                  <p class="mt-1 text-xs text-gray-400">{{ notification.time }}</p>
                </div>
              </button>
            </div>
            <div class="border-t border-gray-200 p-3">
              <button class="w-full rounded-lg py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                View all notifications
              </button>
            </div>
          </div>
        </Transition> -->
      </div>

      <!-- User Menu -->
      <div class="relative">
        <button
          @click="userMenuOpen = !userMenuOpen"
          class="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 transition-all hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <div class="relative h-7 w-7 overflow-hidden rounded-lg bg-linear-to-br from-blue-500 to-purple-500">
            <img
              src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff&size=128"
              alt="Admin"
              class="h-full w-full object-cover"
            />
          </div>
          <svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- User Menu Dropdown -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="userMenuOpen"
            v-click-outside="() => userMenuOpen = false"
            class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl"
          >
            <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ user?.email || 'Admin User' }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ user?.email || 'admin@esp.com' }}</p>
            </div>
            <div class="p-2">
              <NuxtLink
                to="/admin/profile"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </NuxtLink>
              <NuxtLink
                to="/admin/settings"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </NuxtLink>
              <NuxtLink
                to="/"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                View Store
              </NuxtLink>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                @click="handleSignOut"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

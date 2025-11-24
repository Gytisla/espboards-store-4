<script setup lang="ts">
const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: 'M3 3h4l2 4h9a1 1 0 01.98 1.2l-1.8 7.2a1 1 0 01-.98.8H8.79L7 21H5.21M7 13h10m-3 4a1 1 0 100 2 1 1 0 000-2zm-6 0a1 1 0 100 2 1 1 0 000-2z',
    badge: null,
  },
  {
    name: 'Dashboard',
    href: '/admin',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    badge: null,
  },
  {
    name: 'Search Products',
    href: '/admin/search',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    badge: null,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    badge: null,
  }
]
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Logo & Toggle -->
    <div class="flex h-16 items-center justify-between border-b border-gray-200 px-4">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <NuxtLink
          v-if="!collapsed"
          to="/admin"
          class="flex items-center gap-3"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-gray-900">ESP Admin</span>
        </NuxtLink>
        <div v-else class="flex items-center justify-center">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </Transition>

      <button
        @click="emit('toggle')"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg
          class="h-5 w-5 transition-transform duration-300"
          :class="{ 'rotate-180': collapsed }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :title="collapsed ? item.name : undefined"
        class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900"
        active-class="!bg-linear-to-r from-blue-600 to-purple-600 !text-white hover:!bg-linear-to-r hover:from-blue-700 hover:to-purple-700"
      >
        <!-- Icon -->
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
        </svg>

        <!-- Text & Badge -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
        >
          <div v-if="!collapsed" class="flex flex-1 items-center justify-between">
            <span>{{ item.name }}</span>
            <span
              v-if="item.badge"
              class="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-semibold text-gray-700 group-[.router-link-active]:bg-white/20 group-[.router-link-active]:text-white"
            >
              {{ item.badge }}
            </span>
          </div>
        </Transition>

        <!-- Tooltip for collapsed state -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="collapsed"
            class="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
          >
            {{ item.name }}
            <span v-if="item.badge" class="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{{ item.badge }}</span>
            <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        </Transition>
      </NuxtLink>
    </nav>

    <!-- User Section -->
    <div class="border-t border-gray-200 p-4">
      <div
        class="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-gray-100"
        :class="{ 'justify-center': collapsed }"
      >
        <div class="relative shrink-0">
          <div class="h-9 w-9 overflow-hidden rounded-lg bg-linear-to-br from-blue-500 to-purple-500">
            <img
              src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff&size=128"
              alt="Admin User"
              class="h-full w-full object-cover"
            />
          </div>
          <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
        </div>
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
        >
          <div v-if="!collapsed" class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-gray-900">Admin User</p>
            <p class="truncate text-xs text-gray-600">admin@esp.com</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

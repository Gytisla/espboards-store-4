<script setup lang="ts">
import { ref } from 'vue'

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Menu Backdrop -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Sidebar (Overlay) -->
    <aside
      v-if="mobileMenuOpen"
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:hidden"
    >
      <AdminSidebar :collapsed="false" @toggle="toggleSidebar" @close-mobile="closeMobileMenu" />
    </aside>

    <!-- Desktop Sidebar -->
    <aside
      :class="[
        'hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <AdminSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" @close-mobile="closeMobileMenu" />
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Bar -->
      <AdminTopBar @toggle-mobile-menu="toggleMobileMenu" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <div class="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

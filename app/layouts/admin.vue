<script setup lang="ts">
import { ref } from 'vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'relative flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Sidebar content will go here -->
      <AdminSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Bar -->
      <AdminTopBar />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

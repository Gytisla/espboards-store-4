<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <span class="text-xl leading-none">{{ marketplace.flag }}</span>
      <span class="font-semibold text-gray-700 dark:text-gray-300">{{ marketplace.code }}</span>
      <svg
        class="h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="absolute top-full left-0 mt-2 min-w-[250px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden z-50">
        <button
          v-for="mkpl in Object.values(marketplaces)"
          :key="mkpl.code"
          @click="selectMarketplace(mkpl.code)"
          class="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          :class="{ 'bg-blue-50 dark:bg-blue-950': mkpl.code === selectedMarketplace }"
        >
          <span class="text-2xl leading-none">{{ mkpl.flag }}</span>
          <div class="flex flex-col gap-0.5 flex-1">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ mkpl.name }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ mkpl.domain }}</span>
          </div>
          <svg
            v-if="mkpl.code === selectedMarketplace"
            class="h-5 w-5 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { MarketplaceCode } from '~/composables/useMarketplace'

const { selectedMarketplace, marketplace, marketplaces, setMarketplace } = useMarketplace()

const isOpen = ref(false)

const selectMarketplace = (code: MarketplaceCode) => {
  setMarketplace(code)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

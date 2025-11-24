<template>
  <div class="marketplace-selector">
    <button
      @click="isOpen = !isOpen"
      class="selector-button"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <span class="flag">{{ marketplace.flag }}</span>
      <span class="code">{{ marketplace.code }}</span>
      <svg
        class="chevron"
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

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown">
        <button
          v-for="mkpl in Object.values(marketplaces)"
          :key="mkpl.code"
          @click="selectMarketplace(mkpl.code)"
          class="dropdown-item"
          :class="{ active: mkpl.code === selectedMarketplace }"
        >
          <span class="flag">{{ mkpl.flag }}</span>
          <div class="details">
            <span class="name">{{ mkpl.name }}</span>
            <span class="domain">{{ mkpl.domain }}</span>
          </div>
          <svg
            v-if="mkpl.code === selectedMarketplace"
            class="check"
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
  if (!target.closest('.marketplace-selector')) {
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

<style scoped>
.marketplace-selector {
  position: relative;
}

.selector-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.selector-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.selector-button:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.flag {
  font-size: 1.25rem;
  line-height: 1;
}

.code {
  color: #374151;
  font-weight: 600;
}

.chevron {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: transform 0.2s;
}

.chevron.rotate-180 {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 250px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item.active {
  background: #eff6ff;
}

.dropdown-item .flag {
  font-size: 1.5rem;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.domain {
  font-size: 0.75rem;
  color: #6b7280;
}

.check {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>

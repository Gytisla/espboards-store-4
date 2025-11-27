<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { selectedMarketplace } = useMarketplace()

// State
const products = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const selectedProducts = ref<Set<string>>(new Set())
const showGroupModal = ref(false)
const selectedParentId = ref<string>('')
const isGrouping = ref(false)
const searchQuery = ref('')
const filterMode = ref<'all' | 'ungrouped' | 'parents' | 'variants'>('all')

// Edit group modal state
const showEditGroupModal = ref(false)
const editingGroup = ref<any>(null)
const editingGroupProducts = ref<any[]>([]) // Store all products in the group
const editGroupForm = ref({
  title: '',
  description: '',
  parent_product_id: '', // Selected parent product ID
})
const isSavingGroup = ref(false)

// Collapse state for groups - track expanded groups by parent product ID
const expandedGroups = ref<Set<string>>(new Set())

// Helper function to remove affiliate tags from Amazon URLs
const stripAffiliateTag = (url: string) => {
  if (!url) return url
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete('tag')
    return urlObj.toString()
  } catch {
    return url
  }
}

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value

  // Apply mode filter
  if (filterMode.value === 'ungrouped') {
    filtered = filtered.filter(p => !p.custom_parent_id && p.variant_count === 0)
  } else if (filterMode.value === 'parents') {
    filtered = filtered.filter(p => !p.custom_parent_id && p.variant_count > 0)
  } else if (filterMode.value === 'variants') {
    filtered = filtered.filter(p => p.custom_parent_id)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.asin.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Organize products into groups with their variants
const productGroups = computed(() => {
  const filtered = filteredProducts.value
  const groups: any[] = []
  const processedIds = new Set<string>()

  // First pass: Add parents with their variants
  filtered.forEach(product => {
    if (!product.custom_parent_id && !processedIds.has(product.id)) {
      const variants = products.value.filter(p => p.custom_parent_id === product.id)
      
      groups.push({
        parent: product,
        variants: variants,
        isGroup: variants.length > 0
      })
      
      processedIds.add(product.id)
      variants.forEach(v => processedIds.add(v.id))
    }
  })

  // Second pass: Add standalone variants (if filtering shows them but not their parent)
  filtered.forEach(product => {
    if (product.custom_parent_id && !processedIds.has(product.id)) {
      groups.push({
        parent: product,
        variants: [],
        isGroup: false
      })
      processedIds.add(product.id)
    }
  })

  return groups
})

const selectedProductsList = computed(() => {
  return products.value.filter(p => selectedProducts.value.has(p.id))
})

const canCreateGroup = computed(() => {
  return selectedProducts.value.size >= 2 && 
         selectedProductsList.value.every(p => !p.custom_parent_id)
})

// Check if we can add to an existing group
const canAddToGroup = computed(() => {
  const selected = selectedProductsList.value
  
  // Need at least 2 products selected
  if (selected.length < 2) return false
  
  // Find parent products (products with variants/group)
  const parents = selected.filter(p => !p.custom_parent_id && p.variant_count > 0)
  
  // Find ungrouped products
  const ungrouped = selected.filter(p => !p.custom_parent_id && p.variant_count === 0)
  
  // Can add to group if: exactly 1 parent + at least 1 ungrouped product
  return parents.length === 1 && ungrouped.length >= 1
})

const selectedParentForAddition = computed(() => {
  if (!canAddToGroup.value) return null
  return selectedProductsList.value.find(p => !p.custom_parent_id && p.variant_count > 0)
})

// Toggle group expansion
const toggleGroupExpansion = (parentId: string) => {
  if (expandedGroups.value.has(parentId)) {
    expandedGroups.value.delete(parentId)
  } else {
    expandedGroups.value.add(parentId)
  }
}

// Check if group is expanded
const isGroupExpanded = (parentId: string) => {
  return expandedGroups.value.has(parentId)
}

// Expand all groups
const expandAll = () => {
  productGroups.value.forEach(group => {
    if (group.isGroup) {
      expandedGroups.value.add(group.parent.id)
    }
  })
}

// Collapse all groups
const collapseAll = () => {
  expandedGroups.value.clear()
}

// Load products with variant counts
const loadProducts = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch<{ products: any[] }>('/api/admin/products/groups', {
      query: {
        marketplace: selectedMarketplace.value,
      },
    })

    products.value = response.products
  } catch (err: any) {
    console.error('Failed to load products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    isLoading.value = false
  }
}

// Toggle product selection
const toggleSelection = (productId: string) => {
  if (selectedProducts.value.has(productId)) {
    selectedProducts.value.delete(productId)
  } else {
    selectedProducts.value.add(productId)
  }
}

// Select all filtered products
const selectAll = () => {
  filteredProducts.value.forEach(p => {
    if (!p.custom_parent_id) { // Only select ungrouped products
      selectedProducts.value.add(p.id)
    }
  })
}

// Clear selection
const clearSelection = () => {
  selectedProducts.value.clear()
}

// Open group modal
const openGroupModal = () => {
  if (canCreateGroup.value) {
    // Default to first product as parent
    selectedParentId.value = selectedProductsList.value[0].id
    showGroupModal.value = true
  }
}

// Create product group
const createGroup = async () => {
  if (!selectedParentId.value || selectedProducts.value.size < 2) return

  isGrouping.value = true

  try {
    await $fetch('/api/admin/products/groups', {
      method: 'PATCH',
      body: {
        parentId: selectedParentId.value,
        variantIds: Array.from(selectedProducts.value).filter(id => id !== selectedParentId.value),
      },
    })

    // Reload products
    await loadProducts()
    
    // Reset state
    selectedProducts.value.clear()
    showGroupModal.value = false
    selectedParentId.value = ''
  } catch (err: any) {
    console.error('Failed to create group:', err)
    alert(`Failed to create group: ${err.message}`)
  } finally {
    isGrouping.value = false
  }
}

// Add products to existing group
const addToGroup = async () => {
  if (!canAddToGroup.value || !selectedParentForAddition.value) return

  const parent = selectedParentForAddition.value
  const ungroupedProducts = selectedProductsList.value.filter(
    p => !p.custom_parent_id && p.variant_count === 0
  )

  if (!confirm(`Add ${ungroupedProducts.length} product(s) to the group "${parent.title}"?`)) return

  isGrouping.value = true

  try {
    await $fetch('/api/admin/products/groups', {
      method: 'PATCH',
      body: {
        parentId: parent.id,
        variantIds: ungroupedProducts.map(p => p.id),
      },
    })

    // Reload products
    await loadProducts()
    
    // Reset state
    selectedProducts.value.clear()
  } catch (err: any) {
    console.error('Failed to add to group:', err)
    alert(`Failed to add to group: ${err.message}`)
  } finally {
    isGrouping.value = false
  }
}

// Ungroup variant
const ungroupVariant = async (variantId: string) => {
  if (!confirm('Are you sure you want to remove this product from its group?')) return

  try {
    await $fetch(`/api/admin/products/${variantId}/ungroup`, {
      method: 'PATCH',
    })

    await loadProducts()
  } catch (err: any) {
    console.error('Failed to ungroup:', err)
    alert(`Failed to ungroup: ${err.message}`)
  }
}

// Ungroup all variants of a parent
const ungroupAll = async (parentId: string) => {
  if (!confirm('Are you sure you want to ungroup all variants? This will make them standalone products again.')) return

  try {
    await $fetch(`/api/admin/products/${parentId}/ungroup-all`, {
      method: 'PATCH',
    })

    await loadProducts()
  } catch (err: any) {
    console.error('Failed to ungroup all:', err)
    alert(`Failed to ungroup all: ${err.message}`)
  }
}

// Open edit group modal
const openEditGroupModal = (parentProduct: any) => {
  if (!parentProduct.group) {
    alert('This product group does not have group information yet.')
    return
  }

  editingGroup.value = parentProduct.group
  
  // Get all products in this group (including the parent)
  const groupProducts = products.value.filter(p => p.group?.id === parentProduct.group.id)
  editingGroupProducts.value = groupProducts
  
  editGroupForm.value = {
    title: parentProduct.group.title || parentProduct.title,
    description: parentProduct.group.description || '',
    parent_product_id: '', // No parent change by default
  }
  showEditGroupModal.value = true
}

// Save group edits
const saveGroupEdits = async () => {
  if (!editingGroup.value) return

  isSavingGroup.value = true

  try {
    const body: any = {
      title: editGroupForm.value.title,
      description: editGroupForm.value.description || null,
    }
    
    // If a parent product is selected, include it in the request
    if (editGroupForm.value.parent_product_id) {
      body.parent_product_id = editGroupForm.value.parent_product_id
    }
    
    await $fetch(`/api/admin/groups/${editingGroup.value.id}`, {
      method: 'PATCH',
      body,
    })

    // Reload products to show updated group info
    await loadProducts()
    
    // Close modal
    showEditGroupModal.value = false
    editingGroup.value = null
    editingGroupProducts.value = []
  } catch (err: any) {
    console.error('Failed to save group:', err)
    alert(`Failed to save group: ${err.message}`)
  } finally {
    isSavingGroup.value = false
  }
}

// Watch marketplace changes
watch(selectedMarketplace, () => {
  loadProducts()
})

// Load on mount
onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="rounded-2xl bg-linear-to-r from-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl shadow-purple-500/20 dark:shadow-purple-500/10">
      <div class="flex items-center gap-3">
        <svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <div>
          <h2 class="text-xl sm:text-2xl font-bold">Product Groups & Variants</h2>
          <p class="text-sm sm:text-base text-purple-100 dark:text-purple-200">Group duplicate products from different vendors</p>
        </div>
      </div>
    </div>

    <!-- Selection Actions Bar -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="selectedProducts.size > 0" class="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {{ selectedProducts.size }} product{{ selectedProducts.size === 1 ? '' : 's' }} selected
            </span>
            <button
              @click="clearSelection"
              class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            >
              Clear
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <!-- Add to Group button - only show when 1 parent + ungrouped products selected -->
            <button
              v-if="canAddToGroup"
              @click="addToGroup"
              :disabled="isGrouping"
              class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add to "{{ selectedParentForAddition?.title?.substring(0, 30) }}{{ selectedParentForAddition?.title?.length > 30 ? '...' : '' }}"
            </button>
            <!-- Create Group button - only show when all ungrouped products selected -->
            <button
              v-if="!canAddToGroup"
              @click="openGroupModal"
              :disabled="!canCreateGroup"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Group Selected Products
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Filters and Search -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
          />
        </div>

        <!-- Filter Mode -->
        <select
          v-model="filterMode"
          class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
        >
          <option value="all">All Products</option>
          <option value="ungrouped">Ungrouped Only</option>
          <option value="parents">Parent Products</option>
          <option value="variants">Variants Only</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="expandAll"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Expand All
        </button>
        <button
          @click="collapseAll"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" transform="rotate(90 12 12)" />
          </svg>
          Collapse All
        </button>
        <button
          @click="selectAll"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Select All
        </button>
        <button
          @click="loadProducts"
          :disabled="isLoading"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && products.length === 0" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-medium text-red-900 dark:text-red-200">Error loading products</p>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Products Grid - Grouped Display -->
    <div v-else-if="productGroups.length > 0" class="space-y-4">
      <!-- Each product group (parent with variants) or standalone product -->
      <div
        v-for="group in productGroups"
        :key="group.parent.id"
        class="rounded-2xl border transition-all overflow-hidden"
        :class="{
          'border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20': group.isGroup,
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': !group.isGroup && selectedProducts.has(group.parent.id),
          'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg': !group.isGroup && !selectedProducts.has(group.parent.id)
        }"
      >
        <!-- Parent Product Card -->
        <div class="p-4">
          <div class="flex gap-4">
            <!-- Checkbox -->
            <label class="flex items-start pt-1 cursor-pointer">
              <input
                type="checkbox"
                :checked="selectedProducts.has(group.parent.id)"
                @change="toggleSelection(group.parent.id)"
                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              />
            </label>

            <!-- Product Image -->
            <div class="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <img
                v-if="group.parent.images?.primary?.large?.url || group.parent.images?.primary?.medium?.url || group.parent.images?.primary?.small?.url"
                :src="group.parent.images?.primary?.large?.url || group.parent.images?.primary?.medium?.url || group.parent.images?.primary?.small?.url"
                :alt="group.parent.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {{ group.parent.group?.title || group.parent.title }}
                </h3>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                  <a
                    v-if="group.parent.detail_page_url"
                    :href="stripAffiliateTag(group.parent.detail_page_url)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                    :title="`Open ${group.parent.asin} on Amazon`"
                  >
                    {{ group.parent.asin }}
                  </a>
                  <span v-else class="text-xs font-mono text-gray-400 dark:text-gray-500">{{ group.parent.asin }}</span>
                  <span
                    v-if="group.isGroup"
                    class="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {{ group.variants.length + 1 }} variant{{ group.variants.length + 1 === 1 ? '' : 's' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span v-if="group.parent.brand">{{ group.parent.brand }}</span>
                <span v-if="group.parent.brand && group.parent.current_price">•</span>
                <span v-if="group.parent.current_price" class="font-semibold text-gray-900 dark:text-white">
                  ${{ group.parent.current_price }}
                </span>
                <span v-if="(group.parent.brand || group.parent.current_price) && group.parent.status">•</span>
                <span 
                  v-if="group.parent.status"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': group.parent.status === 'active',
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300': group.parent.status === 'draft',
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300': group.parent.status === 'unavailable'
                  }"
                >
                  {{ group.parent.status }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 flex-wrap">
                <!-- Collapse/Expand button for groups -->
                <button
                  v-if="group.isGroup"
                  @click="toggleGroupExpansion(group.parent.id)"
                  class="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="h-3 w-3 transition-transform" :class="{ 'rotate-180': isGroupExpanded(group.parent.id) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  {{ isGroupExpanded(group.parent.id) ? 'Collapse' : 'Expand' }}
                </button>
                <NuxtLink
                  :to="`/admin/products/${group.parent.id}/edit`"
                  class="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </NuxtLink>
                <button
                  v-if="group.isGroup && group.parent.group"
                  @click="openEditGroupModal(group.parent)"
                  class="inline-flex items-center justify-center gap-1 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 transition-all hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Group
                </button>
                <button
                  v-if="group.isGroup"
                  @click="ungroupAll(group.parent.id)"
                  class="inline-flex items-center justify-center gap-1 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/30"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Ungroup All
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Variants Section - Collapsible -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[2000px]"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 max-h-[2000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="group.isGroup && group.variants.length > 0 && isGroupExpanded(group.parent.id)" class="border-t border-purple-200 dark:border-purple-700/50 bg-white/50 dark:bg-gray-900/30 p-4 overflow-hidden">
            <h4 class="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-3">
              Variants ({{ group.variants.length }})
            </h4>
            <div class="space-y-2">
              <!-- Variant Card -->
              <div
                v-for="variant in group.variants"
                :key="variant.id"
                class="rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-800 p-3 transition-all hover:shadow-md"
              >
              <div class="flex gap-3">
                <!-- Variant Image -->
                <div class="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="variant.images?.primary?.small?.url || variant.images?.primary?.medium?.url || variant.images?.primary?.large?.url"
                    :src="variant.images?.primary?.small?.url || variant.images?.primary?.medium?.url || variant.images?.primary?.large?.url"
                    :alt="variant.title"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Variant Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {{ variant.title }}
                    </h5>
                    <a
                      v-if="variant.detail_page_url"
                      :href="stripAffiliateTag(variant.detail_page_url)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors shrink-0"
                      :title="`Open ${variant.asin} on Amazon`"
                    >
                      {{ variant.asin }}
                    </a>
                    <span v-else class="text-xs font-mono text-gray-400 dark:text-gray-500 shrink-0">{{ variant.asin }}</span>
                  </div>

                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span v-if="variant.brand">{{ variant.brand }}</span>
                    <span v-if="variant.brand && variant.current_price">•</span>
                    <span v-if="variant.current_price" class="font-semibold text-gray-900 dark:text-white">
                      ${{ variant.current_price }}
                    </span>
                    <span v-if="(variant.brand || variant.current_price) && variant.status">•</span>
                    <span 
                      v-if="variant.status"
                      class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      :class="{
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': variant.status === 'active',
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300': variant.status === 'draft',
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300': variant.status === 'unavailable'
                      }"
                    >
                      {{ variant.status }}
                    </span>
                  </div>

                  <!-- Variant Actions -->
                  <div class="flex gap-2 flex-wrap">
                    <!-- Open in Amazon for variant -->
                    <a
                      v-if="variant.detail_page_url"
                      :href="stripAffiliateTag(variant.detail_page_url)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-1 rounded-md border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Amazon
                    </a>
                    <NuxtLink
                      :to="`/admin/products/${variant.id}/edit`"
                      class="inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </NuxtLink>
                    <button
                      @click="ungroupVariant(variant.id)"
                      class="inline-flex items-center justify-center gap-1 rounded-md border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ungroup
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No products found</h3>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ searchQuery || filterMode !== 'all' ? 'Try adjusting your filters' : 'Import some products to get started' }}
      </p>
    </div>

    <!-- Group Modal -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showGroupModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showGroupModal = false"
      >
        <div class="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 z-10">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create Product Group</h2>
              <button
                @click="showGroupModal = false"
                class="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select which product should be the parent (main) product. Others will become variants.
            </p>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <div
              v-for="product in selectedProductsList"
              :key="product.id"
              class="rounded-lg border transition-all cursor-pointer"
              :class="{
                'border-purple-500 bg-purple-50 dark:bg-purple-900/20': selectedParentId === product.id,
                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300': selectedParentId !== product.id
              }"
              @click="selectedParentId = product.id"
            >
              <div class="p-4 flex items-start gap-4">
                <input
                  type="radio"
                  :value="product.id"
                  v-model="selectedParentId"
                  class="mt-1 h-4 w-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-start gap-3">
                    <img
                      v-if="product.images?.primary?.small?.url || product.images?.primary?.medium?.url || product.images?.primary?.large?.url"
                      :src="product.images?.primary?.small?.url || product.images?.primary?.medium?.url || product.images?.primary?.large?.url"
                      :alt="product.title"
                      class="h-16 w-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {{ product.title }}
                      </h3>
                      <div class="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span class="font-mono">{{ product.asin }}</span>
                        <span v-if="product.brand">• {{ product.brand }}</span>
                        <span v-if="product.current_price" class="font-semibold text-gray-900 dark:text-white">
                          • ${{ product.current_price }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-end gap-3">
            <button
              @click="showGroupModal = false"
              :disabled="isGrouping"
              class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="createGroup"
              :disabled="isGrouping || !selectedParentId"
              class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isGrouping" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isGrouping ? 'Creating Group...' : 'Create Group' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Group Modal -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showEditGroupModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showEditGroupModal = false"
      >
        <div class="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
          <!-- Modal Header -->
          <div class="border-b border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Edit Group</h2>
              <button
                @click="showEditGroupModal = false"
                class="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Customize the group title and description
            </p>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <!-- Parent Product Selector -->
            <div v-if="editingGroupProducts.length > 1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Representative Product (Optional)
              </label>
              <select
                v-model="editGroupForm.parent_product_id"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 outline-none transition-all"
              >
                <option value="">Keep current parent</option>
                <option 
                  v-for="product in editingGroupProducts" 
                  :key="product.id" 
                  :value="product.id"
                >
                  {{ product.title.substring(0, 60) }}{{ product.title.length > 60 ? '...' : '' }} ({{ product.asin }})
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select a product to use its title, images, and description as the group representative
              </p>
            </div>
            
            <!-- Group Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Title
              </label>
              <input
                v-model="editGroupForm.title"
                type="text"
                placeholder="Enter group title..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 outline-none transition-all"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This title will be displayed on the variants comparison page
              </p>
            </div>

            <!-- Group Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                v-model="editGroupForm.description"
                rows="3"
                placeholder="Enter group description..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 outline-none transition-all"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-end gap-3">
            <button
              @click="showEditGroupModal = false"
              :disabled="isSavingGroup"
              class="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="saveGroupEdits"
              :disabled="isSavingGroup || !editGroupForm.title.trim()"
              class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isSavingGroup" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSavingGroup ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

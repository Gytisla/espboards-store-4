<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231',
    change: '+12.5%',
    trend: 'up',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    name: 'Total Orders',
    value: '1,234',
    change: '+8.3%',
    trend: 'up',
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  },
  {
    name: 'Total Products',
    value: '142',
    change: '+3',
    trend: 'up',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    name: 'Active Customers',
    value: '892',
    change: '-2.4%',
    trend: 'down',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
]

const recentOrders = [
  { id: '#1234', customer: 'John Doe', product: 'ESP32-S3 DevKit', amount: '$45.00', status: 'completed', date: '2 min ago' },
  { id: '#1233', customer: 'Jane Smith', product: 'ESP32-C3 Mini', amount: '$32.50', status: 'processing', date: '15 min ago' },
  { id: '#1232', customer: 'Bob Johnson', product: 'Temperature Sensor', amount: '$12.99', status: 'pending', date: '1 hour ago' },
  { id: '#1231', customer: 'Alice Williams', product: 'OLED Display', amount: '$28.00', status: 'completed', date: '2 hours ago' },
  { id: '#1230', customer: 'Charlie Brown', product: 'Power Module', amount: '$15.99', status: 'completed', date: '3 hours ago' },
]

const topProducts = [
  { name: 'ESP32-S3 DevKit', sales: 145, revenue: '$6,525', trend: 'up' },
  { name: 'ESP32-C3 Mini', sales: 98, revenue: '$3,185', trend: 'up' },
  { name: 'Temperature Sensor DHT22', sales: 87, revenue: '$1,130', trend: 'down' },
  { name: 'OLED Display 128x64', sales: 76, revenue: '$2,128', trend: 'up' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="rounded-2xl bg-linear-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl shadow-blue-500/20">
      <h2 class="mb-2 text-2xl font-bold">Welcome back, Admin! 👋</h2>
      <p class="text-blue-100">Here's what's happening with your store today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
      >
        <div class="flex items-start justify-between">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-purple-50">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
            </svg>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ stat.change }}
          </span>
        </div>
        <div class="mt-4">
          <h3 class="text-sm font-medium text-gray-600">{{ stat.name }}</h3>
          <p class="mt-1 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Recent Orders -->
      <div class="rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <NuxtLink to="/admin/orders" class="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all →
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Order</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Product</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="order in recentOrders" :key="order.id" class="transition-colors hover:bg-gray-50">
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="font-medium text-gray-900">{{ order.id }}</span>
                  <span class="block text-xs text-gray-500">{{ order.date }}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{{ order.customer }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ order.product }}</td>
                <td class="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">{{ order.amount }}</td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-700': order.status === 'completed',
                      'bg-blue-100 text-blue-700': order.status === 'processing',
                      'bg-yellow-100 text-yellow-700': order.status === 'pending',
                    }"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Products -->
      <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-semibold text-gray-900">Top Products</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.name"
              class="flex items-center gap-4"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-purple-50 font-bold text-blue-600">
                {{ index + 1 }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900">{{ product.name }}</p>
                <div class="mt-1 flex items-center gap-2 text-xs text-gray-600">
                  <span>{{ product.sales }} sales</span>
                  <span class="text-gray-400">•</span>
                  <span class="font-semibold text-gray-900">{{ product.revenue }}</span>
                </div>
              </div>
              <div
                class="shrink-0"
                :class="product.trend === 'up' ? 'text-green-600' : 'text-red-600'"
              >
                <svg v-if="product.trend === 'up'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

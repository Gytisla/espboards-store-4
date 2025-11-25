<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const { user, signIn, initialize } = useAuth()

// Theme management
const { theme, cycleTheme } = useTheme()

// Redirect if already logged in
onMounted(async () => {
  await initialize()
  if (user.value) {
    await navigateTo('/admin')
  }
})

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await signIn(email.value, password.value)
    await navigateTo('/admin')
  } catch (err: any) {
    error.value = err.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-white dark:bg-gray-900">
    <!-- Theme Toggle Button -->
    <button
      @click="cycleTheme"
      class="fixed right-4 top-4 z-50 rounded-lg bg-white p-2.5 shadow-lg ring-1 ring-gray-900/10 transition-all hover:shadow-xl dark:bg-gray-800 dark:ring-white/10"
      aria-label="Toggle theme"
    >
      <!-- Sun Icon (Light Mode) -->
      <svg v-if="theme === 'light'" class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- Moon Icon (Dark Mode) -->
      <svg v-else-if="theme === 'dark'" class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <!-- Monitor Icon (System Mode) -->
      <svg v-else class="h-5 w-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </button>

    <!-- Left Side - Login Form -->
    <div class="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm">
        <!-- Logo -->
        <div class="mb-8">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-500/30 dark:shadow-blue-500/20">
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">ESPBoards Admin</span>
          </div>
        </div>

        <!-- Title -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your admin account to continue
          </p>
        </div>

        <!-- Error Alert -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="error"
            class="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4"
          >
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-red-900 dark:text-red-300">Authentication Error</h3>
                <p class="mt-1 text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
              <button
                @click="error = ''"
                class="shrink-0 text-red-600 dark:text-red-400 transition-colors hover:text-red-700 dark:hover:text-red-300"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-900 dark:text-white">
              Email Address
            </label>
            <div class="relative mt-2">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-12 pr-4 text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-900 dark:text-white">
              Password
            </label>
            <div class="relative mt-2">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 pl-12 pr-12 text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 dark:bg-gray-700"
              />
              <label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <button type="button" class="text-sm font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-300">
              Forgot password?
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/30 dark:shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-blue-500/40 dark:hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-xl"
          >
            <svg
              v-if="loading"
              class="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Footer Link -->
        <div class="mt-8 text-center">
          <NuxtLink to="/" class="text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white">
            ← Back to store
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Right Side - Gradient Background with Pattern -->
    <div class="relative hidden lg:block lg:w-1/2">
      <div class="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-blue-700 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900">
        <!-- Decorative Pattern -->
        <div class="absolute inset-0 opacity-10 dark:opacity-5">
          <div class="absolute left-0 top-0 h-full w-full" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        </div>

        <!-- Content -->
        <div class="relative flex h-full flex-col justify-between p-12">
          <!-- Top Quote -->
          <div>
            <svg class="h-12 w-12 text-white/30 dark:text-white/20" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <blockquote class="mt-6 text-2xl font-semibold leading-relaxed text-white">
              Manage your ESPBoards Store with ease. Track orders, update products, and grow your business all in one place.
            </blockquote>
          </div>

          <!-- Bottom Stats -->
          <div class="grid grid-cols-3 gap-8">
            <div>
              <div class="text-4xl font-bold text-white">10k+</div>
              <div class="mt-1 text-sm text-blue-200 dark:text-blue-300">Orders Processed</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-white">142</div>
              <div class="mt-1 text-sm text-blue-200 dark:text-blue-300">Products Listed</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-white">4.9</div>
              <div class="mt-1 text-sm text-blue-200 dark:text-blue-300">Store Rating</div>
            </div>
          </div>
        </div>

        <!-- Decorative Blobs -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 dark:bg-white/5 blur-3xl"></div>
          <div class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 dark:bg-white/5 blur-3xl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

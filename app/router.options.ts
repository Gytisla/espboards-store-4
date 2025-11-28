import type { RouterConfig } from '@nuxt/schema'
import { createWebHistory } from 'vue-router'

export default {
  history: () => createWebHistory('/store/')
} satisfies RouterConfig

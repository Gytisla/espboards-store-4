import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const theme = ref<Theme>('system')
  const isDark = ref(false)

  const updateTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    
    if (theme.value === 'dark') {
      root.classList.add('dark')
      isDark.value = true
    } else if (theme.value === 'light') {
      root.classList.remove('dark')
      isDark.value = false
    }
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    if (nextTheme) {
      updateTheme(nextTheme)
    }
  }

  onMounted(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      theme.value = savedTheme
    }
    
    applyTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  watch(theme, applyTheme)

  return {
    theme,
    isDark,
    updateTheme,
    cycleTheme
  }
}

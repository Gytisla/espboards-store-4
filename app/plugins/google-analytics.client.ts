export default defineNuxtPlugin(() => {
  const route = useRoute()
  const router = useRouter()

  // Check if GA should be disabled via query param
  const checkGAStatus = () => {
    const disableGA = route.query.disableGA
    
    if (disableGA === 'true') {
      // Disable GA and store in localStorage
      localStorage.setItem('disableGA', 'true')
      return true
    } else if (disableGA === 'false') {
      // Enable GA and remove from localStorage
      localStorage.removeItem('disableGA')
      return false
    }
    
    // Check localStorage for persistent setting
    return localStorage.getItem('disableGA') === 'true'
  }

  // Initialize GA if not disabled
  const initGA = () => {
    if (checkGAStatus()) {
      console.log('Google Analytics disabled by user')
      return
    }

    // Load gtag.js
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-5SD44L3D4Q'
    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', 'G-5SD44L3D4Q')

    // Make gtag available globally
    window.gtag = gtag
  }

  // Initialize on mount
  initGA()

  // Re-check on route changes (in case query param changes)
  router.afterEach(() => {
    const shouldDisable = checkGAStatus()
    
    if (shouldDisable && window.gtag) {
      // If GA was enabled but now should be disabled, log it
      console.log('Google Analytics disabled by user')
      // Note: Can't fully remove GA once loaded, but won't track new events
    } else if (!shouldDisable && !window.gtag) {
      // If GA was disabled but now should be enabled, initialize it
      initGA()
    }
  })
})

// Type declaration for gtag
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

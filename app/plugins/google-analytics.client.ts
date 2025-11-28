// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default defineNuxtPlugin(() => {
  // Skip analytics in development
  if (process.dev) {
    console.log('Analytics disabled in development mode')
    return
  }

  // Simple Google tag (gtag.js) insertion
  const GA_ID = 'G-5SD44L3D4Q'

  // Helper: safe localStorage read
  const safeGet = (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      return null
    }
  }

  // If URL contains ?disableGA=true, persist the preference and skip injection
  try {
    const params = new URLSearchParams(window.location.search)
    const disableParam = params.get('disableGA')

    // Explicit enable param (?disableGA=false)
    if (disableParam === 'false') {
      try {
        localStorage.removeItem('analytics_disabled')
      } catch (e) {
        // ignore
      }
      console.log('Google Analytics re-enabled via URL param')
      // continue to inject
    }

    if (disableParam === 'true') {
      try {
        localStorage.setItem('analytics_disabled', '1')
      } catch (e) {
        // ignore storage errors
      }
      console.log('Google Analytics disabled via URL param')
      return
    }
  } catch (e) {
    // ignore URL parsing errors
  }

  // Respect the explicit analytics_disabled flag in localStorage
  try {
    if (safeGet('analytics_disabled') === '1') {
      console.log('Google Analytics disabled via localStorage flag')
      return
    }
  } catch (e) {
    // ignore
  }

  // Inject GA script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  const inline = document.createElement('script')
  inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`
  document.head.appendChild(inline)
})


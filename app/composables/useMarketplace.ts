/**
 * Marketplace Composable
 * Provides shared marketplace state and functionality across the app
 * Persists marketplace selection to localStorage
 */

export type MarketplaceCode = 'US' | 'DE'

export interface Marketplace {
  code: MarketplaceCode
  name: string
  flag: string
  currency: string
  domain: string
}

export const MARKETPLACES: Record<MarketplaceCode, Marketplace> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    domain: 'amazon.com',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    domain: 'amazon.de',
  },
}

const STORAGE_KEY = 'espboards-marketplace'

export const useMarketplace = () => {
  // Reactive state for selected marketplace
  const selectedMarketplace = useState<MarketplaceCode>('marketplace', () => {
    // Try to load from localStorage (client-side only)
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && (stored === 'US' || stored === 'DE')) {
        return stored as MarketplaceCode
      }
    }
    // Default to US
    return 'US'
  })

  // Get marketplace details
  const marketplace = computed(() => MARKETPLACES[selectedMarketplace.value])

  // Set marketplace and persist to localStorage
  const setMarketplace = (code: MarketplaceCode) => {
    selectedMarketplace.value = code
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, code)
    }
  }

  // Toggle between marketplaces
  const toggleMarketplace = () => {
    const newMarketplace = selectedMarketplace.value === 'US' ? 'DE' : 'US'
    setMarketplace(newMarketplace)
  }

  return {
    selectedMarketplace: readonly(selectedMarketplace),
    marketplace,
    marketplaces: MARKETPLACES,
    setMarketplace,
    toggleMarketplace,
  }
}

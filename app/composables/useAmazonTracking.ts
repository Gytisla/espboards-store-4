/**
 * Composable for tracking Amazon affiliate link clicks
 * 
 * Usage:
 * const { trackAmazonClick } = useAmazonTracking()
 * await trackAmazonClick(product, amazonUrl)
 */
export const useAmazonTracking = () => {
  /**
   * Track an Amazon affiliate click
   * Fire-and-forget pattern - doesn't block user navigation
   */
  const trackAmazonClick = async (
    product: {
      id?: string
      asin: string
      slug: string
      marketplace?: { code: string }
    },
    amazonUrl: string
  ) => {
    try {
      // Fire and forget - don't wait for response
      $fetch('/api/track/amazon-click', {
        method: 'POST',
        body: {
          productId: product.id,
          productAsin: product.asin,
          productSlug: product.slug,
          marketplaceCode: product.marketplace?.code || 'US',
        },
      }).catch((error) => {
        // Silently fail - don't block user
        console.warn('Failed to track Amazon click:', error)
      })
    } catch (error) {
      // Silently fail - tracking should never block the user
      console.warn('Error tracking Amazon click:', error)
    }
  }

  return {
    trackAmazonClick,
  }
}

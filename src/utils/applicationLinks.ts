/**
 * Helper function to generate application filter URL for products page
 * 
 * @param applicationKey - Application key (e.g., 'air-curtain', 'jet-fan', 'hrv', 'parking')
 * @returns URL string with application filter and hash anchor
 * 
 * Usage:
 * ```tsx
 * <Link to={getApplicationProductsUrl('air-curtain')}>View Products</Link>
 * // Returns: '/products?application=air-curtain#applications'
 * ```
 */
export function getApplicationProductsUrl(applicationKey: string): string {
    return `/products?application=${applicationKey}#applications`
}

/**
 * Topic to application key mapping
 * Maps knowledge center topic slugs to their corresponding application keys
 */
export const TOPIC_TO_APP_KEY: Record<string, string> = {
    'hava-perdesi': 'air-curtain',
    'jet-fan': 'jet-fan',
    'hrv': 'hrv'
    // Add new mappings here as topics are created
}

/**
 * Get products URL from topic slug
 * 
 * @param topicSlug - Knowledge center topic slug (e.g., 'hava-perdesi')
 * @returns Products page URL with application filter
 */
export function getProductsUrlFromTopic(topicSlug: string): string {
    const appKey = TOPIC_TO_APP_KEY[topicSlug]
    return appKey ? getApplicationProductsUrl(appKey) : '/products#applications'
}

import { CATEGORY_REGISTRY, getCategoryUrl } from '../config/categoryRegistry'

/**
 * Helper function to generate application filter URL for products page
 * 
 * @param applicationKey - Application key (e.g., 'air-curtain', 'jet-fan', 'hrv', 'parking')
 * @returns URL string with application filter and hash anchor
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
}

/**
 * Topic to Category URL mapping
 * Maps topics directly to the definitive Category Registry paths
 */
export const TOPIC_TO_CATEGORY_URL: Record<string, string> = {
    'hava-perdesi': getCategoryUrl('HAVA_PERDELERI'),
    'jet-fan': getCategoryUrl('FANLAR', CATEGORY_REGISTRY.FANLAR.subs.OTOPARK_JET),
    'hrv': getCategoryUrl('ISI_GERI_KAZANIM')
}

/**
 * Get category URL from topic slug (RECOMMENDED for better UX)
 * Directly navigates to product category page using the Registry
 * 
 * @param topicSlug - Knowledge center topic slug (e.g., 'hava-perdesi')
 * @returns Full Category page URL
 */
export function getCategoryUrlFromTopic(topicSlug: string): string {
    return TOPIC_TO_CATEGORY_URL[topicSlug] || '/products'
}

/**
 * Legacy: Get products URL from topic slug (shows application cards)
 */
export function getProductsUrlFromTopic(topicSlug: string): string {
    const appKey = TOPIC_TO_APP_KEY[topicSlug]
    return appKey ? getApplicationProductsUrl(appKey) : '/products#applications'
}

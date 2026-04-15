
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
    'hava-perdesi': '/category/air-curtains',
    'jet-fan': '/category/jet-fans',
    'hrv': '/category/heat-recovery-units'
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




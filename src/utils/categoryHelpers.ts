import type { Category } from '../lib/supabase'
import { STATIC_CATEGORY_METADATA } from '../config/categoryMetadata'

/**
 * Returns the display name for a category.
 * Prioritizes the 'hero_title' from static metadata configuration (SSOT).
 * If not present, falls back to the database name.
 */
export const getCategoryDisplayName = (category: Category | null | undefined): string => {
    if (!category) return ''
    if (STATIC_CATEGORY_METADATA[category.slug]?.hero_title) {
        return STATIC_CATEGORY_METADATA[category.slug].hero_title!
    }
    return typeof category.name === 'string' ? category.name : ''
}

/**
 * Returns the description for a category.
 * Prioritizes 'hero_description' from static metadata.
 */
export const getCategoryDescription = (category: Category | null | undefined): string => {
    if (!category) return ''
    if (STATIC_CATEGORY_METADATA[category.slug]?.hero_description) {
        return STATIC_CATEGORY_METADATA[category.slug].hero_description!
    }
    return typeof category.description === 'string' ? category.description : ''
}

/**
 * Safely parses a price string or number to a number.
 * Deprecated: Prices are now handled as numeric in the database layer.
 */
export const parsePriceToNumber = (val: any): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
        const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
    }
    return 0
}

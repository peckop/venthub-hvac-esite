import type { Category } from '../lib/supabase'
import { STATIC_CATEGORY_METADATA } from '../config/categoryMetadata'

/**
 * Returns the display name for a category.
 * Prioritizes the 'hero_title' from static metadata configuration (SSOT).
 * If not present, falls back to the database name.
 * 
 * This ensures that even if the database has an old name (e.g. cache issues),
 * the UI consistently shows the configured name (e.g. "Exproof Fanlar").
 */
export const getCategoryDisplayName = (category: Category | null | undefined): string => {
    if (!category) return ''

    // 1. Config Override (High Priority)
    // Check if there is a hero_title defined in metadata for this slug
    if (STATIC_CATEGORY_METADATA[category.slug]?.hero_title) {
        return STATIC_CATEGORY_METADATA[category.slug].hero_title!
    }

    // 2. Database Name (Fallback)
    return category.name
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

    return category.description || ''
}




import type { DbCategory, CategoryMetadata } from '../types/db-rows'

/**
 * Returns the display name for a category.
 * Prioritizes the 'hero_title' from database metadata (SSOT).
 * If not present, falls back to the database name.
 */
export const getCategoryDisplayName = (category: DbCategory | null | undefined): string => {
    if (!category) return ''
    
    const meta = category.metadata as CategoryMetadata | null
    if (meta?.hero_title) {
        return meta.hero_title
    }

    return category.name
}

/**
 * Returns the description for a category.
 */
export const getCategoryDescription = (category: DbCategory | null | undefined): string => {
    if (!category) return ''

    const meta = category.metadata as CategoryMetadata | null
    if (meta?.hero_description) {
        return meta.hero_description
    }

    return category.description || ''
}

/**
 * Safely parses a price string or number to a number.
 */
export const parsePriceToNumber = (val: unknown): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
        const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.')
        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
    }
    return 0
}

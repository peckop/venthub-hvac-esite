import type { Category } from '../lib/supabase'

/**
 * Returns the display name for a category.
 * Prioritizes the 'hero_title' from database metadata (SSOT).
 * If not present, falls back to the database name.
 */
export const getCategoryDisplayName = (category: Category | null | undefined): string => {
    if (!category) return ''
    
    const meta = category.metadata as any
    if (meta?.hero_title) {
        return meta.hero_title
    }

    return category.name
}

/**
 * Returns the description for a category.
 */
export const getCategoryDescription = (category: Category | null | undefined): string => {
    if (!category) return ''

    const meta = category.metadata as any
    if (meta?.hero_description) {
        return meta.hero_description
    }

    return category.description || ''
}

/**
 * Safely parses a price string or number to a number.
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

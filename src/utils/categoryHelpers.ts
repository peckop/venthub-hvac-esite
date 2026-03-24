import type { DbCategory } from '../types/db-rows'

/**
 * Returns the raw display name for a category (Data Level).
 * Prioritizes 'menu_label' from database.
 * Falls back to 'name' column.
 */
export const getCategoryDisplayName = (category: DbCategory | null | undefined): string => {
    if (!category) return ''
    
    if (category.menu_label) {
        return category.menu_label
    }

    return category.name
}

/**
 * Returns the rich MARKETING title for a category (Data Level).
 */
export const getCategoryMarketingTitle = (category: DbCategory | null | undefined): string => {
    if (!category) return ''

    if (category.marketing_title) {
        return category.marketing_title
    }

    return getCategoryDisplayName(category)
}

/**
 * Returns the description for a category.
 */
export const getCategoryDescription = (category: DbCategory | null | undefined): string => {
    if (!category) return ''

    const meta = category.metadata
    if (meta?.hero_description) {
        return meta.hero_description as string
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

import type { DbCategory } from '../types/db-rows'

/**
 * Returns the i18n translated display name for a category.
 * ADVANCED SCALE: Prioritizes translation_key over slug.
 */
export const getCategoryDisplayName = (category: DbCategory | null | undefined, t?: (key: string) => string): string => {
    if (!category) return ''
    
    // 1. Try to translate via i18n using translation_key OR slug
    if (t) {
        const tKey = (category as typeof category & { translation_key?: string }).translation_key || category.slug
        const translationPath = `common.categoryList.${tKey}`
        const translated = t(translationPath)
        
        if (translated && translated !== translationPath) {
            return translated
        }
    }

    // 2. Fallback to Menu Label (Manual override from DB)
    if (category.menu_label) {
        return category.menu_label
    }

    // 3. Last resort: Original name
    return category.name
}

/**
 * Returns the rich MARKETING title for a category.
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

import type { DbCategory } from '../types/db-rows'

/**
 * Determines the most appropriate localized display name for a given category.
 * Prioritizes the i18n translation (if a translation function is provided and the key exists),
 * falls back to the database-provided `menu_label`, and finally defaults to the raw `name`.
 *
 * @param category - The database category object to extract the name from
 * @param t - Optional translation function (e.g., from i18next or custom hook)
 * @returns The resolved display name string
 *
 * @example
 * getCategoryDisplayName(category, t) // returns "Aksesuarlar" (translated)
 */
export const getCategoryDisplayName = (category: DbCategory | null | undefined, t?: (key: string) => string): string => {
    if (!category) return ''
    
    // 1. Try to translate via i18n using translation_key OR slug
    if (t) {
        const tKey = category.translation_key || category.slug
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
 * Resolves the marketing-focused title for a category.
 * Returns the dedicated `marketing_title` from the database if available, otherwise falls back to the standard display name.
 *
 * @param category - The database category object
 * @returns The marketing title or fallback display name
 *
 * @example
 * getCategoryMarketingTitle(category) // returns "Premium Havalandırma Çözümleri"
 */
export const getCategoryMarketingTitle = (category: DbCategory | null | undefined): string => {
    if (!category) return ''

    if (category.marketing_title) {
        return category.marketing_title
    }

    return getCategoryDisplayName(category)
}

/**
 * Extracts the primary descriptive text for a category.
 * It first checks the JSON `metadata` for a `hero_description`, falling back to the standard `description` field.
 *
 * @param category - The database category object
 * @returns The resolved description string, or an empty string if none exists
 *
 * @example
 * getCategoryDescription(category) // returns "Endüstriyel mutfaklar için yüksek performanslı..."
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
 * Safely parses an unknown value (typically a string or number) into a numeric price.
 * Handles common string formatting issues like commas, spaces, and currency symbols.
 *
 * @param val - The raw value to parse (e.g., '1.250,50 ₺', 1500)
 * @returns A safe floating-point number, defaulting to 0 if parsing fails
 *
 * @example
 * parsePriceToNumber('1.250,50') // returns 1250.50
 * parsePriceToNumber('invalid') // returns 0
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

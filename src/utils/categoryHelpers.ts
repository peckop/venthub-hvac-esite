import type { DbCategory } from '../types/db-rows'
import type { DomainCategory } from '../types/ui-models'

/**
 * Minimal shape needed to resolve a category URL slug: both `DbCategory` and
 * `DomainCategory` satisfy it, as do raw Supabase rows whose `metadata` is still
 * untyped (e.g. inside `generateStaticParams`).
 */
export type CategorySlugSource = {
    slug: string | null
    metadata?: unknown
}

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
 * Resolves the language-specific (visible) slug of a category.
 *
 * Canonical identity always lives in the `slug` column (English). The localized
 * slugs live in `metadata.slug = { tr, en }` (added by the localized-slug
 * migration). If the migration has NOT been applied yet — or the category has no
 * entry — the canonical slug is returned, so link generation never breaks.
 *
 * @param category - The category (DB row or UI domain model)
 * @param lang - Active language ('tr' | 'en')
 * @returns The slug that should appear in the URL for that language
 *
 * @example
 * getLocalizedCategorySlug(cat, 'tr') // 'banyo-ve-tuvalet-fanlari'
 * getLocalizedCategorySlug(cat, 'en') // 'bathroom-toilet-fans'
 */
export const getLocalizedCategorySlug = (
    category: DbCategory | DomainCategory | CategorySlugSource | null | undefined,
    lang: string
): string => {
    if (!category) return ''

    const canonical = category.slug || ''
    const meta = category.metadata

    if (meta && typeof meta === 'object' && 'slug' in meta) {
        const localized = (meta as { slug?: unknown }).slug
        if (localized && typeof localized === 'object') {
            const key = lang === 'en' ? 'en' : 'tr'
            const value = (localized as Record<string, unknown>)[key]
            if (typeof value === 'string' && value.length > 0) return value
        }
    }

    return canonical
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

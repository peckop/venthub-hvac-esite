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
 * Ad çözümü için gereken EN AZ alan kümesi. `DbCategory`, `DomainCategory` ve
 * `Partial<DbCategory>` (ör. SearchOverlay'in popüler kategori listesi) bunu karşılar.
 *
 * ⭐REC-103: bu tip, çağrı yerinde kaba tip dökümü yazmamak için var. Döküm kuralı
 * sağlamaz, yalnızca derleyiciyi susturur; imzayı gerçekten kullanılan alanlara
 * genişletmek doğrusudur.
 */
export type CategoryNameSource = {
    name?: string | null
    menu_label?: string | null
    translation_key?: string | null
    slug?: string | null
}

/**
 * Determines the most appropriate localized display name for a given category.
 * Prioritizes the i18n translation (if a translation function is provided and the key exists),
 * falls back to the database-provided `menu_label`, and finally defaults to the raw `name`.
 *
 * @param category - The database category object to extract the name from
 * @param t - Sözlük çözücü. ⭐REC-103 UYARISI: imzada opsiyonel ama ATLANMASI KUSURDUR.
 *   `t` verilmezse 1. adım (sözlük) HİÇ çalışmaz ve fonksiyon doğrudan `menu_label` /
 *   `name`'e düşer — ikisi de Türkçedir. 2026-09-01'de canlıda ölçülen kusur buydu:
 *   sözlükte anahtar OLSA BİLE `t`'siz çağrı İngilizce sayfada Türkçe ad basıyordu.
 *   Opsiyonelliği yalnız birim testleri için korunuyor; ürün kodunda daima geçilir.
 *   Kapı: `INV-KATEGORI-ADI-1` (src/__tests__/conformance/kategori-adi-tek-kaynak.test.ts).
 * @returns The resolved display name string
 *
 * @example
 * getCategoryDisplayName(category, t) // returns "Aksesuarlar" (translated)
 */
export const getCategoryDisplayName = (category: CategoryNameSource | DbCategory | null | undefined, t?: (key: string) => string): string => {
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

    // 3. Last resort: Original name (minimal şekilde `name` opsiyonel — yoksa boş dize)
    return category.name ?? ''
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
export const getCategoryMarketingTitle = (
    category: DbCategory | null | undefined,
    t?: (key: string) => string,
): string => {
    if (!category) return ''

    if (category.marketing_title) {
        return category.marketing_title
    }

    // ⭐REC-103: burası `t`'siz çağırıyordu; yani pazarlama başlığı olmayan her kategori
    // bu yoldan TÜRKÇE ad alıyordu. Kapı (INV-KATEGORI-ADI-1) bunu ben listeyi
    // çıkarırken gözden kaçırmışken yakaladı — 12 çağrı sanıyordum, 13'müş.
    // Ürün kodunda bugün çağıran yok (yalnız birim testi), ama imza sızıntıya açıktı.
    return getCategoryDisplayName(category, t)
}

/**
 * Açıklama çözümü için gereken EN AZ alan kümesi. `DbCategory`, `DomainCategory` ve
 * `metadata`'sı henüz tiplenmemiş ham Supabase satırları bunu karşılar.
 */
export type CategoryDescriptionSource = {
    description?: string | null
    metadata?: unknown
}

/**
 * Kategori vitrin paragrafını AKTİF DİLE göre çözer.
 *
 * Çözüm sırası:
 *   1. `metadata.description_i18n[lang]` — dile-bağlı metin (REC-161 ile eklendi)
 *   2. `metadata.hero_description`      — legacy, TEK DİLLİ (Türkçe) hero metni
 *   3. `category.description`           — düz kolon
 *   4. `''`
 *
 * ⭐REC-161 NİÇİN (2026-09-06 ölçümü): bu fonksiyon dile HİÇ bakmıyordu. Kusur o gün
 * GÖRÜNMÜYORDU çünkü canlıda `description` kolonu 37/37 satırda NULL ve `hero_description`
 * yalnız 2 kategoride vardı; yani vitrin sözlük yedeğine düşüyordu. Kusur LATENT'ti:
 * katalog şeridi 23 kategori paragrafını yazdığı an, tek-dilli alana yazılan Türkçe metin
 * İngilizce vitrinde de Türkçe görünecekti.
 *
 * @param lang - Aktif dil. ⭐ZORUNLU (opsiyonel DEĞİL) — bilinçli karar:
 *   aynı dosyadaki `getCategoryDisplayName`'in opsiyonel `t`'si 2026-09-01'de canlıda
 *   tam bu kusuru üretti (çağıran atladı → sessizce Türkçe bastı, REC-103). Kardeş
 *   çözücü `getLocalizedCategorySlug(category, lang)` de `lang`'ı zorunlu alır.
 *   Zorunlu imza ile "çağıran unutur" riskini DERLEYİCİ kapatır (tsc strict = build
 *   hatası); statik tarama kapısı (INV-KATEGORI-ACIKLAMA-1 · K3) ikinci, bağımsız koldur.
 * @returns Dile göre çözülmüş açıklama, yoksa boş dize
 *
 * @example
 * getCategoryDescription(cat, 'tr') // 'Endüstriyel mutfaklar için yüksek performanslı...'
 * getCategoryDescription(cat, 'en') // 'High-performance solutions for industrial kitchens...'
 */
export const getCategoryDescription = (
    category: DbCategory | DomainCategory | CategoryDescriptionSource | null | undefined,
    lang: string
): string => {
    if (!category) return ''

    const meta = category.metadata

    if (meta && typeof meta === 'object') {
        // 1. Dile-bağlı metin (metadata.slug ile birebir aynı kalıp)
        const i18n = (meta as { description_i18n?: unknown }).description_i18n
        if (i18n && typeof i18n === 'object') {
            const key = lang === 'en' ? 'en' : 'tr'
            const value = (i18n as Record<string, unknown>)[key]
            if (typeof value === 'string' && value.length > 0) return value
        }

        // 2. Legacy tek-dilli hero metni (alan yoksa davranış eskisiyle AYNI)
        const hero = (meta as { hero_description?: unknown }).hero_description
        if (typeof hero === 'string' && hero.length > 0) return hero
    }

    // 3. Düz kolon → 4. boş dize
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

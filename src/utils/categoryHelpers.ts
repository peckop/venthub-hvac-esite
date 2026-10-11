import type { DbCategory } from '../types/db-rows'
import type { DomainCategory } from '../types/ui-models'
import { metniIndir } from './dilMetni'

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

/*
 * ⭐`getCategoryMarketingTitle` SİLİNDİ — `marketing_title` EMEKLİ (Recep kararı, 2026-09-09).
 *
 * Ölçüm (2026-09-08): alan 23 kategorinin 12'sinde DOLUYDU ama hiçbir yüzeyde görünmüyordu —
 * bu çözücünün ürün kodunda 0 çağıranı, `useCategoryViewModel.marketingTitle` alanının 0
 * tüketicisi vardı. Yani birileri 12 satır için emek harcamış, metin hiç render edilmemişti.
 *
 * Karar (b) "emekli" seçildi: kategori adı TEK zincirden gelmeye devam eder
 * (`translation_key → menu_label → name`, cetvel §2). Alanı `h1`'e bağlamak, adı İKİ BAŞLI
 * yapardı — menüde kısa ad, sayfada uzun pazarlama başlığı.
 *
 * KOLON SİLİNMEDİ: `categories.marketing_title` DB'de duruyor ve 12 satırdaki metin yerinde;
 * veri silmek geri dönüşsüzdür ve bu bir içerik kararıydı, temizlik değil. Silinen yalnız
 * ÖLÜ ÇÖZÜCÜ — emekli bir alanın çözücüsünü bırakmak, sonraki geliştiriciye "demek ki
 * kullanılıyor" dedirtirdi.
 *
 * Bekçi: `INV-KATEGORI-MARKETING-EMEKLI-1` (kategori-adi-marketing-emekli.test.ts) —
 * hiçbir render yolu bu alanı okuyamaz. Emeklilik bir niyet değil, ölçülen bir hâl.
 * Cetvel: docs/standards/kategori-adlandirma-standard.md §4.
 */

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

        // 2. Legacy tek-dilli hero metni — TÜRKÇEDİR, yalnız TR sayfada.
        // INV-DIL-DUSUSU-1 (2026-09-22 ölçümü): 24 kategorinin description_i18n'inde EN 0; EN
        // sayfa buraya düşüp Türkçe paragraf basıyordu (hero_description 2 kategoride dolu).
        if (lang !== 'en') {
            const hero = (meta as { hero_description?: unknown }).hero_description
            if (typeof hero === 'string' && hero.length > 0) return hero
        }
    }

    // 3. Düz kolon (tek dilli, Türkçe; canlıda 37/37 NULL) — yalnız TR → 4. boş dize
    return lang === 'en' ? '' : category.description || ''
}

/**
 * ARAMA SONUCU BAŞLIĞI VE AÇIKLAMASI İÇİN EN AZ ALAN KÜMESİ (URN-91 alt iş 1, KTL-21).
 * `DbCategory`, `DomainCategory` ve ham Supabase satırları bunu karşılar.
 */
export type CategorySeoSource = {
    seo_title?: string | null
    seo_desc?: string | null
    metadata?: unknown
}

type CategorySeoAlani = 'seo_title' | 'seo_desc'

/**
 * Kategorinin arama sonucu metnini AKTİF DİLE göre çözer; kayıt yoksa boş dize (çağıran bugünkü davranışa döner).
 *
 * YUVA KARARI (URUN ↔ KATALOG, 2026-10-10): TR değer üst düzey `seo_title` / `seo_desc` sütununda (yönetim formunun
 * tek alanı), EN değer `metadata.seo_title_en` / `metadata.seo_desc_en` içinde (migration yok; `description_i18n` ile
 * aynı JSONB kalıbı). Okuma sırası: TR → sütun; EN → YALNIZ `metadata.*_en`.
 *
 * ⭐EN SAYFA SÜTUNA DÜŞMEZ: sütun Türkçedir. Düşerse İngilizce arama sonucunda Türkçe başlık görünür (aynı kusur:
 * INV-DIL-DUSUSU-1, `getCategoryDescription`'ın EN dalı). Boş ya da yalnız boşluktan oluşan değer "kayıt yok" sayılır.
 */
function seoMetni(category: CategorySeoSource | null | undefined, alan: CategorySeoAlani, lang: string): string {
    if (!category) return ''

    let deger: unknown
    if (lang === 'en') {
        const meta = category.metadata
        deger = meta && typeof meta === 'object' ? (meta as Record<string, unknown>)[`${alan}_en`] : undefined
    } else {
        deger = category[alan]
    }

    return typeof deger === 'string' ? deger.trim() : ''
}

/** Kategori sayfasının `<title>` ve og:title metni (site eki HARİÇ); yoksa boş dize. Görünür H1'e dokunmaz. */
export const getCategorySeoTitle = (category: CategorySeoSource | null | undefined, lang: string): string =>
    seoMetni(category, 'seo_title', lang)

/** Kategori sayfasının meta açıklaması (kırpılmamış ham metin); yoksa boş dize. */
export const getCategorySeoDescription = (category: CategorySeoSource | null | undefined, lang: string): string =>
    seoMetni(category, 'seo_desc', lang)

/**
 * ARAMA SONUCU ALANLARINI İSTEMCİYE GİDEN SATIRDAN ÇIKARIR (URN-105, 2026-10-10).
 *
 * `seo_title` / `seo_desc` (TR sütun) ile `metadata.seo_title_en` / `metadata.seo_desc_en` yalnız SUNUCUDA
 * başlık ve açıklama üretir (`getCategorySeoTitle` / `getCategorySeoDescription`); hiçbir istemci bileşeni okumaz.
 * Satırla birlikte gömülü veriye (RSC yükü) giderlerse EN sayfada Türkçe, TR sayfada İngilizce metin sayfa
 * kaynağında durur: KTL-21 28 kategoriyi doldurduğu gün `e2e/dil-dususu` (INV-DIL-DUSUSU-1) kırmızı verdi ve
 * her PR'ın E2E'sini kırdı (canlı ölçüm: `/en` 56, `/en/category/fans` 24 dolu alan). Sütun boşken sızıntı
 * görünmüyordu; kusur kodda önceden vardı, veri onu görünür kıldı.
 *
 * Sütunlar `null`a çevrilir (tip sözleşmesi bozulmaz), `metadata` kopyalanır ve yalnız iki `*_en` anahtarı düşer;
 * `slug`, `description_i18n`, `hide_price` aynen kalır. Girdi değiştirilmez.
 */
export function aramaAlanlariniAyikla<T extends { metadata?: unknown }>(kategori: T): T {
    const cikti = { ...kategori }
    const yazilabilir = cikti as Record<string, unknown>
    for (const sutun of ['seo_title', 'seo_desc']) {
        if (sutun in yazilabilir) yazilabilir[sutun] = null
    }
    const meta = cikti.metadata
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
        const m = { ...(meta as Record<string, unknown>) }
        delete m.seo_title_en
        delete m.seo_desc_en
        yazilabilir.metadata = m
    }
    return cikti
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

/**
 * INV-DIL-DUSUSU-1 · sunucudan istemciye giden kategori satırını SAYFANIN DİLİNE indirir:
 * `metadata.description_i18n` tek dile, tek dilli (Türkçe) legacy alanlar (`metadata.hero_description`,
 * `description`) EN'de düşer. `metadata.slug` {tr,en} İKİ DİLDE kalır — dil değiştirici ve hreflang
 * ona muhtaç. Bu dosyada durur çünkü kategori metadata metnine dokunan meşru tek yer burasıdır (INV-4).
 */
export function kategoriMetniniIndir<T extends { description?: unknown; metadata?: unknown }>(
    kategori: T,
    lang: string
): T {
    // Arama sonucu alanları yalnız sunucuda kullanılır; dile göre indirmek yerine hiç gönderilmez (URN-105).
    // Arama sonucu alanları yalnız sunucuda kullanılır; dile göre indirmek yerine hiç gönderilmez (URN-105).
    const cikti = aramaAlanlariniAyikla(kategori)
    const meta = cikti.metadata
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
        const m = { ...(meta as Record<string, unknown>) }
        if ('description_i18n' in m) m.description_i18n = metniIndir(m.description_i18n, lang)
        if (lang === 'en') delete m.hero_description
        ;(cikti as Record<string, unknown>).metadata = m
    }
    if (lang === 'en' && 'description' in cikti) (cikti as Record<string, unknown>).description = null
    return cikti
}

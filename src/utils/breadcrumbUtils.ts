import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { DomainCategory } from '../lib/type-converters'
import { getCategoryDisplayName, getLocalizedCategorySlug } from './categoryHelpers'
import { adresDili, kategoriKirintiYolu } from './yuzeyAdresleri'

/**
 * Helper: Kategori sayfaları için breadcrumb items oluştur
 *
 * @param lang - Aktif dil; üst kategori linki o dilin görünen slug'ıyla üretilir.
 * @param t - Sözlük çözücü. ⭐REC-103: OPSİYONEL DEĞİL DİYE OKUNMASIN — imzada
 *   opsiyonel, ama VERİLMEZSE `getCategoryDisplayName` sözlük adımını HİÇ çalıştırmaz
 *   ve doğrudan `menu_label`/`name`'e düşer; ikisi de Türkçedir. Yani `t`'siz çağrı
 *   İngilizce sayfada Türkçe breadcrumb basar — 2026-09-01'de canlıda ölçülen kusurun
 *   ta kendisi. Testler dışında `t` HER ZAMAN geçilir; kapı: INV-KATEGORI-ADI-1.
 */
export function buildCategoryBreadcrumb(
    category: DomainCategory | null | undefined,
    parentCategory?: DomainCategory | null,
    homeLabel = 'Ana Sayfa',
    lang = 'tr',
    t?: (key: string) => string
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: homeLabel, href: '/' }
    ]

    if (parentCategory) {
        items.push({
            label: getCategoryDisplayName(parentCategory, t),
            // REC-300 Faz 3d: K3-b açıkken `adresUret` (dil önekli; Breadcrumb önek eklemez —
            // `localizedHref` idempotent). Kapalıyken bugünkü dilsiz `Routes.category`.
            href: kategoriKirintiYolu(getLocalizedCategorySlug(parentCategory, lang), null, adresDili(lang))
        })
    }

    if (category) {
        items.push({
            label: getCategoryDisplayName(category, t),
            href: undefined // Son item, href yok
        })
    }

    return items
}

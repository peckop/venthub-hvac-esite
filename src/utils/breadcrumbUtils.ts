import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { DomainCategory } from '../lib/type-converters'
import { Routes } from '../utils/routes'
import { getCategoryDisplayName, getLocalizedCategorySlug } from './categoryHelpers'

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
            href: Routes.category(getLocalizedCategorySlug(parentCategory, lang))
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

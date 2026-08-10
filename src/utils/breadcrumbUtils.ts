import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { DomainCategory } from '../lib/type-converters'
import { Routes } from '../utils/routes'
import { getCategoryDisplayName, getLocalizedCategorySlug } from './categoryHelpers'

/**
 * Helper: Kategori sayfaları için breadcrumb items oluştur
 *
 * @param lang - Aktif dil; üst kategori linki o dilin görünen slug'ıyla üretilir.
 */
export function buildCategoryBreadcrumb(
    category: DomainCategory | null | undefined,
    parentCategory?: DomainCategory | null,
    homeLabel = 'Ana Sayfa',
    lang = 'tr'
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: homeLabel, href: '/' }
    ]

    if (parentCategory) {
        items.push({
            label: getCategoryDisplayName(parentCategory),
            href: Routes.category(getLocalizedCategorySlug(parentCategory, lang))
        })
    }

    if (category) {
        items.push({
            label: getCategoryDisplayName(category),
            href: undefined // Son item, href yok
        })
    }

    return items
}

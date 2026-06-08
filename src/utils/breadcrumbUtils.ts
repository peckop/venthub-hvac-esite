import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { DomainCategory } from '../lib/type-converters'
import { Routes } from '../utils/routes'
import { getCategoryDisplayName } from './categoryHelpers'

/**
 * Helper: Kategori sayfaları için breadcrumb items oluştur
 */
export function buildCategoryBreadcrumb(
    category: DomainCategory | null | undefined,
    parentCategory?: DomainCategory | null,
    homeLabel = 'Ana Sayfa'
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: homeLabel, href: '/' }
    ]

    if (parentCategory) {
        items.push({
            label: getCategoryDisplayName(parentCategory),
            href: Routes.category(parentCategory.slug)
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

import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { getCategoryDisplayName } from './categoryHelpers'
import { Category } from '../lib/supabase'

/**
 * Helper: Kategori sayfaları için breadcrumb items oluştur
 */
export function buildCategoryBreadcrumb(
    category: Category | null | undefined,
    parentCategory?: Category | null,
    homeLabel = 'Ana Sayfa'
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: homeLabel, href: '/' }
    ]

    if (parentCategory) {
        items.push({
            label: getCategoryDisplayName(parentCategory),
            href: `/category/${parentCategory.slug}`
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

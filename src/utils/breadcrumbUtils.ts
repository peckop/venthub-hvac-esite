import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'

/**
 * Helper: Kategori sayfaları için breadcrumb items oluştur
 */
export function buildCategoryBreadcrumb(
    category: { name: string; slug: string } | null,
    parentCategory?: { name: string; slug: string } | null,
    homeLabel = 'Ana Sayfa'
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { label: homeLabel, href: '/' }
    ]

    if (parentCategory) {
        items.push({
            label: parentCategory.name,
            href: `/category/${parentCategory.slug}`
        })
    }

    if (category) {
        items.push({
            label: category.name
            // Son item, href yok
        })
    }

    return items
}

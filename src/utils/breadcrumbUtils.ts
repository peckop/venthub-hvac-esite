import { Routes } from '../utils/routes'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { getCategoryDisplayName } from './categoryHelpers'
import { DomainCategory } from '../lib/type-converters'

/**
 * Constructs an array of breadcrumb items representing the navigation path to a category.
 * Handles single-level and two-level (parent -> child) category hierarchies.
 *
 * @param category - The current target category being viewed. If null/undefined, the breadcrumb won't include it.
 * @param parentCategory - The parent category of the target, if one exists. Generates an intermediate link.
 * @param homeLabel - The text label to display for the root breadcrumb link (defaults to 'Ana Sayfa').
 * @returns An ordered array of `BreadcrumbItem` objects suitable for rendering. The last item omits `href` to represent the current page.
 *
 * @example
 * const items = buildCategoryBreadcrumb(childCategory, parentCategory, 'Home')
 * // Returns: [{ label: 'Home', href: '/' }, { label: 'Parent', href: '/c/parent' }, { label: 'Child', href: undefined }]
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

import { Routes } from '../utils/routes'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { getCategoryDisplayName } from './categoryHelpers'
import { DomainCategory } from '../lib/type-converters'

/**
 * Constructs an array of breadcrumb items specifically formatted for category pages.
 * Handles the inclusion of a parent category, the current category (without a link, as it's the active page),
 * and an optional custom home label.
 *
 * @param category - The current active domain category
 * @param parentCategory - The parent domain category, if applicable
 * @param homeLabel - The localized label for the root navigation item (defaults to 'Ana Sayfa')
 * @returns An array of `BreadcrumbItem` objects suitable for the `<Breadcrumb />` component
 *
 * @example
 * buildCategoryBreadcrumb(currentCat, parentCat, 'Home') // returns [{ label: 'Home', href: '/' }, { label: 'Parent', href: '/kategori/parent' }, { label: 'Current' }]
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

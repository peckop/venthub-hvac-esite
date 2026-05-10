import { Routes } from '../utils/routes'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { getCategoryDisplayName } from './categoryHelpers'
import { DomainCategory } from '../lib/type-converters'

/**
 * Constructs an array of breadcrumb navigation items based on the active category and its hierarchical parent.
 * Automatically injects the home link and ensures the terminal category lacks a hyperlink (indicating the current page).
 *
 * @param category - The current active domain category being viewed, or null
 * @param parentCategory - The parent domain category (if any) to insert before the current category
 * @param homeLabel - The localized string label for the root index link (defaults to 'Ana Sayfa')
 * @returns An array of sequentially ordered `BreadcrumbItem` objects mapping out the navigation path
 *
 * @example
 * const items = buildCategoryBreadcrumb(currentCategory, parentCategory, 'Home');
 * // returns [{ label: 'Home', href: '/' }, { label: 'Parent', href: '/category/parent' }, { label: 'Current', href: undefined }]
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

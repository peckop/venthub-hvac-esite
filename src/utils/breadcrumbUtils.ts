import { Routes } from '../utils/routes'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { getCategoryDisplayName } from './categoryHelpers'
import { DomainCategory } from '../lib/type-converters'

/**
 * Constructs an array of breadcrumb items tailored for category navigation pages.
 * Ensures the "Home" link is always present, followed by the parent category (if any), and concluding with the current active category (which omits the `href` property).
 *
 * @param category - The current active domain category. If null or undefined, only the parent and home links are generated.
 * @param parentCategory - (Optional) The parent category to nest under in the breadcrumb trail.
 * @param homeLabel - (Optional) The localized text for the root item, defaults to 'Ana Sayfa'.
 * @returns An array of `BreadcrumbItem` objects ready to be rendered by the UI component.
 *
 * @example
 * const items = buildCategoryBreadcrumb(currentCat, parentCat, 'Anasayfa');
 * // returns [{ label: 'Anasayfa', href: '/' }, { label: 'Parent', href: '/c/parent' }, { label: 'Child', href: undefined }]
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

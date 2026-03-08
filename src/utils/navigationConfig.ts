export type NavigationMode = 'expanded' | 'compact'

export type NavigationItemId =
  | 'categories'
  | 'products'
  | 'brands'
  | 'knowledgeHub'
  | 'about'
  | 'contact'

export interface NavigationItemConfig {
  id: NavigationItemId
  labelKey: string
  href?: string
  minWidthClass?: string
  showInCompact?: boolean
}

export const NAVIGATION_HEIGHT_CLASSES: Record<NavigationMode, string> = {
  expanded: 'h-20',
  compact: 'h-16',
}

export const NAVIGATION_MAIN_OFFSET_CLASS = 'pt-16'

export const NAVIGATION_PRIMARY_ITEMS: NavigationItemConfig[] = [
  {
    id: 'categories',
    labelKey: 'common.categories',
    minWidthClass: 'min-w-[132px]',
    showInCompact: true,
  },
  {
    id: 'products',
    labelKey: 'common.products',
    href: '/products',
    minWidthClass: 'min-w-[100px]',
    showInCompact: true,
  },
  {
    id: 'brands',
    labelKey: 'common.brands',
    href: '/brands',
    minWidthClass: 'min-w-[96px]',
    showInCompact: true,
  },
  {
    id: 'knowledgeHub',
    labelKey: 'common.knowledgeHub',
    href: '/destek/merkez',
    minWidthClass: 'min-w-[126px]',
    showInCompact: false,
  },
]

export const NAVIGATION_SECONDARY_ITEMS: NavigationItemConfig[] = [
  {
    id: 'about',
    labelKey: 'common.about',
    href: '/about',
    minWidthClass: 'min-w-[92px]',
    showInCompact: false,
  },
  {
    id: 'contact',
    labelKey: 'common.contact',
    href: '/contact',
    minWidthClass: 'min-w-[92px]',
    showInCompact: false,
  },
]

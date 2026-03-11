import React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface ResolvedNavigationItem {
    id: string
    label: string
    href?: string
}

interface NavPrimaryRailProps {
    items: ResolvedNavigationItem[]
    isCategoriesLoading: boolean
    isCategoryHubOpen: boolean
    onCategoryClick: () => void
    onCategoryHover: () => void
    onItemHover?: (itemId: string) => void
}

const itemBaseClass =
    'group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium text-steel-gray transition-all duration-300 hover:border-primary-navy/10 hover:bg-gradient-to-r hover:from-air-blue/40 hover:to-slate-50 hover:text-primary-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2'

const NavPrimaryRail: React.FC<NavPrimaryRailProps> = ({
    items,
    isCategoriesLoading,
    isCategoryHubOpen,
    onCategoryClick,
    onCategoryHover,
    onItemHover,
}) => {
    return (
        <div className="hidden min-w-0 flex-1 items-center gap-2 pl-2 lg:flex xl:pl-4">
            {items.map((item) => {
                if (item.id === 'categories') {
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={onCategoryClick}
                            onMouseEnter={onCategoryHover}
                            aria-expanded={isCategoryHubOpen}
                            aria-haspopup="dialog"
                            className={cn(itemBaseClass, isCategoryHubOpen && 'border-primary-navy/15 bg-air-blue/40 text-primary-navy')}
                        >
                            {isCategoriesLoading ? (
                                <svg className="h-4 w-4 animate-spin text-primary-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:rotate-180">
                                    <rect x="3" y="3" width="6" height="6" rx="1" />
                                    <rect x="15" y="3" width="6" height="6" rx="1" />
                                    <rect x="3" y="15" width="6" height="6" rx="1" />
                                    <rect x="15" y="15" width="6" height="6" rx="1" />
                                </svg>
                            )}
                            <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                    )
                }

                return (
                    <Link
                        key={item.id}
                        href={item.href || '#'}
                        onMouseEnter={() => onItemHover?.(item.id)}
                        className={itemBaseClass}
                    >
                        <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}

export default NavPrimaryRail

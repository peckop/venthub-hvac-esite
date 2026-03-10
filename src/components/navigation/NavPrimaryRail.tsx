import React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { NavigationItemConfig, NavigationMode } from '@/utils/navigationConfig'

interface ResolvedNavigationItem extends NavigationItemConfig {
    label: string
}

interface NavPrimaryRailProps {
    mode: NavigationMode
    items: ResolvedNavigationItem[]
    secondaryItems?: ResolvedNavigationItem[]
    isCategoriesLoading: boolean
    isCategoryHubOpen: boolean
    onCategoryClick: () => void
    onCategoryHover: () => void
    onItemHover?: (itemId: string) => void
    moreLabel: string
}

const itemBaseClass =
    'group relative inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium text-steel-gray transition-all duration-300 hover:border-primary-navy/10 hover:bg-gradient-to-r hover:from-air-blue/40 hover:to-slate-50 hover:text-primary-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy/20 focus-visible:ring-offset-2'

const NavPrimaryRail: React.FC<NavPrimaryRailProps> = ({
    mode,
    items,
    secondaryItems = [],
    isCategoriesLoading,
    isCategoryHubOpen,
    onCategoryClick,
    onCategoryHover,
    onItemHover,
    moreLabel,
}) => {
    return (
        <div
            className={cn(
                'hidden min-w-0 flex-1 items-center transition-all duration-500 ease-in-out',
                mode === 'compact' ? 'lg:flex gap-1.5 pl-1 xl:pl-3' : 'xl:flex gap-2 pl-2 2xl:pl-4'
            )}
        >
            {items
                .filter((item) => item.showInCompact || mode === 'expanded')
                .map((item) => {
                    const sharedClassName = cn(itemBaseClass, item.minWidthClass, mode === 'compact' ? 'px-3 py-2.5 text-[13px]' : '')

                    if (item.id === 'categories') {
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={onCategoryClick}
                                onMouseEnter={onCategoryHover}
                                aria-expanded={isCategoryHubOpen}
                                aria-haspopup="dialog"
                                className={cn(sharedClassName, isCategoryHubOpen && 'border-primary-navy/15 bg-air-blue/40 text-primary-navy')}
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
                            className={sharedClassName}
                        >
                            <span className="whitespace-nowrap">{item.label}</span>
                        </Link>
                    )
                })}

            {secondaryItems.length > 0 && (
                <div className="relative group items-center border-l border-slate-200/80 hidden lg:flex transition-all duration-500 ease-in-out pl-2 ml-1">
                    <button
                        className={cn(itemBaseClass, mode === 'compact' ? 'px-3 py-2.5 text-[13px]' : '')}
                    >
                        <span>{moreLabel}</span>
                        <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:rotate-180">
                            <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="6,9 12,15 18,9" />
                        </svg>
                    </button>

                    <div className="absolute top-full left-2 mt-1 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 translate-y-1 transition-all duration-300 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_18px_40px_-15px_rgba(15,23,42,0.2)] border border-slate-200/70 overflow-hidden divide-y divide-slate-100 p-1.5 z-50">
                        {secondaryItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href || '#'}
                                className="flex items-center px-3.5 py-2.5 text-[13px] font-medium text-steel-gray hover:text-primary-navy hover:bg-air-blue/30 rounded-lg transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NavPrimaryRail

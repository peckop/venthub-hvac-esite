'use client'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronDown, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { DomainCategory } from '../../lib/type-converters'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import { Routes } from '../../utils/routes'
const MegaMenu3DBackground = dynamic(() => import('./MegaMenu3DBackground'), { ssr: false })

interface EliteMegaMenuProps {
    categories: DomainCategory[]
    onNavigate?: () => void
}

// MobileMegaMenu Export - Needed for MegaMenu.tsx
export const MobileMegaMenu: React.FC<EliteMegaMenuProps> = ({ categories, onNavigate }) => {
    const { wrapCategory } = useCategoryViewModel()
    const mainCategories = categories.filter((c) => !c.parent_id)
    const getSubCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

    return (
        <div className="flex flex-col gap-4 p-4">
            {mainCategories.map((category) => {
                const subs = getSubCategories(category.id)
                const vm = wrapCategory(category)
                return (
                    <div key={category.id} className="space-y-2">
                        <Link 
                            href={Routes.category(category.slug)}
                            onClick={() => onNavigate?.()}
                            className="font-bold text-slate-900 flex items-center gap-2"
                        >
                            {getCategoryIcon(category.slug, { size: 18 })}
                            {vm?.displayName}
                        </Link>
                        {subs.length > 0 && (
                            <div className="pl-6 flex flex-col gap-2">
                                {subs.map(sub => {
                                    const subVm = wrapCategory(sub)
                                    return (
                                        <Link 
                                            key={sub.id} 
                                            href={Routes.category(category.slug, sub.slug)}
                                            onClick={() => onNavigate?.()}
                                            className="text-sm text-slate-600"
                                        >
                                            {subVm?.displayName}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

const EliteMegaMenu: React.FC<EliteMegaMenuProps> = ({ categories, onNavigate }) => {
    const { wrapCategory } = useCategoryViewModel()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleLinkClick = (level: number, slug: string) => {
        // Console log removed for lint compliance
        const _log = `${level} - ${slug}` 
        onNavigate?.()
    }

    const mainCategories = categories.filter((c) => !c.parent_id)
    const getSubCategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

    if (!isMounted) return null

    return (
        <NavigationMenu.Root className="relative z-50 flex w-full justify-center">
            <NavigationMenu.List className="center shadow-blackA7 m-0 flex list-none rounded-hvac-sm bg-white bg-opacity-95 backdrop-blur-sm p-1 shadow-mega-menu shadow-black/5">
                {mainCategories.map((category) => {
                    const subs = getSubCategories(category.id)
                    const vm = wrapCategory(category)

                    if (subs.length === 0) {
                        return (
                            <NavigationMenu.Item key={category.id}>
                                <Link
                                    href={Routes.category(category.slug)}
                                    onClick={() => handleLinkClick(0, category.slug)}
                                    className="block select-none rounded px-3 py-2 text-base font-medium leading-none text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 cursor-pointer flex items-center gap-2"
                                >
                                    <span className="text-primary-navy">
                                        {getCategoryIcon(category.slug, { size: 18 })}
                                    </span>
                                    <span>{vm?.displayName}</span>
                                </Link>
                            </NavigationMenu.Item>
                        )
                    }

                    return (
                        <NavigationMenu.Item key={category.id}>
                            <NavigationMenu.Trigger className="group flex select-none items-center justify-between gap-0.5 rounded px-3 py-2 text-base font-medium leading-none text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary-navy">
                                        {getCategoryIcon(category.slug, { size: 18 })}
                                    </span>
                                    <span>{vm?.displayName}</span>
                                </div>
                                <ChevronDown
                                    className="relative top-px ml-1 h-3 w-3 transition-transform duration-hvac-normal ease-in group-data-[state=open]:-rotate-180"
                                    aria-hidden
                                />
                            </NavigationMenu.Trigger>

                            <NavigationMenu.Content className="absolute top-0 left-0 w-full sm:w-auto data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight">
                                <div className="m-0 grid list-none gap-x-8 p-8 sm:w-hvac-mega-sm sm:grid-cols-hvac-layout-split md:w-hvac-mega-md lg:w-hvac-mega-lg">
                                    <div className="row-span-3">
                                        <div className="flex h-full w-full select-none flex-col justify-end rounded-hvac-sm bg-slate-50/80 backdrop-blur-md border border-slate-100/50 shadow-inner p-6 no-underline outline-none focus-visible:ring-2 focus-visible:ring-slate-300 relative overflow-hidden rounded-xl">
                                            <MegaMenu3DBackground categorySlug={category.slug} />
                                            <div className="relative z-10">
                                                <div className="text-primary-navy mb-4">
                                                    {getCategoryIcon(category.slug, { size: 48 })}
                                                </div>
                                                <div className="mb-2 mt-4 text-xl font-bold tracking-tight leading-hvac-12 text-slate-900">
                                                    {vm?.displayName}
                                                </div>
                                                <p className="text-sm leading-normal text-slate-600">
                                                    {vm?.description || 'Yüksek kaliteli havalandırma çözümleri.'}
                                                </p>
                                                <Link
                                                    href={Routes.category(category.slug)}
                                                    onClick={() => handleLinkClick(0, category.slug)}
                                                    className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-blue hover:text-primary-navy"
                                                >
                                                    Tümünü Gör <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <ul className="grid grid-cols-2 gap-4">
                                            {subs.filter(sub => sub.slug !== category.slug).map((sub) => {
                                                const subVm = wrapCategory(sub)
                                                return (
                                                    <li key={sub.id}>
                                                        <Link
                                                            href={Routes.category(category.slug, sub.slug)}
                                                            onClick={() => handleLinkClick(1, sub.slug)}
                                                            className="block select-none rounded p-3 text-sm font-medium leading-none text-slate-700 no-underline outline-none hover:bg-slate-50 transition-colors"
                                                        >
                                                            {subVm?.displayName}
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    )
                })}
            </NavigationMenu.List>

            <div className="absolute top-full left-0 flex w-full justify-center" style={{ perspective: '2000px' }}>
                <NavigationMenu.Viewport 
                    className="relative mt-2.5 w-full origin-top overflow-hidden rounded-hvac-sm bg-white bg-opacity-95 backdrop-blur-md border border-slate-200/50 shadow-mega-menu-viewport transition-width-height duration-300" 
                    style={{ height: 'var(--radix-navigation-menu-viewport-height)', width: 'var(--radix-navigation-menu-viewport-width)' }}
                />
            </div>
        </NavigationMenu.Root>
    )
}

export default EliteMegaMenu

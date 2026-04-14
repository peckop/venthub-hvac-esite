'use client'
import { Routes } from '../../utils/routes'

import React, { useEffect, useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import MegaMenu3DBackground from './MegaMenu3DBackground'
import { DomainCategory } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'

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
            <NavigationMenu.List className="center shadow-blackA7 m-0 flex list-none rounded-[6px] bg-white bg-opacity-95 backdrop-blur-sm p-1 shadow-[0_2px_10px] shadow-black/5">
                {mainCategories.map((category) => {
                    const subs = getSubCategories(category.id)
                    const vm = wrapCategory(category)

                    if (subs.length === 0) {
                        return (
                            <NavigationMenu.Item key={category.id}>
                                <Link
                                    href={Routes.category(category.slug)}
                                    onClick={() => handleLinkClick(0, category.slug)}
                                    className="block select-none rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none text-slate-700 outline-none hover:bg-slate-50 focus:shadow-[0_0_0_2px] focus:shadow-slate-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 cursor-pointer flex items-center gap-2"
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
                            <NavigationMenu.Trigger className="group flex select-none items-center justify-between gap-[2px] rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none text-slate-700 outline-none hover:bg-slate-50 focus:shadow-[0_0_0_2px] focus:shadow-slate-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary-navy">
                                        {getCategoryIcon(category.slug, { size: 18 })}
                                    </span>
                                    <span>{vm?.displayName}</span>
                                </div>
                                <ChevronDown
                                    className="relative top-[1px] ml-1 h-3 w-3 transition-transform duration-[250ms] ease-in group-data-[state=open]:-rotate-180"
                                    aria-hidden
                                />
                            </NavigationMenu.Trigger>

                            <NavigationMenu.Content className="absolute top-0 left-0 w-full sm:w-auto data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight">
                                <div className="m-0 grid list-none gap-x-[30px] p-[32px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr] md:w-[600px] lg:w-[700px]">
                                    <div className="row-span-3">
                                        <div className="flex h-full w-full select-none flex-col justify-end rounded-[6px] bg-slate-50/80 backdrop-blur-md border border-slate-100/50 shadow-inner p-[25px] no-underline outline-none focus:shadow-[0_0_0_2px] focus:shadow-slate-300 relative overflow-hidden rounded-xl">
                                            <MegaMenu3DBackground categorySlug={category.slug} />
                                            <div className="relative z-10">
                                                <div className="text-primary-navy mb-4">
                                                    {getCategoryIcon(category.slug, { size: 48 })}
                                                </div>
                                                <div className="mb-[7px] mt-4 text-[20px] font-bold tracking-tight leading-[1.2] text-slate-900">
                                                    {vm?.displayName}
                                                </div>
                                                <p className="text-[14px] leading-[1.5] text-slate-600">
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
                                                            className="block select-none rounded-[4px] p-3 text-[14px] font-medium leading-none text-slate-700 no-underline outline-none hover:bg-slate-50 transition-colors"
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

            <div className="perspective-[2000px] absolute top-full left-0 flex w-full justify-center">
                <NavigationMenu.Viewport className="relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-[6px] bg-white bg-opacity-95 backdrop-blur-md border border-slate-200/50 shadow-[0_38.5px_64.1px_-10px_rgba(0,0,0,0.1),0_20.1px_33.5px_-10px_rgba(0,0,0,0.07)] transition-[width,height] duration-300 sm:w-[var(--radix-navigation-menu-viewport-width)]" />
            </div>
        </NavigationMenu.Root>
    )
}

export default EliteMegaMenu

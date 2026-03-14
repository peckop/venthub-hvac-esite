import React, { useEffect, useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import type { Category } from '../../lib/supabase'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import { trackEvent } from '../../utils/analytics'
import MegaMenu3DBackground from './MegaMenu3DBackground'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface EliteMegaMenuProps {
    categories: Category[]
    onNavigate?: () => void
}

export const EliteMegaMenu: React.FC<EliteMegaMenuProps> = ({ categories, onNavigate }) => {
    const mainCategories = categories.filter(cat => cat.level === 0)
    const subCategories = categories.filter(cat => cat.level === 1)

    const getSubCategories = (parentId: string) => {
        return subCategories.filter(sub => sub.parent_id === parentId)
    }

    const handleLinkClick = (level: number, slug: string, parent?: string) => {
        trackEvent('category_click', { level, slug, parent, source: 'elite_megamenu' })
        onNavigate?.()
    }

    return (
        <NavigationMenu.Root className="relative z-50 flex w-full justify-center">
            <NavigationMenu.List className="center shadow-blackA7 m-0 flex list-none rounded-[6px] bg-white bg-opacity-95 backdrop-blur-sm p-1 shadow-[0_2px_10px] shadow-black/5">
                {mainCategories.map((category) => {
                    const subs = getSubCategories(category.id)

                    if (subs.length === 0) {
                        return (
                            <NavigationMenu.Item key={category.id}>
                                <Link
                                    href={`/category/${category.slug}`}
                                    onClick={() => handleLinkClick(0, category.slug)}
                                    className="block select-none rounded-[4px] px-3 py-2 text-[15px] font-medium leading-none text-slate-700 outline-none hover:bg-slate-50 focus:shadow-[0_0_0_2px] focus:shadow-slate-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 cursor-pointer flex items-center gap-2"
                                >
                                    <span className="text-primary-navy">
                                        {getCategoryIcon(category.slug, { size: 18 })}
                                    </span>
                                    <span>{getCategoryDisplayName(category)}</span>
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
                                    <span>{getCategoryDisplayName(category)}</span>
                                </div>
                                <ChevronDown
                                    className="relative top-[1px] ml-1 h-3 w-3 transition-transform duration-[250ms] ease-in group-data-[state=open]:-rotate-180"
                                    aria-hidden
                                />
                            </NavigationMenu.Trigger>

                            <NavigationMenu.Content className="absolute top-0 left-0 w-full sm:w-auto data-[motion=from-start]:animate-enterFromLeft data-[motion=from-end]:animate-enterFromRight data-[motion=to-start]:animate-exitToLeft data-[motion=to-end]:animate-exitToRight">
                                <div className="m-0 grid list-none gap-x-[30px] p-[32px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr] md:w-[600px] lg:w-[700px]">
                                    {/* Category Header */}
                                    <div className="row-span-3">
                                        <div className="flex h-full w-full select-none flex-col justify-end rounded-[6px] bg-slate-50/80 backdrop-blur-md border border-slate-100/50 shadow-inner p-[25px] no-underline outline-none focus:shadow-[0_0_0_2px] focus:shadow-slate-300 relative overflow-hidden rounded-xl">
                                            <MegaMenu3DBackground categorySlug={category.slug} />
                                            <div className="relative z-10">
                                                <div className="text-primary-navy mb-4">
                                                    {getCategoryIcon(category.slug, { size: 48 })}
                                                </div>
                                                <div className="mb-[7px] mt-4 text-[20px] font-bold tracking-tight leading-[1.2] text-slate-900">
                                                    {getCategoryDisplayName(category)}
                                                </div>
                                                <p className="text-[14px] leading-[1.5] text-slate-600">
                                                    {category.description || 'Yüksek kaliteli havalandırma çözümleri.'}
                                                </p>
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    onClick={() => handleLinkClick(0, category.slug)}
                                                    className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary-blue hover:text-primary-navy"
                                                >
                                                    Tümünü Gör <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategories Grid */}
                                    <div className="col-span-1">
                                        <ul className="grid grid-cols-2 gap-4">
                                            {subs.filter(sub => sub.slug !== category.slug).map((sub) => (
                                                <li key={sub.id}>
                                                    <Link
                                                        href={`/category/${category.slug}/${sub.slug}`}
                                                        onClick={() => handleLinkClick(1, sub.slug, category.slug)}
                                                        className="block select-none rounded-[6px] p-4 text-[15px] leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:shadow-[0_0_0_2px] focus:shadow-slate-300"
                                                    >
                                                        <div className="mb-1 font-medium text-slate-900">{getCategoryDisplayName(sub)}</div>
                                                        <p className="mt-1.5 text-[13px] leading-[1.5] text-slate-500 line-clamp-2">
                                                            {sub.description || 'Ürünleri incele →'}
                                                        </p>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    )
                })}



                <NavigationMenu.Indicator className="data-[state=visible]:animate-fadeIn data-[state=hidden]:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
                    <div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-white" />
                </NavigationMenu.Indicator>
            </NavigationMenu.List>

            <div className="absolute left-0 top-full flex w-full justify-center perspective-[2000px]">
                <NavigationMenu.Viewport className="data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[0px] translate-y-2 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-[top_center] overflow-hidden rounded-[10px] bg-white/95 backdrop-blur-md transition-[width,_height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_10px_30px_-10px_rgba(0,0,0,0.03)] border border-slate-100/50" />
            </div>
        </NavigationMenu.Root>
    )
}

// Mobile version - Full screen overlay
interface MobileMegaMenuProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
}

export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ isOpen, onClose, categories }) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const mainCategories = categories.filter(cat => cat.level === 0)
    const subCategories = categories.filter(cat => cat.level === 1)

    const getSubCategories = (parentId: string) => {
        return subCategories.filter(sub => sub.parent_id === parentId)
    }

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="absolute top-0 left-0 w-[85%] max-w-[360px] h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Kategoriler</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Categories */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {mainCategories.map((category) => {
                        const subs = getSubCategories(category.id)
                        const isExpanded = expandedCategory === category.id

                        return (
                            <div key={category.id} className="border border-slate-100 rounded-lg overflow-hidden">
                                <button
                                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                >
                                    <span className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-md text-primary-navy shadow-sm">
                                        {getCategoryIcon(category.slug, { size: 20 })}
                                    </span>
                                    <span className="flex-1 font-semibold text-slate-700">{getCategoryDisplayName(category)}</span>
                                    {subs.length > 0 && (
                                        <ChevronDown
                                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            size={18}
                                        />
                                    )}
                                </button>

                                {subs.length > 0 && isExpanded && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-2 pl-4 space-y-1">
                                        {subs.filter(sub => sub.slug !== category.slug).map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/category/${category.slug}/${sub.slug}`}
                                                onClick={onClose}
                                                className="block p-2 text-sm font-medium text-slate-600 hover:text-primary-navy hover:bg-white rounded-md transition-all"
                                            >
                                                {getCategoryDisplayName(sub)}
                                            </Link>
                                        ))}
                                        <Link
                                            href={`/category/${category.slug}`}
                                            onClick={onClose}
                                            className="block p-2 text-sm font-bold text-secondary-blue hover:text-primary-navy hover:bg-white rounded-md transition-all mt-2"
                                        >
                                            Tümünü Gör →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>


            </div>
        </div>
    )
}

export default EliteMegaMenu




import { Routes } from '../utils/routes'
import React, { useMemo } from 'react'
import Link from 'next/link'
import {
    Wind, Fan, Droplet, Thermometer,
    AirVent, Settings, Package, Wrench, LucideIcon
} from 'lucide-react'
import { getCategoryDisplayName } from '../utils/categoryHelpers'
import { useCategories } from '../contexts/CategoryContext'
import { DomainCategory } from '../lib/type-converters'

// Kategori ikonları - slug bazlı eşleme
const CATEGORY_ICONS: Record<string, LucideIcon> = {
    'hava-perdesi': Wind,
    'fans': Fan,
    'dehumidifiers': Droplet,
    'heat-recovery-units': Thermometer,
    'air-purifiers': AirVent,
    'speed-controllers': Settings,
    'flexible-air-ducts': Package,
    'accessories': Wrench,
}

// Kategori renkleri - premium görünüm
const CATEGORY_COLORS: Record<string, string> = {
    'hava-perdesi': 'from-blue-500 to-blue-700',
    'fans': 'from-emerald-500 to-emerald-700',
    'dehumidifiers': 'from-cyan-500 to-cyan-700',
    'heat-recovery-units': 'from-orange-500 to-orange-700',
    'air-purifiers': 'from-purple-500 to-purple-700',
    'speed-controllers': 'from-slate-500 to-slate-700',
    'flexible-air-ducts': 'from-teal-500 to-teal-700',
    'accessories': 'from-gray-500 to-gray-700',
}

function CategoryCard({ category }: { category: DomainCategory }) {
    const Icon = CATEGORY_ICONS[category.slug] || Package
    const gradient = CATEGORY_COLORS[category.slug] || 'from-gray-500 to-gray-700'

    return (
        <Link
            href={Routes.category(category.slug)}
            className="group flex-shrink-0 w-48 sm:w-56 md:w-64"
        >
            <div className={`
                relative overflow-hidden rounded-2xl p-5 sm:p-6 
                bg-gradient-to-br ${gradient}
                shadow-lg hover:shadow-xl 
                transform transition-transform duration-300 
                hover:scale-105 hover:-translate-y-1
            `}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
                    <div className="absolute -left-4 -bottom-4 w-32 h-32 rounded-full bg-white/10" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-white">
                    <Icon size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2">
                        {getCategoryDisplayName(category)}
                    </h3>
                    {category.description && (
                        <p className="mt-2 text-xs sm:text-sm opacity-80 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}

function ScrollingLane({
    categories,
    direction = 'left',
    speed = 30
}: {
    categories: DomainCategory[]
    direction?: 'left' | 'right'
    speed?: number
}) {
    // 3 set for seamless loop
    const items = [...categories, ...categories, ...categories]

    return (
        <div className="relative overflow-hidden">
            <div
                className={`flex gap-4 ${direction === 'left'
                    ? 'animate-category-scroll-left'
                    : 'animate-category-scroll-right'
                    }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {items.map((cat, idx) => (
                    <CategoryCard key={`${cat.id}-${idx}`} category={cat} />
                ))}
            </div>
        </div>
    )
}

interface CategoryFlowProps {
    title?: string
    subtitle?: string
}

const CategoryFlow: React.FC<CategoryFlowProps> = ({
    title = 'Ürün Kategorilerimiz',
    subtitle = 'Havalandırma çözümlerinde tüm ihtiyaçlarınız için'
}) => {
    const { categories: allCategories, loading } = useCategories()

    const mainCategories = useMemo(() => 
        allCategories.filter(c => !c.parent_id),
    [allCategories])

    // İki lane için kategorileri böl
    const lane1 = useMemo(() => mainCategories.filter((_, i) => i % 2 === 0), [mainCategories])
    const lane2 = useMemo(() => mainCategories.filter((_, i) => i % 2 === 1), [mainCategories])

    if (loading) {
        return (
            <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
            </section>
        )
    }

    if (mainCategories.length === 0) {
        return null
    }


    return (
        <>
            <style>{`
                @keyframes category-scroll-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-33.333%); }
                }
                @keyframes category-scroll-right {
                    from { transform: translateX(-33.333%); }
                    to { transform: translateX(0); }
                }
                .animate-category-scroll-left {
                    animation: category-scroll-left 30s linear infinite;
                }
                .animate-category-scroll-right {
                    animation: category-scroll-right 35s linear infinite;
                }
                .animate-category-scroll-left:hover,
                .animate-category-scroll-right:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                {/* Section Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {title}
                    </h2>
                    <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* Scrolling Lanes */}
                <div className="relative w-screen left-1/2 -translate-x-1/2">
                    {/* Gradient Overlays */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

                    <div className="space-y-4">
                        <ScrollingLane categories={lane1} direction="left" speed={35} />
                        {lane2.length > 0 && (
                            <ScrollingLane categories={lane2} direction="right" speed={40} />
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default CategoryFlow




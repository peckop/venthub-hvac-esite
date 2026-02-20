import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getCategories, Category } from '../lib/supabase'
import { getCategoryDisplayName } from '../utils/categoryHelpers'

interface SubcategoryCardProps {
    subcategory: Category
    parentSlug: string
}

function SubcategoryCard({ subcategory, parentSlug }: SubcategoryCardProps) {
    return (
        <Link
            href={`/category/${parentSlug}/${subcategory.slug}`}
            className="group flex-shrink-0"
        >
            <div className="
                relative w-40 sm:w-48 md:w-52 
                rounded-xl p-4 
                bg-white border border-gray-200
                shadow-sm hover:shadow-md
                transform transition-all duration-300
                hover:scale-105 hover:border-blue-300
            ">
                {/* Icon circle */}
                <div className="
                    w-10 h-10 rounded-full 
                    bg-gradient-to-br from-blue-50 to-blue-100
                    flex items-center justify-center mb-3
                    group-hover:from-blue-100 group-hover:to-blue-200
                    transition-colors
                ">
                    <span className="text-blue-600 font-bold text-sm">
                        {getCategoryDisplayName(subcategory).charAt(0)}
                    </span>
                </div>

                {/* Content */}
                <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {getCategoryDisplayName(subcategory)}
                </h4>

                {/* Hover indicator */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}

function ScrollingLane({
    subcategories,
    parentSlug,
    direction = 'left',
    speed = 25
}: {
    subcategories: Category[]
    parentSlug: string
    direction?: 'left' | 'right'
    speed?: number
}) {
    // 3 set for seamless loop
    const items = [...subcategories, ...subcategories, ...subcategories]

    return (
        <div className="relative overflow-hidden">
            <div
                className={`flex gap-3 ${direction === 'left'
                    ? 'animate-subcat-scroll-left'
                    : 'animate-subcat-scroll-right'
                    }`}
                style={{ animationDuration: `${speed}s` }}
            >
                {items.map((subcat, idx) => (
                    <SubcategoryCard
                        key={`${subcat.id}-${idx}`}
                        subcategory={subcat}
                        parentSlug={parentSlug}
                    />
                ))}
            </div>
        </div>
    )
}

interface SubcategoryFlowProps {
    title?: string
}

const SubcategoryFlow: React.FC<SubcategoryFlowProps> = ({
    title = 'Alt Kategoriler'
}) => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function fetchData() {
            try {
                const data = await getCategories()
                if (!cancelled) {
                    setCategories(data)
                }
            } catch (e) {
                console.warn('SubcategoryFlow fetch error:', e)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchData()
        return () => { cancelled = true }
    }, [])

    // Alt kategorileri parent slugları ile birlikte hazırla
    const subcategoriesWithParent = useMemo(() => {
        const mainCategories = categories.filter(c => c.level === 0)
        const subCategories = categories.filter(c => c.level === 1)

        return subCategories.map(sub => {
            const parent = mainCategories.find(m => m.id === sub.parent_id)
            return {
                ...sub,
                parentSlug: parent?.slug || ''
            }
        }).filter(s => s.parentSlug) // Sadece parent'ı olanlar
    }, [categories])

    // İki lane için alt kategorileri böl
    const lane1 = useMemo(() =>
        subcategoriesWithParent.filter((_, i) => i % 2 === 0),
        [subcategoriesWithParent]
    )
    const lane2 = useMemo(() =>
        subcategoriesWithParent.filter((_, i) => i % 2 === 1),
        [subcategoriesWithParent]
    )

    if (loading) {
        return (
            <section className="py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                </div>
            </section>
        )
    }

    if (subcategoriesWithParent.length < 4) {
        // Yeterli alt kategori yoksa gösterme
        return null
    }

    return (
        <>
            <style>{`
                @keyframes subcat-scroll-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-33.333%); }
                }
                @keyframes subcat-scroll-right {
                    from { transform: translateX(-33.333%); }
                    to { transform: translateX(0); }
                }
                .animate-subcat-scroll-left {
                    animation: subcat-scroll-left 25s linear infinite;
                }
                .animate-subcat-scroll-right {
                    animation: subcat-scroll-right 30s linear infinite;
                }
                .animate-subcat-scroll-left:hover,
                .animate-subcat-scroll-right:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <section className="py-8 sm:py-10 bg-white overflow-hidden">
                {/* Section Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {title}
                    </h3>
                </div>

                {/* Scrolling Lanes */}
                <div className="relative w-screen left-1/2 -translate-x-1/2">
                    {/* Gradient Overlays */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

                    <div className="space-y-3">
                        <ScrollingLane
                            subcategories={lane1.map(s => ({ ...s }))}
                            parentSlug={lane1[0]?.parentSlug || ''}
                            direction="right"
                            speed={28}
                        />
                        {lane2.length > 0 && (
                            <ScrollingLane
                                subcategories={lane2.map(s => ({ ...s }))}
                                parentSlug={lane2[0]?.parentSlug || ''}
                                direction="left"
                                speed={32}
                            />
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default SubcategoryFlow

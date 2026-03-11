'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X, Grid3X3, ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CategoryCard3D from './CategoryCard3D'
import type { Category } from '../../lib/supabase'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryHubOverlayProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
    onCategorySelect: (category: Category) => void
}

/**
 * Tam ekran kategori hub overlay'i.
 * Ana kategorileri 3D kartlar olarak gösterir.
 * Kategori seçilince alt kategorileri listeler.
 */
const CategoryHubOverlay: React.FC<CategoryHubOverlayProps> = ({
    isOpen,
    onClose,
    categories,
    onCategorySelect
}) => {
    const router = useRouter()
    const [isAnimating, setIsAnimating] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    // Ana kategoriler (level 0)
    const mainCategories = categories.filter(cat => cat.level === 0)

    // Seçilen kategorinin alt kategorileri
    const subCategories = selectedCategory
        ? categories.filter(cat => cat.parent_id === selectedCategory.id)
        : []

    // Her ana kategori için alt kategori sayısı
    const getSubCategoryCount = useCallback((parentId: string) => {
        return categories.filter(cat => cat.parent_id === parentId).length
    }, [categories])

    // Açılma/kapanma animasyonu
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            requestAnimationFrame(() => {
                setIsAnimating(true)
            })
        } else {
            setIsAnimating(false)

            setSelectedCategory(null) // Reset selection on close
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // ESC ile kapat veya geri dön
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (selectedCategory) {
                    setSelectedCategory(null)
                } else {
                    onClose()
                }
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose, selectedCategory])

    // Body scroll kilitle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Ana kategoriye tıklandığında
    const handleCategoryClick = (category: Category) => {
        const subCount = getSubCategoryCount(category.id)
        if (subCount > 0) {
            // Alt kategorileri göster
            setSelectedCategory(category)
        } else {
            // Alt kategori yoksa doğrudan sayfaya git
            onCategorySelect(category)
        }
    }

    // Alt kategoriye tıklandığında - doğru URL formatı: /category/{parentSlug}/{childSlug}
    const handleSubCategoryClick = (subCategory: Category) => {
        if (selectedCategory) {
            // Alt kategori: /category/parent-slug/child-slug
            router.push(`/category/${selectedCategory.slug}/${subCategory.slug}`)
        } else {
            // Ana kategori (fallback)
            router.push(`/category/${subCategory.slug}`)
        }
        onClose()
    }

    if (!isVisible) return null

    return (
        <div
            className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Dropdown Panel expanding downwards */}
            <div
                className={`absolute left-0 w-full top-[104px] bg-slate-900/80 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-b border-slate-700/50 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top z-[90] ${isAnimating ? 'max-h-[calc(100vh-104px)] scale-y-100 opacity-100 blur-none' : 'max-h-0 scale-y-95 opacity-0 blur-[2px] pointer-events-none'}`}
            >
                <div className="overflow-y-auto max-h-[calc(100vh-104px)] w-full">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-transparent border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            {selectedCategory ? (
                                <>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors group mr-4"
                                    >
                                        <div className="p-1.5 rounded-full bg-slate-800/50 group-hover:bg-slate-800/80 transition-colors">
                                            <ArrowLeft className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold">Ana Kategoriler</span>
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                                {getCategoryDisplayName(selectedCategory)}
                                            </h2>
                                            <span className="text-sm font-medium text-slate-400">
                                                ({subCategories.length} seri)
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Grid3X3 className="w-6 h-6 text-sky-400" />
                                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                                        Kategoriler
                                    </h2>
                                </>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800/80 rounded-full transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-w-[1400px] mx-auto min-h-[400px]">
                        {!selectedCategory ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {mainCategories.map((category) => {
                                        const subCount = getSubCategoryCount(category.id)
                                        return (
                                            <CategoryCard3D
                                                key={category.id}
                                                category={category}
                                                subCategoryCount={subCount}
                                                onClick={() => handleCategoryClick(category)}
                                            />
                                        )
                                    })}
                                </div>

                                {/* B2B Action Links / CTAs */}
                                <div className="mt-12 pt-8 border-t border-slate-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* CTA 1 */}
                                        <Link href="/proje-talep" className="group relative flex items-center gap-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-white font-bold mb-1">Proje Çözümü Talep Et</div>
                                                <div className="text-slate-400 text-sm">Mühendis ekibimizle ihtiyaç analizi yapın</div>
                                            </div>
                                        </Link>

                                        {/* CTA 2 */}
                                        <Link href="/teknik-dokumantasyon" className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-sky-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 group-hover:text-sky-400 transition-colors">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-slate-200 font-bold mb-1 group-hover:text-white transition-colors">Teknik Dokümantasyon</div>
                                                <div className="text-slate-400 text-sm">Şartname, BIM/Revit dosyaları ve CAD</div>
                                            </div>
                                        </Link>

                                        {/* CTA 3 */}
                                        <Link href="/katalog" className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-sky-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 group-hover:text-sky-400 transition-colors">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-slate-200 font-bold mb-1 group-hover:text-white transition-colors">Kataloğu İncele</div>
                                                <div className="text-slate-400 text-sm">2024 Endüstriyel Ürün Serisi</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {subCategories.map((subCategory) => (
                                    <div
                                        key={subCategory.id}
                                        onClick={() => handleSubCategoryClick(subCategory)}
                                        className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-sky-500/50 backdrop-blur-md hover:shadow-[0_0_30px_-10px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
                                    >
                                        <div className="text-lg font-bold text-white text-center mb-2">
                                            {getCategoryDisplayName(subCategory)}
                                        </div>
                                        <div className="text-sm text-slate-400 font-medium text-center flex items-center gap-1 group-hover:text-sky-400 transition-colors">
                                            İncele <ChevronRight size={14} className="text-sky-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay

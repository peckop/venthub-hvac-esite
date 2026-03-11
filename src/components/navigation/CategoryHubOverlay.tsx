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
                className={`absolute left-0 w-full top-[104px] bg-white/95 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-t border-slate-100 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] z-[90] ${isAnimating ? 'max-h-[calc(100vh-104px)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
                <div className="overflow-y-auto max-h-[calc(100vh-104px)] w-full">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            {selectedCategory ? (
                                <>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-primary-navy transition-colors group mr-4"
                                    >
                                        <div className="p-1.5 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                            <ArrowLeft className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold">Ana Kategoriler</span>
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
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
                                    <Grid3X3 className="w-6 h-6 text-primary-navy" />
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                        Kategoriler
                                    </h2>
                                </>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-800"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-w-[1400px] mx-auto min-h-[400px]">
                        {!selectedCategory ? (
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
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {subCategories.map((subCategory) => (
                                    <div
                                        key={subCategory.id}
                                        onClick={() => handleSubCategoryClick(subCategory)}
                                        className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg hover:shadow-primary-navy/5 transition-all cursor-pointer"
                                    >
                                        <div className="text-lg font-bold text-slate-800 text-center mb-2">
                                            {getCategoryDisplayName(subCategory)}
                                        </div>
                                        <div className="text-sm text-slate-500 font-medium text-center flex items-center gap-1 group-hover:text-secondary-blue transition-colors">
                                            İncele <ChevronRight size={14} className="text-secondary-blue" />
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

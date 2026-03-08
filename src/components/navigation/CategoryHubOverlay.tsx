'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X, Grid3X3, ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CategoryCard3D from './CategoryCard3D'
import type { Category } from '../../lib/supabase'
import { useI18n } from '../../i18n/I18nProvider'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryHubOverlayProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
    isLoading: boolean
    loadError: string | null
    hasLoadedOnce: boolean
    onRetry: () => void
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
    isLoading,
    loadError,
    hasLoadedOnce,
    onRetry,
    onCategorySelect
}) => {
    const router = useRouter()
    const { t } = useI18n()
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
            className={`fixed inset-0 z-[100] transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-primary-navy to-slate-900 rounded-3xl shadow-2xl transition-all duration-300 ${isAnimating
                    ? '-translate-y-1/2 scale-100'
                    : '-translate-y-[40%] scale-95'
                    }`}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center gap-3">
                        {selectedCategory ? (
                            <>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group mr-4"
                                >
                                    <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{t('categoryHub.mainCategories')}</span>
                                    <ChevronRight className="w-4 h-4 text-white/30" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white">
                                            {getCategoryDisplayName(selectedCategory)}
                                        </h2>
                                        <span className="text-sm text-white/50">
                                            ({t('categoryHub.seriesCount', { count: subCategories.length })})
                                        </span>
                                    </div>
                                    {selectedCategory.description && (
                                        <p className="text-sm text-gray-400 mt-0.5 line-clamp-1 max-w-xl">
                                            {selectedCategory.description}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Grid3X3 className="w-6 h-6 text-secondary-blue" />
                                <h2 className="text-xl font-bold text-white">
                                    {t('common.categories')}
                                </h2>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label={t('common.close')}
                    >
                        <X className="w-6 h-6 text-white/70 hover:text-white" />
                    </button>
                </div>

                {/* Content: Ana Kategoriler veya Alt Kategoriler */}
                <div className="p-6">
                    {selectedCategory ? (
                        /* Alt Kategoriler Grid - ARTIK 3D KARTLAR */
                        subCategories.filter(subCat => subCat.slug !== selectedCategory.slug).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {subCategories.filter(subCat => subCat.slug !== selectedCategory.slug).map((subCat) => (
                                    <CategoryCard3D
                                        key={subCat.id}
                                        category={subCat}
                                        subCategoryCount={0}
                                        onClick={() => handleSubCategoryClick(subCat)}
                                    />
                                ))}

                                <Link
                                    href={`/category/${selectedCategory.slug}`}
                                    onClick={() => onClose()}
                                    className="group relative flex flex-col items-center justify-center p-6 bg-secondary-blue/10 hover:bg-secondary-blue/20 border-2 border-dashed border-secondary-blue/30 hover:border-secondary-blue rounded-2xl transition-all duration-300 h-40"
                                >
                                    <div className="p-3 rounded-full bg-secondary-blue/20 group-hover:bg-secondary-blue/30 mb-3 transition-colors">
                                        <ChevronRight className="w-8 h-8 text-secondary-blue" />
                                    </div>
                                    <span className="font-semibold text-secondary-blue text-center group-hover:text-white transition-colors">
                                        {t('categoryHub.viewAllInCategory', {
                                            category: getCategoryDisplayName(selectedCategory)
                                        })}
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/70">
                                {t('categoryHub.noSubcategories')}
                            </div>
                        )
                    ) : (
                        /* Ana Kategoriler Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse flex flex-col justify-end p-4">
                                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-1/4 bg-white/5 rounded" />
                                    </div>
                                ))
                            ) : loadError ? (
                                <div className="col-span-full rounded-2xl border border-rose-400/20 bg-rose-500/10 px-6 py-10 text-center">
                                    <p className="text-sm text-white/80">{loadError}</p>
                                    <button
                                        type="button"
                                        onClick={onRetry}
                                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-navy transition-colors hover:bg-secondary-blue hover:text-white"
                                    >
                                        {t('common.retry')}
                                    </button>
                                </div>
                            ) : mainCategories.length > 0 ? (
                                mainCategories.map((category) => (
                                    <CategoryCard3D
                                        key={category.id}
                                        category={category}
                                        subCategoryCount={getSubCategoryCount(category.id)}
                                        onClick={() => handleCategoryClick(category)}
                                    />
                                ))
                            ) : hasLoadedOnce ? (
                                <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/70">
                                    {t('categoryHub.empty')}
                                </div>
                            ) : (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse flex flex-col justify-end p-4">
                                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-1/4 bg-white/5 rounded" />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-sm text-white/50">
                        {selectedCategory
                            ? t('categoryHub.subcategoryHint')
                            : t('categoryHub.categoryHint')}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay





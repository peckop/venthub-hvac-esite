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
                                    <span className="text-sm font-medium">Ana Kategoriler</span>
                                    <ChevronRight className="w-4 h-4 text-white/30" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white">
                                            {getCategoryDisplayName(selectedCategory)}
                                        </h2>
                                        <span className="text-sm text-white/50">
                                            ({subCategories.length} seri)
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
                                    Kategoriler
                                </h2>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Kapat"
                    >
                        <X className="w-6 h-6 text-white/70 hover:text-white" />
                    </button>
                </div>

                {/* Content: Ana Kategoriler veya Alt Kategoriler */}
                <div className="p-6">
                    {selectedCategory ? (
                        /* Alt Kategoriler Grid - ARTIK 3D KARTLAR */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {subCategories.map((subCat) => (
                                <CategoryCard3D
                                    key={subCat.id}
                                    category={subCat}
                                    subCategoryCount={0} // Alt kategorinin altı yok
                                    onClick={() => handleSubCategoryClick(subCat)}
                                />
                            ))}

                            {/* Tüm Ürünleri Gör butonu - Grid içinde şık durması için kart boyutunda */}
                            <Link
                                href={`/category/${selectedCategory.slug}`}
                                onClick={() => onClose()}
                                className="group relative flex flex-col items-center justify-center p-6 bg-secondary-blue/10 hover:bg-secondary-blue/20 border-2 border-dashed border-secondary-blue/30 hover:border-secondary-blue rounded-2xl transition-all duration-300 h-40"
                            >
                                <div className="p-3 rounded-full bg-secondary-blue/20 group-hover:bg-secondary-blue/30 mb-3 transition-colors">
                                    <ChevronRight className="w-8 h-8 text-secondary-blue" />
                                </div>
                                <span className="font-semibold text-secondary-blue text-center group-hover:text-white transition-colors">
                                    Tüm {getCategoryDisplayName(selectedCategory)} <br /> Ürünlerini Gör
                                </span>
                            </Link>
                        </div>
                    ) : (
                        /* Ana Kategoriler Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mainCategories.map((category) => (
                                <CategoryCard3D
                                    key={category.id}
                                    category={category}
                                    subCategoryCount={getSubCategoryCount(category.id)}
                                    onClick={() => handleCategoryClick(category)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 pb-6 text-center">
                    <p className="text-sm text-white/50">
                        {selectedCategory
                            ? 'Bir alt kategori seçerek ürünleri görüntüleyin'
                            : 'Bir kategori seçerek alt serileri görüntüleyin'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay


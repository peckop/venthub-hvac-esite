'use client'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useCallback,useEffect, useMemo, useState } from 'react'

import { useCategories } from '../../contexts/CategoryContext'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes'

const FADE_IN_DOWN_CSS = `@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`
const FADE_IN_CSS = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`
const SCALE_IN_CSS = `@keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`

const OrbitalProductsShowcase = dynamic(() => import('./OrbitalProductsShowcase'), { ssr: false })

// Helper to determine 3D model type based on slug
const getModelTypeForCategory = (slug?: string): string | undefined => {
    if (!slug) return undefined
    const s = slug.toLowerCase()
    
    // Families / Groups
    if (s.includes('perde') || s.includes('air-curtain')) return 'AirCurtainModel'
    if (s.includes('temizleyici')) return 'AirPurifierModel'
    if (s.includes('nem-alma') || s.includes('dehumidifier')) return 'DehumidifierModel'
    if (s.includes('heat-recovery') || s.includes('isi-geri')) return 'HRVModel'
    if (s.includes('speed-control') || s.includes('hiz-kontrol')) return 'SpeedControlModel'
    if (s.includes('accessories') || s.includes('aksesuar')) return 'AccessoryModel'
    if (s.includes('flexible')) return 'FlexibleDuctModel'
    
    // Fans
    if (s.includes('exproof') || s.includes('atex')) return 'ExproofFanModel'
    if (s.includes('roof') || s.includes('cati')) return 'RoofFanModel'
    if (s.includes('sessiz') || s.includes('silent')) return 'SilentChannelFanModel'
    if (s.includes('kanal') || s.includes('round')) return 'RoundDuctFanModel'
    if (s.includes('rectangular') || s.includes('siginak')) return 'RectangularDuctFanModel'
    if (s.includes('smoke') || s.includes('duman')) return 'SmokeExhaustFanModel'
    if (s.includes('jet') || s.includes('otopark')) return 'JetFanModel'
    if (s.includes('santrifuj') || s.includes('radyal') || s.includes('quadro')) return 'SnailFanModel'
    if (s.includes('plug')) return 'PlugFanModel'
    if (s.includes('nicotra')) return 'NicotraFanModel'
    
    // Default
    if (s.includes('residential') || s.includes('konut')) return 'DomesticFanModel'
    if (s.includes('industrial') || s.includes('endustriyel')) return 'AxialFanModel'
    
    return 'AxialFanModel'
}

interface CategoryOrbitCarouselProps {
    onSubcategorySelect?: (categorySlug: string, subcategorySlug?: string) => void
    compact?: boolean
}

const CategoryOrbitCarousel = ({ onSubcategorySelect, compact = false }: CategoryOrbitCarouselProps) => {
    const router = useRouter()
    const { categories, loading: categoriesLoading } = useCategories()
    const { wrapCategory } = useCategoryViewModel()
    const { t } = useI18n()
    
    const [level, setLevel] = useState<'main' | 'subcategory'>('main')
    const [activeMainCategorySlug, setActiveMainCategorySlug] = useState<string | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [focusedItemTitle, setFocusedItemTitle] = useState<string | null>(null) 
    const [frontCardTitle, setFrontCardTitle] = useState<string | null>(null) 
    const [hintIndex, setHintIndex] = useState(0) 

    const ROTATING_HINTS = ['Tut Çevir', 'Ürüne Tıkla', 'Sol-Sağ Çevir', 'Kategoriyi Seç']

    // 1. Prepare Main Categories (ViewModels)
    const mainCategories = useMemo(() => {
        return categories
            .filter(c => !c.parent_id)
            .map(c => wrapCategory(c))
            .filter((vm): vm is NonNullable<typeof vm> => vm !== null)
    }, [categories, wrapCategory])

    const activeMainCategory = useMemo(() => {
        return mainCategories.find(c => c.slug === activeMainCategorySlug) || null
    }, [mainCategories, activeMainCategorySlug])

    // 2. Prepare Subcategories for Active Main
    const subcategories = useMemo(() => {
        if (!activeMainCategory) return []
        return categories
            .filter(c => c.parent_id === activeMainCategory.id)
            .map(c => wrapCategory(c))
            .filter((vm): vm is NonNullable<typeof vm> => vm !== null)
    }, [categories, activeMainCategory, wrapCategory])

    const mainCategoriesMap = useMemo(() => {
        const map = new Map();
        for (const c of mainCategories) {
            if (!map.has(c.slug)) map.set(c.slug, c);
        }
        return map;
    }, [mainCategories])

    const subcategoriesMap = useMemo(() => {
        const map = new Map();
        for (const s of subcategories) {
            if (!map.has(s.slug)) map.set(s.slug, s);
        }
        return map;
    }, [subcategories])

    const handleFocusedItemChange = useCallback((itemId: string | null) => {
        if (!itemId) {
            setFocusedItemTitle(null)
            setHintIndex(0)
            return
        }

        let title = ''
        if (level === 'main') {
            const cat = mainCategoriesMap.get(itemId)
            title = cat ? cat.displayName : ''
        } else if (level === 'subcategory') {
            const sub = subcategoriesMap.get(itemId)
            title = sub ? sub.displayName : ''
        }
        setFocusedItemTitle(title)
    }, [level, mainCategoriesMap, subcategoriesMap])

    const handleFrontCardChange = useCallback((itemId: string) => {
        let title = ''
        if (level === 'main') {
            const cat = mainCategoriesMap.get(itemId)
            title = cat ? cat.displayName : ''
        } else if (level === 'subcategory') {
            const sub = subcategoriesMap.get(itemId)
            title = sub ? sub.displayName : ''
        }
        setFrontCardTitle(title)
        setHintIndex(prev => (prev + 1) % 4) 
    }, [level, mainCategoriesMap, subcategoriesMap])

    useEffect(() => {
        setFocusedItemTitle(null)
        setFrontCardTitle(null)
    }, [level])

    const displayItems = useMemo(() => {
        if (level === 'main') {
            return mainCategories.map(vm => {
                // SSOT: DB metadata.model_type öncelikli, slug-inference fallback
                const rawCat = categories.find(c => c.slug === vm.slug)
                const dbModelType = (rawCat?.metadata as { model_type?: string } | null)?.model_type
                return {
                    id: vm.slug,
                    title: vm.displayName,
                    image: vm.imageUrl || '/images/hvac_installation_close_up_premium_3.webp',
                    categorySlug: vm.slug,
                    modelType: dbModelType || getModelTypeForCategory(vm.slug)
                }
            })
        } else if (level === 'subcategory') {
            return subcategories.map(vm => {
                // SSOT: DB metadata.model_type öncelikli, slug-inference fallback
                const rawCat = categories.find(c => c.slug === vm.slug)
                const dbModelType = (rawCat?.metadata as { model_type?: string } | null)?.model_type
                return {
                    id: vm.slug,
                    title: vm.displayName,
                    image: vm.imageUrl || '/images/hvac_installation_close_up_premium_3.webp',
                    categorySlug: vm.slug,
                    modelType: dbModelType || getModelTypeForCategory(vm.slug)
                }
            })
        }
        return []
    }, [level, mainCategories, subcategories, categories])

    const handleCardClick = useCallback((itemId: string) => {
        if (level === 'main') {
            const categoryVm = mainCategoriesMap.get(itemId)
            if (categoryVm) {
                // Check if has subs
                const hasSubs = categories.some(c => c.parent_id === categoryVm.id)
                if (hasSubs) {
                    setIsTransitioning(true)
                    setActiveMainCategorySlug(categoryVm.slug)
                    setTimeout(() => {
                        setLevel('subcategory')
                        setIsTransitioning(false)
                    }, 400)
                } else {
                    if (onSubcategorySelect) {
                        onSubcategorySelect(categoryVm.slug)
                    } else {
                        router.push(Routes.category(categoryVm.slug))
                    }
                }
            }
        } else if (level === 'subcategory') {
            const subVm = subcategoriesMap.get(itemId)
            if (subVm && activeMainCategorySlug) {
                if (onSubcategorySelect) {
                    onSubcategorySelect(activeMainCategorySlug, subVm.slug)
                } else {
                    router.push(Routes.category(activeMainCategorySlug, subVm.slug))
                }
            }
        }
    }, [level, mainCategoriesMap, subcategoriesMap, activeMainCategorySlug, categories, router, onSubcategorySelect])

    const handleBack = useCallback(() => {
        setIsTransitioning(true)
        setTimeout(() => {
            setLevel('main')
            setActiveMainCategorySlug(null)
            setIsTransitioning(false)
        }, 400)
    }, [])

    const handleViewAllProducts = useCallback(() => {
        if (activeMainCategorySlug) {
            router.push(Routes.category(activeMainCategorySlug))
        }
    }, [activeMainCategorySlug, router])

    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkMobile)
            return () => window.removeEventListener('resize', checkMobile)
        }
    }, [])

    if (categoriesLoading) {
        return <div className="h-hvac-panel flex items-center justify-center bg-surface-darker w-full" />
    }

    const responsiveHeight = compact ? (isMobile ? 220 : 280) : (isMobile ? 380 : 500)
    const responsiveModelScale = compact ? (isMobile ? 0.7 : 0.9) : (isMobile ? 1.1 : 1.5)

    return (
        <section className="bg-surface-darker overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div 
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-orbit-radial-1 ${level === 'main' ? 'opacity-100' : 'opacity-0'}`} 
                />
                <div 
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-orbit-radial-2 ${level === 'subcategory' ? 'opacity-100' : 'opacity-0'}`} 
                />
            </div>

            {level === 'subcategory' && activeMainCategory && (
                    <div
                        className="absolute top-4 left-0 right-0 z-40 container mx-auto px-4"
                        style={{ animation: 'fadeInDown 0.3s ease-out' }}
                    >
                        <style>{FADE_IN_DOWN_CSS}</style>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-transform duration-300 group w-full sm:w-auto hover:scale-102 active:scale-98"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">{t('common.back')}</span>
                                <span className="text-sm font-bold text-cyan-400 truncate max-w-150px ml-2">
                                    {activeMainCategory.displayName}
                                </span>
                            </button>

                            <button
                                onClick={handleViewAllProducts}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-transform duration-300 w-full sm:w-auto hover:scale-102 active:scale-98"
                            >
                                {t('common.seeAllProducts')}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

            <div className="absolute top-6 left-0 right-0 z-30 container mx-auto px-4">
                <div
                    key={level}
                    className="text-center"
                    style={{ animation: 'fadeIn 0.3s ease-out', marginTop: level === 'subcategory' ? (isMobile ? '5.5rem' : '3rem') : 0 }}
                >
                    <style>{FADE_IN_CSS}</style>
                    <h2 className="text-xl md:text-3xl font-bold text-white/90">
                        {focusedItemTitle || frontCardTitle || (level === 'main' ? 'Ürün Yelpazemizi Keşfedin' : `${activeMainCategory?.displayName} Alt Kategorileri`)}
                    </h2>
                    <p className="text-white/50 text-xs sm:text-sm mt-2 font-medium tracking-wide">
                        {focusedItemTitle
                            ? (level === 'main'
                                ? (isMobile ? 'Dokun: Aç • Çift Dokun: Git' : 'Tek tık: Kategoriyi Aç • Çift tık: Sayfaya Git')
                                : (isMobile ? 'Dokunarak Sayfaya Gidin' : 'Tıklayarak Ürün Sayfasına Gidin'))
                            : ROTATING_HINTS[hintIndex]
                        }
                    </p>
                </div>
            </div>

            <div className="w-full relative z-10 flex justify-center items-center overflow-hidden" style={{ minHeight: responsiveHeight }}>
                <div
                    key={level}
                    className="w-full max-w-page will-change-transform"
                    style={{ animation: 'scaleIn 0.4s ease-out' }}
                >
                    <style>{SCALE_IN_CSS}</style>
                    <React.Suspense fallback={<div className="flex items-center justify-center bg-surface-darker w-full" style={{ minHeight: responsiveHeight }} />}>
                        <OrbitalProductsShowcase
                            items={displayItems}
                            onCardClick={handleCardClick}
                            externalPause={isTransitioning}
                            onFocusedItemChange={handleFocusedItemChange}
                            onFrontCardChange={handleFrontCardChange}
                            modelScale={responsiveModelScale}
                            containerHeight={responsiveHeight}
                            skipHints={level === 'subcategory'}
                        />
                    </React.Suspense>
                </div>
            </div>
        </section>
    )
}

export default CategoryOrbitCarousel

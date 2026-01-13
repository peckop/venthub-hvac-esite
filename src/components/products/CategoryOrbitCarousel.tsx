import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Wind, Zap, Activity, Fan, Settings, Droplets } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OrbitalProductsShowcase from './OrbitalProductsShowcase'
import CategoryPreviewPanel, { CategoryPreviewData } from './CategoryPreviewPanel'
import RadialActionMenu from './RadialActionMenu'
import { CATEGORY_REGISTRY } from '@/config/categoryRegistry'

// --- Category Data using OFFICIAL SLUGS from categoryRegistry ---
export interface CategoryCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    image: string
    color: string
    productCount?: number
    priceRange?: { min: number; max: number }
}

const categories: CategoryCard[] = [
    {
        id: CATEGORY_REGISTRY.HAVA_PERDELERI.slug,
        title: CATEGORY_REGISTRY.HAVA_PERDELERI.name,
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri. Kapı girişlerinde ısı kaybını önler, enerji tasarrufu sağlar.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/air-curtain.png',
        color: 'from-cyan-500 to-blue-600',
        productCount: 24,
        priceRange: { min: 3500, max: 25000 }
    },
    {
        id: CATEGORY_REGISTRY.FANLAR.slug,
        title: CATEGORY_REGISTRY.FANLAR.name,
        description: 'Yüksek performanslı havalandırma ve egzoz sistemleri. Endüstriyel ve ticari uygulamalar için tasarlandı.',
        icon: <Fan className="w-6 h-6" />,
        image: '/images/products/industrial-fan.png',
        color: 'from-blue-500 to-indigo-600',
        productCount: 45,
        priceRange: { min: 1200, max: 18000 }
    },
    {
        id: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.slug,
        title: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.name,
        description: 'Maksimum enerji tasarrufu sağlayan taze hava üniteleri. Kış ve yaz aylarında enerji verimliliği.',
        icon: <Activity className="w-6 h-6" />,
        image: '/images/products/hrv-unit.png',
        color: 'from-emerald-500 to-teal-600',
        productCount: 18,
        priceRange: { min: 8000, max: 45000 }
    },
    {
        id: CATEGORY_REGISTRY.HIZ_KONTROL.slug,
        title: CATEGORY_REGISTRY.HIZ_KONTROL.name,
        description: 'Fan ve motor hız kontrol sistemleri. Enerji tasarrufu ve sessiz çalışma için optimize edilmiş.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/speed-controller.png',
        color: 'from-orange-500 to-red-600',
        productCount: 12,
        priceRange: { min: 450, max: 3500 }
    },
    {
        id: CATEGORY_REGISTRY.HAVA_TEMIZLEYICILER.slug,
        title: 'Hava Temizleyiciler',
        description: 'Anti-viral ve hava temizleme çözümleri. Sağlıklı iç mekan havası için profesyonel sistemler.',
        icon: <Zap className="w-6 h-6" />,
        image: '/images/products/air-purifier.png',
        color: 'from-violet-500 to-purple-600',
        productCount: 8,
        priceRange: { min: 2500, max: 15000 }
    },
    {
        id: CATEGORY_REGISTRY.NEM_ALMA.slug,
        title: CATEGORY_REGISTRY.NEM_ALMA.name,
        description: 'Profesyonel nem kontrol çözümleri. Endüstriyel ve ticari alanlarda nem problemlerini çözün.',
        icon: <Droplets className="w-6 h-6" />,
        image: '/images/products/dehumidifier.png',
        color: 'from-sky-500 to-cyan-600',
        productCount: 15,
        priceRange: { min: 4000, max: 22000 }
    },
    {
        id: CATEGORY_REGISTRY.FLEXIBLE.slug,
        title: CATEGORY_REGISTRY.FLEXIBLE.name,
        description: 'Esnek hava kanalı çözümleri. Kolay montaj ve yüksek dayanıklılık.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/flexible-duct.png',
        color: 'from-amber-500 to-yellow-600',
        productCount: 20,
        priceRange: { min: 150, max: 1200 }
    },
    {
        id: CATEGORY_REGISTRY.AKSESUARLAR.slug,
        title: CATEGORY_REGISTRY.AKSESUARLAR.name,
        description: 'Havalandırma sistem aksesuarları. Montaj malzemeleri, bağlantı elemanları ve yedek parçalar.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/accessories.png',
        color: 'from-rose-500 to-pink-600',
        productCount: 35,
        priceRange: { min: 50, max: 800 }
    }
]

const CategoryOrbitCarousel = () => {
    const navigate = useNavigate()
    const containerRef = useRef<HTMLElement>(null)

    // Quick View Panel State (korunuyor)
    const [selectedCategory, setSelectedCategory] = useState<CategoryPreviewData | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    // Radial Menu State
    const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false)
    const [radialMenuPosition, setRadialMenuPosition] = useState({ x: 0, y: 0 })
    const [radialMenuCategoryId, setRadialMenuCategoryId] = useState<string | null>(null)
    const [radialMenuCategoryTitle, setRadialMenuCategoryTitle] = useState('')

    // Kart tıklandığında Radial Menu aç
    const handleCardClick = useCallback((itemId: string, event?: MouseEvent) => {
        const category = categories.find(c => c.id === itemId)
        if (category) {
            // Tıklama pozisyonunu al (ekran ortasına yakın)
            const x = event?.clientX ?? window.innerWidth / 2
            const y = event?.clientY ?? window.innerHeight / 2

            setRadialMenuCategoryId(itemId)
            setRadialMenuCategoryTitle(category.title)
            setRadialMenuPosition({ x, y })
            setIsRadialMenuOpen(true)
        }
    }, [])

    const handleCloseRadialMenu = useCallback(() => {
        setIsRadialMenuOpen(false)
    }, [])

    // Radial Menu Aksiyonları
    const handleSelectSubcategories = useCallback(() => {
        // TODO: Faz 4.2'de alt kategoriler radial genişlemesi
        console.warn('[Radial] Alt kategoriler seçildi:', radialMenuCategoryId)
    }, [radialMenuCategoryId])

    const handleSelectProductInfo = useCallback(() => {
        // Kategori sayfasına git (ileride VentHub Geçişi ile)
        if (radialMenuCategoryId) {
            navigate(`/category/${radialMenuCategoryId}`)
        }
    }, [radialMenuCategoryId, navigate])

    const handleSelectPriceInfo = useCallback(() => {
        // Quick View Panel'i aç (fiyat bilgisi için)
        const category = categories.find(c => c.id === radialMenuCategoryId)
        if (category) {
            setSelectedCategory({
                id: category.id,
                title: category.title,
                description: category.description,
                image: category.image,
                icon: category.icon,
                color: category.color,
                productCount: category.productCount,
                priceRange: category.priceRange
            })
            setIsPanelOpen(true)
        }
    }, [radialMenuCategoryId])

    const handleSelectTechnicalWizard = useCallback(() => {
        // Wizard sayfasına git
        if (radialMenuCategoryId) {
            navigate(`/category/${radialMenuCategoryId}#wizard`)
        }
    }, [radialMenuCategoryId, navigate])

    const handleClosePanel = useCallback(() => {
        setIsPanelOpen(false)
    }, [])

    return (
        <section ref={containerRef} className="bg-[#020617] overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617] pointer-events-none" />

            {/* Integrated Title - Üstte overlay */}
            <div className="absolute top-6 left-0 right-0 z-30 container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold text-white/90 text-center"
                >
                    Ürün Yelpazemizi Keşfedin
                </motion.h2>
            </div>

            <div className="container mx-auto px-4 relative z-10 w-full">
                {/* 3D Showcase */}
                <OrbitalProductsShowcase
                    items={categories.map(c => ({ id: c.id, title: c.title, image: c.image }))}
                    onCardClick={handleCardClick}
                />
            </div>

            {/* Radial Action Menu */}
            <RadialActionMenu
                isOpen={isRadialMenuOpen}
                onClose={handleCloseRadialMenu}
                position={radialMenuPosition}
                categoryId={radialMenuCategoryId || ''}
                categoryTitle={radialMenuCategoryTitle}
                onSelectSubcategories={handleSelectSubcategories}
                onSelectProductInfo={handleSelectProductInfo}
                onSelectPriceInfo={handleSelectPriceInfo}
                onSelectTechnicalWizard={handleSelectTechnicalWizard}
            />

            {/* Quick View Panel (korunuyor, fiyat bilgisi için kullanılıyor) */}
            <CategoryPreviewPanel
                category={selectedCategory}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </section>
    )
}

export default CategoryOrbitCarousel



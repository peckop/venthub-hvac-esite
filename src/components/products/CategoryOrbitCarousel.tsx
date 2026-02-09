import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Ban as Fan, Settings, Droplets, ArrowLeft, ChevronRight, Activity, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OrbitalProductsShowcase from './OrbitalProductsShowcase'
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

// Alt kategori için tip
interface SubcategoryItem {
    id: string
    slug: string
    title: string
    parentSlug: string
    image: string
}

const categories: CategoryCard[] = [
    {
        id: CATEGORY_REGISTRY.HAVA_PERDELERI.slug,
        title: CATEGORY_REGISTRY.HAVA_PERDELERI.name,
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/air-curtain.png',
        color: 'from-cyan-500 to-blue-600',
        productCount: 24,
        priceRange: { min: 3500, max: 25000 }
    },
    {
        id: CATEGORY_REGISTRY.FANLAR.slug,
        title: CATEGORY_REGISTRY.FANLAR.name,
        description: 'Yüksek performanslı havalandırma ve egzoz sistemleri.',
        icon: <Fan className="w-6 h-6" />,
        image: '/images/products/industrial-fan.png',
        color: 'from-blue-500 to-indigo-600',
        productCount: 45,
        priceRange: { min: 1200, max: 18000 }
    },
    {
        id: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.slug,
        title: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.name,
        description: 'Maksimum enerji tasarrufu sağlayan taze hava üniteleri.',
        icon: <Activity className="w-6 h-6" />,
        image: '/images/products/hrv-unit.png',
        color: 'from-emerald-500 to-teal-600',
        productCount: 18,
        priceRange: { min: 8000, max: 45000 }
    },
    {
        id: CATEGORY_REGISTRY.HIZ_KONTROL.slug,
        title: CATEGORY_REGISTRY.HIZ_KONTROL.name,
        description: 'Fan ve motor hız kontrol sistemleri.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/speed-controller.png',
        color: 'from-orange-500 to-red-600',
        productCount: 12,
        priceRange: { min: 450, max: 3500 }
    },
    {
        id: CATEGORY_REGISTRY.HAVA_TEMIZLEYICILER.slug,
        title: 'Hava Temizleyiciler',
        description: 'Anti-viral ve hava temizleme çözümleri.',
        icon: <Zap className="w-6 h-6" />,
        image: '/images/products/air-purifier.png',
        color: 'from-violet-500 to-purple-600',
        productCount: 8,
        priceRange: { min: 2500, max: 15000 }
    },
    {
        id: CATEGORY_REGISTRY.NEM_ALMA.slug,
        title: CATEGORY_REGISTRY.NEM_ALMA.name,
        description: 'Profesyonel nem kontrol çözümleri.',
        icon: <Droplets className="w-6 h-6" />,
        image: '/images/products/dehumidifier.png',
        color: 'from-sky-500 to-cyan-600',
        productCount: 15,
        priceRange: { min: 4000, max: 22000 }
    },
    {
        id: CATEGORY_REGISTRY.FLEXIBLE.slug,
        title: CATEGORY_REGISTRY.FLEXIBLE.name,
        description: 'Esnek hava kanalı çözümleri.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/flexible-duct.png',
        color: 'from-amber-500 to-yellow-600',
        productCount: 20,
        priceRange: { min: 150, max: 1200 }
    },
    {
        id: CATEGORY_REGISTRY.AKSESUARLAR.slug,
        title: CATEGORY_REGISTRY.AKSESUARLAR.name,
        description: 'Havalandırma sistem aksesuarları.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/accessories.png',
        color: 'from-rose-500 to-pink-600',
        productCount: 35,
        priceRange: { min: 50, max: 800 }
    }
]

// Alt kategori label formatla
const formatSubcategoryLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
        // Fanlar
        BASINCLANDIRMA: 'Basınçlandırma Fanları',
        CATI_TIPI: 'Çatı Tipi Fanlar',
        DUMAN_EGZOZ: 'Duman Egzoz Fanları',
        DUVAR_TIPI: 'Duvar Tipi Fanlar',
        KANAL_TIPI: 'Kanal Tipi Fanlar',
        OTOPARK_JET: 'Otopark Jet Fanları',
        ENDUSTRIYEL: 'Endüstriyel Fanlar',
        KONUT_TIPI: 'Konut Tipi',
        PLUG: 'Plug Fanlar',
        SANTRIFUJ: 'Santrifüj Fanlar',
        SIGINAK: 'Sığınak Fanları',
        SESSIZ_KANAL: 'Sessiz Kanal Tipi',
        NICOTRA: 'Nicotra Gebhardt',
        // Hava Perdeleri
        ELEKTRIKLI: 'Elektrikli Isıtıcı',
        ORTAM_HAVALI: 'Ortam Havalı',
        // Isı Geri Kazanım
        TICARI_TIP: 'Ticari Tip',
        // Hava Temizleyiciler
        DEPURO_PRO: 'Depuro Pro',
        SG_DISPENSER: 'SG Dispenser',
        UV_LOGIKA: 'UV Logika',
        VORT_SUPER_DRY: 'Vort Super Dry',
        // Hız Kontrol
        FREKANS_KONVERTOR: 'Frekans Konvertörü',
        HIZ_ANAHTARI: 'Hız Anahtarı',
        // Aksesuarlar
        ALUMINYUM_BANT: 'Alüminyum Bantlar',
        BAGLANTI_KONNEKTORU: 'Bağlantı Konnektörü',
        GEMICI_ANEMOSTADI: 'Gemici Anemostadı',
        PLASTIK_KELEPCE: 'Plastik Kelepçeler'
    }
    return labelMap[key] || key.toLowerCase().replace(/_/g, ' ')
}

// Kategori slug'ından alt kategorileri al
const getSubcategoriesForCategory = (categorySlug: string): SubcategoryItem[] => {
    const entries = Object.entries(CATEGORY_REGISTRY)
    const found = entries.find(([, val]) => val.slug === categorySlug)

    if (!found) return []

    const subs = found[1].subs as Record<string, string>
    if (!subs || Object.keys(subs).length === 0) return []

    return Object.entries(subs).map(([key, slug]) => ({
        id: slug,
        slug,
        title: formatSubcategoryLabel(key),
        parentSlug: categorySlug,
        // Alt kategoriler için placeholder image - ileride gerçek görseller eklenebilir
        image: `/images/subcategories/${slug}.png`
    }))
}

// Carousel seviyesi
type CarouselLevel = 'main' | 'subcategory'

const CategoryOrbitCarousel = () => {
    const navigate = useNavigate()

    // Carousel State
    const [level, setLevel] = useState<CarouselLevel>('main')
    const [activeMainCategory, setActiveMainCategory] = useState<CategoryCard | null>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [focusedItemTitle, setFocusedItemTitle] = useState<string | null>(null) // Tıklanan (focus) kart
    const [frontCardTitle, setFrontCardTitle] = useState<string | null>(null) // Dönerken önde olan kart
    const [hintIndex, setHintIndex] = useState(0) // Dönen hint bilgileri için

    // Dönen hint bilgileri (Emoji'siz - Profesyonel)
    const ROTATING_HINTS = [
        'Tut Çevir',
        'Ürüne Tıkla',
        'Sol-Sağ Çevir',
        'Kategoriyi Seç',
    ]

    // Alt kategorileri hesapla
    const subcategories = useMemo(() => {
        if (!activeMainCategory) return []
        return getSubcategoriesForCategory(activeMainCategory.id)
    }, [activeMainCategory])

    const handleFocusedItemChange = useCallback((itemId: string | null) => {
        if (!itemId) {
            setFocusedItemTitle(null)
            setHintIndex(0) // Sayfa ilk yüklenmiş gibi - dönen bilgiler baştan başlasın
            return
        }

        let title = ''
        if (level === 'main') {
            const cat = categories.find(c => c.id === itemId)
            title = cat ? cat.title : ''
        } else {
            const sub = subcategories.find(s => s.slug === itemId)
            title = sub ? sub.title : ''
        }
        setFocusedItemTitle(title)
    }, [level, subcategories])

    // Dönerken önde olan kartın adını güncelle ve hint index'i artır
    const handleFrontCardChange = useCallback((itemId: string) => {
        let title = ''
        if (level === 'main') {
            const cat = categories.find(c => c.id === itemId)
            title = cat ? cat.title : ''
        } else {
            const sub = subcategories.find(s => s.slug === itemId)
            title = sub ? sub.title : ''
        }
        setFrontCardTitle(title)
        setHintIndex(prev => (prev + 1) % 4) // 4 farklı hint arasında dön
    }, [level, subcategories])

    // Reset focus when level changes
    useEffect(() => {
        setFocusedItemTitle(null)
        setFrontCardTitle(null)
    }, [level])



    // Gösterilecek öğeler (level'a göre)
    const displayItems = useMemo(() => {
        if (level === 'main') {
            return categories.map(c => ({
                id: c.id,
                title: c.title,
                image: c.image,
                categorySlug: c.id
            }))
        } else {
            return subcategories.map(s => ({
                id: s.slug,
                title: s.title,
                image: s.image,
                // DÜZELTME: Alt kategorinin kendi slug'ını kullan
                categorySlug: s.slug
            }))
        }
    }, [level, subcategories])

    // Kart tıklama - Ana kategori veya alt kategori
    const handleCardClick = useCallback((itemId: string) => {
        if (level === 'main') {
            const category = categories.find(c => c.id === itemId)
            if (category) {
                const subs = getSubcategoriesForCategory(category.id)
                if (subs.length > 0) {
                    // Alt kategorilere geçiş
                    setIsTransitioning(true)
                    setActiveMainCategory(category)

                    // Animasyon için delay
                    setTimeout(() => {
                        setLevel('subcategory')
                        setIsTransitioning(false)
                    }, 400)
                } else {
                    // Alt kategori yoksa direkt sayfaya git
                    navigate(`/category/${category.id}`)
                }
            }
        } else {
            // Alt kategoriye tıklandı - sayfaya git
            if (activeMainCategory) {
                navigate(`/category/${activeMainCategory.id}/${itemId}`)
            }
        }
    }, [level, activeMainCategory, navigate])

    // Geri dönüş
    const handleBack = useCallback(() => {
        setIsTransitioning(true)
        setTimeout(() => {
            setLevel('main')
            setActiveMainCategory(null)
            setIsTransitioning(false)
        }, 400)
    }, [])

    // Ana kategoriye git (View All)
    const handleViewAllProducts = useCallback(() => {
        if (activeMainCategory) {
            navigate(`/category/${activeMainCategory.id}`)
        }
    }, [activeMainCategory, navigate])

    return (
        <section className="bg-[#020617] overflow-hidden relative">
            {/* Background Atmosphere */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: level === 'main'
                        ? 'radial-gradient(circle at center, rgba(30,41,59,0.5) 0%, rgb(2,6,23) 70%)'
                        : `radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, rgb(2,6,23) 70%)`
                }}
                transition={{ duration: 0.8 }}
            />

            {/* Breadcrumb Navigation */}
            <AnimatePresence>
                {level === 'subcategory' && activeMainCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-4 left-0 right-0 z-40 container mx-auto px-4"
                    >
                        <div className="flex items-center justify-between">
                            {/* Geri Butonu + Breadcrumb */}
                            <motion.button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-full
                                           bg-white/10 backdrop-blur-md border border-white/20
                                           text-white hover:bg-white/20 transition-all duration-300
                                           group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Ana Kategoriler</span>
                                <ChevronRight className="w-4 h-4 text-white/50" />
                                <span className="text-sm font-bold text-cyan-400">{activeMainCategory.title}</span>
                            </motion.button>

                            {/* Tüm Ürünleri Gör */}
                            <motion.button
                                onClick={handleViewAllProducts}
                                className="flex items-center gap-2 px-4 py-2 rounded-full
                                           bg-gradient-to-r from-cyan-500 to-blue-600
                                           text-white font-medium text-sm
                                           hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Tüm Ürünleri Gör
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Title & Instructions */}
            <div className="absolute top-6 left-0 right-0 z-30 container mx-auto px-4">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={level}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                        style={{ marginTop: level === 'subcategory' ? '3rem' : 0 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white/90">
                            {focusedItemTitle
                                ? focusedItemTitle
                                : frontCardTitle
                                    ? frontCardTitle
                                    : (level === 'main' ? 'Ürün Yelpazemizi Keşfedin' : `${activeMainCategory?.title} Alt Kategorileri`)
                            }
                        </h2>
                        {/* Dinamik açıklama - dönen hint bilgileri */}
                        <p className="text-white/50 text-sm mt-2 font-medium tracking-wide">
                            {focusedItemTitle
                                ? (level === 'main'
                                    ? 'Tek tık: Kategoriyi Aç • Çift tık: Sayfaya Git'
                                    : 'Tıklayarak Ürün Sayfasına Gidin')
                                : ROTATING_HINTS[hintIndex]
                            }
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3D Carousel Container */}
            <div className="container mx-auto px-4 relative z-10 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={level + (activeMainCategory?.id || '')}
                        initial={{ opacity: 0, scale: 0.9, rotateY: level === 'subcategory' ? 15 : -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: level === 'subcategory' ? -15 : 15 }}
                        transition={{
                            duration: 0.6,
                            type: 'spring',
                            damping: 20,
                            stiffness: 100
                        }}
                        style={{ perspective: '1000px' }}
                    >
                        <OrbitalProductsShowcase
                            items={displayItems}
                            onCardClick={handleCardClick}
                            externalPause={isTransitioning}
                            onFocusedItemChange={handleFocusedItemChange}
                            onFrontCardChange={handleFrontCardChange}
                            modelScale={level === 'subcategory' ? 2.3 : 1.5} // Main: 1.5 (Standard), Sub: 2.3 (Large)
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Subcategory Count Badge */}
            <AnimatePresence>
                {level === 'subcategory' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-8 left-0 right-0 z-30 flex justify-center"
                    >
                        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                            <span className="text-white/70 text-sm">
                                {subcategories.length} alt kategori mevcut
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default CategoryOrbitCarousel

import React, { useState, useRef, useEffect } from 'react'
import { Category, Product } from '../../lib/supabase'
import {
    ChevronDown,
    Wind,
    Zap,
    Activity,
    Shield,
    Thermometer,
    Leaf,
    ShieldCheck,
    Sparkles,
    Settings,
    Cpu,
    Wrench,
    Layers,
    Maximize,
    Droplet,
    Home,
    Box,
    Filter,
    ArrowRight,
    ThermometerSun
} from 'lucide-react'
import ProductCard from '../ProductCard'
// import { useI18n } from '../../i18n/I18nProvider'
import EnhancedNeedsWizard from './EnhancedNeedsWizard'
// import { Link, useNavigate } from 'react-router-dom'
// Premium section components for air curtains
import {
    ProblemSection,
    HowItWorks,
    VorticeBrand,
    TypeComparison,
    FAQ,
    TrustSignals,
    BottomCTA
} from './sections'
import { Breadcrumb } from '../navigation/Breadcrumb'
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryLandingProps {
    category: Category
    products: Product[]
    subCategories?: Category[] // For in-page subcategory selection
    parentCategory?: Category | null
}

const ICON_MAP: Record<string, React.ElementType> = {
    'wind': Wind,
    'zap': Zap,
    'activity': Activity,
    'shield': Shield,
    'thermometer': Thermometer,
    'leaf': Leaf,
    'shield-check': ShieldCheck,
    'sparkles': Sparkles,
    'settings': Settings,
    'cpu': Cpu,
    'tool': Wrench,
    'layers': Layers,
    'maximize': Maximize,
    'droplet': Droplet,
    'home': Home,
    'box': Box
}

const CategoryLanding: React.FC<CategoryLandingProps> = ({ category, products, subCategories = [], parentCategory }) => {
    // const { t } = useI18n()
    const [showProducts, setShowProducts] = useState(false)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [wizardOpen, setWizardOpen] = useState(false)
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [disableAnimation, setDisableAnimation] = useState(true)
    const productListRef = useRef<HTMLDivElement>(null)
    const subcategoryProductsRef = useRef<HTMLDivElement>(null)

    const isAirCurtain = category.slug === 'hava-perdeleri'

    // Track if we're restoring from URL hash
    const isRestoringFromHash = useRef(false)

    // Restore state from URL hash on mount or back navigation
    useEffect(() => {
        const checkHash = () => {
            const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''

            if (hash === 'tum-modeller') {
                setShowProducts(true)
                setSelectedSubcategory(null)
            } else if (hash && subCategories.length > 0) {
                const matchedSubcat = subCategories.find(s => s.slug === hash)
                if (matchedSubcat) {
                    setSelectedSubcategory(matchedSubcat.id)
                    setShowProducts(false)
                }
            }
        }

        checkHash()
        // URL hash değişimlerini de dinle (SPA içi navigasyon için)
        window.addEventListener('hashchange', checkHash)

        // İlk yüklemede layout shift olmaması için animasyonu kısa süre sonra aç
        const animTimer = setTimeout(() => setDisableAnimation(false), 100)

        return () => {
            window.removeEventListener('hashchange', checkHash)
            clearTimeout(animTimer)
        }
    }, [subCategories])

    // REMOVED: Auto-scroll to products section when restored from hash
    // (User wants to land at the top/hero first, even when state is restored)

    const handleShowProducts = () => {
        setShowProducts(true)
        setSelectedSubcategory(null) // Clear subcategory selection when showing all
        // URL hash'i güncelle - geri navigasyonda restore edilebilsin
        window.history.replaceState(null, '', '#tum-modeller')
        window.dispatchEvent(new HashChangeEvent('hashchange'))

        // Wait for state update and initial layout
        requestAnimationFrame(() => {
            // Give a slight buffer for the expansion to register visually
            setTimeout(() => {
                const headerOffset = 100 // Adjust based on sticky header height if any
                const element = productListRef.current
                if (!element) return

                const elementPosition = element.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                })
            }, 50)
        })
    }

    // Handle subcategory selection - show products in-page
    const handleSelectSubcategory = (subcatId: string) => {
        setSelectedSubcategory(subcatId)
        setShowProducts(false) // Hide main products
        // Update URL hash for bookmarking
        const subcat = subCategories.find(s => s.id === subcatId)
        if (subcat) {
            window.history.replaceState(null, '', `#${subcat.slug}`)
            window.dispatchEvent(new HashChangeEvent('hashchange'))
        }
        setTimeout(() => {
            subcategoryProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

    // Get products for selected subcategory
    const subcategoryProducts = selectedSubcategory
        ? products.filter(p => p.category_id === selectedSubcategory)
        : []

    // "Smart" stats calculations (Optional, can be used as fallback or supplementary)
    const maxAirflow = Math.max(...products.map(p => p.airflow_capacity || 0))
    // const minNoise = Math.min(...products.map(p => p.noise_level || 100).filter(n => n > 0))

    // Filter products based on active filter
    const filteredProducts = products.filter(p => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'quiet') return (p.noise_level || 100) <= 50
        if (activeFilter === 'powerful') return (p.airflow_capacity || 0) >= maxAirflow * 0.8
        return true
    })

    const heroImage = category.image_url
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
        : null

    const features = category.metadata?.features || []

    // Build breadcrumb items
    const breadcrumbItems = buildCategoryBreadcrumb(category, parentCategory, 'Ana Sayfa')

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb Navigation - Dark variant for dark hero */}
            <div className="bg-zinc-900">
                <Breadcrumb items={breadcrumbItems} variant="dark" className="border-b-0" />
            </div>

            {/* Hero Section */}
            <div className="relative bg-zinc-900 text-white py-20 lg:py-32 overflow-hidden">
                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-zinc-800 to-transparent opacity-50 transform skew-x-12 translate-x-1/3" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Technical Summary / Badge */}
                            {category.metadata?.technical_summary && (
                                <div className="flex items-center space-x-2 text-secondary-blue mb-4">
                                    <Activity size={20} />
                                    <span className="font-medium tracking-wide text-sm uppercase">
                                        {category.metadata.technical_summary}
                                    </span>
                                </div>
                            )}

                            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                {getCategoryDisplayName(category)}
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 max-w-xl">
                                {category.metadata?.hero_description || category.description}
                            </p>

                            {/* Dynamic Features Grid */}
                            {features.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                    {features.map((feature, idx) => {
                                        const IconComponent = ICON_MAP[feature.icon] || Box
                                        return (
                                            <div key={idx} className="flex items-start space-x-3">
                                                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                                                    <IconComponent className="text-secondary-blue" size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">{feature.title}</div>
                                                    <div className="text-sm text-gray-400">{feature.description}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleShowProducts}
                                    className="group flex items-center bg-secondary-blue hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30"
                                >
                                    <span>Modelleri İncele</span>
                                    <ChevronDown className={`ml-2 transition-transform duration-300 ${showProducts ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
                                </button>

                                {/* Quick Start Wizard Button (only for air curtains) */}
                                {isAirCurtain && (
                                    <button
                                        onClick={() => setWizardOpen(true)}
                                        className="group flex items-center bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold transition-all backdrop-blur-sm"
                                    >
                                        <ThermometerSun className="mr-3 text-yellow-400" size={24} />
                                        <span>Bana Uygun Olanı Bul</span>
                                        <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative hidden lg:block h-[500px]">
                            {heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={category.name}
                                    className="w-full h-full object-contain drop-shadow-2xl filter contrast-125 select-none"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="p-12 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <Wind size={120} className="text-white/20" />
                                    </div>
                                </div>
                            )}

                            {/* Animated Scroll Down Indicator */}
                            <button
                                onClick={() => document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce"
                                aria-label="Devamını keşfet"
                            >
                                <span className="text-xs uppercase tracking-widest font-medium">Devamını Keşfet</span>
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Scroll Down Indicator */}



                {/* Scroll Anchor */}
                <div id="content-start" className="scroll-mt-20" />

                {/* Enhanced Needs Analysis Wizard */}
                <EnhancedNeedsWizard
                    isOpen={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    parentSlug={category.slug}
                />

                {/* ====== PREMIUM AIR CURTAIN EXPERIENCE (8-Section Flow) ====== */}
                {
                    isAirCurtain && (
                        <>
                            {/* Section 2: Problem Recognition */}
                            <ProblemSection />

                            {/* Section 3: How It Works */}
                            <HowItWorks />

                            {/* Section 4: Brand Trust - Vortice Story */}
                            <VorticeBrand />

                            {/* Section 5: Type Comparison (Elektrikli vs Ortam) */}
                            <TypeComparison
                                onOpenWizard={() => setWizardOpen(true)}
                                onSelectType={(type) => {
                                    const targetSlug = type === 'elektrikli' ? 'elektrikli-isitici' : 'ortam-havali'
                                    const subcat = subCategories.find(s => s.slug === targetSlug)
                                    if (subcat) {
                                        handleSelectSubcategory(subcat.id)
                                    }
                                }}
                            />

                            {/* Section 6: Subcategory Products (In-Page Expansion) */}
                            {selectedSubcategory && (
                                <div
                                    ref={subcategoryProductsRef}
                                    className="bg-gradient-to-b from-gray-50 to-white py-16 border-t border-gray-200"
                                >
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        {/* Section Header */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-industrial-gray flex items-center gap-3">
                                                    {subCategories.find(s => s.id === selectedSubcategory)?.name || 'Alt Kategori'} Modelleri
                                                    <span className="text-sm font-normal bg-secondary-blue text-white px-3 py-1 rounded-full">
                                                        {subcategoryProducts.length} ürün
                                                    </span>
                                                </h2>
                                                <p className="text-sm text-steel-gray mt-1">
                                                    {subCategories.find(s => s.id === selectedSubcategory)?.description || 'Bu kategorideki ürünler'}
                                                </p>
                                            </div>

                                            {/* Clear Selection Button */}
                                            <button
                                                onClick={() => {
                                                    setSelectedSubcategory(null)
                                                    window.history.replaceState(null, '', window.location.pathname)
                                                }}
                                                className="text-sm text-steel-gray hover:text-industrial-gray underline"
                                            >
                                                ← Seçimi Kaldır
                                            </button>
                                        </div>

                                        {/* Products Grid */}
                                        {subcategoryProducts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {subcategoryProducts.map(product => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        layout="grid"
                                                        hidePrice={!!category.metadata?.hide_price}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                                <Filter size={48} className="mx-auto mb-4 text-gray-300" />
                                                <p className="text-steel-gray">Bu alt kategoride henüz ürün bulunmuyor.</p>
                                                <p className="text-sm text-gray-400 mt-2">Lütfen başka bir kategori seçin veya tüm modelleri görüntüleyin.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section 7: Trust Signals */}
                            <TrustSignals />

                            {/* Section 8: FAQ */}
                            <FAQ />

                            {/* Section 9: Bottom CTA */}
                            <BottomCTA
                                onOpenWizard={() => setWizardOpen(true)}
                                onShowProducts={handleShowProducts}
                                showWizard={true}
                                categoryName="Hava Perdesi"
                            />
                        </>
                    )
                }

                {/* Expandable Product List Content */}
                <div
                    ref={productListRef}
                    className={`${disableAnimation ? '' : 'transition-all duration-500 ease-in-out'} ${showProducts ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-industrial-gray">
                                    {category.name} Modelleri
                                </h2>
                                <p className="text-sm text-steel-gray mt-1">
                                    {filteredProducts.length} model listeleniyor
                                </p>
                            </div>

                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm font-medium text-steel-gray self-center mr-2">Hızlı Filtre:</span>
                                {[
                                    { key: 'all', label: 'Tüm Modeller' },
                                    { key: 'quiet', label: 'En Sessiz' },
                                    { key: 'powerful', label: 'En Güçlü' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${activeFilter === filter.key
                                            ? 'bg-primary-navy text-white border-primary-navy'
                                            : 'bg-white text-steel-gray border-gray-200 hover:border-primary-navy'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    layout="grid"
                                    hidePrice={!!category.metadata?.hide_price}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-steel-gray">
                                <Filter size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Bu filtreye uygun ürün bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryLanding




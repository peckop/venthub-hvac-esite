import React, { useState, useRef, useEffect } from 'react'
import type { DbCategory, DbProduct } from '../../types/db-rows'
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
    ThermometerSun,
    LucideIcon
} from 'lucide-react'
import ProductCard from '../ProductCard'
import { useI18n } from '../../i18n/I18nProvider'
import EnhancedNeedsWizard from './EnhancedNeedsWizard'
// Premium section components for air curtains
import {
    ProblemSection,
    HowItWorks,
    VorticeBrand,
    TypeComparison,
    FAQ,
    TrustSignals,
    BottomCTA,
    SilentFanProblem,
    SilentFanHowItWorks,
    SilentFanVorticeBrand,
    SilentFanTypeComparison,
    SilentFanFAQ
} from './sections'
import { Breadcrumb } from '../navigation/Breadcrumb'
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { VentImage } from '../ui/VentImage'
import { mapDatabaseCategoryToDomain, mapDatabaseProductToDomain } from '../../lib/type-converters'

interface CategoryLandingProps {
    category: DbCategory
    products: DbProduct[]
    subCategories?: DbCategory[] // For in-page subcategory selection
    parentCategory?: DbCategory | null
    groupedSeries?: Array<{ name: string; products: DbProduct[]; image?: string; minPrice: number }>
}

const ICON_MAP: Record<string, LucideIcon> = {
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
    const { t } = useI18n()
    const [showProducts, setShowProducts] = useState(false)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [wizardOpen, setWizardOpen] = useState(false)
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [disableAnimation, setDisableAnimation] = useState(true)
    const productListRef = useRef<HTMLDivElement>(null)
    const subcategoryProductsRef = useRef<HTMLDivElement>(null)

    const isAirCurtain = category.slug === 'hava-perdeleri'
    const isSilentFan = category.slug === 'sessiz-kanal-tipi-fanlar'

    // Convert database objects to UI domain models for child components
    const domainCategory = mapDatabaseCategoryToDomain(category)
    const domainParentCategory = parentCategory ? mapDatabaseCategoryToDomain(parentCategory) : null

    // Restore state from URL hash on mount or back navigation
    useEffect(() => {
        const checkHash = () => {
            if (typeof window === 'undefined') return
            const hash = window.location.hash.slice(1)

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
        const animTimer = setTimeout(() => setDisableAnimation(false), 300)

        return () => {
            window.removeEventListener('hashchange', checkHash)
            clearTimeout(animTimer)
        }
    }, [subCategories])

    const handleScrollToTarget = (targetId: string) => {
        if (typeof window === 'undefined') return
        const anchor = document.getElementById(targetId)
        if (!anchor) return

        const originalPadding = document.body.style.paddingBottom
        document.body.style.paddingBottom = '3000px'

        setTimeout(() => {
            const headerOffset = 80 // Sticky header
            const targetY = anchor.getBoundingClientRect().top + window.pageYOffset - headerOffset
            window.scrollTo({ top: targetY, behavior: 'smooth' })

            setTimeout(() => {
                document.body.style.paddingBottom = originalPadding
                const finalY = anchor.getBoundingClientRect().top + window.pageYOffset - headerOffset
                if (Math.abs(window.scrollY - finalY) > 5) {
                    window.scrollTo({ top: finalY, behavior: 'smooth' })
                }
            }, 800)
        }, 10)
    }

    const handleShowProducts = () => {
        setShowProducts(true)
        setSelectedSubcategory(null)
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '#tum-modeller')
            window.dispatchEvent(new HashChangeEvent('hashchange'))
        }

        requestAnimationFrame(() => {
            if (!selectedSubcategory) {
                handleScrollToTarget('products-anchor')
            }
        })
    }

    const handleSelectSubcategory = (subcatId: string) => {
        setSelectedSubcategory(subcatId)
        setShowProducts(false)
        const subcat = subCategories.find(s => s.id === subcatId)
        if (subcat && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${subcat.slug}`)
            window.dispatchEvent(new HashChangeEvent('hashchange'))
        }
        setTimeout(() => {
            handleScrollToTarget('subcategory-anchor')
        }, 50)
    }

    const subcategoryProducts = selectedSubcategory
        ? products.filter(p => p.category_id === selectedSubcategory)
        : []

    const maxAirflow = products.length > 0
        ? Math.max(...products.map(p => Number(p.airflow_capacity) || 0))
        : 1000

    const filteredProducts = products.filter((p: DbProduct) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'quiet') return (Number(p.noise_level) || 100) <= 50
        if (activeFilter === 'powerful') return (Number(p.airflow_capacity) || 0) >= maxAirflow * 0.8
        return true
    })

    const heroImagePath = category.image_url ? `category-images/${category.image_url}` : null
    const features = category.metadata?.features ?? []
    const breadcrumbItems = buildCategoryBreadcrumb(domainCategory, domainParentCategory, t('common.home'))

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-zinc-900">
                <Breadcrumb items={breadcrumbItems} variant="dark" className="border-b-0" />
            </div>

            <div className="relative bg-zinc-900 text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-zinc-800 to-transparent opacity-50 transform skew-x-12 translate-x-1/3" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {category.metadata?.technical_summary && (
                                <div className="flex items-center space-x-2 text-secondary-blue mb-4">
                                    <Activity size={20} />
                                    <span className="font-medium tracking-wide text-sm uppercase">
                                        {category.metadata.technical_summary}
                                    </span>
                                </div>
                            )}

                            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                {getCategoryDisplayName(domainCategory)}
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 max-w-xl">
                                {category.metadata?.hero_description ?? category.description}
                            </p>

                            {features.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                    {features.map((feature, idx: number) => {
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

                        <div className="relative hidden lg:block h-[500px]">
                            <VentImage
                                src={heroImagePath}
                                alt={category.name}
                                fallbackType="category"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain drop-shadow-2xl filter contrast-125 select-none"
                                priority
                            />

                            <button
                                onClick={() => {
                                    if (typeof document !== 'undefined') {
                                        document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })
                                    }
                                }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce"
                                aria-label="Devamını keşfet"
                            >
                                <span className="text-xs uppercase tracking-widest font-medium">Devamını Keşfet</span>
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div id="content-start" className="scroll-mt-20" />

                <EnhancedNeedsWizard
                    isOpen={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    parentSlug={category.slug}
                />

                {
                    isAirCurtain && (
                        <>
                            <ProblemSection />
                            <HowItWorks />
                            <VorticeBrand />
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

                            {selectedSubcategory && (
                                <div className="bg-gradient-to-b from-gray-50 to-white py-16 border-t border-gray-200">
                                    <div id="subcategory-anchor" className="scroll-mt-24" />
                                    <div ref={subcategoryProductsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                                            <button
                                                onClick={() => {
                                                    setSelectedSubcategory(null)
                                                    if (typeof window !== 'undefined') {
                                                        window.history.replaceState(null, '', window.location.pathname)
                                                    }
                                                }}
                                                className="text-sm text-steel-gray hover:text-industrial-gray underline"
                                            >
                                                ← Seçimi Kaldır
                                            </button>
                                        </div>

                                        {subcategoryProducts.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {subcategoryProducts.map(product => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={mapDatabaseProductToDomain(product)}
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

                            <TrustSignals />
                            <FAQ />
                            <BottomCTA
                                onOpenWizard={() => setWizardOpen(true)}
                                onShowProducts={handleShowProducts}
                                showWizard={true}
                                categoryName="Hava Perdesi"
                            />
                        </>
                    )
                }

                {
                    isSilentFan && (
                        <>
                            <SilentFanProblem />
                            <SilentFanHowItWorks />
                            <SilentFanVorticeBrand />
                            <SilentFanTypeComparison />
                            
                            <TrustSignals />
                            <SilentFanFAQ />

                            <BottomCTA
                                onOpenWizard={handleShowProducts}
                                onShowProducts={handleShowProducts}
                                showWizard={false}
                                categoryName="Sessiz Kanal Tipi Fan"
                            />
                        </>
                    )
                }

                <div id="products-anchor" className="scroll-mt-24" />

                <div
                    ref={productListRef}
                    className={`${disableAnimation ? '' : 'transition-all duration-500 ease-in-out'} ${showProducts ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                    style={{
                        maxHeight: showProducts ? '20000px' : '0',
                        minHeight: (showProducts && disableAnimation) ? '1000px' : '0'
                    }}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={mapDatabaseProductToDomain(product)}
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

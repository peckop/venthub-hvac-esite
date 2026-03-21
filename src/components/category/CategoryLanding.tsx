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
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { mapDatabaseCategoryToDomain, mapDatabaseProductToDomain } from '../../lib/type-converters'

interface CategoryLandingProps {
    category: DbCategory
    products: DbProduct[]
    subCategories?: DbCategory[] // For in-page subcategory selection
    parentCategory?: DbCategory | null
    groupedSeries?: Array<{ name: string; products: DbProduct[]; image?: string; minPrice: number }>
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

    const isAirCurtain = category.slug === 'hava-perdesi' || category.slug === 'hava-perdeleri'
    const isSilentFan = category.slug === 'sessiz-kanal-tipi-fanlar'

    // Restore state from URL hash
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
        window.addEventListener('hashchange', checkHash)
        const animTimer = setTimeout(() => setDisableAnimation(false), 300)
        return () => {
            window.removeEventListener('hashchange', checkHash)
            clearTimeout(animTimer)
        }
    }, [subCategories])

    const handleScrollToTarget = (targetId: string) => {
        const anchor = document.getElementById(targetId)
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
    }

    const handleShowProducts = () => {
        setShowProducts(true)
        setSelectedSubcategory(null)
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '#tum-modeller')
        }
        setTimeout(() => handleScrollToTarget('products-anchor'), 100)
    }

    const handleSelectSubcategory = (subcatId: string) => {
        setSelectedSubcategory(subcatId)
        setShowProducts(false)
        const subcat = subCategories.find(s => s.id === subcatId)
        if (subcat && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${subcat.slug}`)
        }
        setTimeout(() => handleScrollToTarget('subcategory-anchor'), 100)
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

    return (
        <div className="bg-white">
            <div id="content-start" className="scroll-mt-20" />

            <EnhancedNeedsWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                parentSlug={category.slug}
            />

            {isAirCurtain && (
                <>
                    <ProblemSection />
                    <HowItWorks />
                    <VorticeBrand />
                    <TypeComparison
                        onOpenWizard={() => setWizardOpen(true)}
                        onSelectType={(type) => {
                            const targetSlug = type === 'elektrikli' ? 'elektrikli-isitici' : 'ortam-havali'
                            const subcat = subCategories.find(s => s.slug === targetSlug)
                            if (subcat) handleSelectSubcategory(subcat.id)
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
                                    </div>
                                    <button onClick={() => setSelectedSubcategory(null)} className="text-sm text-steel-gray hover:text-industrial-gray underline">
                                        ← Seçimi Kaldır
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {subcategoryProducts.map(product => (
                                        <ProductCard key={product.id} product={mapDatabaseProductToDomain(product)} layout="grid" hidePrice={!!category.metadata?.hide_price} />
                                    ))}
                                </div>
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
            )}

            {isSilentFan && (
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
            )}

            <div id="products-anchor" className="scroll-mt-24" />

            <div
                ref={productListRef}
                className={`${disableAnimation ? '' : 'transition-all duration-500 ease-in-out'} ${showProducts ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                style={{ maxHeight: showProducts ? '20000px' : '0' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-industrial-gray">{category.name} Modelleri</h2>
                            <p className="text-sm text-steel-gray mt-1">{filteredProducts.length} model listeleniyor</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'Tüm Modeller' },
                                { key: 'quiet', label: 'En Sessiz' },
                                { key: 'powerful', label: 'En Güçlü' }
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${activeFilter === f.key ? 'bg-primary-navy text-white' : 'bg-white text-steel-gray hover:border-primary-navy'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(p => (
                            <ProductCard key={p.id} product={mapDatabaseProductToDomain(p)} layout="grid" hidePrice={!!category.metadata?.hide_price} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryLanding

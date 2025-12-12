
import React, { useState, useRef } from 'react'
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
import { Link } from 'react-router-dom'

interface CategoryLandingProps {
    category: Category
    products: Product[]
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

const CategoryLanding: React.FC<CategoryLandingProps> = ({ category, products }) => {
    // const { t } = useI18n()
    const [showProducts, setShowProducts] = useState(false)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [wizardOpen, setWizardOpen] = useState(false)
    const productListRef = useRef<HTMLDivElement>(null)

    const isAirCurtain = category.slug === 'hava-perdeleri'

    const handleShowProducts = () => {
        setShowProducts(true)
        setTimeout(() => {
            productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }

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

    // Determine hero image
    const heroImage = category.image_url
        ? `${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
        : null

    const features = category.metadata?.features || []

    return (
        <div className="min-h-screen bg-white">
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
                                {category.metadata?.hero_title || category.name}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Needs Analysis Wizard */}
            <EnhancedNeedsWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                parentSlug={category.slug}
            />

            {/* Educational Section (Air Curtains only) */}
            {isAirCurtain && (
                <>
                    {/* Preserved Vortice Hero Image in Flow */}
                    <div className="bg-white pt-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[21/9] group">
                                <img
                                    src="/images/category/hero-vortice.png"
                                    alt="Vortice Air Curtain Application"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-8 left-8 text-white max-w-xl">
                                    <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                                        <Sparkles size={20} />
                                        <span className="font-bold tracking-wider uppercase text-sm">Premium Konfor</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2">Görünmez Konfor Kalkanı</h3>
                                    <p className="text-gray-200">
                                        Estetik tasarım, sessiz çalışma ve üstün performansın mükemmel uyumu.
                                        Mekanınızın havasını korurken şıklığından ödün vermeyin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 py-16 border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-industrial-gray mb-4">Hangi Hava Perdesini Seçmelisiniz?</h2>
                                <p className="text-steel-gray max-w-2xl mx-auto">
                                    İhtiyacınıza en uygun çözümü belirlemenize yardımcı olalım.
                                </p>
                            </div>

                            {/* Comparison Image */}
                            <div className="flex justify-center mb-12">
                                <img
                                    src="/images/category/electric-vs-ambient.png"
                                    alt="Elektrikli vs Ortam Havalı Karşılaştırma"
                                    className="max-w-full md:max-w-3xl rounded-xl shadow-lg"
                                />
                            </div>

                            {/* Quick Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Elektrikli Card */}
                                <Link
                                    to={`/category/${category.slug}/elektrikli-isitici`}
                                    className="group bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="p-3 bg-orange-50 rounded-lg text-orange-500 group-hover:bg-orange-100 transition-colors">
                                            <Zap size={32} />
                                        </div>
                                        <h4 className="text-xl font-bold text-industrial-gray">Elektrikli Isıtıcılı</h4>
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        Kış aylarında kapı önünde sıcak karşılama sağlar.
                                    </p>
                                    <div className="flex items-center text-orange-500 font-semibold">
                                        <span>Modelleri İncele</span>
                                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                {/* Ortam Havalı Card */}
                                <Link
                                    to={`/category/${category.slug}/ortam-havali`}
                                    className="group bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                            <Wind size={32} />
                                        </div>
                                        <h4 className="text-xl font-bold text-industrial-gray">Ortam Havalı</h4>
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        Soğuk depolar ve hijyen gereken alanlar için ideal.
                                    </p>
                                    <div className="flex items-center text-blue-500 font-semibold">
                                        <span>Modelleri İncele</span>
                                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Technical Diagram Section */}
                    <div className="bg-primary-navy py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-4">Nasıl Çalışır?</h2>
                                <p className="text-gray-300 max-w-2xl mx-auto">
                                    Hava perdesi, görünmez bir bariyer oluşturarak iç ve dış ortamı birbirinden ayırır.
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <img
                                    src="/images/category/air-curtain-diagram.png"
                                    alt="Hava Perdesi Çalışma Prensibi"
                                    className="max-w-full md:max-w-4xl rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Expandable Product List Content */}
            <div
                ref={productListRef}
                className={`transition-all duration-1000 ease-in-out ${showProducts ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
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
    )
}

export default CategoryLanding

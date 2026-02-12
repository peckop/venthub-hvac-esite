import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Category } from '../../lib/supabase'
import { ArrowRight, ThermometerSun, ChevronDown, Zap, Wind, CheckCircle2 } from 'lucide-react'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import EnhancedNeedsWizard from './EnhancedNeedsWizard'
import { BottomCTA } from './sections'
import { Breadcrumb } from '../navigation/Breadcrumb'
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryShowcaseProps {
    category: Category
    subCategories: Category[]
    parentCategory?: Category | null
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ category, subCategories, parentCategory }) => {
    const [wizardOpen, setWizardOpen] = useState(false)

    // Check if this is hava-perdeleri category for special treatment
    const isAirCurtain = category.slug === 'hava-perdeleri'

    // Hero image with fallback to new generated asset
    const heroImage = category.metadata?.showcase_images?.[0]?.desktop ||
        (isAirCurtain ? '/images/category/hero-vortice.png' : null) ||
        (category.image_url ? `${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}` : null)



    // Build breadcrumb items
    const breadcrumbItems = buildCategoryBreadcrumb(category, parentCategory, 'Ana Sayfa')

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} variant="white" />

            {/* Hero Section */}
            <div className="relative h-[600px] w-full overflow-hidden bg-primary-navy">
                {heroImage && (
                    <div className="absolute inset-0">
                        <img
                            src={heroImage}
                            alt={getCategoryDisplayName(category)}
                            className="w-full h-full object-cover opacity-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/80 via-primary-navy/40 to-transparent" />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-3xl animate-fadeIn">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-blue/20 text-secondary-blue backdrop-blur-sm border border-secondary-blue/30 text-sm font-medium mb-6">
                                Premium Koleksiyon
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                {getCategoryDisplayName(category)}
                            </h1>
                            <p className="text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
                                {category.metadata?.hero_description || category.description}
                            </p>

                            {/* Quick Start Wizard Button (only for air curtains) */}
                            {isAirCurtain && (
                                <button
                                    onClick={() => setWizardOpen(true)}
                                    className="group flex items-center bg-gradient-to-r from-secondary-blue to-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:scale-105"
                                >
                                    <ThermometerSun className="mr-3" size={24} />
                                    <span>Bana Uygun Modeli Bul</span>
                                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Animated Scroll Down Indicator */}
                <button
                    onClick={() => document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce z-20"
                    aria-label="Devamını keşfet"
                >
                    <span className="text-xs uppercase tracking-widest font-medium">Devamını Keşfet</span>
                    <ChevronDown className="w-6 h-6" />
                </button>
            </div>

            {/* Scroll Anchor */}
            <div id="content-start" className="scroll-mt-20" />

            {/* Enhanced Needs Analysis Wizard */}
            <EnhancedNeedsWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                parentSlug={category.slug}
            />

            {/* Educational Section (Air Curtains only) */}
            {isAirCurtain && (
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
            )
            }

            {/* Technical Diagram Section (Air Curtains only) */}
            {
                isAirCurtain && (
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
                )
            }

            {/* Series Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-industrial-gray mb-4">Tüm Seriler</h2>
                    <p className="text-steel-gray">İhtiyacınıza uygun seriyi seçin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subCategories.map((sub) => (
                        <Link
                            key={sub.id}
                            to={`/category/${category.slug}/${sub.slug}`}
                            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                        >
                            <div className="aspect-[4/3] bg-light-gray relative overflow-hidden">
                                {sub.image_url ? (
                                    <img
                                        src={`${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/category-images/${sub.image_url}`}
                                        alt={getCategoryDisplayName(sub)}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        {getCategoryIcon(sub.slug, { size: 64, className: "text-gray-300 group-hover:text-secondary-blue transition-colors" })}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-2xl font-bold text-white mb-1">{getCategoryDisplayName(sub)}</h3>
                                    <p className="text-gray-200 text-sm line-clamp-1">{sub.description}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between text-primary-navy font-semibold group-hover:text-secondary-blue transition-colors">
                                    <span>Seriyi İncele</span>
                                    <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Value Proposition / Features Section */}
            <div className="bg-light-gray py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-industrial-gray mb-4">Neden {getCategoryDisplayName(category)}?</h2>
                        <p className="text-steel-gray max-w-2xl mx-auto">
                            Endüstriyel standartlarda üretim ve yüksek mühendislik çözümleriyle projelerinize değer katıyoruz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Yüksek Verimlilik", desc: "ErP standartlarına uygun enerji tasarrufu sağlayan motor teknolojisi." },
                            { title: "Sessiz Çalışma", desc: "Özel akustik izolasyon ve aerodinamik fan tasarımı." },
                            { title: "Uzun Ömür", desc: "Korozyona dayanıklı gövde ve ağır hizmet tipi bileşenler." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-primary-navy/10 rounded-lg flex items-center justify-center mb-6">
                                    <CheckCircle2 className="text-primary-navy" />
                                </div>
                                <h3 className="text-xl font-bold text-industrial-gray mb-3">{feature.title}</h3>
                                <p className="text-steel-gray">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA Section */}
            <BottomCTA
                onOpenWizard={isAirCurtain ? () => setWizardOpen(true) : undefined}
                showWizard={isAirCurtain}
                categoryName={getCategoryDisplayName(category)}
            />
        </div >
    )
}

export default CategoryShowcase

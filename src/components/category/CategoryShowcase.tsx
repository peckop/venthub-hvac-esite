import { Routes } from '../../utils/routes'
import VentImage from '@/components/ui/VentImage'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ThermometerSun, ChevronDown, Zap, Wind, CheckCircle2, Activity, ShieldCheck } from 'lucide-react'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import EnhancedNeedsWizard from './EnhancedNeedsWizard'
import { BottomCTA } from './sections'
import Breadcrumb from '../navigation/Breadcrumb'
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { DomainCategory } from '../../lib/type-converters'
import { useI18n } from '../../i18n/I18nProvider'

interface CategoryShowcaseProps {
    category: DomainCategory
    subCategories: DomainCategory[]
    parentCategory?: DomainCategory | null
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ category, subCategories, parentCategory }) => {
    const { t } = useI18n()
    const [wizardOpen, setWizardOpen] = useState(false)

    // Check if this is special showcase categories
    const isAirCurtain = category.slug === 'air-curtains'
    const isQuietFan = category.slug === 'quiet-duct-fans'

    interface CategoryMetadataExtended { showcase_images?: { desktop: string }[] }
    const metadata = category.metadata as CategoryMetadataExtended | null
    const showcaseImages = metadata?.showcase_images
    const heroImage = (showcaseImages?.[0]?.desktop) ||
        (isAirCurtain ? '/images/category/hero-vortice.png' : null) ||
        (isQuietFan ? '/images/vortice/vortice_lineo_hero.png' : null) ||
        (category.image_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}` : null)



    // Build breadcrumb items
    const breadcrumbItems = buildCategoryBreadcrumb(category, parentCategory, 'Ana Sayfa')

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} variant="white" />

            {/* Hero Section */}
            <div className="relative h-hvac-hero w-full overflow-hidden bg-primary-navy">
                {heroImage && (
                    <div className="absolute inset-0">
                        <Image
                            src={heroImage}
                            alt={getCategoryDisplayName(category)}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover opacity-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/80 via-primary-navy/40 to-transparent" />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-3xl animate-fadeIn">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-blue/20 text-secondary-blue backdrop-blur-sm border border-secondary-blue/30 text-sm font-medium mb-6">
                                {t('category.premiumCollection')}
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
                                    type="button"
                                    onClick={() => setWizardOpen(true)}
                                    className="focus-ring focus-visible:ring-2 focus-visible:ring-primary-navy group flex items-center bg-gradient-to-r from-secondary-blue to-blue-600 text-white px-8 py-4 rounded-full font-bold transition-transform shadow-lg shadow-blue-500/30 hover:scale-105"
                                >
                                    <ThermometerSun className="mr-3" size={24} />
                                    <span>{t('category.findModel')}</span>
                                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Animated Scroll Down Indicator */}
                <button
                    type="button"
                    onClick={() => document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })}
                    className="focus-ring focus-visible:ring-2 focus-visible:ring-primary-navy absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce z-20"
                    aria-label={t('category.discoverMore')}
                >
                    <span className="text-xs uppercase tracking-widest font-medium">{t('category.discoverMore')}</span>
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
                            <h2 className="text-3xl font-bold text-industrial-gray mb-4">{t('category.whichAirCurtain')}</h2>
                            <p className="text-steel-gray max-w-2xl mx-auto">
                                {t('category.airCurtainHelper')}
                            </p>
                        </div>

                        {/* Comparison Image */}
                        <div className="flex justify-center mb-12">
                            <VentImage src="/images/category/electric-vs-ambient.png"
                                alt="Elektrikli vs Ortam Havalı Karşılaştırma"
                                className="max-w-full md:max-w-3xl rounded-xl shadow-lg"
                             />
                        </div>

                        {/* Quick Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Elektrikli Card */}
                            <Link
                                href={category.slug === 'elektrikli-isitici' ? Routes.category(category.slug) : Routes.category(category.slug, 'elektrikli-isitici')}
                                className="group bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="p-3 bg-orange-50 rounded-lg text-orange-500 group-hover:bg-orange-100 transition-colors">
                                        <Zap size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-industrial-gray">{t('category.electricHeated')}</h4>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t('category.electricPoint1')}
                                </p>
                                <div className="flex items-center text-orange-500 font-semibold">
                                    <span>{t('category.inspectModels')}</span>
                                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            {/* Ortam Havalı Card */}
                            <Link
                                href={category.slug === 'ortam-havali' ? Routes.category(category.slug) : Routes.category(category.slug, 'ortam-havali')}
                                className="group bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                        <Wind size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-industrial-gray">{t('category.ambientAir')}</h4>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t('category.ambientPoint2')}
                                </p>
                                <div className="flex items-center text-blue-500 font-semibold">
                                    <span>{t('category.inspectModels')}</span>
                                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {/* Premium Application Areas (Quiet Fans only) */}
            {isQuietFan && (
                <div className="bg-slate-50 py-24 border-y border-slate-100 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative aspect-4/5 rounded-hvac-2xl overflow-hidden shadow-2xl group"
                            >
                                <Image
                                    src="/images/vortice/vortice_lineo_loft.png"
                                    alt="Modern Loft Uygulaması"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 600px"
                                    className="object-cover transition-transform duration-hvac-glacial group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h4 className="text-2xl font-bold text-white mb-2">{t('category.modernLiving')}</h4>
                                    <p className="text-slate-200 text-sm">{t('category.modernLivingDesc')}</p>
                                </div>
                            </motion.div>

                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">{t('category.flexibilityEsthetics')}</h2>
                                    <p className="text-lg text-slate-600 leading-relaxed italic">
                                        "Lineo Quiet ES, sadece bir fan değil; modern mimarinin sessiz kahramanıdır."
                                    </p>
                                </div>

                                <div className="grid gap-8">
                                    <div className="flex gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-cyan-500">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-2">{t('category.smartControl')}</h4>
                                            <p className="text-slate-600 text-sm">{t('category.smartControlDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-cyan-500">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-2">{t('category.longTermInvestment')}</h4>
                                            <p className="text-slate-600 text-sm">{t('category.longTermInvestmentDesc')}</p>
                                        </div>
                                    </div>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white"
                                >
                                    <Image
                                        src="/images/vortice/vortice_lineo_neon.png"
                                        alt="Endüstriyel Laboratuvar Uygulaması"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 600px"
                                        className="object-cover"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Diagram Section */}
            {(isAirCurtain || isQuietFan) && (
                <div className="bg-primary-navy py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {isQuietFan ? 'Vortice Lineo Quiet ES Teknolojisi' : 'Nasıl Çalışır?'}
                            </h2>
                            <p className="text-gray-300 max-w-2xl mx-auto">
                                {isQuietFan 
                                    ? 'Sessizlik ve performansın mükemmel uyumu. Gelişmiş aerodinamik tasarım ile tanışın.' 
                                    : 'Hava perdesi, görünmez bir bariyer oluşturarak iç ve dış ortamı birbirinden ayırır.'}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                                <Image
                                    src={isQuietFan ? '/images/vortice/vortice_lineo_technical.png' : '/images/category/air-curtain-diagram.png'}
                                    alt={isQuietFan ? 'Linieo Quiet Teknik Detay' : 'Hava Perdesi Çalışma Prensibi'}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 900px"
                                    className="object-contain bg-slate-900/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Series Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-industrial-gray mb-4">{t('category.allSeries')}</h2>
                    <p className="text-steel-gray">{t('category.chooseSeriesDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subCategories.filter(sub => sub.slug !== category.slug).map((sub) => (
                        <Link
                            key={sub.id}
                            href={Routes.category(category.slug, sub.slug)}
                            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-gray-100"
                        >
                            <div className="aspect-4/3 bg-light-gray relative overflow-hidden">
                                {sub.image_url ? (
                                    <VentImage src={`${(process.env.NEXT_PUBLIC_SUPABASE_URL || '')}/storage/v1/object/public/product-images/${sub.image_url}`}
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
                                    <span>{t('category.inspectSeries')}</span>
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
                        <h2 className="text-3xl font-bold text-industrial-gray mb-4">
                            {t('category.whyCategory', { category: getCategoryDisplayName(category) })}
                        </h2>
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

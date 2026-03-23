'use client';

import { VentImage } from '@/components/ui/VentImage'
import React, { useState } from 'react'

import { ArrowRight, ThermometerSun, ChevronDown, Zap, Activity, ShieldCheck } from 'lucide-react'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import EnhancedNeedsWizard from '@/components/category/EnhancedNeedsWizard'
import { BottomCTA } from '@/components/category/sections'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import { buildCategoryBreadcrumb } from '../../utils/breadcrumbUtils'
import Image from 'next/image'

import { getCategoryDisplayName, getCategoryMarketingTitle } from '../../utils/categoryHelpers'
import { DomainCategory } from '../../lib/type-converters'

interface CategoryShowcaseProps {
    category: DomainCategory
    subCategories: DomainCategory[]
    onSubcategorySelect?: (slug: string) => void
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
    category,
    subCategories,
    onSubcategorySelect
}) => {
    const [wizardOpen, setWizardOpen] = useState(false)
    const isAirCurtain = category.slug.includes('hava-perde')

    // Breadcrumb (GATEWAY READY)
    const breadcrumbItems = buildCategoryBreadcrumb(category, null, 'Ana Sayfa')

    // Hero image logic (GATEWAY READY)
    interface CategoryMetadataExtended { showcase_images?: { desktop: string }[] }
    const metadata = category.metadata as CategoryMetadataExtended | null
    const showcaseImages = metadata?.showcase_images
    const heroImage = (showcaseImages?.[0]?.desktop) || category.image_url || '/images/products/vortice_lineo_360.png'

    return (
        <div className="bg-white">
            {/* HERO SECTION - CINEMATIC */}
            <div className="relative h-[70vh] min-h-[500px] overflow-hidden bg-primary-navy">
                {heroImage && (
                    <div className="absolute inset-0 z-0">
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
                                Premium Koleksiyon
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                {getCategoryMarketingTitle(category)}
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
                    aria-label="Devamını Keşfet"
                >
                    <span className="text-xs uppercase tracking-widest font-medium">Devamını Keşfet</span>
                    <ChevronDown className="w-6 h-6" />
                </button>
            </div>

            <div id="content-start" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Breadcrumb items={breadcrumbItems} />

                {/* Subcategories Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subCategories.map((sub) => (
                        <div
                            key={sub.id}
                            className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-secondary-blue/30 transition-all cursor-pointer overflow-hidden"
                            onClick={() => onSubcategorySelect?.(sub.slug)}
                        >
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-navy mb-6 group-hover:scale-110 transition-transform">
                                    {getCategoryIcon(sub.slug, { size: 28 })}
                                </div>
                                <h3 className="text-2xl font-bold text-industrial-gray mb-3">{getCategoryDisplayName(sub)}</h3>
                                <p className="text-steel-gray text-sm line-clamp-2 mb-6">{sub.description}</p>
                                <div className="flex items-center text-secondary-blue font-bold text-sm">
                                    Serileri İncele <ChevronDown className="ml-1 -rotate-90" size={16} />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary-blue/5 rounded-full blur-3xl group-hover:bg-secondary-blue/10 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Sections based on Category */}
            <div className="space-y-32 pb-32">
                <section className="relative py-24 bg-slate-950 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-8">Neden VentHub Mühendisliği?</h2>
                                <div className="space-y-6">
                                    {[
                                        { icon: ShieldCheck, title: 'Endüstriyel Sertifikasyon', desc: 'Tüm ürünlerimiz uluslararası testlerden geçmiş ve onaylanmıştır.' },
                                        { icon: Activity, title: 'Yüksek Performans', desc: 'Minimum enerji tüketimi ile maksimum hava debisi sunan aerodinamik tasarım.' },
                                        { icon: Zap, title: 'Akıllı Kontrol', desc: 'BMS ve merkezi otomasyon sistemlerine tam uyumlu haberleşme altyapısı.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1"><item.icon className="text-secondary-blue" size={24} /></div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                                <p className="text-gray-400 text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                                <VentImage src={heroImage} alt="Premium Engineering" className="object-cover" fill />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <BottomCTA 
                onOpenWizard={isAirCurtain ? () => setWizardOpen(true) : undefined}
                showWizard={isAirCurtain}
                categoryName={getCategoryDisplayName(category)}
            />

            <EnhancedNeedsWizard 
                isOpen={wizardOpen} 
                onClose={() => setWizardOpen(false)} 
                parentSlug={category.slug}
            />
        </div>
    )
}

export default CategoryShowcase

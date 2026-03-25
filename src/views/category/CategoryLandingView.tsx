'use client';

import React, { useState, useRef, useEffect } from 'react'
import type { DbProduct } from '../../types/db-rows'
import ProductCard from '@/components/ProductCard'
import EnhancedNeedsWizard from '@/components/category/EnhancedNeedsWizard'
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
} from '@/components/category/sections'
import { mapDatabaseProductToDomain, DomainCategory } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import Image from 'next/image'
import { Info } from 'lucide-react'
import Breadcrumb from '@/components/navigation/Breadcrumb'

interface CategoryLandingProps {
    category: DomainCategory
    products: DbProduct[]
    subCategories?: DomainCategory[]
}

const CategoryLanding: React.FC<CategoryLandingProps> = ({ category, products, subCategories = [] }) => {
    const { wrapCategory } = useCategoryViewModel()
    const [showProducts, setShowProducts] = useState(false)
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [wizardOpen, setWizardOpen] = useState(false)
    
    const [disableAnimation, setDisableAnimation] = useState(true)
    const productListRef = useRef<HTMLDivElement>(null)
    

    const vm = wrapCategory(category)
    const parentVm = wrapCategory(subCategories.find(s => s.id === category.parent_id)) // Attempt to find parent if any
    
    const isAirCurtain = category.slug === 'hava-perdesi' || category.slug === 'hava-perdeleri'
    const isSilentFan = category.slug === 'sessiz-kanal-tipi-fanlar'
    const isDehumidifier = category.slug === 'nem-alma-cihazlari'

    // Breadcrumb Items (MAXIMUM GATEWAY STANDARD)
    const breadcrumbItems = [
        { label: 'Ana Sayfa', href: '/' },
        ...(parentVm ? [{ label: parentVm.displayName, href: `/category/${parentVm.slug}` }] : []),
        { label: vm?.displayName || category.name, href: '' }
    ]

    const heroImage = category.image_url || '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

    useEffect(() => {
        const animTimer = setTimeout(() => setDisableAnimation(false), 300)
        return () => clearTimeout(animTimer)
    }, [])

    const handleScrollToTarget = (targetId: string) => {
        const anchor = document.getElementById(targetId)
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
    }

    const handleShowProducts = () => {
        setShowProducts(true)
        setTimeout(() => handleScrollToTarget('products-anchor'), 100)
    }

    const filteredProducts = (products || []).filter((p: DbProduct) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'quiet') return (Number(p.noise_level) || 100) <= 50
        return true
    })

    return (
        <div className="bg-white">
            {/* MAXIMUM HERO - INTEGRATED WITH LANDING CONTENT */}
            <div className="bg-slate-50 border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fadeIn">
                            <Breadcrumb items={breadcrumbItems} className="mb-10" />
                            <div className="flex items-center gap-3 mb-6 text-primary-navy font-bold text-sm tracking-widest uppercase bg-primary-navy/5 w-fit px-4 py-2 rounded-full border border-primary-navy/10">
                                <Info size={16} />
                                <span>Uzmanlık Alanı</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-industrial-gray mb-8 leading-[1.1] tracking-tight">
                                {vm?.displayName}
                            </h1>
                            <p className="text-xl text-steel-gray max-w-xl leading-relaxed font-medium">
                                {vm?.description || 'Profesyonel çözümleri teknik detaylarıyla keşfedin.'}
                            </p>
                            <div className="mt-10 flex gap-4">
                                <button 
                                    onClick={() => handleScrollToTarget('landing-content')}
                                    className="bg-primary-navy text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-secondary-blue shadow-xl shadow-primary-navy/20 active:scale-95"
                                >
                                    Detaylı İncele
                                </button>
                                <button 
                                    onClick={handleShowProducts}
                                    className="bg-white border-2 border-slate-200 text-industrial-gray px-8 py-4 rounded-2xl font-bold transition-all hover:border-primary-navy active:scale-95"
                                >
                                    Modelleri Gör
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-secondary-blue/5 rounded-full blur-3xl" />
                            <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white group">
                                <Image src={heroImage} alt={vm?.displayName || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-[2s]" priority />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="landing-content" className="scroll-mt-20">
                {isAirCurtain && (
                    <>
                        <ProblemSection />
                        <HowItWorks />
                        <VorticeBrand />
                        <TypeComparison
                            onOpenWizard={() => setWizardOpen(true)}
                            onSelectType={() => handleShowProducts()}
                        />
                        <TrustSignals />
                        <FAQ />
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
                    </>
                )}

                {isDehumidifier && (
                    <div className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
                                <div className="relative z-10 max-w-2xl">
                                    <h2 className="text-4xl md:text-5xl font-black mb-8">Nem Kontrolünde Mühendislik Hassasiyeti</h2>
                                    <p className="text-xl text-slate-400 leading-relaxed mb-12">
                                        Endüstriyel ve konfor alanları için optimize edilmiş nem alma teknolojileri ile ideal hava kalitesini koruyun.
                                    </p>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div><p className="text-3xl font-black text-secondary-blue">35L/Gün</p><p className="text-xs uppercase tracking-widest font-bold text-slate-500 mt-2">Kapasite</p></div>
                                        <div><p className="text-3xl font-black text-secondary-blue">42dB</p><p className="text-xs uppercase tracking-widest font-bold text-slate-500 mt-2">Sessiz Operasyon</p></div>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-secondary-blue/10 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div id="products-anchor" className="scroll-mt-24" />

            <div
                ref={productListRef}
                className={`${disableAnimation ? '' : 'transition-all duration-500 ease-in-out'} ${showProducts ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                style={{ maxHeight: showProducts ? '20000px' : '0' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4 border-b border-slate-100 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-industrial-gray uppercase tracking-tighter">{vm?.displayName} Modelleri</h2>
                            <p className="text-sm text-steel-gray mt-2 font-bold uppercase tracking-widest">{filteredProducts.length} Teknik Çözüm Listeleniyor</p>
                        </div>
                        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            {[
                                { key: 'all', label: 'Tüm Modeller' },
                                { key: 'quiet', label: 'En Sessiz' }
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setActiveFilter(f.key)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeFilter === f.key ? 'bg-white text-primary-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {(filteredProducts || []).map(p => (
                            <ProductCard key={p.id} product={mapDatabaseProductToDomain(p)} layout="grid" />
                        ))}
                    </div>
                </div>
            </div>

            <BottomCTA
                onOpenWizard={isAirCurtain ? () => setWizardOpen(true) : undefined}
                onShowProducts={handleShowProducts}
                showWizard={isAirCurtain}
                categoryName={vm?.displayName || "VentHub Çözümü"}
            />

            <EnhancedNeedsWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                parentSlug={category.slug}
            />
        </div>
    )
}

export default CategoryLanding

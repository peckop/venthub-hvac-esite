'use client';
import { Routes } from '../../utils/routes'

import { VentImage } from '@/components/ui/VentImage'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ThermometerSun, ChevronDown, Zap, Activity, ShieldCheck, Layers } from 'lucide-react'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import EnhancedNeedsWizard from '@/components/category/EnhancedNeedsWizard'
import { BottomCTA } from '@/components/category/sections'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import { DomainCategory } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { motion } from 'framer-motion'

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
    const router = useRouter()
    const { wrapCategory } = useCategoryViewModel()
    const [wizardOpen, setWizardOpen] = useState(false)
    
    const vm = wrapCategory(category)
    const isAirCurtain = category.slug.includes('hava-perde')

    // Handle selection either via prop or direct routing
    const handleSubSelect = (subSlug: string) => {
        if (onSubcategorySelect) {
            onSubcategorySelect(subSlug)
        } else {
            router.push(Routes.category(category.slug, subSlug))
        }
    }

    // Breadcrumb (VENTHUB SIGNATURE - FIXED LOCATION)
    const breadcrumbItems = [
        { label: 'Ana Sayfa', href: '/' },
        { label: vm?.displayName || category.name, href: Routes.category(category.slug) }
    ]

    // Hero image logic
    interface CategoryMetadataExtended { showcase_images?: { desktop: string }[] }
    const metadata = category.metadata as CategoryMetadataExtended | null
    const showcaseImages = metadata?.showcase_images
    const heroImage = (showcaseImages?.[0]?.desktop) || category.image_url || '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

    return (
        <div className="bg-white">
            {/* HERO SECTION - VENTHUB SIGNATURE (DARK CINEMATIC) */}
            <section className="relative h-[75vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 z-0">
                    <VentImage
                        src={heroImage}
                        alt={vm?.displayName || category.name}
                        fill
                        priority
                        className="object-cover opacity-30 grayscale brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
                </div>

                <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* FIXED BREADCRUMB - VENTHUB SIGNATURE */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-12"
                    >
                        <Breadcrumb items={breadcrumbItems} variant="transparent" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Premium Engineering Solutions</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl lg:text-8xl font-extralight tracking-tighter leading-[1.1] mb-10"
                    >
                        {vm?.displayName?.split(' ').slice(0, -1).join(' ')} <span className="font-medium text-white italic">{vm?.displayName?.split(' ').slice(-1)}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-slate-400 font-light leading-relaxed mb-12"
                    >
                        {vm?.description || 'Yüksek performanslı, akıllı ve sürdürülebilir havalandırma sistemlerinin teknik otoritesi.'}
                    </motion.p>

                    {isAirCurtain && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={() => setWizardOpen(true)}
                            className="group inline-flex items-center bg-white text-slate-950 px-10 py-5 rounded-full font-bold transition-all hover:bg-cyan-500 hover:text-white"
                        >
                            <ThermometerSun className="mr-3" size={20} />
                            <span>Bana Uygun Modeli Bul</span>
                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                        </motion.button>
                    )}
                </div>

                <button
                    onClick={() => document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer animate-bounce z-20"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Keşfet</span>
                    <ChevronDown className="w-5 h-5" />
                </button>
            </section>

            <div id="content-start" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex items-center gap-2 text-cyan-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Layers size={14} />
                        <span>Kategori Katalogu</span>
                    </div>
                    <h2 className="text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
                        Alt <span className="font-medium italic">Ürün Grupları</span>
                    </h2>
                </div>

                {/* Subcategories Grid - CENTERED */}
                <div className="flex flex-wrap justify-center gap-8">
                    {subCategories.map((sub) => {
                        const subVm = wrapCategory(sub)
                        return (
                            <div
                                key={sub.id}
                                className="group relative bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:border-cyan-500/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer overflow-hidden w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] max-w-[420px]"
                                onClick={() => handleSubSelect(sub.slug)}
                            >
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-10 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                        {getCategoryIcon(sub.slug, { size: 28 })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-950 mb-4 tracking-tight">{subVm?.displayName}</h3>
                                    <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-3 mb-10">{subVm?.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-cyan-600 transition-colors">
                                        <span>Serileri İncele</span>
                                        <div className="h-px w-6 bg-slate-200 group-hover:w-12 group-hover:bg-cyan-500 transition-all duration-500" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <section className="relative py-32 bg-slate-950 overflow-hidden text-white">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                                <ShieldCheck size={16} />
                                <span>VentHub Güvencesi</span>
                            </div>
                            <h2 className="text-5xl font-light tracking-tight mb-12">Neden <span className="font-medium italic">VentHub Mühendisliği?</span></h2>
                            <div className="space-y-10">
                                {[
                                    { icon: ShieldCheck, title: 'Endüstriyel Sertifikasyon', desc: 'Uluslararası testlerden geçmiş, tam onaylı sistemler.' },
                                    { icon: Activity, title: 'Yüksek Performans', desc: 'Aerodinamik tasarım ile maksimum verimlilik ve düşük enerji tüketimi.' },
                                    { icon: Zap, title: 'Akıllı Kontrol', desc: 'BMS ve merkezi otomasyon sistemleriyle kusursuz entegrasyon.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-slate-400 font-light leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                            <VentImage src={heroImage} alt="Premium Engineering" className="object-cover opacity-60" fill />
                        </div>
                    </div>
                </div>
            </section>

            <BottomCTA 
                onOpenWizard={isAirCurtain ? () => setWizardOpen(true) : undefined}
                showWizard={isAirCurtain}
                categoryName={vm?.displayName || category.name}
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

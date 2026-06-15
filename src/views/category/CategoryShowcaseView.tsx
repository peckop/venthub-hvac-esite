'use client';
import { Activity, ArrowRight, ChevronDown, Layers,ShieldCheck, ThermometerSun, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import EnhancedNeedsWizard from '@/components/category/EnhancedNeedsWizard'
import { BottomCTA } from '@/components/category/sections'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import VentImage from '@/components/ui/VentImage'
import useScrollAnimation, { scrollAnimationClasses } from '@/hooks/useScrollAnimation'
import { useI18n } from '@/i18n/I18nProvider'

import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { DomainCategory } from '../../lib/type-converters'
import { getCategoryIcon } from '../../utils/getCategoryIcon'

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
    const { t, dict } = useI18n()
    const Routes = useLocalizedRoutes()
    const { wrapCategory } = useCategoryViewModel()
    const [wizardOpen, setWizardOpen] = useState(false)
    
    const vm = wrapCategory(category)
    const isAirCurtain = category.slug.includes('hava-perde')
    const [breadcrumbRef, breadcrumbVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })
    const [heroBadgeRef, heroBadgeVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
    const [heroTitleRef, heroTitleVisible] = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })
    const [heroTextRef, heroTextVisible] = useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 })
    const [airCurtainBtnRef, airCurtainBtnVisible] = useScrollAnimation<HTMLButtonElement>({ threshold: 0.2 })

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
        { label: t('category.breadcrumbHome'), href: '/' },
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
            <section className="relative h-75vh min-h-600px flex items-center justify-center overflow-hidden bg-slate-950 text-white">
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

                <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* FIXED BREADCRUMB - VENTHUB SIGNATURE */}
                    <div ref={breadcrumbRef} className={scrollAnimationClasses.fadeUp(breadcrumbVisible) + " flex justify-center mb-12"}>
                        <Breadcrumb items={breadcrumbItems} variant="transparent" />
                    </div>

                    <div ref={heroBadgeRef} className={scrollAnimationClasses.fadeUp(heroBadgeVisible) + " inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"}>
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-hvac-loose text-cyan-400">{t('category.showcase.premiumTitle')}</span>
                    </div>

                    <h1 ref={heroTitleRef} className={scrollAnimationClasses.scaleIn(heroTitleVisible) + " text-5xl lg:text-8xl font-extralight tracking-tighter leading-hvac-11 mb-10"}>
                        {vm?.displayName?.split(' ').slice(0, -1).join(' ')} <span className="font-medium text-white italic">{vm?.displayName?.split(' ').slice(-1)}</span>
                    </h1>

                    <p ref={heroTextRef} className={scrollAnimationClasses.fadeIn(heroTextVisible) + " max-w-2xl mx-auto text-xl text-slate-400 font-light leading-relaxed mb-12"}>
                        {vm?.description || t('category.showcase.defaultDescription')}
                    </p>

                    {isAirCurtain && (
                        <button
                            ref={airCurtainBtnRef}
                            onClick={() => setWizardOpen(true)}
                            className={scrollAnimationClasses.fadeIn(airCurtainBtnVisible) + " group inline-flex items-center bg-white text-slate-950 px-10 py-5 rounded-full font-bold transition-colors hover:bg-cyan-500 hover:text-white"}
                        >
                            <ThermometerSun className="mr-3" size={20} />
                            <span>{t('category.findModel')}</span>
                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer animate-bounce z-20"
                >
                    <span className="text-xs uppercase tracking-widest font-bold">{t('category.showcase.discover')}</span>
                    <ChevronDown className="w-5 h-5" />
                </button>
            </section>

            <div id="content-start" className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="inline-flex items-center gap-2 text-cyan-600 font-black text-xs uppercase tracking-hvac-relaxed mb-4">
                        <Layers size={14} />
                        <span>{t('category.showcase.catalog')}</span>
                    </div>
                    <h2 className="text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
                        {t('category.showcase.subGroups')}
                    </h2>
                </div>

                {/* Subcategories Grid - CENTERED */}
                <div className="flex flex-wrap justify-center gap-8">
                    {subCategories.map((sub) => {
                        const subVm = wrapCategory(sub)
                        return (
                            <button
                                key={sub.id}
                                className="group relative bg-white rounded-hvac-2xl p-10 border border-slate-100 hover:border-cyan-500/20 hover:shadow-hvac-card-hover transition-shadow duration-700 cursor-pointer overflow-hidden max-w-modal text-left block"
                                style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'calc(33.33% - 1.5rem)' : typeof window !== 'undefined' && window.innerWidth >= 768 ? 'calc(50% - 1rem)' : '100%' }}
                                onClick={() => handleSubSelect(sub.slug)}
                            >
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-10 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-500">
                                        {getCategoryIcon(sub.slug, { size: 28 })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-950 mb-4 tracking-tight">{subVm?.displayName}</h3>
                                    <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-3 mb-10">{subVm?.description}</p>
                                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-hvac-relaxed text-slate-400 group-hover:text-cyan-600 transition-colors">
                                        <span>{t('category.showcase.exploreSeries')}</span>
                                        <div className="h-px w-6 bg-slate-200 group-hover:w-12 group-hover:bg-cyan-500 transition-colors duration-500" />
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <section className="relative py-32 bg-slate-950 overflow-hidden text-white">
                <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-hvac-relaxed mb-6">
                                <ShieldCheck size={16} />
                                <span>{t('category.showcase.guarantee')}</span>
                            </div>
                            <h2 className="text-5xl font-light tracking-tight mb-12">
                                {dict.category.showcase.whyVenthubTitle.split('VentHub')[0]}
                                <span className="font-medium italic">
                                    {t('common.brand')}
                                    {dict.category.showcase.whyVenthubTitle.split('VentHub')[1] || ''}
                                </span>
                            </h2>
                            <div className="space-y-10">
                                {[ShieldCheck, Activity, Zap].map((Icon, i) => {
                                    const item = dict.category.showcase.features[i]
                                    return (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-500">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                                <p className="text-slate-400 font-light leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-hvac-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <VentImage src={heroImage} alt={dict.category.showcase.premiumEngineeringAlt} className="object-cover opacity-60" fill />
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

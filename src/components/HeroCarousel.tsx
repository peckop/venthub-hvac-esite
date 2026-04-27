'use client';
import { Routes } from '../utils/routes'

import VentImage from '@/components/ui/VentImage'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, ArrowRight, Wind, Shield, Activity, Zap, Droplet, Layers, Cpu, Maximize, LucideIcon } from 'lucide-react'
import { DomainCategory } from '../lib/type-converters'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import { useI18n } from '../i18n/I18nProvider'

interface HeroCarouselProps {
    categories: DomainCategory[]
}

interface CategoryFeature {
    icon: string;
    title: string;
    description?: string;
}

interface CategoryMetadataExtended {
    hero_title?: string;
    hero_description?: string;
    technical_summary?: string;
    features?: CategoryFeature[];
    [key: string]: unknown;
}

// Fallback data for when DB metadata is missing
const FALLBACK_METADATA: Record<string, CategoryMetadataExtended> = {
    'industrial-ventilation': {
        hero_title: 'Endüstriyel Havalandırma Çözümleri',
        hero_description: 'Yüksek performanslı, enerji verimli ve uzun ömürlü fan teknolojileri.',
        technical_summary: '20+ Yıl Tecrübe',
        features: [{ icon: 'wind', title: 'Yüksek Performans' }, { icon: 'zap', title: 'Enerji Tasarrufu' }]
    },
    'residential-ventilation': {
        hero_title: 'Profesyonel Konut Havalandırması',
        hero_description: 'İşletmeniz ve eviniz için sessiz konfor bariyeri ve enerji tasarrufu.',
        technical_summary: 'Sessizlik',
        features: [{ icon: 'shield', title: 'Hava Bariyeri' }, { icon: 'activity', title: 'İklim Koruma' }]
    },
    'default': {
        hero_title: 'Profesyonel İklimlendirme',
        hero_description: 'En son teknoloji HVAC çözümleri ile tanışın.',
        technical_summary: 'Premium Kalite',
        features: [{ icon: 'activity', title: 'Uzun Ömürlü' }, { icon: 'shield', title: 'Garantili' }]
    }
}

// Icon mapper
const IconMap: Record<string, LucideIcon> = {
    wind: Wind,
    shield: Shield,
    activity: Activity,
    zap: Zap,
    droplet: Droplet,
    layers: Layers,
    cpu: Cpu,
    maximize: Maximize,
    'shield-check': Shield,
    sparkles: Activity,
    settings: Cpu,
    tool: Layers,
    home: Activity
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ categories }) => {
    const { wrapCategory } = useCategoryViewModel()
    const { t } = useI18n()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Filter only top-level categories and wrap them in ViewModel
    const mainCategoryVms = useMemo(() => {
        return categories
            .filter(c => !c.parent_id)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(c => wrapCategory(c))
            .filter((vm): vm is NonNullable<typeof vm> => vm !== null)
    }, [categories, wrapCategory])

    // Safe reset if categories change
    useEffect(() => {
        if (currentIndex >= mainCategoryVms.length) setCurrentIndex(0)
    }, [mainCategoryVms.length, currentIndex])

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlaying && mainCategoryVms.length > 0) {
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % mainCategoryVms.length)
            }, 5000)
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [currentIndex, isAutoPlaying, mainCategoryVms.length])

    const handleNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev + 1) % mainCategoryVms.length)
    }

    const handlePrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev - 1 + mainCategoryVms.length) % mainCategoryVms.length)
    }

    if (mainCategoryVms.length === 0) return null

    return (
        <div className="relative h-[600px] lg:h-[700px] w-full overflow-hidden bg-zinc-900 text-white group">
            {mainCategoryVms.map((vm, idx) => {
                const isActive = idx === currentIndex
                const cat = vm.raw
                const meta = (cat.metadata as CategoryMetadataExtended) || FALLBACK_METADATA[vm.slug] || FALLBACK_METADATA['default']

                // Construct image URL
                let bgImage = `/images/category/hero-${vm.slug}.png`
                if (vm.imageUrl) {
                    bgImage = vm.imageUrl.startsWith('http') || vm.imageUrl.startsWith('/') 
                        ? vm.imageUrl 
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${vm.imageUrl}`
                }

                return (
                    <div
                        key={vm.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'}`}
                    >
                        {/* Background Image Layer */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                            <VentImage src={bgImage}
                                alt={vm.displayName}
                                className={`w-full h-full object-cover object-center transform transition-transform duration-[2000ms] ${isActive ? 'scale-105' : 'scale-100'}`}
                                 onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg';
                                }}
                            />
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                            <div className={`max-w-2xl transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                {/* Category Badge */}
                                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
                                    <Activity className="text-secondary-blue w-4 h-4" />
                                    <span className="text-sm font-medium tracking-wide uppercase">{vm.displayName}</span>
                                </div>

                                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                    {vm.marketingTitle}
                                </h1>

                                <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
                                    {meta.hero_description || vm.description}
                                </p>

                                {/* Features Grid */}
                                {meta.features && (
                                    <div className="flex gap-8 mb-10">
                                        {meta.features.map((f: CategoryFeature, i: number) => {
                                            const Icon = IconMap[f.icon.toLowerCase()] || Activity
                                            return (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/10 rounded-lg">
                                                        <Icon className="w-6 h-6 text-secondary-blue" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{f.title}</div>
                                                        <div className="text-xs text-gray-400">{f.description}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={Routes.category(vm.slug)}
                                        className="px-8 py-4 bg-secondary-blue hover:bg-blue-600 text-white rounded-lg font-bold transition-all flex items-center shadow-lg shadow-blue-500/30"
                                    >
                                        {t('home.hero.primaryCta')}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                    <button type="button"
                                        onClick={() => {
                                            window.openLeadModal?.()
                                        }}
                                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg font-bold transition-all backdrop-blur-sm"
                                    >
                                        {t('home.hero.secondaryCta')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Navigation Controls */}
            <div className="absolute bottom-10 right-10 z-30 flex gap-2">
                <button type="button"
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                 aria-label={t("common.prev") as string}>
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button type="button"
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                 aria-label={t("common.next") as string}>
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>


            {/* Progress Indicators */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                {mainCategoryVms.map((_, idx) => (
                    <button type="button"
                        key={idx}
                        onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx) }}
                        className={`h-1.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 ${idx === currentIndex ? 'w-8 bg-secondary-blue' : 'w-2 bg-white/30 hover:bg-white/50'
                            }`} aria-label={`${t("common.next")} ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroCarousel

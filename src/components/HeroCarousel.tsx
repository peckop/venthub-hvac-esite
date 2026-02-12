import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, ArrowRight, Wind, Shield, Activity, Zap, Droplet, Layers, Cpu, Maximize } from 'lucide-react'
import { Category } from '../lib/supabase'
import { CATEGORY_REGISTRY } from '../config/categoryRegistry'
import { useI18n } from '../i18n/I18nProvider'
import { getCategoryDisplayName } from '../utils/categoryHelpers'

interface HeroCarouselProps {
    categories: Category[]
}

// Fallback data for when DB metadata is missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACK_METADATA: Record<string, any> = {
    'fanlar': {
        hero_title: 'Endüstriyel Havalandırma Çözümleri',
        hero_description: 'Yüksek performanslı, enerji verimli ve uzun ömürlü fan teknolojileri.',
        technical_summary: '20+ Yıl Tecrübe',
        features: [{ icon: 'Wind', title: 'Yüksek Performans' }, { icon: 'Zap', title: 'Enerji Tasarrufu' }]
    },
    'hava-perdeleri': {
        hero_title: 'Profesyonel Hava Perdeleri',
        hero_description: 'İşletmeniz için görünmez konfor bariyeri ve enerji tasarrufu.',
        technical_summary: 'İzolasyon',
        features: [{ icon: 'Shield', title: 'Hava Bariyeri' }, { icon: 'Activity', title: 'İklim Koruma' }]
    },
    // Default fallback for others
    'default': {
        hero_title: 'Profesyonel İklimlendirme',
        hero_description: 'En son teknoloji HVAC çözümleri ile tanışın.',
        technical_summary: 'Premium Kalite',
        features: [{ icon: 'Activity', title: 'Uzun Ömürlü' }, { icon: 'Shield', title: 'Garantili' }]
    }
}

// Icon mapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconMap: Record<string, any> = {
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
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { t: _t } = useI18n()

    // Filter only main categories defined in registry
    const mainCategories = categories.filter(c =>
        Object.values(CATEGORY_REGISTRY).some(reg => reg.slug === c.slug)
    ).sort((a, b) => {
        // Custom sort order if needed, or rely on DB sort_order
        return (a.sort_order || 99) - (b.sort_order || 99)
    })

    // Safe reset if categories change
    useEffect(() => {
        if (currentIndex >= mainCategories.length) setCurrentIndex(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainCategories.length])

    // Auto-play logic
    useEffect(() => {
        if (isAutoPlaying && mainCategories.length > 0) {
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % mainCategories.length)
            }, 5000)
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [currentIndex, isAutoPlaying, mainCategories.length])

    const handleNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev + 1) % mainCategories.length)
    }

    const handlePrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev - 1 + mainCategories.length) % mainCategories.length)
    }

    if (mainCategories.length === 0) return null

    return (
        <div className="relative h-[600px] lg:h-[700px] w-full overflow-hidden bg-zinc-900 text-white group">
            {mainCategories.map((cat, idx) => {
                const isActive = idx === currentIndex
                const meta = cat.metadata || FALLBACK_METADATA[cat.slug] || FALLBACK_METADATA['default']

                // Construct image URL
                let bgImage = `/images/category/hero-${cat.slug}.png`
                if (cat.image_url) {
                    bgImage = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/category-images/${cat.image_url}`
                }

                return (
                    <div
                        key={cat.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-20' : 'opacity-0 z-10 pointer-events-none'}`}
                    >
                        {/* Background Image Layer */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-black/40 z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                            <img
                                src={bgImage}
                                alt={cat.name}
                                className={`w-full h-full object-cover object-center transform transition-transform duration-[2000ms] ${isActive ? 'scale-105' : 'scale-100'}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'
                                }}
                            />
                        </div>

                        {/* Content Layer */}
                        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                            <div className={`max-w-2xl transition-all duration-1000 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                {/* Category Badge */}
                                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
                                    <Activity className="text-secondary-blue w-4 h-4" />
                                    <span className="text-sm font-medium tracking-wide uppercase">{getCategoryDisplayName(cat)}</span>
                                </div>

                                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                                    {getCategoryDisplayName(cat)}
                                </h1>

                                <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
                                    {meta.hero_description || cat.description}
                                </p>

                                {/* Features Grid */}
                                {meta.features && (
                                    <div className="flex gap-8 mb-10">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {meta.features.map((f: any, i: number) => {
                                            const Icon = IconMap[f.icon] || Activity
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
                                        to={`/category/${cat.slug}`}
                                        className="px-8 py-4 bg-secondary-blue hover:bg-blue-600 text-white rounded-lg font-bold transition-all flex items-center shadow-lg shadow-blue-500/30"
                                    >
                                        Ürünleri İncele
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-lg font-bold transition-all backdrop-blur-sm">
                                        Hızlı Teklif Al
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Navigation Controls */}
            <div className="absolute bottom-10 right-10 z-30 flex gap-2">
                <button
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>


            {/* Progress Indicators */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                {mainCategories.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx) }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-secondary-blue' : 'w-2 bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

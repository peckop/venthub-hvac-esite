import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, ArrowRight, Wind, Shield, Activity, Zap, Droplet, Layers, Cpu, Maximize } from 'lucide-react'
import { Category } from '../lib/supabase'
import { CATEGORY_REGISTRY, getCategoryUrl } from '../config/categoryRegistry'
import { useI18n } from '../i18n/I18nProvider'

interface HeroCarouselProps {
    categories: Category[]
}

// Fallback data for when DB metadata is missing
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
    const { t } = useI18n()

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

    const currentCat = mainCategories[currentIndex]
    // Merge DB data with Fallback
    const meta = currentCat.metadata || FALLBACK_METADATA[currentCat.slug] || FALLBACK_METADATA['default']

    // Construct image URL (mock or real)
    // For now using the local reference images or placeholders as user hasn't uploaded all to Supabase yet
    // If image_url exists in DB, use it. Else use local placeholders based on slug.
    const getImageUrl = (cat: Category) => {
        if (cat.image_url) {
            return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/category-images/${cat.image_url}`
        }
        // Fallback to local images path (assuming they will be placed there)
        // Or use the ones we generated contextually - for now using a generic placeholder if missing
        // Actually we have: hero-vortice.png logic from previous steps. 
        // Let's use a smart local path mapping if we know the filenames
        return `/images/category/hero-${cat.slug}.png` // Expectation for local files
    }

    const bgImage = getImageUrl(currentCat)

    return (
        <div className="relative h-[600px] lg:h-[700px] w-full overflow-hidden bg-zinc-900 text-white group">

            {/* Background Image Layer */}
            <div key={currentCat.id} className="absolute inset-0 transition-opacity duration-700 ease-in-out">
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                <img
                    src={bgImage}
                    alt={currentCat.name}
                    className="w-full h-full object-cover object-center transform scale-105 animate-slow-zoom"
                    onError={(e) => {
                        // Fallback if local image missing
                        (e.target as HTMLImageElement).src = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'
                    }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="max-w-2xl animate-fade-in-up">
                    {/* Category Badge */}
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
                        <Activity className="text-secondary-blue w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide uppercase">{currentCat.name}</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                        {meta.hero_title || currentCat.name}
                    </h1>

                    <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
                        {meta.hero_description || currentCat.description}
                    </p>

                    {/* Features Grid */}
                    {meta.features && (
                        <div className="flex gap-8 mb-10">
                            {meta.features.map((f: any, idx: number) => {
                                const Icon = IconMap[f.icon] || Activity
                                return (
                                    <div key={idx} className="flex items-center gap-3">
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
                            to={`/category/${currentCat.slug}`}
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

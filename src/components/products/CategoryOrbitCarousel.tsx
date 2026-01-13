import React from 'react'
import { motion } from 'framer-motion'
import { Wind, Zap, Activity, Fan, Settings, Droplets } from 'lucide-react'
import OrbitalProductsShowcase from './OrbitalProductsShowcase'
import { CATEGORY_REGISTRY } from '@/config/categoryRegistry'

// --- Category Data using OFFICIAL SLUGS from categoryRegistry ---
export interface CategoryCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    image: string
    color: string
}

const categories: CategoryCard[] = [
    {
        id: CATEGORY_REGISTRY.HAVA_PERDELERI.slug,
        title: CATEGORY_REGISTRY.HAVA_PERDELERI.name,
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/air-curtain.png',
        color: 'from-cyan-500 to-blue-600'
    },
    {
        id: CATEGORY_REGISTRY.FANLAR.slug,
        title: CATEGORY_REGISTRY.FANLAR.name,
        description: 'Yüksek performanslı havalandırma ve egzoz sistemleri.',
        icon: <Fan className="w-6 h-6" />,
        image: '/images/products/industrial-fan.png',
        color: 'from-blue-500 to-indigo-600'
    },
    {
        id: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.slug,
        title: CATEGORY_REGISTRY.ISI_GERI_KAZANIM.name,
        description: 'Maksimum enerji tasarrufu sağlayan taze hava üniteleri.',
        icon: <Activity className="w-6 h-6" />,
        image: '/images/products/hrv-unit.png',
        color: 'from-emerald-500 to-teal-600'
    },
    {
        id: CATEGORY_REGISTRY.HIZ_KONTROL.slug,
        title: CATEGORY_REGISTRY.HIZ_KONTROL.name,
        description: 'Fan ve motor hız kontrol sistemleri.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/speed-controller.png',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: CATEGORY_REGISTRY.HAVA_TEMIZLEYICILER.slug,
        title: 'Hava Temizleyiciler',
        description: 'Anti-viral ve hava temizleme çözümleri.',
        icon: <Zap className="w-6 h-6" />,
        image: '/images/products/air-purifier.png',
        color: 'from-violet-500 to-purple-600'
    },
    {
        id: CATEGORY_REGISTRY.NEM_ALMA.slug,
        title: CATEGORY_REGISTRY.NEM_ALMA.name,
        description: 'Profesyonel nem kontrol çözümleri.',
        icon: <Droplets className="w-6 h-6" />,
        image: '/images/products/dehumidifier.png',
        color: 'from-sky-500 to-cyan-600'
    },
    {
        id: CATEGORY_REGISTRY.FLEXIBLE.slug,
        title: CATEGORY_REGISTRY.FLEXIBLE.name,
        description: 'Esnek hava kanalı çözümleri.',
        icon: <Wind className="w-6 h-6" />,
        image: '/images/products/flexible-duct.png',
        color: 'from-amber-500 to-yellow-600'
    },
    {
        id: CATEGORY_REGISTRY.AKSESUARLAR.slug,
        title: CATEGORY_REGISTRY.AKSESUARLAR.name,
        description: 'Havalandırma sistem aksesuarları.',
        icon: <Settings className="w-6 h-6" />,
        image: '/images/products/accessories.png',
        color: 'from-rose-500 to-pink-600'
    }
]

const CategoryOrbitCarousel = () => {
    return (
        <section className="bg-[#020617] overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#020617] to-[#020617] pointer-events-none" />

            {/* Integrated Title - Üstte overlay */}
            <div className="absolute top-6 left-0 right-0 z-30 container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold text-white/90 text-center"
                >
                    Ürün Yelpazemizi Keşfedin
                </motion.h2>
            </div>

            <div className="container mx-auto px-4 relative z-10 w-full">
                {/* 3D Showcase - Pass category data with correct slugs */}
                <OrbitalProductsShowcase items={categories.map(c => ({ id: c.id, title: c.title, image: c.image }))} />
            </div>
        </section>
    )
}

export default CategoryOrbitCarousel

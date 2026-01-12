import React from 'react'
import { Link } from 'react-router-dom'
import { Wind, Fan, RefreshCw, ArrowRight } from 'lucide-react'

interface CategoryCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
    gradient: string
}

const categories: CategoryCard[] = [
    {
        id: 'hava-perdeleri',
        title: 'Hava Perdeleri',
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.',
        icon: <Wind size={32} />,
        href: '/category/hava-perdeleri',
        gradient: 'from-blue-500 to-cyan-400'
    },
    {
        id: 'fanlar',
        title: 'Endüstriyel Fanlar',
        description: 'Geniş hacimli mekanlar için güçlü ve dayanıklı havalandırma çözümleri.',
        icon: <Fan size={32} />,
        href: '/category/fanlar',
        gradient: 'from-slate-600 to-slate-400'
    },
    {
        id: 'isi-geri-kazanim',
        title: 'Isı Geri Kazanım',
        description: 'Enerji tasarrufu sağlayan gelişmiş ısı geri kazanım üniteleri.',
        icon: <RefreshCw size={32} />,
        href: '/category/isi-geri-kazanim-cihazlari',
        gradient: 'from-emerald-500 to-teal-400'
    }
]

/**
 * Premium category showcase cards for Products Hub
 * 3 large cards with glassmorphism effect
 */
const CategoryShowcaseCards: React.FC = () => {
    return (
        <section className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.href}
                        className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all hover:scale-[1.02] hover:shadow-xl"
                    >
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                        {/* Content */}
                        <div className="relative z-10 p-8">
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                                {category.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                                {category.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                {category.description}
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-secondary-blue font-semibold group-hover:gap-3 transition-all">
                                <span>Keşfet</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Bottom Gradient Line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default CategoryShowcaseCards

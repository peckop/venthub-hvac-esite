import React from 'react'
import { Link } from 'react-router-dom'
import { Wind, Fan, RefreshCw, ChevronRight } from 'lucide-react'

interface CategoryCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
    productImage: string
}

const categories: CategoryCard[] = [
    {
        id: 'hava-perdeleri',
        title: 'Hava Perdeleri',
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.',
        icon: <Wind size={22} strokeWidth={1.5} />,
        href: '/category/hava-perdeleri',
        productImage: '/images/products/air-curtain.png'
    },
    {
        id: 'fanlar',
        title: 'Endüstriyel Fanlar',
        description: 'Geniş hacimli mekanlar için güçlü ve dayanıklı havalandırma çözümleri.',
        icon: <Fan size={22} strokeWidth={1.5} />,
        href: '/category/fanlar',
        productImage: '/images/products/industrial-fan.png'
    },
    {
        id: 'isi-geri-kazanim',
        title: 'Isı Geri Kazanım',
        description: 'Enerji tasarrufu sağlayan gelişmiş ısı geri kazanım üniteleri.',
        icon: <RefreshCw size={22} strokeWidth={1.5} />,
        href: '/category/isi-geri-kazanim-cihazlari',
        productImage: '/images/products/hrv-unit.png'
    }
]

/**
 * Premium category showcase cards - Pixel-perfect mockup implementation
 * Matches the original mockup design exactly
 */
const CategoryShowcaseCards: React.FC = () => {
    return (
        <section className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.href}
                        className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 hover:border-slate-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/30"
                    >
                        {/* Top Content Section */}
                        <div className="p-6 pb-4 text-center">
                            {/* Icon Badge - Rounded square like mockup */}
                            <div className="inline-flex w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/25">
                                {category.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                {category.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {category.description}
                            </p>
                        </div>

                        {/* Product Image Section */}
                        <div className="flex-1 flex items-center justify-center px-6 py-4 min-h-[160px]">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Subtle glow behind image */}
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-700/10 to-transparent rounded-lg" />

                                {/* Product Image */}
                                <img
                                    src={category.productImage}
                                    alt={category.title}
                                    className="relative z-10 max-h-32 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        {/* CTA Button Section */}
                        <div className="p-5 pt-3">
                            <div className="flex items-center justify-center gap-2 py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-medium text-sm transition-all group-hover:gap-3">
                                <span>Keşfet</span>
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default CategoryShowcaseCards

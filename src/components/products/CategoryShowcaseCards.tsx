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
    productImage: string
}

const categories: CategoryCard[] = [
    {
        id: 'hava-perdeleri',
        title: 'Hava Perdeleri',
        description: 'Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.',
        icon: <Wind size={24} />,
        href: '/category/hava-perdeleri',
        gradient: 'from-blue-500 to-cyan-400',
        productImage: '/images/category/air-curtain-product.png'
    },
    {
        id: 'fanlar',
        title: 'Endüstriyel Fanlar',
        description: 'Geniş hacimli mekanlar için güçlü ve dayanıklı havalandırma çözümleri.',
        icon: <Fan size={24} />,
        href: '/category/fanlar',
        gradient: 'from-slate-500 to-slate-400',
        productImage: '/images/category/fan-product.png'
    },
    {
        id: 'isi-geri-kazanim',
        title: 'Isı Geri Kazanım',
        description: 'Enerji tasarrufu sağlayan gelişmiş ısı geri kazanım üniteleri.',
        icon: <RefreshCw size={24} />,
        href: '/category/isi-geri-kazanim-cihazlari',
        gradient: 'from-emerald-500 to-teal-400',
        productImage: '/images/category/hrv-product.png'
    }
]

/**
 * Premium category showcase cards for Products Hub
 * Matches the mockup design with icons, product images, and glassmorphism
 */
const CategoryShowcaseCards: React.FC = () => {
    return (
        <section className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={category.href}
                        className="group relative bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-500 transition-all hover:shadow-2xl hover:shadow-blue-900/20"
                    >
                        {/* Card Content */}
                        <div className="relative z-10 p-6 flex flex-col h-full min-h-[380px]">
                            {/* Top Section: Icon + Title + Description */}
                            <div className="text-center mb-4">
                                {/* Icon Badge */}
                                <div className={`inline-flex w-14 h-14 rounded-xl bg-gradient-to-br ${category.gradient} items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {category.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                    {category.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {category.description}
                                </p>
                            </div>

                            {/* Product Image Area */}
                            <div className="flex-1 flex items-center justify-center my-4">
                                <div className="relative w-full h-32 flex items-center justify-center">
                                    {/* Glow Effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 blur-2xl rounded-full`} />

                                    {/* Product Image Placeholder - using SVG icons as placeholder */}
                                    <div className="relative z-10 text-gray-500 group-hover:text-gray-400 transition-colors">
                                        {category.id === 'hava-perdeleri' && (
                                            <svg className="w-32 h-24" viewBox="0 0 128 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="8" y="8" width="112" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
                                                <rect x="16" y="40" width="96" height="8" rx="2" fill="currentColor" opacity="0.3" />
                                                <rect x="16" y="52" width="96" height="8" rx="2" fill="currentColor" opacity="0.2" />
                                                <rect x="16" y="64" width="96" height="8" rx="2" fill="currentColor" opacity="0.1" />
                                                <path d="M64 76 L64 88 M54 82 L74 82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                        {category.id === 'fanlar' && (
                                            <svg className="w-28 h-28" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="56" cy="56" r="12" fill="currentColor" opacity="0.5" />
                                                <path d="M56 20 C56 20 72 36 72 56 C72 56 56 72 56 56 C56 40 56 20 56 20" fill="currentColor" opacity="0.4" />
                                                <path d="M92 56 C92 56 76 72 56 72 C56 72 40 56 56 56 C72 56 92 56 92 56" fill="currentColor" opacity="0.4" />
                                                <path d="M56 92 C56 92 40 76 40 56 C40 56 56 40 56 56 C56 72 56 92 56 92" fill="currentColor" opacity="0.4" />
                                                <path d="M20 56 C20 56 36 40 56 40 C56 40 72 56 56 56 C40 56 20 56 20 56" fill="currentColor" opacity="0.4" />
                                            </svg>
                                        )}
                                        {category.id === 'isi-geri-kazanim' && (
                                            <svg className="w-32 h-24" viewBox="0 0 128 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="8" y="16" width="112" height="64" rx="6" stroke="currentColor" strokeWidth="2" />
                                                <rect x="16" y="24" width="32" height="48" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                                                <rect x="80" y="24" width="32" height="48" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                                                <path d="M52 48 L76 48 M64 36 L64 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M56 40 L64 48 L72 40 M56 56 L64 48 L72 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="mt-auto pt-4">
                                <div className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-semibold transition-all group-hover:gap-3">
                                    <span>Keşfet</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Gradient Line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default CategoryShowcaseCards

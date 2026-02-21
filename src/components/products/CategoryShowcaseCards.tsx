import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * Premium category showcase cards - EXACT mockup design
 * Using line-art style SVG illustrations matching the concept image
 */
const CategoryShowcaseCards: React.FC = () => {
    return (
        <section className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Hava Perdeleri Card */}
                <Link
                    href="/category/hava-perdeleri"
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-600/50 bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 hover:border-slate-400/50 transition-all duration-300 hover:shadow-2xl"
                >
                    <div className="p-6 pb-2 text-center">
                        {/* Icon - Door with air flow lines */}
                        <div className="flex justify-center mb-4">
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-cyan-400">
                                <rect x="12" y="8" width="20" height="40" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                <rect x="26" y="26" width="3" height="6" rx="1" fill="currentColor" />
                                <path d="M36 16 L48 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M36 22 L52 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M36 28 L48 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M36 34 L44 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Hava Perdeleri</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Ticari ve endüstriyel alanlar için enerji verimli hava bariyerleri.
                        </p>
                    </div>

                    {/* Product Illustration - Air Curtain Unit */}
                    <div className="flex-1 flex items-center justify-center px-6 py-4 min-h-[140px]">
                        <svg width="180" height="100" viewBox="0 0 180 100" fill="none" className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            {/* Main Unit Body */}
                            <rect x="20" y="20" width="140" height="35" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            {/* Vent Grilles */}
                            <line x1="35" y1="30" x2="35" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="50" y1="30" x2="50" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="65" y1="30" x2="65" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="80" y1="30" x2="80" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="95" y1="30" x2="95" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="110" y1="30" x2="110" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="125" y1="30" x2="125" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="140" y1="30" x2="140" y2="45" stroke="currentColor" strokeWidth="1" />
                            {/* Air Flow Lines */}
                            <path d="M40 60 L40 85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M70 60 L70 90" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M100 60 L100 85" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                            <path d="M130 60 L130 80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                            {/* Wall Mount */}
                            <rect x="15" y="10" width="150" height="6" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                        </svg>
                    </div>

                    {/* CTA Button */}
                    <div className="p-5 pt-2">
                        <div className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/5 border border-white/20 rounded-full text-white font-medium text-sm hover:bg-white/10 transition-all">
                            <span>Keşfet</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </Link>

                {/* Endüstriyel Fanlar Card */}
                <Link
                    href="/category/fanlar"
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-600/50 bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 hover:border-slate-400/50 transition-all duration-300 hover:shadow-2xl"
                >
                    <div className="p-6 pb-2 text-center">
                        {/* Icon - Fan Symbol */}
                        <div className="flex justify-center mb-4">
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-cyan-400">
                                <circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                                <circle cx="28" cy="28" r="4" fill="currentColor" />
                                {/* Fan Blades */}
                                <path d="M28 8 C32 14 32 22 28 24 C24 22 24 14 28 8" fill="currentColor" opacity="0.7" />
                                <path d="M48 28 C42 32 34 32 32 28 C34 24 42 24 48 28" fill="currentColor" opacity="0.7" />
                                <path d="M28 48 C24 42 24 34 28 32 C32 34 32 42 28 48" fill="currentColor" opacity="0.7" />
                                <path d="M8 28 C14 24 22 24 24 28 C22 32 14 32 8 28" fill="currentColor" opacity="0.7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Exproof Fanlar</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Geniş hacimli mekanlar için güçlü ve dayanıklı havalandırma çözümleri.
                        </p>
                    </div>

                    {/* Product Illustration - Industrial Fan */}
                    <div className="flex-1 flex items-center justify-center px-6 py-4 min-h-[140px]">
                        <svg width="140" height="120" viewBox="0 0 140 120" fill="none" className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            {/* Outer Frame */}
                            <circle cx="70" cy="60" r="45" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            {/* Inner Circle */}
                            <circle cx="70" cy="60" r="35" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            {/* Center Hub */}
                            <circle cx="70" cy="60" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="70" cy="60" r="4" fill="currentColor" opacity="0.5" />
                            {/* Fan Blades */}
                            <path d="M70 25 C80 40 78 55 70 60 C62 55 60 40 70 25" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3" />
                            <path d="M105 60 C90 70 75 68 70 60 C75 52 90 50 105 60" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3" />
                            <path d="M70 95 C60 80 62 65 70 60 C78 65 80 80 70 95" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3" />
                            <path d="M35 60 C50 50 65 52 70 60 C65 68 50 70 35 60" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3" />
                            {/* Mounting Points */}
                            <circle cx="28" cy="20" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <circle cx="112" cy="20" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <circle cx="28" cy="100" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <circle cx="112" cy="100" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                        </svg>
                    </div>

                    {/* CTA Button */}
                    <div className="p-5 pt-2">
                        <div className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/5 border border-white/20 rounded-full text-white font-medium text-sm hover:bg-white/10 transition-all">
                            <span>Keşfet</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </Link>

                {/* Isı Geri Kazanım Card */}
                <Link
                    href="/category/isi-geri-kazanim-cihazlari"
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-600/50 bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-900 hover:border-slate-400/50 transition-all duration-300 hover:shadow-2xl"
                >
                    <div className="p-6 pb-2 text-center">
                        {/* Icon - Heat Exchange Arrows */}
                        <div className="flex justify-center mb-4">
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-cyan-400">
                                {/* Left Arrow */}
                                <path d="M8 20 L28 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M20 14 L28 20 L20 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                {/* Right Arrow */}
                                <path d="M48 36 L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M36 30 L28 36 L36 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Isı Geri Kazanım</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Enerji tasarrufu sağlayan gelişmiş ısı geri kazanım üniteleri.
                        </p>
                    </div>

                    {/* Product Illustration - HRV Unit */}
                    <div className="flex-1 flex items-center justify-center px-6 py-4 min-h-[140px]">
                        <svg width="160" height="100" viewBox="0 0 160 100" fill="none" className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            {/* Main Unit Body */}
                            <rect x="30" y="25" width="100" height="55" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            {/* Left Chamber */}
                            <rect x="38" y="33" width="35" height="40" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
                            {/* Right Chamber */}
                            <rect x="88" y="33" width="35" height="40" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
                            {/* Center Exchange Pattern */}
                            <line x1="75" y1="38" x2="83" y2="38" stroke="currentColor" strokeWidth="1" />
                            <line x1="75" y1="45" x2="83" y2="45" stroke="currentColor" strokeWidth="1" />
                            <line x1="75" y1="52" x2="83" y2="52" stroke="currentColor" strokeWidth="1" />
                            <line x1="75" y1="59" x2="83" y2="59" stroke="currentColor" strokeWidth="1" />
                            <line x1="75" y1="66" x2="83" y2="66" stroke="currentColor" strokeWidth="1" />
                            {/* Flow Arrows */}
                            <path d="M50 50 L65 50" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                            <path d="M60 46 L65 50 L60 54" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
                            <path d="M110 55 L95 55" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                            <path d="M100 51 L95 55 L100 59" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
                            {/* Duct Connections */}
                            <rect x="10" y="40" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <rect x="130" y="40" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <rect x="10" y="50" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                            <rect x="130" y="50" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                        </svg>
                    </div>

                    {/* CTA Button */}
                    <div className="p-5 pt-2">
                        <div className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white/5 border border-white/20 rounded-full text-white font-medium text-sm hover:bg-white/10 transition-all">
                            <span>Keşfet</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    )
}

export default CategoryShowcaseCards




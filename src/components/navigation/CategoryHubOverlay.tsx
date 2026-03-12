'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { X, Grid3X3, ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Category3DIcon from '../products/Category3DIcon'
import type { Category } from '../../lib/supabase'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryHubOverlayProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
    onCategorySelect: (category: Category) => void
}

const CategoryHubOverlay: React.FC<CategoryHubOverlayProps> = ({
    isOpen,
    onClose,
    categories,
    onCategorySelect
}) => {
    const router = useRouter()
    const [isAnimating, setIsAnimating] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    // Alt kategorilere dalmak için state
    const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null)

    // Hover edilen (Sol tarafta 3D modeli gösterilecek) kategori
    const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)

    // Ana kategoriler (level 0)
    const mainCategories = categories.filter(cat => cat.level === 0)

    // Seçilen kategorinin alt kategorileri
    const subCategories = selectedParentCategory
        ? categories.filter(cat => cat.parent_id === selectedParentCategory.id)
        : []

    // Başlangıçta ilk kategoriyi 3D vitrinde göstermek için
    useEffect(() => {
        if (mainCategories.length > 0 && !hoveredCategory) {
            setHoveredCategory(mainCategories[0])
        }
    }, [mainCategories, hoveredCategory])


    // Add this inside the component body, let's find a good spot.

    const getSubCategoryCount = useCallback((parentId: string) => {
        return categories.filter(cat => cat.parent_id === parentId).length
    }, [categories])

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            requestAnimationFrame(() => {
                setIsAnimating(true)
            })
        } else {
            setIsAnimating(false)
            setSelectedParentCategory(null)
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (selectedParentCategory) {
                    setSelectedParentCategory(null)
                } else {
                    onClose()
                }
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose, selectedParentCategory])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleCategoryClick = (category: Category) => {
        const subCount = getSubCategoryCount(category.id)
        if (subCount > 0) {
            setSelectedParentCategory(category)
            setHoveredCategory(category) // Alt menüye girince 3D model sabitlensin
        } else {
            onCategorySelect(category)
            onClose()
        }
    }

    const handleSubCategoryClick = (subCategory: Category) => {
        if (selectedParentCategory) {
            router.push(`/category/${selectedParentCategory.slug}/${subCategory.slug}`)
        } else {
            router.push(`/category/${subCategory.slug}`)
        }
        onClose()
    }

    if (!isVisible) return null

    // Ekranda gösterilecek mevcut liste (Ana kategoriler veya alt kategoriler)
    const displayCategories = selectedParentCategory ? subCategories : mainCategories

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            {/* Asimetrik Dropdown Panel */}
            <div className={`absolute left-0 w-full top-[96px] bg-slate-900/90 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-b border-slate-700/50 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top z-[90] ${isAnimating ? 'max-h-[calc(100vh-96px)] scale-y-100 opacity-100 blur-none' : 'max-h-0 scale-y-95 opacity-0 blur-[2px] pointer-events-none'}`}>
                <div className="flex h-[600px] max-w-[1400px] mx-auto">

                    {/* SOL TARAF: 3D Vitrin (%40 Genişlik) */}
                    <div className="w-[42%] relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-r from-transparent to-slate-800/20 border-r border-slate-700/50 overflow-hidden shrink-0">
                        {/* Deep Glow Background */}
                        <div
                            className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{
                                background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)"
                            }}
                            aria-hidden="true"
                        />

                        {hoveredCategory ? (
                            <>
                                {/* Üst: Badge + Başlık */}
                                <div className="relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <span className="inline-block mb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400 font-mono border border-sky-400/20 bg-sky-400/10 rounded-sm px-2.5 py-1">
                                        ÖNE ÇIKAN TEKNOLOJİ
                                    </span>
                                    <h3 className="text-3xl font-extrabold leading-none tracking-tight text-white mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                                        {getCategoryDisplayName(hoveredCategory)}
                                    </h3>
                                    <p className="text-[13px] leading-relaxed text-slate-400 max-w-[280px]">
                                        {hoveredCategory.description || 'Yüksek performanslı, akıllı endüstriyel çözüm. Optimum verimlilik ve güvenilirlik için tasarlandı.'}
                                    </p>
                                </div>

                                {/* Orta: 3D Görsel Alanı */}
                                <div className="relative z-10 flex-1 flex justify-center items-center min-h-[250px] -mt-8">
                                    {/* Zemin yansıması */}
                                    <div
                                        className="absolute bottom-10 inset-x-8 h-12 rounded-full blur-2xl opacity-50"
                                        style={{ background: "rgba(56, 189, 248, 0.2)" }}
                                        aria-hidden="true"
                                    />
                                    <div className="w-full h-full absolute inset-0 pointer-events-none">
                                        <Canvas key={hoveredCategory.id} camera={{ position: [0, 0, 2.2], fov: 40 }} style={{ background: 'transparent' }} className="animate-in fade-in zoom-in-95 duration-700">
                                            <Suspense fallback={null}>
                                                <Environment preset="city" />
                                                <ambientLight intensity={0.5} />
                                                <directionalLight position={[10, 10, 5]} intensity={1} />
                                                <Category3DIcon categorySlug={hoveredCategory.slug} scale={1.2} />
                                                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
                                            </Suspense>
                                        </Canvas>
                                    </div>
                                </div>

                                {/* Alt: Stat'lar */}
                                <div className="relative z-10 flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[40px]">
                                    {(hoveredCategory?.metadata as any)?.metric1?.value && (
                                        <div>
                                            <p className="text-2xl font-bold tabular-nums leading-none text-white">{(hoveredCategory?.metadata as any)?.metric1?.value}</p>
                                            <p className="mt-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">{(hoveredCategory?.metadata as any)?.metric1?.label}</p>
                                        </div>
                                    )}
                                    {(hoveredCategory?.metadata as any)?.metric2?.value && (
                                        <div>
                                            <p className="text-2xl font-bold tabular-nums leading-none text-white">{(hoveredCategory?.metadata as any)?.metric2?.value}</p>
                                            <p className="mt-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">{(hoveredCategory?.metadata as any)?.metric2?.label}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* SAĞ TARAF: Navigasyon ve CTA'lar (%60 Genişlik) */}
                    <div className="w-full lg:w-[58%] flex flex-col h-full bg-slate-900/30 backdrop-blur-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                {selectedParentCategory ? (
                                    <button onClick={() => setSelectedParentCategory(null)} className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors group">
                                        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                                            <ArrowLeft className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold tracking-wide uppercase">Geri Dön</span>
                                    </button>
                                ) : (
                                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                                        <Grid3X3 className="w-5 h-5 text-sky-400" />
                                        Ürün Kategorileri
                                    </h2>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayCategories.map((cat) => {
                                    const isSelected = selectedParentCategory !== null; // Eğer alt kategorideysek
                                    const subCount = !isSelected ? getSubCategoryCount(cat.id) : 0;

                                    return (
                                        <Link
                                            key={cat.id}
                                            href={isSelected ? `/category/${selectedParentCategory.slug}/${cat.slug}` : `/category/${cat.slug}`}
                                            onMouseEnter={() => !isSelected && setHoveredCategory(cat)}
                                            onClick={(e) => { e.preventDefault(); if (isSelected) { handleSubCategoryClick(cat); } else { handleCategoryClick(cat); } }}
                                            className="group/item relative flex items-center justify-between px-5 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer overflow-hidden
                                                       before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-[3px] before:rounded-r-full before:bg-sky-400 before:transition-all before:duration-300 hover:before:h-2/3"
                                        >
                                            <div>
                                                <div className="text-base font-bold text-slate-200 group-hover/item:text-white transition-colors flex items-center gap-3">
                                                    {getCategoryDisplayName(cat)}
                                                </div>
                                                {!isSelected && subCount > 0 && (
                                                    <div className="text-[11px] font-medium tracking-wide uppercase text-slate-500 mt-1.5">{subCount} Endüstriyel Seri</div>
                                                )}
                                                {isSelected && (
                                                    <div className="text-[12px] text-slate-500 mt-1.5 line-clamp-1">{cat.description || 'Detayları inceleyin.'}</div>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-slate-700/50 bg-slate-800/50 flex items-center justify-center group-hover/item:bg-sky-500 group-hover/item:border-sky-400 group-hover/item:text-white text-slate-500 transition-all duration-300 shadow-sm opacity-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0">
                                                <ChevronRight size={16} />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* B2B CTA Section */}
                            {!selectedParentCategory && (
                                <>
                                    <div className="my-6 h-px bg-gradient-to-r from-slate-700/50 via-slate-700/10 to-transparent" aria-hidden="true" />
                                    <div className="flex items-center flex-wrap gap-4 pt-2">
                                        {/* Ghost CTA: Teknik Dokümanlar */}
                                        <Link href="/teknik-dokumantasyon" onClick={onClose} className="group/cta flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-slate-400 border border-slate-700/50 hover:border-sky-500/50 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 bg-slate-800/20">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                            <span>Teknik Dokümanlar</span>
                                        </Link>

                                        {/* Ghost CTA: Katalog */}
                                        <Link href="/katalog" onClick={onClose} className="group/cta flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-slate-400 border border-slate-700/50 hover:border-sky-500/50 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 bg-slate-800/20">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                            <span>Kataloğu İncele</span>
                                        </Link>

                                        <span className="flex-1" />

                                        {/* Primary CTA: Proje Çözümü */}
                                        <Link href="/proje-talep" onClick={onClose} className="group/primary relative flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-[13px] font-bold tracking-wide bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors duration-200 focus-visible:outline-none shadow-[0_0_20px_-4px_rgba(56,189,248,0.5)] hover:shadow-[0_0_28px_-2px_rgba(56,189,248,0.7)]">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            Proje Çözümü Talep Et
                                            <ChevronRight size={16} className="transition-transform duration-200 group-hover/primary:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay

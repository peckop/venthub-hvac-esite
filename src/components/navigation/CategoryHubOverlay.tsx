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
            <div className={`absolute left-0 w-full top-[104px] bg-slate-900/90 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-b border-slate-700/50 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top z-[90] ${isAnimating ? 'max-h-[calc(100vh-104px)] scale-y-100 opacity-100 blur-none' : 'max-h-0 scale-y-95 opacity-0 blur-[2px] pointer-events-none'}`}>
                <div className="flex h-[600px] max-w-[1400px] mx-auto">

                    {/* SOL TARAF: 3D Vitrin (%40 Genişlik) */}
                    <div className="w-[40%] relative hidden lg:block bg-gradient-to-r from-transparent to-slate-800/30 border-r border-slate-700/50">
                        {hoveredCategory ? (
                            <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
                                <div className="w-full h-full max-h-[350px] relative pointer-events-none">
                                    {/* Yumuşak geçiş için key kullanıyoruz, böylece react-three-fiber baştan render olur */}
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
                                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{getCategoryDisplayName(hoveredCategory)}</h3>
                                    <p className="text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                        {hoveredCategory.description || 'Premium endüstriyel çözüm.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* SAĞ TARAF: Navigasyon ve CTA'lar (%60 Genişlik) */}
                    <div className="w-full lg:w-[60%] flex flex-col h-full">
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
                                        <div
                                            key={cat.id}
                                            onMouseEnter={() => !isSelected && setHoveredCategory(cat)}
                                            onClick={() => isSelected ? handleSubCategoryClick(cat) : handleCategoryClick(cat)}
                                            className="group relative flex items-center justify-between p-5 rounded-2xl bg-transparent hover:bg-slate-800/60 border border-transparent hover:border-slate-700/80 transition-all duration-300 cursor-pointer"
                                        >
                                            <div>
                                                <div className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                                                    {getCategoryDisplayName(cat)}
                                                </div>
                                                {!isSelected && subCount > 0 && (
                                                    <div className="text-sm text-slate-500 mt-1">{subCount} Alt Seri</div>
                                                )}
                                                {isSelected && (
                                                    <div className="text-sm text-slate-500 mt-1 line-clamp-1">{cat.description || 'İncele'}</div>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white text-slate-500 transition-all shadow-sm">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* B2B CTA Section (Sadece Ana Menüdeyken gösterilir) */}
                            {!selectedParentCategory && (
                                <div className="mt-12 pt-8 border-t border-slate-700/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Link href="/proje-talep" onClick={onClose} className="group flex items-center gap-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all duration-300">
                                            <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm">Proje Çözümü Talep Et</div>
                                                <div className="text-slate-400 text-xs mt-0.5">Mühendis ekibimizle görüşün</div>
                                            </div>
                                        </Link>
                                        <Link href="/teknik-dokumantasyon" onClick={onClose} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-sky-500/30 transition-all duration-300">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 group-hover:text-sky-400 transition-colors">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                            </div>
                                            <div>
                                                <div className="text-slate-200 font-bold text-sm group-hover:text-white transition-colors">Teknik Dokümantasyon</div>
                                                <div className="text-slate-400 text-xs mt-0.5">Şartname, BIM/Revit dosyaları</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay

'use client'
import { Routes } from '../../utils/routes'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { X, Grid3X3, ArrowLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Category3DIcon from '../products/Category3DIcon'
import type { CategoryMetadata } from '../../types/db-rows'
import { useCategories } from '../../contexts/CategoryContext'
import { DomainCategory } from '../../lib/type-converters'
import { useCategoryViewModel } from '../../hooks/useCategoryViewModel'

interface CategoryHubOverlayProps {
    isOpen: boolean
    onClose: () => void
}

const CategoryHubOverlay: React.FC<CategoryHubOverlayProps> = ({
    isOpen,
    onClose
}) => {
    const router = useRouter()
    const { categories, categoryTree: mainCategories } = useCategories()
    const { wrapCategory } = useCategoryViewModel()
    
    const [isAnimating, setIsAnimating] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [hoveredCategory, setHoveredCategory] = useState<DomainCategory | null>(null)
    const [selectedParentCategory, setSelectedParentCategory] = useState<DomainCategory | null>(null)

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

    const handleCategoryClick = (category: DomainCategory) => {
        const subCount = categories.filter(c => c.parent_id === category.id).length
        if (subCount > 0) {
            setSelectedParentCategory(category)
            setHoveredCategory(category)
        } else {
            router.push(Routes.category(category.slug))
            onClose()
        }
    }

    const handleSubCategoryClick = (subCategory: DomainCategory) => {
        if (selectedParentCategory) {
            router.push(Routes.category(selectedParentCategory.slug, subCategory.slug))
        } else {
            router.push(Routes.category(subCategory.slug))
        }
        onClose()
    }

    if (!isVisible) return null

    const displayCategories = selectedParentCategory 
        ? categories.filter(cat => cat.parent_id === selectedParentCategory.id) 
        : mainCategories

    const hoveredVm = wrapCategory(hoveredCategory)

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
                onClick={onClose} 
                onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
                role="presentation"
            />

            <div className={`absolute left-0 w-full top-[96px] bg-slate-900/90 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-b border-slate-700/50 overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top z-[90] ${isAnimating ? 'max-h-[calc(100vh-96px)] scale-y-100 opacity-100 blur-none' : 'max-h-0 scale-y-95 opacity-0 blur-[2px] pointer-events-none'}`}>
                <div className="flex h-[600px] max-w-[1400px] mx-auto">

                    <div className="w-[42%] relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-r from-transparent to-slate-800/20 border-r border-slate-700/50 overflow-hidden shrink-0">
                        <div
                            className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{
                                background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)"
                            }}
                            aria-hidden="true"
                        />

                        {hoveredCategory ? (
                            <>
                                <div className="relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <span className="inline-block mb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400 font-mono border border-sky-400/20 bg-sky-400/10 rounded-sm px-2.5 py-1">
                                        ÖNE ÇIKAN TEKNOLOJİ
                                    </span>
                                    <h3 className="text-3xl font-extrabold leading-none tracking-tight text-white mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
                                        {hoveredVm?.displayName}
                                    </h3>
                                    <p className="text-[13px] leading-relaxed text-slate-400 max-w-[280px]">
                                        {hoveredVm?.description || 'Yüksek performanslı, akıllı endüstriyel çözüm.'}
                                    </p>
                                </div>

                                <div className="relative z-10 flex-1 flex justify-center items-center min-h-[250px] -mt-8">
                                    <div
                                        className="absolute bottom-10 inset-x-8 h-12 rounded-full blur-2xl opacity-50"
                                        style={{ background: "rgba(56, 189, 248, 0.2)" }}
                                        aria-hidden="true"
                                    />
                                    <div className="w-full h-full absolute inset-0 pointer-events-none">
                                        <Canvas 
                                            camera={{ position: [0, 0, 2.2], fov: 40 }} 
                                            style={{ background: 'transparent' }} 
                                            gl={{ antialias: false, alpha: true }}
                                            dpr={[1, 1.5]}
                                            className="animate-in fade-in zoom-in-95 duration-700"
                                        >
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

                                <div className="relative z-10 flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[40px]">
                                    {(() => {
                                        const metadata = hoveredCategory?.metadata as CategoryMetadata | null;
                                        const metric1 = metadata?.metric1 as { value?: string | number, label?: string } | null;
                                        if (!metric1) return null;
                                        return (
                                            <div>
                                                <p className="text-2xl font-bold tabular-nums leading-none text-white">{String(metric1.value || '')}</p>
                                                <p className="mt-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">{String(metric1.label || '')}</p>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[58%] flex flex-col h-full bg-slate-900/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                {selectedParentCategory ? (
                                    <button type="button" onClick={() => setSelectedParentCategory(null)} className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors group">
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
                            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displayCategories.map((cat) => {
                                    const vm = wrapCategory(cat)
                                    const isSelected = selectedParentCategory !== null;
                                    const subCount = !isSelected ? getSubCategoryCount(cat.id) : 0;

                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onMouseEnter={() => !isSelected && setHoveredCategory(cat)}
                                            onClick={() => { if (isSelected) { handleSubCategoryClick(cat); } else { handleCategoryClick(cat); } }}
                                            className="group/item relative flex items-center justify-between px-5 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors duration-200 overflow-hidden w-full text-left
                                                       before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-[3px] before:rounded-r-full before:bg-sky-400 before:transition-all before:duration-300 hover:before:h-2/3"
                                        >
                                            <div>
                                                <div className="text-base font-bold text-slate-200 group-hover/item:text-white transition-colors flex items-center gap-3">
                                                    {vm?.displayName}
                                                </div>
                                                {!isSelected && subCount > 0 && (
                                                    <div className="text-[11px] font-medium tracking-wide uppercase text-slate-500 mt-1.5">{subCount} Alt Kategori</div>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-slate-700/50 bg-slate-800/50 flex items-center justify-center group-hover/item:bg-sky-500 group-hover/item:border-sky-400 group-hover/item:text-white text-slate-500 transition-all duration-300 opacity-0 -translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0">
                                                <ChevronRight size={16} />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryHubOverlay

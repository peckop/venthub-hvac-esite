import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
const Category3DIcon = dynamic(() => import('../products/Category3DIcon'), { ssr: false, loading: () => null })
import type { Category } from '../../lib/supabase'

import { getCategoryDisplayName } from '../../utils/categoryHelpers'

interface CategoryCard3DProps {
    category: Category
    subCategoryCount: number
    onClick?: () => void
}

/**
 * 3D animasyonlu kategori kartı.
 * Category Hub grid'inde kullanılır.
 */
const CategoryCard3D: React.FC<CategoryCard3DProps> = ({
    category,
    subCategoryCount,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`${getCategoryDisplayName(category)} kategorisine git`}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="group relative cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
        >
            {/* Background Layer - Absolute */}
            <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl group-hover:shadow-hvac-3d-glow group-hover:border-sky-500/50 group-hover:bg-slate-800/60 transition-shadow duration-500 ease-hvac-ease -z-10 pointer-events-none" />

            {/* 3D Canvas Area - Extended height and negative margin for Pop-out effect */}
            <div className="h-56 relative -mt-12 z-10 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 2.2], fov: 45 }}
                    style={{ background: 'transparent' }}
                    gl={{ antialias: false, powerPreference: "high-performance" }}
                    dpr={1}
                >
                    {/* Lighting Setup for Menu Tiles */}
                    <Environment preset="city" />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#b0e0e6" />

                    <Suspense fallback={null}>
                        <Category3DIcon 
                            categorySlug={category.slug} 
                            modelType={category.metadata?.model_type}
                            scale={0.9} 
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Text Content */}
            <div className="px-4 pb-4 relative z-20">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-sky-400 transition-colors">
                    {getCategoryDisplayName(category)}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">
                        {subCategoryCount} seri
                    </span>
                    <ChevronRight
                        className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-transform"
                    />
                </div>
            </div>
        </div>
    )
}

export default CategoryCard3D

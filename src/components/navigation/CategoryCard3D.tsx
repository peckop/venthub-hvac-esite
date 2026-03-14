import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { ChevronRight } from 'lucide-react'
import Category3DIcon from '../products/Category3DIcon'
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
            className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20"
        >
            {/* Background Layer - Absolute */}
            <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl group-hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.25)] group-hover:border-sky-500/50 group-hover:bg-slate-800/60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -z-10 pointer-events-none" />

            {/* 3D Canvas Area - Extended height and negative margin for Pop-out effect */}
            <div className="h-56 relative -mt-12 z-10 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 2.2], fov: 45 }}
                    style={{ background: 'transparent' }}
                >
                    {/* Lighting Setup for Menu Tiles */}
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#b0e0e6" />

                    <Suspense fallback={null}>
                        <Category3DIcon categorySlug={category.slug} scale={0.9} />
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            enableRotate={false}
                            autoRotate
                            autoRotateSpeed={2}
                        />
                        <Environment preset="city" />
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
                        className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                </div>
            </div>
        </div>
    )
}

export default CategoryCard3D




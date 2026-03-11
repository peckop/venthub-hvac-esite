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
            className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
        >
            {/* Background Layer - Absolute */}
            <div className="absolute inset-0 bg-slate-50 group-hover:bg-white rounded-2xl border border-slate-200/60 group-hover:border-secondary-blue/30 transition-colors -z-10 pointer-events-none" />

            {/* 3D Canvas Area - Extended height and negative margin for Pop-out effect */}
            <div className="h-56 relative -mt-12 z-10 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 2.2], fov: 45 }}
                    style={{ background: 'transparent' }}
                >
                    {/* Lighting Setup for Menu Tiles */}
                    <ambientLight intensity={1.2} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />

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
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-secondary-blue transition-colors">
                    {getCategoryDisplayName(category)}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        {subCategoryCount} seri
                    </span>
                    <ChevronRight
                        className="w-5 h-5 text-slate-400 group-hover:text-secondary-blue group-hover:translate-x-1 transition-all"
                    />
                </div>
            </div>
        </div>
    )
}

export default CategoryCard3D




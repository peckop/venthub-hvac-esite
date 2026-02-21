import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { ChevronRight } from 'lucide-react'
import Category3DIcon from '../products/Category3DIcon'
import type { Category } from '../../lib/supabase'

import { getCategoryDisplayName } from '../../utils/categoryHelpers'

// ... existing imports ...

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
            className="group relative bg-gradient-to-br from-primary-navy to-secondary-blue rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
        >
            {/* 3D Canvas Area */}
            <div className="h-40 relative">
                <Canvas
                    camera={{ position: [0, 0, 2.2], fov: 45 }}
                    style={{ background: 'transparent' }}
                >
                    {/* Lighting Setup for Menu Tiles */}
                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
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

                {/* Gradient overlay for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-navy/90 to-transparent pointer-events-none" />
            </div>

            {/* Text Content */}
            <div className="px-4 pb-4 -mt-4 relative z-10">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-secondary-blue transition-colors">
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

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-colors pointer-events-none" />
        </div>
    )
}

export default CategoryCard3D




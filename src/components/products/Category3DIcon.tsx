'use client';

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { ChevronLeft, ChevronRight,MousePointerClick } from 'lucide-react'
import React, { useRef } from 'react'
import type { Group } from 'three'

import { useI18n } from '../../i18n/I18nProvider'
import { ProductModelRenderer } from './3d/ProductModelRenderer'

interface Category3DIconProps {
    categorySlug: string
    hovered?: boolean
    isFrontCard?: boolean
    shouldShowTapHint?: boolean
    shouldShowDragHint?: boolean
    hintStage?: 'idle' | 'tap' | 'drag' | 'scroll' | 'down' | 'finished'
    DetailedModel?: React.ComponentType | null
    scale?: number
    modelType?: string
    offsetContext?: string
}

/**
 * @component Category3DIcon
 * @description Kategori bazlı 3D modelleri (ProductModelRenderer üzerinden) orbital sistem içinde sergiler.
 */
const Category3DIcon: React.FC<Category3DIconProps> = ({
    categorySlug,
    hovered,
    isFrontCard,
    shouldShowTapHint,
    shouldShowDragHint,
    hintStage,
    DetailedModel,
    scale = 1,
    modelType,
    offsetContext
}) => {
    const { t } = useI18n()
    const meshRef = useRef<Group>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
            if (hovered) {
                meshRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.2
            }
        }
    })

    const showTapHint = shouldShowTapHint && hintStage === 'tap'

    return (
        <group ref={meshRef} name={`icon-container-${offsetContext || 'default'}`}>
                        
            <group scale={[scale, scale, scale]}>
                {DetailedModel ? <DetailedModel /> : (
                    <ProductModelRenderer
                        slug={categorySlug}
                        modelType={modelType}
                        scale={1}
                    />
                )}
            </group>

            {/* UI Hints */}
            {isFrontCard && showTapHint && (
                <Html position={[0, 0, 1]} center>
                    <div className="animate-bounce bg-white/90 p-2 rounded-full shadow-lg border border-primary-navy/20">
                        <MousePointerClick className="text-primary-navy" size={24} />
                    </div>
                </Html>
            )}

            {isFrontCard && shouldShowDragHint && hintStage === 'drag' && (
                <Html position={[0, 1.5, 0]} center>
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                        <ChevronLeft className="text-cyan-400 animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest">{t('products.category3DIcon.dragHint')}</span>
                        <ChevronRight className="text-cyan-400 animate-pulse" />
                    </div>
                </Html>
            )}


        </group>
    )
}

export default Category3DIcon

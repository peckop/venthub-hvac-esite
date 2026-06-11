'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'

import Category3DIcon from '../products/Category3DIcon'

interface MegaMenu3DBackgroundProps {
    categorySlug: string
}

/**
 * MegaMenu Dropdown için 3D arka plan bileşeni.
 * Üst kısımda büyük 3D model, alt kısımda gradyan ile yazı okunabilirliği sağlanır.
 */
const MegaMenu3DBackground: React.FC<MegaMenu3DBackgroundProps> = ({ categorySlug }) => {
    return (
        <>
            {/* 3D Canvas - üst 3/4 alan */}
            <div className="absolute top-0 left-0 right-0 h-3/4 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0.1, 2.2], fov: 40 }}
                    style={{ background: 'transparent' }}
                    frameloop="demand"
                    dpr={[1, 1]}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <Category3DIcon categorySlug={categorySlug} scale={0.9} />
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            enableRotate={false}
                            autoRotate
                            autoRotateSpeed={1.5}
                        />
                    </Suspense>
                </Canvas>
            </div>
            {/* Gradient overlay - ferah beyaz geçiş */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent pointer-events-none" />
        </>
    )
}

export default MegaMenu3DBackground

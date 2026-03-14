'use client'

'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
            {/* 3D Canvas - üst 2/3 alan */}
            <div className="absolute top-0 left-0 right-0 h-3/4 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0.2, 2], fov: 45 }}
                    style={{ background: 'transparent' }}
                >
                    <Suspense fallback={null}>
                        <Category3DIcon categorySlug={categorySlug} scale={1.1} />
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
            {/* Gradient overlay - yazıların okunabilirliği için */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-navy via-primary-navy/80 to-transparent pointer-events-none" />
        </>
    )
}

export default MegaMenu3DBackground




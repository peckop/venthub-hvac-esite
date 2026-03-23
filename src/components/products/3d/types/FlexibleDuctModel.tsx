"use client";
import React from 'react'

import { useFanMaterials } from '../materials/useFanMaterials'

export function FlexibleDuctModel() {
    const materials = useFanMaterials()

    return (
        <group scale={[1.2, 1.2, 1.2]} position={[0, 0, 0]}>
            {/* Spiral Yapı için ardışık halkalar */}
            {Array(20).fill(0).map((_, i) => (
                <group key={i} position={[(i - 10) * 0.15, Math.sin(i * 0.3) * 0.2, Math.cos(i * 0.3) * 0.2]} rotation={[0, 0, Math.sin(i * 0.2) * 0.1]}>
                    <mesh material={materials.galvanizedSteel} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
                    </mesh>
                    <mesh material={materials.matteBlack} rotation={[0, 0, Math.PI / 2]} position={[0.075, 0, 0]}>
                        <cylinderGeometry args={[0.48, 0.48, 0.1, 32]} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

"use client";
import React from 'react'

import { useFanMaterials } from '../materials/useFanMaterials'

export function HRVModel() {
    const materials = useFanMaterials()

    return (
        <group scale={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
            {/* Ana Gövde */}
            <mesh name="Body" material={materials.ral7035}>
                <boxGeometry args={[3, 0.6, 2.5]} />
            </mesh>
            {/* Alt Kapak */}
            <mesh name="AccessPanel" material={materials.brushedAluminum} position={[0, -0.31, 0]}>
                <boxGeometry args={[2.8, 0.02, 2.3]} />
            </mesh>
            {/* Yan Bağlantı Kanalları */}
            {[-1.55, 1.55].map((x, i) => (
                <group key={`duct-${i}`} position={[x, 0, 0]}>
                    <mesh material={materials.galvanizedSteel} position={[0, 0, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
                    </mesh>
                    <mesh material={materials.galvanizedSteel} position={[0, 0, -0.8]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
                    </mesh>
                </group>
            ))}
            {/* İç Isı Eşanjörü (Şematik) */}
            <mesh material={materials.industrialSteel} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[1.5, 0.5, 1.5]} />
            </mesh>
            <mesh material={materials.safetyOrange} position={[-0.8, 0, 0.8]}>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
            </mesh>
            <mesh material={materials.ral5010} position={[0.8, 0, -0.8]}>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
            </mesh>
        </group>
    )
}

"use client";
import React from 'react'
import { useFanMaterials } from '../materials/useFanMaterials'

export function AccessoryModel() {
    const materials = useFanMaterials()

    return (
        <group scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
            {/* Menfez Çerçevesi */}
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[2, 2, 0.1]} />
            </mesh>
            {/* Menfez İç Boşluğu */}
            <mesh material={materials.matteBlack} position={[0, 0, -0.01]}>
                <planeGeometry args={[1.8, 1.8]} />
            </mesh>
            {/* Menfez Kanatları */}
            {Array(10).fill(0).map((_, i) => (
                <mesh key={i} material={materials.brushedAluminum} position={[0, 0.7 - i * 0.15, 0.02]} rotation={[0.4, 0, 0]}>
                    <boxGeometry args={[1.8, 0.12, 0.02]} />
                </mesh>
            ))}
            {/* Arka Kanal Vidası/Konektörü */}
            <mesh material={materials.galvanizedSteel} position={[0, 0, -0.3]}>
                <boxGeometry args={[1.5, 1.5, 0.5]} />
            </mesh>
        </group>
    )
}

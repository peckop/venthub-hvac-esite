"use client";
import React, { useMemo } from 'react'

// import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

interface MotorProps {
    scale?: number
    color?: 'galvanized' | 'ral7035' | 'blue'
    showMount?: boolean // Alt montaj ayağı
}

export const Motor: React.FC<MotorProps> = ({ scale = 1, color = 'galvanized', showMount = false }) => {
    const materials = useFanMaterials()

    // Motor rengini seç
    const bodyMaterial = useMemo(() => {
        if (color === 'galvanized') return materials.industrialSteel
        if (color === 'ral7035') return materials.ral7035
        return materials.ral5010 // Blue
    }, [color, materials])

    return (
        <group scale={scale}>
            {/* === ANA GÖVDE (Sadece Silindir) === */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={bodyMaterial}>
                <cylinderGeometry args={[0.35, 0.35, 0.8, 32]} />
            </mesh>

            {/* === ÖN KAPAK & MİL === */}
            <group position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                {/* Ön Kapak */}
                <mesh material={materials.matteBlack}>
                    <cylinderGeometry args={[0.36, 0.36, 0.05, 32]} />
                </mesh>
                {/* Mil */}
                <mesh position={[0, 0.15, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
                </mesh>
            </group>

            {/* === ARKA KAPAK (Fan Izgarası) === */}
            <group position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                {/* Arka fan kapağı daima siyah kalsın */}
                <mesh material={materials.matteBlack}>
                    <cylinderGeometry args={[0.36, 0.36, 0.05, 32]} />
                </mesh>
                {/* Arka Çıkıntı */}
                <mesh position={[0, 0.05, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
                </mesh>
            </group>

            {/* === KLEMENS KUTUSU (Terminal Box) === */}
            <group position={[0, 0.36, 0]}>
                <mesh position={[0, 0.05, 0]} material={materials.matteBlack} castShadow>
                    <boxGeometry args={[0.25, 0.1, 0.25]} />
                </mesh>
                {/* Kablo Rakoru */}
                <mesh position={[0.05, 0.05, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.03, 0.03, 0.06, 8]} />
                </mesh>
            </group>

            {/* === MONTAJ AYAĞI (Opsiyonel) === */}
            {showMount && (
                <mesh position={[0, -0.4, 0]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.6, 0.1, 0.4]} />
                </mesh>
            )}
        </group>
    )
}





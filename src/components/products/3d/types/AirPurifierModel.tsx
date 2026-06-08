"use client";
import React from 'react'

import { useFanMaterials } from '../materials/useFanMaterials'

export function AirPurifierModel() {
    const materials = useFanMaterials()

    return (
        <group scale={[1, 1, 1]}>
            {/* 1. ANA KASA (White/Light Gray Body) */}
            <mesh name="PurifierBody" material={materials.ral7035}>
                <boxGeometry args={[0.5, 1.2, 0.5]} />
            </mesh>

            {/* Yan Kenarlar (Yuvarlatılmış görünüm illüzyonu) */}
            {[-0.25, 0.25].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]} material={materials.brushedAluminum}>
                    <boxGeometry args={[0.02, 1.18, 0.48]} />
                </mesh>
            ))}

            {/* 2. ÖN PANEL - Delikli Izgara (Perforated Sheet) */}
            <group position={[0, -0.1, 0.251]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.42, 0.8, 0.01]} />
                </mesh>
                {/* Delik Dokusu (Basit ızgara temsili) */}
                {Array(10).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, 0.35 - (i * 0.08), 0.005]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.38, 0.01, 0.002]} />
                    </mesh>
                ))}
            </group>

            {/* 3. ÜST KONTROL PANELİ (Display Area) */}
            <group position={[0, 0.601, 0]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.4, 0.02, 0.4]} />
                </mesh>
                {/* Durum Işığı (Halka) */}
                <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color="#3b82f6" />
                </mesh>
            </group>

            {/* 4. ALT TABAN (Base) */}
            <mesh position={[0, -0.58, 0]} material={materials.matteBlack}>
                <boxGeometry args={[0.55, 0.06, 0.55]} />
            </mesh>

            {/* 5. ARKA FİLTRE KAPAĞI */}
            <group position={[0, -0.1, -0.251]}>
                <mesh material={materials.ral7035}>
                    <boxGeometry args={[0.42, 0.8, 0.01]} />
                </mesh>
                {/* Tutamak Girintisi */}
                <mesh position={[0, 0.3, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.1, 0.04, 0.02]} />
                </mesh>
            </group>

        </group>
    )
}





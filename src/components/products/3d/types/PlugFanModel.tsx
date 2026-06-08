"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

export const PlugFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    useFrame(() => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= 0.1
        }
    })

    return (
        <group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>

            {/* 1. EMİŞ HUNİSİ (Inlet Cone) - DÜZ SAC KONİ (Halka değil) */}
            <group position={[0, 0, 0.35]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                    {/* Halka (Torus) yerine Konik Silindir */}
                    <cylinderGeometry args={[0.38, 0.30, 0.15, 32, 1, true]} />
                </mesh>
                {/* Giriş Flanşı (Düz Şerit) */}
                <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.40, 0.40, 0.02, 32]} />
                </mesh>
            </group>

            {/* 2. PLUG FAN PERVANESİ (Backward Curved) */}
            <group ref={fanRef} position={[0, 0, 0]}>
                {/* Arka Disk (Backplate) */}
                <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
                </mesh>
                {/* Ön Halka (Front Shroud) */}
                <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.4, 0.25, 0.05, 32, 1, true]} />
                </mesh>

                {/* Kanatlar (7 Adet - Geriye Eğimli) */}
                {Array(7).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
                        <mesh position={[0.25, 0.05, 0]} rotation={[0, 0.5, 0.2]} material={materials.safetyOrange}>
                            <boxGeometry args={[0.015, 0.3, 0.25]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 3. MOTOR (Arkada - Direkt Akuple) */}
            <group position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
                {/* Motor Gövdesi */}
                <mesh material={materials.ral7035}>
                    <cylinderGeometry args={[0.18, 0.18, 0.35, 32]} />
                </mesh>
                {/* Soğutma Kanatçıkları */}
                {Array(12).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]} position={[0.18, 0, 0]}>
                        <boxGeometry args={[0.04, 0.35, 0.02]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                ))}
                {/* Klemens Kutusu */}
                <mesh position={[0.15, 0.1, 0.15]} material={materials.matteBlack}>
                    <boxGeometry args={[0.1, 0.1, 0.05]} />
                </mesh>
            </group>

            {/* 4. TABAN KAİDESİ (Base Frame) */}
            <group position={[0, -0.45, -0.2]}>
                <mesh material={materials.industrialSteel}>
                    <boxGeometry args={[0.6, 0.05, 0.6]} />
                </mesh>
                {/* Motor Destek Ayağı */}
                <mesh position={[0, 0.2, -0.1]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.2, 0.4, 0.02]} />
                </mesh>
            </group>

        </group>
    )
}





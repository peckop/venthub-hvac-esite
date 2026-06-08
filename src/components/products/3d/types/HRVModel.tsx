"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

/**
 * @component HRVModel
 * @description Hava akışı animasyonlu, fiziksel tabanlı Isı Geri Kazanım Ünitesi (HRV) modeli.
 */
export function HRVModel() {
    const materials = useFanMaterials()
    const freshRef = useRef<THREE.Group>(null)
    const staleRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (freshRef.current) {
            freshRef.current.children.forEach((child: THREE.Object3D) => {
                child.position.x += delta * 0.5
                if (child.position.x > 0.45) child.position.x = -0.45
            })
        }
        if (staleRef.current) {
            staleRef.current.children.forEach((child: THREE.Object3D) => {
                child.position.x -= delta * 0.5
                if (child.position.x < -0.45) child.position.x = 0.45
            })
        }
    })

    return (
        <group scale={[1.2, 1.2, 1.2]}>
            {/* Ana Gövde (Cihaz Kabini) */}
            <mesh material={materials.ral7035}>
                <boxGeometry args={[1.2, 1.3, 0.65]} />
            </mesh>

            {/* Bağlantı Flanşları (Duct Connections) */}
            {[
                [-0.35, 0.7, 0.12], [0.35, 0.7, 0.12],
                [-0.35, 0.7, -0.12], [0.35, 0.7, -0.12]
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
                </mesh>
            ))}

            {/* Kontrol Ünitesi / Filtre Kapak Detayı */}
            <mesh position={[0, 0.1, 0.33]} material={materials.matteBlack}>
                <boxGeometry args={[0.35, 0.18, 0.02]} />
            </mesh>

            {/* Hava Akış Animasyonu (Isı Transferi Simülasyonu) */}
            <group position={[0, 0.75, 0]}>
                {/* Taze Hava (Mavi) */}
                <group ref={freshRef}>
                    {[-0.25, 0, 0.25].map((x, i) => (
                        <mesh key={`fresh-${i}`} position={[x, 0, 0.12]}>
                            <sphereGeometry args={[0.028, 6, 6]} />
                            <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
                        </mesh>
                    ))}
                </group>
                {/* Atık Hava (Kırmızı) */}
                <group ref={staleRef}>
                    {[-0.12, 0.12, 0.38].map((x, i) => (
                        <mesh key={`stale-${i}`} position={[x, 0, -0.12]}>
                            <sphereGeometry args={[0.028, 6, 6]} />
                            <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    )
}

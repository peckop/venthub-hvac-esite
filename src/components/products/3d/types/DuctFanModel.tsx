"use client";
import { useFrame } from '@react-three/fiber'
import React, { useMemo,useRef } from 'react'
import type { Group } from 'three'
import { MeshStandardMaterial } from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'



export function DuctFanModel() {
    const fanRef = useRef<Group>(null)
    const materials = useFanMaterials() // Centralized materials

    // ROUND DUCT FAN (Kanal Tipi) - SCALE FIX

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.y -= delta * 8
        }
    })

    // Localized specialized materials using useMemo for lifecycle safety
    const localBladeColor = useMemo(() => new MeshStandardMaterial({
        color: '#be123c',
        metalness: 0.6,
        roughness: 0.4
    }), [])

    return (
        // SCALE: 0.6 (Diğer fanlarla uyumlu olması için küçültüldü)
        <group scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}> {/* Açılı duruş */}

            {/* 1. ANA GÖVDE */}
            <group>
                <mesh material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.48, 0.48, 0.4, 32]} />
                </mesh>

                <mesh position={[0, 0.35, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.38, 0.48, 0.3, 32]} />
                </mesh>
                <mesh position={[0, -0.35, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.48, 0.38, 0.3, 32]} />
                </mesh>

                <mesh position={[0, 0.55, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.38, 0.38, 0.1, 32]} />
                </mesh>
                <mesh position={[0, -0.55, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.38, 0.38, 0.1, 32]} />
                </mesh>
            </group>

            {/* 2. TAŞIYICI AYAK */}
            <group position={[0.35, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh position={[0.4, 0, 0]} material={materials.galvanizedSteel}>
                    <boxGeometry args={[0.1, 0.8, 0.6]} />
                </mesh>
                {[-0.2, 0.2].map((z, i) => (
                    <mesh key={i} position={[0.2, z, 0]} rotation={[0, 0, 0.5]} material={materials.galvanizedSteel}>
                        <boxGeometry args={[0.4, 0.1, 0.4]} />
                    </mesh>
                ))}
            </group>

            {/* 3. KLEMENS KUTUSU */}
            <group position={[-0.45, 0.1, 0]}>
                <mesh material={materials.galvanizedSteel}>
                    <boxGeometry args={[0.15, 0.25, 0.2]} />
                </mesh>
            </group>

            {/* 4. PERVANE */}
            <group ref={fanRef} position={[0, 0.4, 0]}>
                <mesh material={localBladeColor}>
                    <cylinderGeometry args={[0.12, 0.12, 0.15, 32]} />
                </mesh>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
                    <group key={i} rotation={[0, rot * Math.PI / 180, 0]}>
                        <mesh position={[0.2, 0, 0]} rotation={[0.4, 0, 0]} material={localBladeColor}>
                            <boxGeometry args={[0.35, 0.08, 0.02]} />
                        </mesh>
                    </group>
                ))}
            </group>

        </group>
    )
}

export const RectangularDuctFanModel: React.FC = () => {
    const materials = useFanMaterials()
    return (
        <group>
            <mesh material={materials.galvanizedSteel}>
                <boxGeometry args={[1, 0.6, 0.6]} />
            </mesh>
            {[-0.5, 0.5].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.05, 0.7, 0.7]} />
                </mesh>
            ))}
            <mesh position={[0, 0.35, 0]} material={materials.matteBlack}>
                <boxGeometry args={[0.3, 0.15, 0.2]} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.brushedAluminum}>
                <cylinderGeometry args={[0.25, 0.25, 1.02, 32]} />
            </mesh>
        </group>
    )
}





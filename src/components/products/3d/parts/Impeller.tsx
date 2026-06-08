"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

interface ImpellerProps {
    type: 'axial' | 'radial' | 'backward_curved'
    diameter?: number
    bladeCount?: number
    color?: 'aluminum' | 'plastic' | 'steel'
    spinSpeed?: number // Devir hızı
}

export const Impeller: React.FC<ImpellerProps> = ({
    type,
    diameter = 1,
    bladeCount = 8,
    color = 'aluminum',
    spinSpeed = 5
}) => {
    const groupRef = useRef<THREE.Group>(null)
    const materials = useFanMaterials()

    const material = color === 'plastic' ? materials.matteBlack :
        color === 'steel' ? materials.industrialSteel :
            materials.brushedAluminum

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.z -= delta * spinSpeed
        }
    })

    const radius = diameter / 2

    return (
        <group ref={groupRef}>
            {/* AXIAL TYPE (Standart Fan) */}
            {type === 'axial' && (
                <group>
                    {/* Göbek */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                        <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.1, 16]} />
                    </mesh>
                    <mesh position={[0, 0, 0.05]} material={materials.industrialSteel}>
                        <sphereGeometry args={[radius * 0.12, 16, 16]} />
                    </mesh>

                    {/* Kanatlar */}
                    {Array(bladeCount).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / bladeCount]}>
                            <mesh
                                position={[radius * 0.6, 0, 0]}
                                rotation={[0.4, 0, 0]} // Kanat açısı
                                material={material}
                            >
                                <boxGeometry args={[radius * 0.8, radius * 0.25, 0.02]} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}

            {/* RADIAL TYPE (Sık Kanatlı / Salyangoz Fan) */}
            {type === 'radial' && (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Arka Plaka */}
                    <mesh position={[0, -0.1, 0]} material={materials.galvanizedSteel}>
                        <cylinderGeometry args={[radius, radius, 0.02, 32]} />
                    </mesh>

                    {/* Ön Halka (Giriş) */}
                    <mesh position={[0, 0.1, 0]} material={materials.galvanizedSteel}>
                        <torusGeometry args={[radius * 0.8, radius * 0.2, 2, 32]} />
                        {/* TorusGeometry orientation fix needed manually or use ring + tube. Let's stick to RingGeometry for simplicity */}
                    </mesh>

                    {/* Ön Halka Düzeltme */}
                    <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                        <ringGeometry args={[radius * 0.7, radius, 32]} />
                    </mesh>

                    {/* Kanatçıklar */}
                    {Array(bladeCount * 2).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, (i * Math.PI * 2) / (bladeCount * 2), 0]}>
                            <mesh position={[radius * 0.85, 0, 0]} rotation={[0, -0.4, 0]} material={material}>
                                <boxGeometry args={[0.02, 0.2, radius * 0.25]} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}

            {/* BACKWARD CURVED (Plug Fan Tipi) */}
            {type === 'backward_curved' && (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Arka Plaka */}
                    <mesh position={[0, -0.15, 0]} material={materials.ral5010}>
                        <cylinderGeometry args={[radius, radius, 0.05, 32]} />
                    </mesh>

                    {/* Kavisli Kanatlar (Box approximation) */}
                    {Array(7).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, (i * Math.PI * 2) / 7, 0]}>
                            <mesh position={[radius * 0.6, 0, 0]} rotation={[0, 0.8, -0.2]} material={materials.industrialSteel}>
                                <boxGeometry args={[radius * 0.6, 0.3, 0.05]} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}

        </group>
    )
}





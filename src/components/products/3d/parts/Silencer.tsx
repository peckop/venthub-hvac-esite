"use client";
import React, { useMemo } from 'react'
import { DoubleSide,Path, Shape, ShapeGeometry } from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

interface SilencerProps {
    radius?: number
    length?: number
    position?: [number, number, number]
}

/**
 * SILENCER (SUSTA) - Sound attenuation component
 * Cylindrical casing with internal perforated surface for noise reduction
 */
export const Silencer: React.FC<SilencerProps> = ({
    radius = 0.6,
    length = 0.8,
    position = [0, 0, 0]
}) => {
    const materials = useFanMaterials()

    // Perforated inner surface geometry - holes pattern
    const _perforationGeometry = useMemo(() => {
        const shape = new Shape()
        // Create a ring with holes using shape
        const holeRadius = radius * 0.85
        const holeCount = 12

        for (let i = 0; i < holeCount; i++) {
            const angle = (i / holeCount) * Math.PI * 2
            const hx = Math.cos(angle) * holeRadius
            const hy = Math.sin(angle) * holeRadius

            const hole = new Path()
            hole.absarc(hx, hy, 0.03, 0, Math.PI * 2, true)
            shape.holes.push(hole)
        }

        return new ShapeGeometry(shape, 8)
    }, [radius])

    return (
        <group position={position}>
            {/* Outer Cylinder Shell */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[radius, radius, length, 64, 1, true]} />
                </mesh>

                {/* End Flanges */}
                <mesh position={[0, length / 2, 0]} material={materials.industrialSteel}>
                    <ringGeometry args={[radius * 0.9, radius, 32]} />
                </mesh>
                <mesh position={[0, -length / 2, 0]} material={materials.industrialSteel}>
                    <ringGeometry args={[radius * 0.9, radius, 32]} />
                </mesh>
            </group>

            {/* Inner Perforated Liner (Sound absorbing surface) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={materials.matteBlack}>
                    <cylinderGeometry args={[radius * 0.85, radius * 0.85, length * 0.95, 48, 4, true]} />
                </mesh>

                {/* Perforation rings (acoustic open area) */}
                {Array(6).fill(0).map((_, i) => {
                    const zPos = -length / 2 + (i + 1) * (length / 7)
                    return (
                        <mesh key={i} position={[0, zPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[radius * 0.7, radius * 0.9, 32]} />
                            {/* Custom material for perforated look */}
                            <meshStandardMaterial
                                color="#1a1a1a"
                                metalness={0.3}
                                roughness={0.8}
                                side={DoubleSide}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                    )
                })}
            </group>

            {/* Structural Reinforcement Rings */}
            {[-0.3, 0, 0.3].map((z, i) => (
                <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <torusGeometry args={[radius * 1.02, 0.015, 8, 32]} />
                </mesh>
            ))}

            {/* Mounting Brackets */}
            {[0, 120, 240].map((angle, i) => (
                <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]} position={[0, 0, 0]}>
                    <mesh position={[radius + 0.04, 0, 0]} material={materials.galvanizedSteel}>
                        <boxGeometry args={[0.06, 0.08, 0.12]} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
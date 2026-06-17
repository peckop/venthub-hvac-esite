"use client";
import React, { useEffect,useMemo } from 'react'
import { BoxGeometry,CylinderGeometry, RingGeometry, TorusGeometry } from 'three'

import { useResolveMaterials } from '../core'

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
    const materials = useResolveMaterials()

    // Memoized geometries to prevent recreation on every render
    const geometries = useMemo(() => {
        const outerCasingGeo = new CylinderGeometry(radius, radius, length, 64, 1, true)
        const flangeGeo = new RingGeometry(radius * 0.9, radius, 32)
        const innerLinerGeo = new CylinderGeometry(radius * 0.85, radius * 0.85, length * 0.95, 48, 4, true)
        const perforationRingGeo = new RingGeometry(radius * 0.7, radius * 0.9, 32)
        const reinforcementRingGeo = new TorusGeometry(radius * 1.02, 0.015, 8, 32)
        const bracketGeo = new BoxGeometry(0.06, 0.08, 0.12)

        return {
            outerCasingGeo,
            flangeGeo,
            innerLinerGeo,
            perforationRingGeo,
            reinforcementRingGeo,
            bracketGeo
        }
    }, [radius, length])

    // Dispose of memoized geometries to prevent VRAM memory leaks when dependencies change or component unmounts
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach(geo => geo.dispose())
        }
    }, [geometries])

    return (
        <group position={position}>
            {/* Outer Cylinder Shell */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh geometry={geometries.outerCasingGeo} material={materials.galvanizedSteel} />

                {/* End Flanges */}
                <mesh position={[0, length / 2, 0]} geometry={geometries.flangeGeo} material={materials.industrialSteel} />
                <mesh position={[0, -length / 2, 0]} geometry={geometries.flangeGeo} material={materials.industrialSteel} />
            </group>

            {/* Inner Perforated Liner (Sound absorbing surface) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh geometry={geometries.innerLinerGeo} material={materials.matteBlack} />

                {/* Perforation rings (acoustic open area) */}
                {Array(6).fill(0).map((_, i) => {
                    const zPos = -length / 2 + (i + 1) * (length / 7)
                    return (
                        <mesh
                            key={i}
                            position={[0, zPos, 0]}
                            rotation={[Math.PI / 2, 0, 0]}
                            geometry={geometries.perforationRingGeo}
                            material={materials.matteBlack}
                        />
                    )
                })}
            </group>

            {/* Structural Reinforcement Rings */}
            {[-0.3, 0, 0.3].map((z, i) => (
                <mesh
                    key={i}
                    position={[0, 0, z]}
                    rotation={[Math.PI / 2, 0, 0]}
                    geometry={geometries.reinforcementRingGeo}
                    material={materials.industrialSteel}
                />
            ))}

            {/* Mounting Brackets */}
            {[0, 120, 240].map((angle, i) => (
                <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]} position={[0, 0, 0]}>
                    <mesh
                        position={[radius + 0.04, 0, 0]}
                        geometry={geometries.bracketGeo}
                        material={materials.galvanizedSteel}
                    />
                </group>
            ))}
        </group>
    )
}

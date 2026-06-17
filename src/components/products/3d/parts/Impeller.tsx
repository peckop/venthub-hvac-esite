"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect,useMemo, useRef } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'

import { useResolveMaterials } from '../core'

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
    const groupRef = useRef<Group>(null)
    const materials = useResolveMaterials()

    const material = color === 'plastic' ? materials.matteBlack :
        color === 'steel' ? materials.industrialSteel :
            materials.brushedAluminum

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.z -= delta * spinSpeed
        }
    })

    const radius = diameter / 2

    // Memoize geometries to avoid recreating them on every render
    const geometries = useMemo(() => {
        const geoms: Record<string, THREE.BufferGeometry> = {}

        if (type === 'axial') {
            geoms.axialHubCylinder = new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, 0.1, 16)
            geoms.axialHubSphere = new THREE.SphereGeometry(radius * 0.12, 16, 16)
            geoms.axialBladeBox = new THREE.BoxGeometry(radius * 0.8, radius * 0.25, 0.02)
        } else if (type === 'radial') {
            geoms.radialBackplate = new THREE.CylinderGeometry(radius, radius, 0.02, 32)
            geoms.radialFrontTorus = new THREE.TorusGeometry(radius * 0.8, radius * 0.2, 2, 32)
            geoms.radialFrontRing = new THREE.RingGeometry(radius * 0.7, radius, 32)
            geoms.radialBladeBox = new THREE.BoxGeometry(0.02, 0.2, radius * 0.25)
        } else if (type === 'backward_curved') {
            geoms.backwardBackplate = new THREE.CylinderGeometry(radius, radius, 0.05, 32)
            geoms.backwardBladeBox = new THREE.BoxGeometry(radius * 0.6, 0.3, 0.05)
        }

        return geoms
    }, [type, radius])

    // Dispose of all memoized geometries on unmount or dependency change to clear VRAM
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach((geom) => {
                geom.dispose()
            })
        }
    }, [geometries])

    return (
        <group ref={groupRef}>
            {/* AXIAL TYPE (Standart Fan) */}
            {type === 'axial' && (
                <group>
                    {/* Göbek */}
                    <mesh 
                        rotation={[Math.PI / 2, 0, 0]} 
                        material={materials.industrialSteel}
                        geometry={geometries.axialHubCylinder}
                    />
                    <mesh 
                        position={[0, 0, 0.05]} 
                        material={materials.industrialSteel}
                        geometry={geometries.axialHubSphere}
                    />

                    {/* Kanatlar */}
                    {Array(bladeCount).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / bladeCount]}>
                            <mesh
                                position={[radius * 0.6, 0, 0]}
                                rotation={[0.4, 0, 0]} // Kanat açısı
                                material={material}
                                geometry={geometries.axialBladeBox}
                            />
                        </group>
                    ))}
                </group>
            )}

            {/* RADIAL TYPE (Sık Kanatlı / Salyangoz Fan) */}
            {type === 'radial' && (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Arka Plaka */}
                    <mesh 
                        position={[0, -0.1, 0]} 
                        material={materials.galvanizedSteel}
                        geometry={geometries.radialBackplate}
                    />

                    {/* Ön Halka (Giriş) */}
                    <mesh 
                        position={[0, 0.1, 0]} 
                        material={materials.galvanizedSteel}
                        geometry={geometries.radialFrontTorus}
                    />

                    {/* Ön Halka Düzeltme */}
                    <mesh 
                        position={[0, 0.1, 0]} 
                        rotation={[Math.PI / 2, 0, 0]} 
                        material={materials.galvanizedSteel}
                        geometry={geometries.radialFrontRing}
                    />

                    {/* Kanatçıklar */}
                    {Array(bladeCount * 2).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, (i * Math.PI * 2) / (bladeCount * 2), 0]}>
                            <mesh 
                                position={[radius * 0.85, 0, 0]} 
                                rotation={[0, -0.4, 0]} 
                                material={material}
                                geometry={geometries.radialBladeBox}
                            />
                        </group>
                    ))}
                </group>
            )}

            {/* BACKWARD CURVED (Plug Fan Tipi) */}
            {type === 'backward_curved' && (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Arka Plaka */}
                    <mesh 
                        position={[0, -0.15, 0]} 
                        material={materials.ral5010}
                        geometry={geometries.backwardBackplate}
                    />

                    {/* Kavisli Kanatlar (Box approximation) */}
                    {Array(7).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, (i * Math.PI * 2) / 7, 0]}>
                            <mesh 
                                position={[radius * 0.6, 0, 0]} 
                                rotation={[0, 0.8, -0.2]} 
                                material={materials.industrialSteel}
                                geometry={geometries.backwardBladeBox}
                            />
                        </group>
                    ))}
                </group>
            )}

        </group>
    )
}





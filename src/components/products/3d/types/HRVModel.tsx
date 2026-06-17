"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group, Object3D } from 'three'
import { BoxGeometry, CylinderGeometry, MeshBasicMaterial, SphereGeometry } from 'three'

import { useResolveMaterials } from '../core'

const FLANGE_POSITIONS: [number, number, number][] = [
    [-0.35, 0.7, 0.12],
    [0.35, 0.7, 0.12],
    [-0.35, 0.7, -0.12],
    [0.35, 0.7, -0.12]
]

const FLANGE_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0]
const FILTER_POSITION: [number, number, number] = [0, 0.1, 0.33]
const FLOW_GROUP_POSITION: [number, number, number] = [0, 0.75, 0]
const ROOT_SCALE: [number, number, number] = [1.2, 1.2, 1.2]

const FRESH_X_POSITIONS = [-0.25, 0, 0.25]
const STALE_X_POSITIONS = [-0.12, 0.12, 0.38]

/**
 * @component HRVModel
 * @description Hava akışı animasyonlu, fiziksel tabanlı Isı Geri Kazanım Ünitesi (HRV) modeli.
 */
export function HRVModel() {
    const materials = useResolveMaterials()
    const freshRef = useRef<Group>(null)
    const staleRef = useRef<Group>(null)

    // Memoize geometries
    const mainBoxGeo = useMemo(() => new BoxGeometry(1.2, 1.3, 0.65), [])
    const flangeCylinderGeo = useMemo(() => new CylinderGeometry(0.09, 0.09, 0.18, 12), [])
    const filterBoxGeo = useMemo(() => new BoxGeometry(0.35, 0.18, 0.02), [])
    const airSphereGeo = useMemo(() => new SphereGeometry(0.028, 6, 6), [])

    // Memoize basic materials for flow simulation
    const freshMaterial = useMemo(() => new MeshBasicMaterial({ color: "#3b82f6", transparent: true, opacity: 0.8 }), [])
    const staleMaterial = useMemo(() => new MeshBasicMaterial({ color: "#ef4444", transparent: true, opacity: 0.8 }), [])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            mainBoxGeo.dispose()
            flangeCylinderGeo.dispose()
            filterBoxGeo.dispose()
            airSphereGeo.dispose()
            freshMaterial.dispose()
            staleMaterial.dispose()
        }
    }, [mainBoxGeo, flangeCylinderGeo, filterBoxGeo, airSphereGeo, freshMaterial, staleMaterial])

    useFrame((_, delta) => {
        if (freshRef.current) {
            freshRef.current.children.forEach((child: Object3D) => {
                child.position.x += delta * 0.5
                if (child.position.x > 0.45) child.position.x = -0.45
            })
        }
        if (staleRef.current) {
            staleRef.current.children.forEach((child: Object3D) => {
                child.position.x -= delta * 0.5
                if (child.position.x < -0.45) child.position.x = 0.45
            })
        }
    })

    return (
        <group scale={ROOT_SCALE}>
            {/* Ana Gövde (Cihaz Kabini) */}
            <mesh geometry={mainBoxGeo} material={materials.ral7035} />

            {/* Bağlantı Flanşları (Duct Connections) */}
            {FLANGE_POSITIONS.map((pos, i) => (
                <mesh
                    key={i}
                    position={pos}
                    rotation={FLANGE_ROTATION}
                    geometry={flangeCylinderGeo}
                    material={materials.matteBlack}
                />
            ))}

            {/* Kontrol Ünitesi / Filtre Kapak Detayı */}
            <mesh
                position={FILTER_POSITION}
                geometry={filterBoxGeo}
                material={materials.matteBlack}
            />

            {/* Hava Akış Animasyonu (Isı Transferi Simülasyonu) */}
            <group position={FLOW_GROUP_POSITION}>
                {/* Taze Hava (Mavi) */}
                <group ref={freshRef}>
                    {FRESH_X_POSITIONS.map((x, i) => (
                        <mesh
                            key={`fresh-${i}`}
                            position={[x, 0, 0.12]}
                            geometry={airSphereGeo}
                            material={freshMaterial}
                        />
                    ))}
                </group>
                {/* Atık Hava (Kırmızı) */}
                <group ref={staleRef}>
                    {STALE_X_POSITIONS.map((x, i) => (
                        <mesh
                            key={`stale-${i}`}
                            position={[x, 0, -0.12]}
                            geometry={airSphereGeo}
                            material={staleMaterial}
                        />
                    ))}
                </group>
            </group>
        </group>
    )
}
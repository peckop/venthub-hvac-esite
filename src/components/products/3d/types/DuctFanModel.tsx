"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from 'three'

import { useResolveMaterials } from '../core'

export function DuctFanModel() {
    const fanRef = useRef<Group>(null)
    const materials = useResolveMaterials() // Centralized materials

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

    // Memoize geometries
    const geometries = useMemo(() => {
        const mainCylinderGeo1 = new CylinderGeometry(0.48, 0.48, 0.4, 32)
        const mainCylinderGeo2 = new CylinderGeometry(0.38, 0.48, 0.3, 32)
        const mainCylinderGeo3 = new CylinderGeometry(0.48, 0.38, 0.3, 32)
        const mainCylinderGeo4 = new CylinderGeometry(0.38, 0.38, 0.1, 32)
        const footBoxGeo1 = new BoxGeometry(0.1, 0.8, 0.6)
        const footBoxGeo2 = new BoxGeometry(0.4, 0.1, 0.4)
        const boxGeo3 = new BoxGeometry(0.15, 0.25, 0.2)
        const impellerHubGeo = new CylinderGeometry(0.12, 0.12, 0.15, 32)
        const bladeGeo = new BoxGeometry(0.35, 0.08, 0.02)

        return {
            mainCylinderGeo1,
            mainCylinderGeo2,
            mainCylinderGeo3,
            mainCylinderGeo4,
            footBoxGeo1,
            footBoxGeo2,
            boxGeo3,
            impellerHubGeo,
            bladeGeo,
        }
    }, [])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach(geo => geo.dispose())
            localBladeColor.dispose()
        }
    }, [geometries, localBladeColor])

    return (
        // SCALE: 0.6 (Diğer fanlarla uyumlu olması için küçültüldü)
        <group scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}> {/* Açılı duruş */}

            {/* 1. ANA GÖVDE */}
            <group>
                <mesh geometry={geometries.mainCylinderGeo1} material={materials.galvanizedSteel} />

                <mesh position={[0, 0.35, 0]} geometry={geometries.mainCylinderGeo2} material={materials.galvanizedSteel} />
                <mesh position={[0, -0.35, 0]} geometry={geometries.mainCylinderGeo3} material={materials.galvanizedSteel} />

                <mesh position={[0, 0.55, 0]} geometry={geometries.mainCylinderGeo4} material={materials.galvanizedSteel} />
                <mesh position={[0, -0.55, 0]} geometry={geometries.mainCylinderGeo4} material={materials.galvanizedSteel} />
            </group>

            {/* 2. TAŞIYICI AYAK */}
            <group position={[0.35, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh position={[0.4, 0, 0]} geometry={geometries.footBoxGeo1} material={materials.galvanizedSteel} />
                {[-0.2, 0.2].map((z, i) => (
                    <mesh key={i} position={[0.2, z, 0]} rotation={[0, 0, 0.5]} geometry={geometries.footBoxGeo2} material={materials.galvanizedSteel} />
                ))}
            </group>

            {/* 3. KLEMENS KUTUSU */}
            <group position={[-0.45, 0.1, 0]}>
                <mesh geometry={geometries.boxGeo3} material={materials.galvanizedSteel} />
            </group>

            {/* 4. PERVANE */}
            <group ref={fanRef} position={[0, 0.4, 0]}>
                <mesh geometry={geometries.impellerHubGeo} material={localBladeColor} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
                    <group key={i} rotation={[0, rot * Math.PI / 180, 0]}>
                        <mesh position={[0.2, 0, 0]} rotation={[0.4, 0, 0]} geometry={geometries.bladeGeo} material={localBladeColor} />
                    </group>
                ))}
            </group>

        </group>
    )
}

export const RectangularDuctFanModel: React.FC = () => {
    const materials = useResolveMaterials()

    // Memoize geometries
    const geometries = useMemo(() => {
        const bodyGeo = new BoxGeometry(1, 0.6, 0.6)
        const flangeGeo = new BoxGeometry(0.05, 0.7, 0.7)
        const topBoxGeo = new BoxGeometry(0.3, 0.15, 0.2)
        const cylinderGeo = new CylinderGeometry(0.25, 0.25, 1.02, 32)
        return {
            bodyGeo,
            flangeGeo,
            topBoxGeo,
            cylinderGeo
        }
    }, [])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach(geo => geo.dispose())
        }
    }, [geometries])

    return (
        <group>
            <mesh geometry={geometries.bodyGeo} material={materials.galvanizedSteel} />
            {[-0.5, 0.5].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]} geometry={geometries.flangeGeo} material={materials.industrialSteel} />
            ))}
            <mesh position={[0, 0.35, 0]} geometry={geometries.topBoxGeo} material={materials.matteBlack} />
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={geometries.cylinderGeo} material={materials.brushedAluminum} />
        </group>
    )
}
"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect,useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry,PlaneGeometry } from 'three'

import { useResolveMaterials } from '../core'

export function DehumidifierModel() {
    const fanWheelRef = useRef<Group>(null)
    const materials = useResolveMaterials()

    useFrame((state, delta) => {
        if (fanWheelRef.current) {
            fanWheelRef.current.rotation.y += delta * 6
        }
    })

    const geometries = useMemo(() => {
        const bodyGeo = new BoxGeometry(1.5, 2.5, 1)
        const topPanelGeo = new BoxGeometry(1.4, 0.05, 0.9)
        const screenGeo = new PlaneGeometry(0.6, 0.3)
        const waterTankGeo = new BoxGeometry(1.2, 0.6, 0.1)
        const topVentGeo = new PlaneGeometry(0.8, 0.5)
        const fanWheelGeo = new CylinderGeometry(0.3, 0.3, 0.02, 16)
        const barGeo = new BoxGeometry(0.85, 0.02, 0.02)
        const sideVentGeo = new PlaneGeometry(0.6, 1.2)
        const wheelGeo = new CylinderGeometry(0.1, 0.1, 0.05, 16)

        return {
            bodyGeo,
            topPanelGeo,
            screenGeo,
            waterTankGeo,
            topVentGeo,
            fanWheelGeo,
            barGeo,
            sideVentGeo,
            wheelGeo
        }
    }, [])

    useEffect(() => {
        return () => {
            Object.values(geometries).forEach(geo => geo.dispose())
        }
    }, [geometries])

    return (
        <group scale={[1, 1, 1]} position={[0, -0.5, 0]}>
            <mesh name="Body" geometry={geometries.bodyGeo} material={materials.boxMat} />
            <mesh name="TopPanel" geometry={geometries.topPanelGeo} material={materials.matteBlack} position={[0, 1.26, 0]} />
            <mesh name="Screen" geometry={geometries.screenGeo} material={materials.matteBlack} position={[0, 1.0, 0.51]} />
            <mesh name="WaterTank" geometry={geometries.waterTankGeo} material={materials.chassisInnerMat} position={[0, -0.8, 0.51]} />
            <group position={[0, 1.25, 0]}>
                <mesh geometry={geometries.topVentGeo} material={materials.castIron} rotation={[-Math.PI / 2, 0, 0]} />
                <group ref={fanWheelRef}>
                   <mesh geometry={geometries.fanWheelGeo} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel} />
                </group>
                <mesh geometry={geometries.barGeo} material={materials.matteBlack} position={[0, 0.05, 0]} />
                <mesh geometry={geometries.barGeo} material={materials.matteBlack} position={[0, 0.05, 0.2]} />
                <mesh geometry={geometries.barGeo} material={materials.matteBlack} position={[0, 0.05, -0.2]} />
            </group>
            
            <mesh name="SideVent" geometry={geometries.sideVentGeo} material={materials.castIron} position={[0.76, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            
            <group position={[0, -1.25, 0]}>
                {[-0.5, 0.5].map((x, i) => (
                    <mesh key={`lg1-${i}`} geometry={geometries.wheelGeo} position={[x, -0.1, 0.3]} material={materials.rubber} rotation={[0, 0, Math.PI / 2]} />
                ))}
                {[-0.5, 0.5].map((x, i) => (
                    <mesh key={`lg2-${i}`} geometry={geometries.wheelGeo} position={[x, -0.1, -0.3]} material={materials.rubber} rotation={[0, 0, Math.PI / 2]} />
                ))}
            </group>
        </group>
    )
}

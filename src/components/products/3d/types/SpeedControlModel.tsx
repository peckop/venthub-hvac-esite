"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import {
    BoxGeometry,
    CircleGeometry,
    CylinderGeometry,
    MeshBasicMaterial,
    PlaneGeometry
} from 'three'

import { useResolveMaterials } from '../core'

export function SpeedControlModel() {
    const materials = useResolveMaterials()
    const knobRef = useRef<Group>(null)
    const ledRef = useRef<MeshBasicMaterial>(null)

    // LED Material - Memoized to prevent leaks
    const ledMaterial = useMemo(() => new MeshBasicMaterial({ color: '#00ff00' }), [])

    // Geometries - Memoized to prevent leaks and improve performance
    const boxGeometry = useMemo(() => new BoxGeometry(0.8, 1, 0.3), [])
    const frontPanelGeometry = useMemo(() => new PlaneGeometry(0.7, 0.9), [])
    const finGeometry = useMemo(() => new BoxGeometry(0.02, 0.1, 0.2), [])
    const knobCylinderGeometry = useMemo(() => new CylinderGeometry(0.15, 0.15, 0.1, 32), [])
    const knobLineGeometry = useMemo(() => new BoxGeometry(0.02, 0.1, 0.02), [])
    const ledGeometry = useMemo(() => new CircleGeometry(0.03, 16), [])
    const logoGeometry = useMemo(() => new PlaneGeometry(0.2, 0.05), [])

    // VRAM Cleanup on unmount
    useEffect(() => {
        return () => {
            ledMaterial.dispose()
            boxGeometry.dispose()
            frontPanelGeometry.dispose()
            finGeometry.dispose()
            knobCylinderGeometry.dispose()
            knobLineGeometry.dispose()
            ledGeometry.dispose()
            logoGeometry.dispose()
        }
    }, [
        ledMaterial,
        boxGeometry,
        frontPanelGeometry,
        finGeometry,
        knobCylinderGeometry,
        knobLineGeometry,
        ledGeometry,
        logoGeometry
    ])

    useFrame((state) => {
        const time = state.clock.elapsedTime
        
        // Rotate knob
        if (knobRef.current) {
            knobRef.current.rotation.z = Math.sin(time * 2) * 0.5
        }

        // Pulse LED without re-rendering the component
        if (ledRef.current) {
            const intensity = Math.abs(Math.sin(time * 2))
            const greenValue = Math.floor(100 + intensity * 155)
            ledRef.current.color.setRGB(0, greenValue / 255, 0)
        }
    })

    return (
        <group scale={[2.5, 2.5, 2.5]} position={[0, 0, 0]}>
            {/* Kutu */}
            <mesh name="Box" material={materials.boxMat} geometry={boxGeometry} />
            {/* Ön Panel */}
            <mesh name="FrontPanel" material={materials.matteBlack} position={[0, 0, 0.16]} geometry={frontPanelGeometry} />
            {/* Yan Soğutma Kanalları */}
            {[-0.3, 0, 0.3].map((y, i) => (
                <mesh key={`heatl-${i}`} material={materials.matteBlack} position={[0.41, y, 0]} geometry={finGeometry} />
            ))}
            {[-0.3, 0, 0.3].map((y, i) => (
                <mesh key={`heatr-${i}`} material={materials.matteBlack} position={[-0.41, y, 0]} geometry={finGeometry} />
            ))}
            {/* Çevirmeli Düğme (Potentiometer) */}
            <group ref={knobRef} position={[0, -0.1, 0.16]}>
                <mesh material={materials.brushedAluminum} rotation={[Math.PI / 2, 0, 0]} geometry={knobCylinderGeometry} />
                <mesh material={materials.matteBlack} position={[0, 0.08, 0.05]} geometry={knobLineGeometry} />
            </group>
            {/* LED Gösterge */}
            <mesh position={[-0.2, 0.3, 0.16]} geometry={ledGeometry}>
                <primitive object={ledMaterial} ref={ledRef} attach="material" />
            </mesh>
            {/* VentHub Yazısı veya Logosu */}
            <mesh material={materials.boxMat} position={[0, 0.35, 0.16]} geometry={logoGeometry} />
        </group>
    )
}

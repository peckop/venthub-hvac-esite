"use client";
import { useFrame } from '@react-three/fiber'
import React, { useMemo,useRef } from 'react'
import type { Group } from 'three'
import { MeshBasicMaterial } from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

export function SpeedControlModel() {
    const materials = useFanMaterials()
    const knobRef = useRef<Group>(null)
    const ledRef = useRef<MeshBasicMaterial>(null)

    // LED Material - Memoized to prevent leaks
    const ledMaterial = useMemo(() => new MeshBasicMaterial({ color: '#00ff00' }), [])

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
            <mesh name="Box" material={materials.boxMat}>
                <boxGeometry args={[0.8, 1, 0.3]} />
            </mesh>
            {/* Ön Panel */}
            <mesh name="FrontPanel" material={materials.matteBlack} position={[0, 0, 0.16]}>
                <planeGeometry args={[0.7, 0.9]} />
            </mesh>
            {/* Yan Soğutma Kanalları */}
            {[-0.3, 0, 0.3].map((y, i) => (
                <mesh key={`heatl-${i}`} material={materials.matteBlack} position={[0.41, y, 0]}>
                    <boxGeometry args={[0.02, 0.1, 0.2]} />
                </mesh>
            ))}
            {[-0.3, 0, 0.3].map((y, i) => (
                <mesh key={`heatr-${i}`} material={materials.matteBlack} position={[-0.41, y, 0]}>
                    <boxGeometry args={[0.02, 0.1, 0.2]} />
                </mesh>
            ))}
            {/* Çevirmeli Düğme (Potentiometer) */}
            <group ref={knobRef} position={[0, -0.1, 0.16]}>
                <mesh material={materials.brushedAluminum} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                </mesh>
                <mesh material={materials.matteBlack} position={[0, 0.08, 0.05]}>
                    <boxGeometry args={[0.02, 0.1, 0.02]} />
                </mesh>
            </group>
            {/* LED Gösterge */}
            <mesh position={[-0.2, 0.3, 0.16]}>
                <circleGeometry args={[0.03, 16]} />
                <primitive object={ledMaterial} ref={ledRef} attach="material" />
            </mesh>
            {/* VentHub Yazısı veya Logosu */}
            <mesh material={materials.boxMat} position={[0, 0.35, 0.16]}>
                <planeGeometry args={[0.2, 0.05]} />
            </mesh>
        </group>
    )
}

"use client";
import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export function SpeedControlModel() {
    const materials = useFanMaterials()
    const knobRef = useRef<THREE.Group>(null)
    const [ledIntensity, setLedIntensity] = useState(0)

    useFrame((state) => {
        if (knobRef.current) {
            knobRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.5
            setLedIntensity(Math.abs(Math.sin(state.clock.elapsedTime * 2)))
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
                <meshBasicMaterial color={new THREE.Color(`rgb(0, ${Math.floor(100 + ledIntensity * 155)}, 0)`)} />
            </mesh>
            {/* VentHub Yazısı veya Logosu */}
            <mesh material={materials.boxMat} position={[0, 0.35, 0.16]}>
                <planeGeometry args={[0.2, 0.05]} />
            </mesh>
        </group>
    )
}

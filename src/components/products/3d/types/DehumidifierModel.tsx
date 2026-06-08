"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

export function DehumidifierModel() {
    const fanWheelRef = useRef<THREE.Group>(null)
    const materials = useFanMaterials()

    useFrame((state, delta) => {
        if (fanWheelRef.current) {
            fanWheelRef.current.rotation.y += delta * 6
        }
    })

    return (
        <group scale={[1, 1, 1]} position={[0, -0.5, 0]}>
            <mesh name="Body" material={materials.boxMat}>
                <boxGeometry args={[1.5, 2.5, 1]} />
            </mesh>
            <mesh name="TopPanel" material={materials.matteBlack} position={[0, 1.26, 0]}>
                <boxGeometry args={[1.4, 0.05, 0.9]} />
            </mesh>
            <mesh name="Screen" material={materials.matteBlack} position={[0, 1.0, 0.51]}>
                <planeGeometry args={[0.6, 0.3]} />
            </mesh>
            <mesh name="WaterTank" material={materials.chassisInnerMat} position={[0, -0.8, 0.51]}>
                <boxGeometry args={[1.2, 0.6, 0.1]} />
            </mesh>
            <group position={[0, 1.25, 0]}>
                <mesh material={materials.castIron} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.8, 0.5]} />
                </mesh>
                <group ref={fanWheelRef}>
                   <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                       <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
                   </mesh>
                </group>
                <mesh material={materials.matteBlack} position={[0, 0.05, 0]}>
                     <boxGeometry args={[0.85, 0.02, 0.02]} />
                </mesh>
                 <mesh material={materials.matteBlack} position={[0, 0.05, 0.2]}>
                     <boxGeometry args={[0.85, 0.02, 0.02]} />
                </mesh>
                 <mesh material={materials.matteBlack} position={[0, 0.05, -0.2]}>
                     <boxGeometry args={[0.85, 0.02, 0.02]} />
                </mesh>
            </group>
            
            <mesh name="SideVent" material={materials.castIron} position={[0.76, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.6, 1.2]} />
            </mesh>
            
            <group position={[0, -1.25, 0]}>
                {[-0.5, 0.5].map((x, i) => (
                    <mesh key={`lg1-${i}`} position={[x, -0.1, 0.3]} material={materials.rubber} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                    </mesh>
                ))}
                {[-0.5, 0.5].map((x, i) => (
                    <mesh key={`lg2-${i}`} position={[x, -0.1, -0.3]} material={materials.rubber} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

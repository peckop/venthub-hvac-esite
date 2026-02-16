import React from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

export function SilentChannelFanModel() {
    // Materials - PHOTO ACCURATE & HOLLOW READY
    const mats = React.useMemo(() => ({
        darkPlastic: new THREE.MeshStandardMaterial({
            color: '#2d2d30',
            roughness: 0.65,
            metalness: 0.1,
            side: THREE.DoubleSide // Vital for hollow appearance
        }),
        greenAccent: new THREE.MeshStandardMaterial({
            color: '#6ab04c',
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.DoubleSide
        }),
        whiteDetail: new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.5
        })
    }), [])

    // Geometry Constants
    const bRad = 0.44 // Barrel max radius
    const dRad = 0.36 // Duct/Pipe radius
    const dLen = 0.22 // Duct pipe length (Short)
    const targetBYHalf = 0.54 // Target length
    const phiLimit = Math.asin(dRad / bRad)
    const naturalBYHalf = bRad * Math.cos(phiLimit)
    const compensatoryStretch = targetBYHalf / naturalBYHalf

    return (
        <group position={[0, -0.6, 0]} scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}>
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* --- 1. THE ARCHED BARREL --- */}
                <mesh rotation={[0, 0, 0]} scale={[1, compensatoryStretch, 1]}>
                    <sphereGeometry args={[bRad, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit]} />
                    <primitive object={mats.darkPlastic} />
                </mesh>

                {/* Branding Logo */}
                <group position={[bRad - 0.01, 0, 0]} rotation={[0, Math.PI / 2, -Math.PI / 2]}>
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[0.22, 0.1]} />
                        <primitive object={mats.greenAccent} />
                    </mesh>
                    <Text
                        position={[0, 0, 0.001]}
                        fontSize={0.045}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        VORTICE
                    </Text>
                </group>


                {/* --- 2. THE ZERO-SLOPE DUCT ENDS --- */}
                <group position={[0, targetBYHalf + (dLen / 2), 0]}>
                    <mesh>
                        <cylinderGeometry args={[dRad, dRad, dLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                    <group position={[0, -dLen / 2 + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <torusGeometry args={[dRad + 0.015, 0.018, 16, 64]} />
                            <primitive object={mats.greenAccent} />
                        </mesh>
                        <mesh position={[dRad + 0.02, 0, 0]}>
                            <boxGeometry args={[0.08, 0.07, 0.12]} />
                            <primitive object={mats.greenAccent} />
                        </mesh>
                    </group>
                </group>

                <group position={[0, -(targetBYHalf + (dLen / 2)), 0]}>
                    <mesh>
                        <cylinderGeometry args={[dRad, dRad, dLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                    <group position={[0, dLen / 2 - 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <torusGeometry args={[dRad + 0.015, 0.018, 16, 64]} />
                            <primitive object={mats.greenAccent} />
                        </mesh>
                        <mesh position={[dRad + 0.02, 0, 0]}>
                            <boxGeometry args={[0.08, 0.07, 0.12]} />
                            <primitive object={mats.greenAccent} />
                        </mesh>
                    </group>
                </group>

                {/* --- 3. THE ELECTRIC BOX (SINGLE PRISM / NO BASE) --- */}
                {/* 
                    "sadece prizma şeklinde tek başına yuarlak gövdeye geçiş yapmış olacak"
                    Removing all secondary boxes/plates.
                */}
                <group position={[bRad - 0.04, 0, 0]}>
                    <mesh position={[0.12, 0, 0]}>
                        <boxGeometry args={[0.22, 0.35, 0.28]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                    {/* Subtle top detail lid (Flush) */}
                    <mesh position={[0.23, 0, 0]}>
                        <boxGeometry args={[0.01, 0.35, 0.28]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>

                {/* --- 4. THE MOUNTING TRAY --- */}
                <group position={[-0.50, 0, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.10, 2.0, 0.30]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                    <group position={[0.08, targetBYHalf + 0.03, 0]}>
                        <mesh>
                            <boxGeometry args={[0.18, 0.12, 0.30]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>
                    <group position={[0.08, -(targetBYHalf + 0.03), 0]}>
                        <mesh>
                            <boxGeometry args={[0.20, 0.12, 0.30]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>
                </group>

            </group>
        </group>
    )
}

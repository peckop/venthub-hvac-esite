import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'



export function SmokeExhaustFanModel() {
    const rotorRef = useRef<THREE.Group>(null)

    // DUMAN EGZOZ FANI (MAX FILL UPDATE)
    // 1. Blade Length: Extended to 0.51 (Tip Radius 0.69 vs Casing 0.70). Gap = 1cm.
    // 2. Count: 6 Blades.
    // 3. Shape: Broad Sickle (Cleaver).

    useFrame((state, delta) => {
        if (rotorRef.current) {
            rotorRef.current.rotation.z -= delta * 8
        }
    })

    const smokeCoating = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#334155', roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide
    }), [])

    const castBladeMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#222',
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide
    }), [])

    const boltMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#111', roughness: 0.8, metalness: 0.5
    }), [])

    // BLADE GEOMETRY: Long Cleaver
    const bladeGeometry = useMemo(() => {
        const shape = new THREE.Shape()

        // Blade Root at (0,0). X is Radial Length. Y is Chord Width.

        // Root Chord
        shape.moveTo(0, -0.05)
        shape.lineTo(0, 0.05)

        // Leading Edge (Long Sickle Curve)
        // Adjust control points to stretch to X=0.51 (Max Fill)
        shape.bezierCurveTo(0.15, 0.12, 0.35, 0.20, 0.51, 0.18) // Tip Leading at X=0.51

        // Tip Edge
        shape.lineTo(0.52, 0.08) // Tip Trailing (slightly further out visually)

        // Trailing Edge
        shape.bezierCurveTo(0.35, -0.02, 0.15, -0.04, 0, -0.05) // Back to root

        const extrudeSettings = {
            depth: 0.015,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.003,
            bevelSegments: 2
        }
        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    return (
        <group position={[0, -0.1, 0]} scale={[0.85, 0.85, 0.85]} rotation={[0, -Math.PI / 4, 0]}>

            {/* FRAME & STANDS (Preserved) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={smokeCoating}>
                    <cylinderGeometry args={[0.7, 0.7, 0.8, 64, 1, true]} />
                    <meshStandardMaterial {...smokeCoating} />
                </mesh>
            </group>
            {[0.38, -0.38].map((zPos, i) => (
                <group key={`flange - ${i} `} position={[0, 0, zPos]}>
                    <mesh material={smokeCoating}>
                        <ringGeometry args={[0.7, 0.82, 64]} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={smokeCoating}>
                        <cylinderGeometry args={[0.82, 0.82, 0.04, 64, 1, true]} />
                    </mesh>
                    {Array(16).fill(0).map((_, b) => (
                        <mesh key={b}
                            position={[0.76 * Math.cos(b * Math.PI / 8), 0.76 * Math.sin(b * Math.PI / 8), (i === 0 ? 0.025 : -0.025)]}
                            rotation={[Math.PI / 2, 0, 0]}
                            material={boltMaterial}>
                            <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                        </mesh>
                    ))}
                    <group position={[0, -0.75, 0]}>
                        <mesh position={[-0.55, 0, 0]} material={smokeCoating}>
                            <boxGeometry args={[0.08, 0.4, 0.04]} />
                        </mesh>
                        <mesh position={[0.55, 0, 0]} material={smokeCoating}>
                            <boxGeometry args={[0.08, 0.4, 0.04]} />
                        </mesh>
                    </group>
                </group>
            ))}
            <group position={[-0.55, -0.92, 0]}>
                <mesh material={smokeCoating}><boxGeometry args={[0.1, 0.05, 1.2]} /></mesh>
            </group>
            <group position={[0.55, -0.92, 0]}>
                <mesh material={smokeCoating}><boxGeometry args={[0.1, 0.05, 1.2]} /></mesh>
            </group>

            {/* ROTOR (Long Blades) */}
            <group ref={rotorRef} position={[0, 0, 0.2]}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh material={castBladeMat}>
                        <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
                    </mesh>
                    <mesh position={[0, 0.065, 0]}>
                        <cylinderGeometry args={[0.08, 0.14, 0.08, 32]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>

                {/* 6 Blades */}
                {Array(6).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, i * ((Math.PI * 2) / 6)]}>
                        <group position={[0.18, 0, 0]}>
                            <group rotation={[0.7, 0, 0]}>
                                <mesh geometry={bladeGeometry} material={castBladeMat} />
                            </group>
                        </group>
                    </group>
                ))}
            </group>

            {/* MOTOR */}
            <group position={[0, 0, -0.2]}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh material={smokeCoating}>
                        <cylinderGeometry args={[0.25, 0.25, 0.45, 32]} />
                    </mesh>
                </group>
                <group position={[0, 0.3, 0.1]}>
                    <mesh material={smokeCoating}>
                        <boxGeometry args={[0.12, 0.12, 0.08]} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}

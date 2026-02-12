import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'



export function SilentChannelFanModel() {
    const fanRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    // Custom Materials with DoubleSide EXPLICITLY defined here if needed, 
    // BUT better to spread existing materials into a new meshStandardMaterial component.

    const limeGreenProps = {
        color: '#84cc16',
        roughness: 0.2,
        metalness: 0.1
    }

    const darkPlasticProps = {
        color: '#18181b',
        roughness: 0.5,
        metalness: 0.1
    }

    return (
        <group position={[0, -0.7, 0]} scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}>
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. ANA GÖVDE - REMOVED material={} prop from mesh to avoid override */}
                <group>
                    <mesh>
                        <cylinderGeometry args={[0.42, 0.42, 0.6, 48, 1, true]} />
                        <meshStandardMaterial {...darkPlasticProps} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Üst Kutu */}
                    <mesh position={[0.35, 0, 0]}>
                        <boxGeometry args={[0.2, 0.5, 0.3]} />
                        <meshStandardMaterial {...darkPlasticProps} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.45, 0, 0]}>
                        <boxGeometry args={[0.01, 0.3, 0.15]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* 2. KELEPÇELER */}
                <group position={[0, 0.28, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.44, 0.44, 0.05, 48]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.4, 0, 0]}>
                        <boxGeometry args={[0.15, 0.06, 0.15]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                </group>
                <group position={[0, -0.28, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.44, 0.44, 0.05, 48]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.4, 0, 0]}>
                        <boxGeometry args={[0.15, 0.06, 0.15]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* 3. KONİLER */}
                <group position={[0, 0.45, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.35, 0.42, 0.3, 48, 1, true]} />
                        <meshStandardMaterial {...darkPlasticProps} side={THREE.DoubleSide} />
                    </mesh>
                </group>
                <group position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.35, 0.42, 0.3, 48, 1, true]} />
                        <meshStandardMaterial {...darkPlasticProps} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* 4. PERVANE */}
                <group ref={fanRef} position={[0, 0, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.25, 0.15, 0.4, 32]} />
                        <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                    </mesh>
                    {Array(12).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]}>
                            <mesh position={[0.22, 0, 0]} rotation={[0.5, 0.5, 0.2]}>
                                <boxGeometry args={[0.15, 0.15, 0.02]} />
                                <meshStandardMaterial {...limeGreenProps} side={THREE.DoubleSide} />
                            </mesh>
                        </group>
                    ))}
                </group>
            </group>

            <group position={[0.5, -0.5, 0]} rotation={[0, 0, 0.2]}>
                <mesh>
                    <boxGeometry args={[0.3, 0.05, 0.8]} />
                    <meshStandardMaterial {...darkPlasticProps} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    )
}

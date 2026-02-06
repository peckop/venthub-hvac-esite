import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const SnailFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // Snail Fan (Ex-Proof) - SCALE FIX

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.x -= delta * 8
        }
    })

    return (
        // SCALE: 0.65 (Diğerleriyle uyumlu olması için)
        <group position={[0, -0.2, 0]} scale={[0.65, 0.65, 0.65]}>
            {/* 1. SALYANGOZ GÖVDE (Scroll Housing) - MAT SİYAH */}
            <group>
                {/* Ana Daire */}
                <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} />
                </mesh>
                {/* Çıkış Ağzı (Dikdörtgen) - Tangential */}
                <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.6, 0.5, 0.4]} />
                </mesh>
                {/* Flanş (Çıkış) */}
                <mesh position={[0.4, 0.65, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.7, 0.02, 0.5]} />
                </mesh>
            </group>

            {/* 2. EX-PROOF DETAYI: BAKIR HALKA KALDIRILDI (Sade Tasarım) */}

            {/* 2.1 Giriş Izgarası (Siyah Tel) */}
            <group position={[0, 0.2, 0.25]}>
                {[0, 45, 90, 135].map((rot, i) => (
                    <mesh key={i} rotation={[0, 0, rot * Math.PI / 180]} material={materials.matteBlack}>
                        <boxGeometry args={[0.6, 0.01, 0.01]} />
                    </mesh>
                ))}
            </group>

            {/* 3. MOTOR (Yanda, Dışta) */}
            <group position={[0, 0.2, -0.35]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.25, 0.25, 0.4, 32]} />
                </mesh>
                {Array(6).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, 0, i * 0.06 - 0.15]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                        <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
                    </mesh>
                ))}
                <mesh position={[0, 0.2, 0]} material={materials.ral7035}>
                    <boxGeometry args={[0.2, 0.15, 0.2]} />
                </mesh>
                <mesh position={[0, 0.28, 0]} material={materials.safetyOrange} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 0.1]} />
                </mesh>
            </group>

            {/* 4. PERVANE */}
            <group ref={fanRef} position={[0, 0.2, 0]}>
                {Array(12).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * 30 * Math.PI / 180]} position={[0.25, 0, 0]}>
                        <boxGeometry args={[0.1, 0.05, 0.3]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

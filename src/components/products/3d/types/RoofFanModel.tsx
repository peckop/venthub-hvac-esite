import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const RoofFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const rotorRef = useRef<THREE.Group>(null)

    // Vortice Torrette TR-ED Serisi - Teknik İyileştirme
    // - Oranlar: Büyük Konik Başlık / Dar Alt Izgara
    // - Rotor: Backward Curved Plug Fan
    // - Detaylar: Eyebolts ve Yağmur Korumalı Shroud

    useFrame((state, delta) => {
        if (rotorRef.current) {
            rotorRef.current.rotation.y -= delta * 12
        }
    })

    // Gelişmiş Endüstriyel Materyaller (Hammered Metallic Effect)
    const darkGreyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#334155', // Slate-700 benzeri derin gri
        metalness: 0.6,
        roughness: 0.35,
        envMapIntensity: 1.0,
    }), [])

    const matteBlackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0F172A', // Slate-900 derin siyah
        metalness: 0.4,
        roughness: 0.6,
    }), [])

    return (
        <group position={[0, -0.4, 0]} scale={[0.85, 0.85, 0.85]}>

            {/* 1. ALT KAİDE (Kare Siyah Taban) */}
            <mesh position={[0, 0.04, 0]} material={matteBlackMaterial}>
                <boxGeometry args={[0.92, 0.08, 0.92]} />
            </mesh>
            <mesh position={[0, 0.09, 0]} material={matteBlackMaterial}>
                <boxGeometry args={[0.78, 0.02, 0.78]} />
            </mesh>

            {/* 2. TEKNİK IZGARA (Dikey Teller ve Yatay Destekler) */}
            <group position={[0, 0.1, 0]}>
                {Array(32).fill(0).map((_, i) => {
                    const angle = (i / 32) * Math.PI * 2
                    const r = 0.30
                    return (
                        <mesh
                            key={i}
                            position={[Math.cos(angle) * r, 0.16, Math.sin(angle) * r]}
                        >
                            <cylinderGeometry args={[0.003, 0.003, 0.32, 8]} />
                            <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
                        </mesh>
                    )
                })}

                {/* Dairesel Destek Halkaları */}
                {[0.05, 0.15, 0.25, 0.32].map((y, k) => (
                    <mesh key={k} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.30, 0.004, 8, 64]} />
                        <meshStandardMaterial color="#020617" />
                    </mesh>
                ))}
            </group>

            {/* 3. İÇ PLUG FAN (Backward Curved Rotor) */}
            <group ref={rotorRef} position={[0, 0.26, 0]}>
                <mesh position={[0, -0.095, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.27, 0.27, 0.015, 64]} />
                </mesh>
                <mesh position={[0, 0.09, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.16, 0.27, 0.04, 64, 1, true]} />
                </mesh>
                <mesh material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.04, 0.05, 0.18, 16]} />
                </mesh>

                {/* Geriye Eğimli Teknik Kanatlar */}
                {Array(8).fill(0).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2
                    return (
                        <group key={i} rotation={[0, angle, 0]}>
                            <group position={[0.06, 0, 0]} rotation={[0, -0.25, 0]}>
                                <mesh position={[0.04, 0, 0]} rotation={[0, 0.1, 0]}>
                                    <boxGeometry args={[0.08, 0.18, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                                <mesh position={[0.11, 0, 0.01]} rotation={[0, 0.4, 0]}>
                                    <boxGeometry args={[0.08, 0.18, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                                <mesh position={[0.18, 0, 0.04]} rotation={[0, 0.8, 0]}>
                                    <boxGeometry args={[0.06, 0.18, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                            </group>
                        </group>
                    )
                })}
            </group>

            {/* 4. GENİŞ SHROUD (Yağmur Korumalı) */}
            <group position={[0, 0.43, 0]}>
                <mesh position={[0, 0.06, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.42, 0.58, 0.12, 64]} />
                </mesh>
                <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.58, 0.008, 12, 64]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                {/* Sabitleme Klipsleri */}
                {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
                    <group key={i} rotation={[0, rot, 0]}>
                        <mesh position={[0.54, 0.06, 0]} material={materials.industrialSteel}>
                            <boxGeometry args={[0.012, 0.12, 0.04]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 5. KONİK ÜST GÖVDE VE MARKA */}
            <group position={[0, 0.72, 0]}>
                <mesh position={[0, -0.05, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.38, 0.42, 0.15, 64]} />
                </mesh>
                <mesh position={[0, 0.2, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.18, 0.38, 0.35, 64]} />
                </mesh>

                {/* Vortice Marka Logo */}
                <group position={[0, 0.15, 0.22]} rotation={[Math.PI / 10, 0, 0]}>
                    <mesh>
                        <boxGeometry args={[0.11, 0.10, 0.015]} />
                        <meshStandardMaterial color="#10B981" />
                    </mesh>
                    <mesh position={[0, 0, 0.008]}>
                        <torusGeometry args={[0.024, 0.005, 8, 32]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            </group>

            {/* 6. ÜST BİTİŞ KAPAĞI VE TAŞIMA HALKALARI */}
            <group position={[0, 1.05, 0]}>
                <mesh position={[0, 0, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.22, 0.2, 0.04, 32]} />
                </mesh>
                <mesh position={[0, 0.04, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.18, 0.22, 0.03, 32]} />
                </mesh>

                {/* TAŞIMA HALKALARI (Eyebolts) */}
                {[-0.12, 0.12].map((x, i) => (
                    <mesh key={i} position={[x, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.025, 0.006, 12, 24]} />
                        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

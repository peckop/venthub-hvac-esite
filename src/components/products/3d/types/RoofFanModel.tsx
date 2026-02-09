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
            rotorRef.current.rotation.y -= delta * 6
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

            {/* 1. ALT KAİDE (Kare Siyah Taban) - %10 Büyütüldü */}
            <mesh position={[0, 0.04, 0]} material={matteBlackMaterial}>
                <boxGeometry args={[1.012, 0.08, 1.012]} />
            </mesh>
            <mesh position={[0, 0.09, 0]} material={matteBlackMaterial}>
                <boxGeometry args={[0.858, 0.02, 0.858]} />
            </mesh>

            {/* 2. TEKNİK IZGARA (Çap ve Yükseklik %25 Artırıldı) */}
            <group position={[0, 0.1, 0]}>
                {Array(32).fill(0).map((_, i) => {
                    const angle = (i / 32) * Math.PI * 2
                    const r = 0.45 // 0.36 -> 0.45
                    return (
                        <mesh
                            key={i}
                            position={[Math.cos(angle) * r, 0.281, Math.sin(angle) * r]} // 0.5625 / 2
                        >
                            <cylinderGeometry args={[0.003, 0.003, 0.5625, 8]} />
                            <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
                        </mesh>
                    )
                })}

                {/* Dairesel Destek Halkaları */}
                {[0.12, 0.28, 0.44, 0.56].map((y, k) => (
                    <mesh key={k} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.45, 0.004, 8, 64]} />
                        <meshStandardMaterial color="#020617" />
                    </mesh>
                ))}
            </group>

            {/* 3. İÇ PLUG FAN (Yükseklik %30 Artırıldı) */}
            <group ref={rotorRef} position={[0, 0.468, 0]}>
                <mesh position={[0, -0.153, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.406, 0.406, 0.019, 64]} />
                </mesh>
                <mesh position={[0, 0.143, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.238, 0.406, 0.05, 64, 1, true]} />
                </mesh>
                <mesh material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.04, 0.05, 0.293, 16]} />
                </mesh>

                {/* Geriye Eğimli Teknik Kanatlar - %30 Uzatıldı */}
                {Array(8).fill(0).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2
                    return (
                        <group key={i} rotation={[0, angle, 0]}>
                            <group position={[0.09, 0, 0]} rotation={[0, -0.25, 0]}>
                                <mesh position={[0.06, 0, 0]} rotation={[0, 0.1, 0]}>
                                    <boxGeometry args={[0.12, 0.293, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                                <mesh position={[0.165, 0, 0.01]} rotation={[0, 0.4, 0]}>
                                    <boxGeometry args={[0.12, 0.293, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                                <mesh position={[0.27, 0, 0.04]} rotation={[0, 0.8, 0]}>
                                    <boxGeometry args={[0.09, 0.293, 0.006]} />
                                    <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
                                </mesh>
                            </group>
                        </group>
                    )
                })}
            </group>

            {/* 4. GENİŞ SHROUD - %25 Yükseklik Artışına Göre Kaydırıldı */}
            <group position={[0, 0.6625, 0]}> // 0.55 + 0.1125
                {/* Alt Taban Segmanı (Dikey Kenar/Skirt) */}
                <mesh position={[0, 0.083, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.68, 0.68, 0.166, 64]} />
                </mesh>
                {/* Geçiş Kavisi - Koniyle Uyumlu (0.32) */}
                <mesh position={[0, 0.206, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.32, 0.68, 0.12, 64]} />
                </mesh>

                {/* Shroud Sabitleme Klipsleri */}
                {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
                    <group key={i} rotation={[0, rot, 0]}>
                        <mesh position={[0.65, 0.166, 0]} material={materials.industrialSteel}>
                            <boxGeometry args={[0.015, 0.12, 0.04]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 5. KONİK GÖVDE - Yukarı Kaydırıldı */}
            <group position={[0, 1.1285, 0]}> // 1.016 + 0.1125
                <mesh material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.224, 0.32, 0.50, 64]} />
                </mesh>
            </group>

            {/* Vortice Marka Logo - Yukarı Kaydırıldı */}
            <group position={[0, 1.1685, 0.21]} rotation={[0, 0, 0]}> // 1.056 + 0.1125
                <mesh>
                    <boxGeometry args={[0.07, 0.06, 0.01]} />
                    <meshStandardMaterial color="#10B981" />
                </mesh>
                <mesh position={[0, 0, 0.006]}>
                    <torusGeometry args={[0.016, 0.003, 8, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>

            {/* 6. ÜST BİTİŞ KAPAĞI VE TEKNİK KADEME - Yukarı Kaydırıldı */}
            <group position={[0, 1.3685, 0]}> // 1.256 + 0.1125
                {/* Teknik Kanal (Groove) */}
                <mesh position={[0, 0.01, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.208, 0.208, 0.03, 64]} />
                </mesh>

                {/* Üst Şapka */}
                <mesh position={[0, 0.06, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.224, 0.224, 0.08, 32]} />
                </mesh>

                {/* TAŞIMA HALKALARI */}
                {[-0.10, 0.10].map((x, i) => (
                    <mesh key={i} position={[x, 0.10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.02, 0.005, 12, 24]} />
                        <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

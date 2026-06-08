"use client";
import React, { useMemo } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

export const ExproofFanModel: React.FC = () => {
    const materials = useFanMaterials()

    // Salyangoz Formu - Dış Kontur - Memoized
    const scrollShape = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0.44)
        shape.lineTo(0.58, 0.44)
        shape.lineTo(0.58, 0.08)
        shape.lineTo(0.32, 0.08)
        shape.quadraticCurveTo(0.38, -0.36, 0, -0.35)
        shape.quadraticCurveTo(-0.38, -0.36, -0.44, 0)
        shape.quadraticCurveTo(-0.44, 0.44, 0, 0.44)
        return shape
    }, [])

    // Standart Cıvata (Krom) - Performance Optimized
    const Bolt = ({ position }: { position: [number, number, number] }) => (
        <group position={position} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.boltChrome}>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
            </mesh>
            <mesh position={[0, 0.01, 0]} material={materials.boltChrome}>
                <sphereGeometry args={[0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
        </group>
    )

    return (
        <group>
            {/* 1. MOTOR & KAİDE (YAN MONTAJ) */}
            <group position={[0, 0.35, -0.32]}>
                {/* Motor Gövdesi (Gümüş/Alüminyum) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.motorSilver}>
                    <cylinderGeometry args={[0.18, 0.18, 0.42, 32]} />
                </mesh>

                {/* Soğutma Kanatları */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]} material={materials.motorSilver}>
                        <boxGeometry args={[0.015, 0.39, 0.40]} />
                    </mesh>
                ))}

                {/* Klemens Kutusu (Üstte) */}
                <group position={[0, 0.21, 0.05]}>
                    <mesh material={materials.zincGray}>
                        <boxGeometry args={[0.16, 0.12, 0.16]} />
                    </mesh>
                    {/* Sarı Şimşek Etiketi */}
                    <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.warningYellow}>
                        <planeGeometry args={[0.08, 0.08]} />
                    </mesh>
                </group>

                {/* Arka Kapak (Fan Muhafazası) */}
                <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.boltChrome}>
                    <cylinderGeometry args={[0.19, 0.185, 0.12, 32]} />
                </mesh>

                {/* --- MONTAJ AYAKLARI (KAİDE) --- */}
                <group position={[0, -0.22, 0.05]}>
                    <mesh material={materials.castIron}>
                        <boxGeometry args={[0.25, 0.08, 0.30]} />
                    </mesh>
                    <mesh position={[0, -0.05, 0]} material={materials.castIron}>
                        <boxGeometry args={[0.32, 0.02, 0.38]} />
                    </mesh>
                </group>
            </group>

            {/* 2. SALYANGOZ GÖVDE (SCROLL HOUSING) */}
            <group position={[0, 0.35, 0]}>
                {/* Gövde Extrusion (Siyah Döküm) */}
                <mesh position={[0, 0, -0.12]} material={materials.exproofBlack}>
                    <extrudeGeometry args={[scrollShape, { depth: 0.24, bevelEnabled: false }]} />
                </mesh>

                {/* EMİŞ ÜNİTESİ (BAKIR + IZGARA) */}
                <group position={[0, 0, 0.125]}>

                    {/* A. Bakır Huni (Spark Protection Ring) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.copper}>
                        <cylinderGeometry args={[0.24, 0.20, 0.04, 64, 1, true]} />
                    </mesh>
                    {/* Bakır Ön Yüzey (Halka) */}
                    <mesh position={[0, 0, 0.02]} material={materials.copper}>
                        <ringGeometry args={[0.20, 0.24, 64]} />
                    </mesh>

                    {/* B. Vidalar (Halkayı Tutan) */}
                    {[45, 135, 225, 315].map((angle, i) => (
                        <Bolt
                            key={i}
                            position={[
                                Math.cos(angle * Math.PI / 180) * 0.22,
                                Math.sin(angle * Math.PI / 180) * 0.22,
                                0.025
                            ]}
                        />
                    ))}

                    {/* C. Koruma Izgarası (Siyah Tel) */}
                    <group position={[0, 0, 0.015]}>
                        {/* Konsentrik Halkalar */}
                        {[0.05, 0.10, 0.15, 0.19].map((r, i) => (
                            <mesh key={`ring-${i}`} material={materials.matteBlack}>
                                <torusGeometry args={[r, 0.003, 8, 64]} />
                            </mesh>
                        ))}
                        {/* Radyal Teller */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.matteBlack}>
                                <boxGeometry args={[0.38, 0.006, 0.006]} />
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* Atış Ağzı (Flanşlı) */}
                <group position={[0.45, 0.26, 0]}>
                    <mesh material={materials.exproofBlack}>
                        <boxGeometry args={[0.3, 0.35, 0.24]} />
                    </mesh>
                    {/* Flanş Plakası */}
                    <mesh position={[0.15, 0, 0]} material={materials.exproofBlack}>
                        <boxGeometry args={[0.02, 0.40, 0.28]} />
                    </mesh>
                    {/* Ağız Boşluğu */}
                    <mesh position={[0.01, 0.05, 0]} material={materials.matteBlack}>
                        <boxGeometry args={[0.32, 0.28, 0.20]} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}

"use client";
import React, { useMemo } from 'react'
import * as THREE from 'three'

/**
 * ExproofFanModel (HIGH FIDELITY - RESTORED)
 * 
 * Referans: Kullanıcı Görselleri (Siyah Salyangoz + Gümüş Motor + Bakır Halka + Tel Izgara)
 * 
 * Yapılan İyileştirmeler:
 * 1. TEL IZGARA: Siyah konsentrik halkalar geri eklendi.
 * 2. BAKIR HALKA: Parlak ve belirgin hale getirildi.
 * 3. MONTAJ AYAKLARI: Motor altına döküm ayaklar eklendi.
 * 4. VİDA DETAYLARI: Halkayı tutan krom vidalar eklendi.
 */
export const ExproofFanModel: React.FC = () => {

    // Salyangoz Formu - Dış Kontur
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

    // Standart Cıvata (Krom)
    const Bolt = ({ position }: { position: [number, number, number] }) => (
        <group position={position} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    )

    return (
        <group>
            {/* 1. MOTOR & KAİDE (YAN MONTAJ) */}
            <group position={[0, 0.35, -0.32]}>
                {/* Motor Gövdesi (Gümüş/Alüminyum) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.42, 32]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
                </mesh>

                {/* Soğutma Kanatları */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]}>
                        <boxGeometry args={[0.015, 0.39, 0.40]} />
                        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
                    </mesh>
                ))}

                {/* Klemens Kutusu (Üstte) */}
                <group position={[0, 0.21, 0.05]}>
                    <mesh>
                        <boxGeometry args={[0.16, 0.12, 0.16]} />
                        <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
                    </mesh>
                    {/* Sarı Şimşek Etiketi */}
                    <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.08, 0.08]} />
                        <meshBasicMaterial color="#fbbf24" />
                    </mesh>
                </group>

                {/* Arka Kapak (Fan Muhafazası) */}
                <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.19, 0.185, 0.12, 32]} />
                    <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* --- MONTAJ AYAKLARI (KAİDE) --- */}
                <group position={[0, -0.22, 0.05]}>
                    <mesh>
                        <boxGeometry args={[0.25, 0.08, 0.30]} />
                        <meshStandardMaterial color="#4b5563" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.05, 0]}>
                        <boxGeometry args={[0.32, 0.02, 0.38]} />
                        <meshStandardMaterial color="#4b5563" roughness={0.8} />
                    </mesh>
                </group>
            </group>

            {/* 2. SALYANGOZ GÖVDE (SCROLL HOUSING) */}
            <group position={[0, 0.35, 0]}>
                {/* Gövde Extrusion (Siyah Döküm) */}
                <mesh position={[0, 0, -0.12]}>
                    <extrudeGeometry args={[scrollShape, { depth: 0.24, bevelEnabled: false }]} />
                    <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.3} />
                </mesh>

                {/* EMİŞ ÜNİTESİ (BAKIR + IZGARA) */}
                <group position={[0, 0, 0.125]}>

                    {/* A. Bakır Huni (Spark Protection Ring) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.24, 0.20, 0.04, 64, 1, true]} />
                        <meshStandardMaterial
                            color="#f59e0b" // Canlı Bakır
                            metalness={0.9}
                            roughness={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    {/* Bakır Ön Yüzey (Halka) */}
                    <mesh position={[0, 0, 0.02]}>
                        <ringGeometry args={[0.20, 0.24, 64]} />
                        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
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
                            <mesh key={`ring-${i}`}>
                                <torusGeometry args={[r, 0.003, 8, 64]} />
                                <meshStandardMaterial color="#000" metalness={0.5} roughness={0.5} />
                            </mesh>
                        ))}
                        {/* Radyal Teller */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]}>
                                <boxGeometry args={[0.38, 0.006, 0.006]} />
                                <meshStandardMaterial color="#000" metalness={0.5} roughness={0.5} />
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* Atış Ağzı (Flanşlı) */}
                <group position={[0.45, 0.26, 0]}>
                    <mesh>
                        <boxGeometry args={[0.3, 0.35, 0.24]} />
                        <meshStandardMaterial color="#111827" />
                    </mesh>
                    {/* Flanş Plakası */}
                    <mesh position={[0.15, 0, 0]}>
                        <boxGeometry args={[0.02, 0.40, 0.28]} />
                        <meshStandardMaterial color="#111827" />
                    </mesh>
                    {/* Ağız Boşluğu */}
                    <mesh position={[0.01, 0.05, 0]}>
                        <boxGeometry args={[0.32, 0.28, 0.20]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                </group>
            </group>
        </group>
    )
}





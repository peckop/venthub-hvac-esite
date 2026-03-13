"use client";
import React, { useMemo } from 'react'
import * as THREE from 'three'

/**
 * SnailFanModel (Standart Santrifüj / Salyangoz Fan)
 * 
 * ÖNEMLİ: Bu dosya ExproofFanModel.tsx'in BİREBİR KOPYASIDIR.
 * Aralarındaki TEK FARK renk/materyal tanımlarıdır.
 * Geometri, pozisyon, boyut ve yapı TAMAMEN AYNI olmak ZORUNDADIR.
 * Aksi halde BoundingBox farkı oluşur ve SmartCenterScale / Orbit offset
 * farklı sonuçlar verir.
 * 
 * Farklar (SADECE RENK):
 * - Gövde: #111827 (Exproof Siyah) → #374151 (Endüstriyel Gri)
 * - Emiş Hunisi: #f59e0b (Bakır) → #e2e8f0 (Galvaniz Gümüş)
 * - Motor: #c0c0c0 (Alüminyum) → #475569 (Endüstriyel Mavi/Gri)
 * - Klemens: #a1a1aa → #334155
 * - Ayaklar: #4b5563 → #334155
 */
export const SnailFanModel: React.FC = () => {

    // Salyangoz Formu - Dış Kontur (Exproof ile BİREBİR AYNI)
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

    // Standart Cıvata (Exproof ile AYNI yapı, farklı renk)
    const Bolt = ({ position }: { position: [number, number, number] }) => (
        <group position={position} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.02, 6]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    )

    return (
        <group>
            {/* 1. MOTOR & KAİDE (YAN MONTAJ) */}
            <group position={[0, 0.35, -0.32]}>
                {/* Motor Gövdesi (Endüstriyel Mavi/Gri) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.42, 32]} />
                    <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
                </mesh>

                {/* Soğutma Kanatları */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]}>
                        <boxGeometry args={[0.015, 0.39, 0.40]} />
                        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
                    </mesh>
                ))}

                {/* Klemens Kutusu (Üstte) — Exproof ile AYNI pozisyon/boyut */}
                <group position={[0, 0.21, 0.05]}>
                    <mesh>
                        <boxGeometry args={[0.16, 0.12, 0.16]} />
                        <meshStandardMaterial color="#334155" metalness={0.5} />
                    </mesh>
                    {/* Etiket (Exproof'ta Sarı Şimşek) — Geometri eşitliği için korunuyor */}
                    <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.08, 0.08]} />
                        <meshBasicMaterial color="#64748b" />
                    </mesh>
                </group>

                {/* Arka Kapak (Fan Muhafazası) */}
                <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.19, 0.185, 0.12, 32]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* --- MONTAJ AYAKLARI (KAİDE) --- Exproof ile BİREBİR AYNI yapı */}
                <group position={[0, -0.22, 0.05]}>
                    <mesh>
                        <boxGeometry args={[0.25, 0.08, 0.30]} />
                        <meshStandardMaterial color="#334155" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, -0.05, 0]}>
                        <boxGeometry args={[0.32, 0.02, 0.38]} />
                        <meshStandardMaterial color="#334155" roughness={0.8} />
                    </mesh>
                </group>
            </group>

            {/* 2. SALYANGOZ GÖVDE (SCROLL HOUSING) */}
            <group position={[0, 0.35, 0]}>
                {/* Gövde Extrusion (Endüstriyel Gri Sac) */}
                <mesh position={[0, 0, -0.12]}>
                    <extrudeGeometry args={[scrollShape, { depth: 0.24, bevelEnabled: false }]} />
                    <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.4} />
                </mesh>

                {/* EMİŞ ÜNİTESİ */}
                <group position={[0, 0, 0.125]}>

                    {/* A. Huni (Galvaniz Gümüş — Exproof'ta Bakır) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.24, 0.20, 0.04, 64, 1, true]} />
                        <meshStandardMaterial
                            color="#e2e8f0"
                            metalness={0.6}
                            roughness={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    {/* Ön Yüzey (Halka) */}
                    <mesh position={[0, 0, 0.02]}>
                        <ringGeometry args={[0.20, 0.24, 64]} />
                        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
                    </mesh>

                    {/* B. Vidalar — Exproof ile AYNI açılar (45,135,225,315) */}
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

                    {/* C. Koruma Izgarası — Exproof ile AYNI yapı (4 halka + 6 tel) */}
                    <group position={[0, 0, 0.015]}>
                        {/* Konsentrik Halkalar — Exproof ile AYNI yarıçaplar */}
                        {[0.05, 0.10, 0.15, 0.19].map((r, i) => (
                            <mesh key={`ring-${i}`}>
                                <torusGeometry args={[r, 0.003, 8, 64]} />
                                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
                            </mesh>
                        ))}
                        {/* Radyal Teller — Exproof ile AYNI açılar */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]}>
                                <boxGeometry args={[0.38, 0.006, 0.006]} />
                                <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* Atış Ağzı (Flanşlı) — Exproof ile BİREBİR AYNI */}
                <group position={[0.45, 0.26, 0]}>
                    <mesh>
                        <boxGeometry args={[0.3, 0.35, 0.24]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    {/* Flanş Plakası — KRİTİK: Bu mesh Exproof'ta var, Snail'de eksikti! */}
                    <mesh position={[0.15, 0, 0]}>
                        <boxGeometry args={[0.02, 0.40, 0.28]} />
                        <meshStandardMaterial color="#374151" />
                    </mesh>
                    {/* Ağız Boşluğu */}
                    <mesh position={[0.01, 0.05, 0]}>
                        <boxGeometry args={[0.32, 0.28, 0.20]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                </group>
            </group>
        </group>
    )
}





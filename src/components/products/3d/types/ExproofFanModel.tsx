import React, { useMemo } from 'react'
import * as THREE from 'three'


/**
 * ExproofFanModel (Engineering High-Fidelity - Absolute Identity V15)
 * 
 * KRİTİK ANALİZ VE RENK SADAKATİ (Referans: exproof fan-2.png):
 * 1. SALYANGOZ GÖVDE: Mat Antrasit/Siyah (#1a1a1a).
 * 2. MOTOR VE KANATÇIKLAR: Döküm Alüminyum Grisi (#a1a1aa), metalik doku.
 * 3. ARKA TAS (KAPAK): Parlak Gümüş/Alüminyum (#e5e7eb), yüksek yansıma.
 * 4. KARE ÇIKIŞ: 0.45x0.45 tam kare siyah plaka.
 * 5. BAKIR: Canlı ve radyant bakır (#f6ad55).
 * 6. KLEMENS KUTUSU: Açık gri gövde, gümüş kapak ve sarı şimşek sembolü.
 * 7. PEDESTAL: Koyu döküm gri blok (#374151).
 */
export const ExproofFanModel: React.FC = () => {


    // Salyangoz Formu (Keskin Hatlı)
    const scrollShape = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0.44)
        shape.lineTo(0.58, 0.44)
        shape.lineTo(0.58, 0.08)
        shape.lineTo(0.32, 0.08)
        shape.quadraticCurveTo(0.44, -0.32, 0, -0.32)
        shape.quadraticCurveTo(-0.44, -0.32, -0.44, 0)
        shape.quadraticCurveTo(-0.44, 0.44, 0, 0.44)
        return shape
    }, [])

    // Tek Parça Bakır Ünitesi (Torna Geometrisi)
    const intakePoints = useMemo(() => {
        const pts = []
        pts.push(new THREE.Vector2(0.24, 0.006))
        pts.push(new THREE.Vector2(0.19, 0.012))
        pts.push(new THREE.Vector2(0.175, 0.005))
        pts.push(new THREE.Vector2(0.17, -0.015))
        pts.push(new THREE.Vector2(0.165, -0.12))
        return pts
    }, [])

    // Standart Mühendislik Cıvatası
    const StandardFastener = ({ position, rotation, doubleSided = false }: { position: [number, number, number], rotation?: [number, number, number], doubleSided?: boolean }) => (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : new THREE.Euler()}>
            <mesh>
                <cylinderGeometry args={[0.008, 0.008, 0.015, 6]} />
                <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.012, 0]}>
                <sphereGeometry args={[0.018, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.9}
                    roughness={0.05}
                    emissive="#666666"
                    emissiveIntensity={0.2}
                />
            </mesh>
            {doubleSided && (
                <mesh position={[0, -0.012, 0]} rotation={[Math.PI, 0, 0]}>
                    <sphereGeometry args={[0.018, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.05} emissive="#666666" />
                </mesh>
            )}
        </group>
    )

    return (
        <group position={[0, -0.35, 0]}>

            {/* --- 1. MOTOR VE MONTAJ ÜNİTESİ (FOTOĞRAF İLE BİREBİR RENKLER) --- */}
            <group position={[0, 0.35, -0.42]}>

                {/* Motor Gövdesi (Döküm Alüminyum - #a1a1aa) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.22, 0.22, 0.5, 32]} />
                    <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.4} />
                </mesh>

                {/* Soğutma Kanatları (Hizalı ve Milimetrik) */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]}>
                        <boxGeometry args={[0.012, 0.48, 0.48]} />
                        <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.4} />
                    </mesh>
                ))}

                {/* Klemens Kutusu (Açık Gri Gövde + Gümüş Kapak + Sarı Şimşek) */}
                <group position={[0, 0.24, 0.05]}>
                    {/* Gövde */}
                    <mesh>
                        <boxGeometry args={[0.22, 0.14, 0.22]} />
                        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.5} />
                    </mesh>
                    {/* Kapak (Gümüş) */}
                    <mesh position={[0, 0.075, 0]}>
                        <boxGeometry args={[0.24, 0.02, 0.24]} />
                        <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
                    </mesh>
                    {/* Sarı Şimşek Sembolü */}
                    <group position={[0, 0.086, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <mesh>
                            <planeGeometry args={[0.08, 0.08]} />
                            <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, 0.001]}>
                            <shapeGeometry args={[new THREE.Shape([
                                new THREE.Vector2(-0.01, 0.02),
                                new THREE.Vector2(0.02, 0),
                                new THREE.Vector2(-0.02, 0),
                                new THREE.Vector2(0.01, -0.02)
                            ])]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                </group>

                {/* Arka Kapak (Parlak Gümüş - #e5e7eb) */}
                <mesh position={[0, 0, -0.31]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.25, 0.24, 0.14, 32]} />
                    <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
                </mesh>

                {/* MOTOR DESTREK BLOĞU (Koyu Döküm Gri - #374151) */}
                <group position={[0, -0.28, 0.05]}>
                    <mesh>
                        <boxGeometry args={[0.34, 0.12, 0.42]} />
                        <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, -0.07, 0]}>
                        <boxGeometry args={[0.44, 0.04, 0.54]} />
                        <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.7} />
                    </mesh>
                </group>
            </group>

            {/* --- 2. SALYANGOZ GÖVDE (MAT ANTRASİT - KARE ÇIKIŞ) --- */}
            <group position={[0, 0.35, 0]}>

                {/* Spiral Kasa (Mat Antrasit/Siyah - #1a1a1a) */}
                <group>
                    <mesh position={[0, 0, -0.12]}>
                        <extrudeGeometry args={[scrollShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005 }]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.1} />
                    </mesh>

                    {/* HAVA ÇIKIŞ AĞZI (KARE FORM - 0.45x0.45 SİYAH PLAKA) */}
                    <group position={[0.58, 0.26, -0.01]} rotation={[0, Math.PI / 2, 0]}>
                        <mesh>
                            <boxGeometry args={[0.45, 0.45, 0.02]} />
                            <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.1} />
                        </mesh>
                        <StandardFastener position={[0.18, 0.18, 0]} doubleSided={true} />
                        <StandardFastener position={[-0.18, 0.18, 0]} doubleSided={true} />
                        <StandardFastener position={[0.18, -0.18, 0]} doubleSided={true} />
                        <StandardFastener position={[-0.18, -0.18, 0]} doubleSided={true} />
                    </group>
                </group>

                {/* EMİŞ ÜNİTESİ (CANLI BAKIR - #f6ad55) */}
                <group position={[0, 0, 0.1]}>

                    {/* Tek Parça Bakır Ünitesi (Torna) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.008]}>
                        <latheGeometry args={[intakePoints, 64]} />
                        <meshStandardMaterial
                            color="#f6ad55"
                            metalness={0.85}
                            roughness={0.1}
                            emissive="#4a2a1a"
                            emissiveIntensity={0.15}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* 3 Standart Cıvata */}
                    {[30, 150, 270].map((angle, i) => (
                        <StandardFastener
                            key={i}
                            position={[
                                Math.cos(angle * Math.PI / 180) * 0.21,
                                Math.sin(angle * Math.PI / 180) * 0.21,
                                0.015
                            ]}
                            rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}
                        />
                    ))}

                    {/* IZGARA (Mazgal) */}
                    <group position={[0, 0, -0.05]}>
                        {[0.06, 0.09, 0.12, 0.15].map((r, i) => (
                            <mesh key={i}>
                                <torusGeometry args={[r, 0.007, 8, 48]} />
                                <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
                            </mesh>
                        ))}
                    </group>
                </group>

                {/* %100 STATİK - FOTOĞRAF KADAR GERÇEKÇİ */}
            </group>

        </group>
    )
}

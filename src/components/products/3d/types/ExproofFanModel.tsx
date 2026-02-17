import React, { useMemo } from 'react'
import * as THREE from 'three'


/**
 * ExproofFanModel (Engineering High-Fidelity - Precision V17)
 * 
 * KRİTİK HASSAS DÜZELTMELER:
 * 1. VIDA HİZALAMA: Bakır şeridin orta eksenine (0.21 radius) hizalandı.
 * 2. IZGARA HİZALAMA: En dış halka 0.20 radius'a taşındı.
 * 3. MOTOR KÜÇÜLTME: %20 küçültüldü (radius: 0.176, uzunluk: 0.4).
 * 4. SALYANGOZ KASA: 2mm et kalınlığıyla içi boş yapıldı.
 * 
 * RENK SADAKATİ (Referans: exproof fan-2.png):
 * 1. SALYANGOZ GÖVDE: Mat Antrasit/Siyah (#1a1a1a).
 * 2. MOTOR VE KANATÇIKLAR: Döküm Alüminyum Grisi (#a1a1aa).
 * 3. ARKA KAPAK: Parlak Gümüş (#e5e7eb).
 * 4. KARE ÇIKIŞ: 0.45x0.45 siyah plaka.
 * 5. BAKIR: Canlı radyant (#f6ad55).
 * 6. KLEMENS KUTUSU: Açık gri + gümüş kapak + sarı şimşek.
 * 7. PEDESTAL: Koyu döküm gri (#374151).
 */
export const ExproofFanModel: React.FC = () => {

    // Salyangoz Formu - Dış Kontur
    const scrollShape = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0.44)
        shape.lineTo(0.58, 0.44)
        shape.lineTo(0.58, 0.08)
        shape.lineTo(0.32, 0.08)
        // Daha yuvarlak alt profil için ayarlanmış kontrol noktaları
        shape.quadraticCurveTo(0.38, -0.36, 0, -0.35)
        shape.quadraticCurveTo(-0.38, -0.36, -0.44, 0)
        shape.quadraticCurveTo(-0.44, 0.44, 0, 0.44)
        return shape
    }, [])

    // Salyangoz Formu - İç Kontur (2mm et kalınlığı için)
    const scrollShapeInner = useMemo(() => {
        const offset = 0.002 // 2mm
        const shape = new THREE.Shape()
        shape.moveTo(offset, 0.44 - offset)
        shape.lineTo(0.58 - offset, 0.44 - offset)
        shape.lineTo(0.58 - offset, 0.08 + offset)
        shape.lineTo(0.32 + offset, 0.08 + offset)
        // İç kontur - daha yuvarlak profil
        shape.quadraticCurveTo(0.38 - offset, -0.36 + offset, offset, -0.35 + offset)
        shape.quadraticCurveTo(-0.38 + offset, -0.36 + offset, -0.44 + offset, offset)
        shape.quadraticCurveTo(-0.44 + offset, 0.44 - offset, offset, 0.44 - offset)
        return shape
    }, [])

    // Tek Parça Bakır Ünitesi (Torna Geometrisi)
    const intakePoints = useMemo(() => {
        const pts = []
        pts.push(new THREE.Vector2(0.24, 0.006))  // Dış çap
        pts.push(new THREE.Vector2(0.19, 0.012))
        pts.push(new THREE.Vector2(0.175, 0.005))
        pts.push(new THREE.Vector2(0.17, -0.015))
        pts.push(new THREE.Vector2(0.165, -0.12))  // İç çap
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
        <group>

            {/* --- 1. MOTOR VE MONTAJ ÜNİTESİ (SALYANGOZ İLE TEMAS) --- */}
            <group position={[0, 0.35, -0.32]}>

                {/* Motor Gövdesi (Döküm Alüminyum - Küçültülmüş) */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.176, 0.176, 0.4, 32]} />
                    <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.4} />
                </mesh>

                {/* Soğutma Kanatları (Küçültülmüş) */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]}>
                        <boxGeometry args={[0.012, 0.384, 0.384]} />
                        <meshStandardMaterial color="#a1a1aa" metalness={0.7} roughness={0.4} />
                    </mesh>
                ))}

                {/* Klemens Kutusu (Küçültülmüş) */}
                <group position={[0, 0.192, 0.04]}>
                    <mesh>
                        <boxGeometry args={[0.176, 0.112, 0.176]} />
                        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0.06, 0]}>
                        <boxGeometry args={[0.192, 0.016, 0.192]} />
                        <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.2} />
                    </mesh>
                    {/* Sarı Şimşek Sembolü */}
                    <group position={[0, 0.069, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <mesh>
                            <planeGeometry args={[0.064, 0.064]} />
                            <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, 0.001]}>
                            <shapeGeometry args={[new THREE.Shape([
                                new THREE.Vector2(-0.008, 0.016),
                                new THREE.Vector2(0.016, 0),
                                new THREE.Vector2(-0.016, 0),
                                new THREE.Vector2(0.008, -0.016)
                            ])]} />
                            <meshBasicMaterial color="#000000" />
                        </mesh>
                    </group>
                </group>

                {/* Arka Kapak (Küçültülmüş) */}
                <mesh position={[0, 0, -0.248]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.20, 0.192, 0.112, 32]} />
                    <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
                </mesh>

                {/* MOTOR DESTREK BLOĞU (Küçültülmüş) */}
                <group position={[0, -0.224, 0.04]}>
                    <mesh>
                        <boxGeometry args={[0.272, 0.096, 0.336]} />
                        <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, -0.056, 0]}>
                        <boxGeometry args={[0.352, 0.032, 0.432]} />
                        <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.7} />
                    </mesh>
                </group>
            </group>

            {/* --- 2. SALYANGOZ GÖVDE (İÇİ BOŞ - 2MM ET KALINLIĞI) --- */}
            <group position={[0, 0.35, 0]}>

                {/* Dış Yüzey */}
                <mesh position={[0, 0, -0.12]}>
                    <extrudeGeometry args={[scrollShape, { depth: 0.22, bevelEnabled: false }]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.1} />
                </mesh>

                {/* İç Yüzey (Ters Yönlü - İçi Boş Yapmak İçin) */}
                <mesh position={[0, 0, -0.12]} scale={[1, 1, 1]}>
                    <extrudeGeometry args={[scrollShapeInner, { depth: 0.22, bevelEnabled: false }]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.1} side={THREE.BackSide} />
                </mesh>

                {/* HAVA ÇIKIŞ AĞZI (KARE FORM - SADECE MONTAJ DELİKLERİ) */}
                <group position={[0.58, 0.26, -0.01]} rotation={[0, Math.PI / 2, 0]}>
                    {/* Dış Çerçeve */}
                    <mesh>
                        <boxGeometry args={[0.45, 0.45, 0.002]} />
                        <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.1} />
                    </mesh>
                    {/* İç Boşluk */}
                    <mesh position={[0, 0, 0.001]}>
                        <boxGeometry args={[0.43, 0.43, 0.004]} />
                        <meshStandardMaterial color="#000000" transparent opacity={0} />
                    </mesh>
                    {/* Montaj Delikleri (Fastener'lar Kaldırıldı) */}
                    {[
                        [0.18, 0.18, 0],
                        [-0.18, 0.18, 0],
                        [0.18, -0.18, 0],
                        [-0.18, -0.18, 0]
                    ].map((pos, i) => (
                        <mesh key={i} position={pos as [number, number, number]}>
                            <cylinderGeometry args={[0.018, 0.018, 0.006, 16]} />
                            <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.1} />
                        </mesh>
                    ))}
                </group>

                {/* EMİŞ ÜNİTESİ (BAKIR + IZGARA + CLAMPS) */}
                <group position={[0, 0, 0.1]}>

                    {/* 1. Bakır Ünitesi */}
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

                    {/* 2. Siyah Tel Izgara (HİZALANMIŞ - En Dış 0.20) */}
                    <group position={[0, 0, 0.02]}>
                        {/* Konsentrik Halkalar - İYİLEŞTİRİLMİŞ (5 Halka) */}
                        {[
                            { r: 0.04, z: 0.045 },
                            { r: 0.08, z: 0.040 },
                            { r: 0.12, z: 0.032 },
                            { r: 0.16, z: 0.024 },
                            { r: 0.20, z: 0.018 }  // En dış - Vidalarla hizalı
                        ].map((ring, i) => (
                            <mesh key={`ring-${i}`} position={[0, 0, ring.z]}>
                                <torusGeometry args={[ring.r, 0.003, 12, 64]} />
                                <meshStandardMaterial color="#0a0a0a" metalness={0.2} roughness={0.85} />
                            </mesh>
                        ))}

                        {/* Radyal Teller - İYİLEŞTİRİLMİŞ (12 Adet) */}
                        {Array.from({ length: 12 }, (_, i) => i * 30).map((angle, i) => (
                            <group key={`radial-${i}`} rotation={[0, 0, angle * Math.PI / 180]}>
                                <mesh position={[0.12, 0, 0.028]} rotation={[0, 0.12, 0]}>
                                    <boxGeometry args={[0.24, 0.003, 0.003]} />
                                    <meshStandardMaterial color="#0a0a0a" metalness={0.2} roughness={0.85} />
                                </mesh>
                            </group>
                        ))}
                    </group>

                    {/* 3. Bağlantı Elemanları (HİZALANMIŞ - 0.21 Radius) */}
                    {[30, 150, 270].map((angle, i) => (
                        <group
                            key={`clamp-${i}`}
                            position={[
                                Math.cos(angle * Math.PI / 180) * 0.21, // BAKIR ORTA EKSENİ
                                Math.sin(angle * Math.PI / 180) * 0.21,
                                0.028 // Izgara yüksekliğine göre
                            ]}
                            rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}
                        >
                            <StandardFastener position={[0, 0, 0]} />

                            {/* Sıkıştırma Pulu */}
                            <mesh position={[0, 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.014, 0.014, 0.001, 16]} />
                                <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.3} />
                            </mesh>
                        </group>
                    ))}
                </group>

                {/* %100 STATİK - MÜHENDİSLİK HASSASLIĞI */}
            </group>

        </group>
    )
}

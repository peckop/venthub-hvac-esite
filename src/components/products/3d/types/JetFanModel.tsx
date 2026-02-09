import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const JetFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // OTOPARK JET FAN (Referans: Kullanıcı Resimleri - DÜZELTME)
    // - Sol taraf: DAMPER KANATLARI (3-4 adet yatay kanat)
    // - Sağ taraf: Radyal mazgal ızgara
    // - Pervane: TAM ORTADA (merkezde)
    // - Montaj: TAVAN ASMA APARATLARI (yukarı doğru)

    useFrame((state, delta) => {
        if (fanRef.current) {
            // Pervanenin fan ekseninde (Y) dönmesi sağlanmalı.
            fanRef.current.rotation.y -= delta * 25
        }
    })

    // Turuncu Parlak Materyal
    const orangeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#FF6600',
        metalness: 0.6,
        roughness: 0.2,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide
    }), [])

    // Gri Elektrik Kutusu Materyali
    const greyBoxMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#9CA3AF',
        metalness: 0.3,
        roughness: 0.7,
    }), [])

    return (
        <group position={[0, -0.2, 0]} scale={[1, 1, 1]} rotation={[0, -Math.PI / 4, 0]}>

            {/* A. ANA SİLİNDİRİK GÖVDE (Turuncu - Üç Bölümlü KAYNAKLI BİRLEŞİM) */}
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. Sol Bölüm (Giriş Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, 0.65, 0]} material={orangeMaterial}>
                    <cylinderGeometry args={[0.32, 0.32, 0.8, 64, 1, true]} />
                </mesh>

                {/* Flanş 1: Sol-Orta Birleşimi */}
                <mesh position={[0, 0.25, 0]} material={orangeMaterial}>
                    <cylinderGeometry args={[0.34, 0.34, 0.03, 64]} />
                </mesh>

                {/* 2. Orta Bölüm (Motor Bölümü - KÜÇÜK ÇAP - Açık Uçlu) */}
                <mesh position={[0, 0, 0]} material={orangeMaterial}>
                    <cylinderGeometry args={[0.28, 0.28, 0.5, 64, 1, true]} />
                </mesh>

                {/* Flanş 2: Orta-Sağ Birleşimi */}
                <mesh position={[0, -0.25, 0]} material={orangeMaterial}>
                    <cylinderGeometry args={[0.34, 0.34, 0.03, 64]} />
                </mesh>

                {/* 3. Sağ Bölüm (Çıkış Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, -0.65, 0]} material={orangeMaterial}>
                    <cylinderGeometry args={[0.32, 0.32, 0.8, 64, 1, true]} />
                </mesh>

                {/* Sac Et Kalınlığı (Uçlardaki Yuvarlatılmış Kenarlar) */}
                <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.32, 0.006, 8, 64]} />
                    <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.2} />
                </mesh>
                <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.32, 0.006, 8, 64]} />
                    <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.2} />
                </mesh>

                {/* --- SOL TARAF: İÇ KANATLAR (YATAY - Fotoğraftaki Gibi) --- */}
                <group position={[0, 1.05, 0]}>
                    {/* 3 Adet Kanat - Orta Hattan Aşağıya, Yuvarlak Kesite Uygun (Chord length) */}
                    {[0, -0.12, -0.22].map((xVal, k) => {
                        const r = 0.31;
                        const w = 2 * Math.sqrt(Math.max(0, r * r - xVal * xVal));
                        return (
                            <mesh key={k} position={[xVal, -0.12, 0]}>
                                <boxGeometry args={[0.015, 0.25, w]} />
                                <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.3} />
                            </mesh>
                        );
                    })}
                </group>

                {/* --- SAĞ MAZGAL IZGARA (Dairesel Tel Koruma) --- */}
                <group position={[0, -1.05, 0]}>

                    {/* Radyal Koruma Telleri */}
                    {Array(8).fill(0).map((_, k) => (
                        <mesh key={k} rotation={[0, (k / 8) * Math.PI, 0]}>
                            <boxGeometry args={[0.64, 0.01, 0.006]} />
                            <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.3} />
                        </mesh>
                    ))}

                    {/* Dairesel Halka Telleri (3 Adet) */}
                    {[0.12, 0.2, 0.28].map((radius, k) => (
                        <mesh key={`ring-${k}`} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[radius, 0.006, 8, 32]} />
                            <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.3} />
                        </mesh>
                    ))}

                </group>

            </group>

            {/* B. GRİ ELEKTRİK KUTUSU (Saat Yönü Tersine 30 Derece Kaydırılmış +30°) */}
            <group
                position={[0, 0.303, 0.175]}
                rotation={[0.523, 0, 0]} // +30 derece (saat yönü tersi)
            >
                {/* Ana Kutu Gövdesi */}
                <mesh material={greyBoxMaterial}>
                    <boxGeometry args={[0.16, 0.14, 0.10]} />
                </mesh>

                {/* Kapak Vidaları */}
                {[0.065, -0.065].map(bx => [0.05, -0.05].map(by => (
                    <mesh key={`${bx}-${by}`} position={[bx, by, 0.051]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.012, 8]} />
                        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
                    </mesh>
                )))}
            </group>

            {/* Kablo Giriş Rakoru ve Esnek Boru (Tam Üstte - Sacın İçine Giren Yer) */}
            <group position={[0, 0.28, 0]}>
                {/* Boru Giriş Rakoru (Buhat Girişi) */}
                <mesh position={[0, 0.03, 0]}>
                    <cylinderGeometry args={[0.02, 0.025, 0.06, 16]} />
                    <meshStandardMaterial color="#1F2937" metalness={0.5} roughness={0.6} />
                </mesh>

                {/* Esnek Kablo Borusu (Tepeden Kutuyu Bağlayan) */}
                <group position={[0, 0.06, 0]}>
                    <FlexibleCable />
                </group>
            </group>

            {/* C. TAVAN ASMA APARATLARI (Yukarı Doğru) */}
            {/* C. MONTAJ AYAKLARI (L-Profil - Zemin ve Tavan İçin) */}
            {/* Ön ve Arka her iki yanda toplam 4 ayak - Orta bölüme yakın */}
            {[-0.35, 0.35].map((xPos) => (
                <group key={xPos} position={[xPos, 0, 0]}>
                    {/* Sağ ve Sol Ayak Takımı */}
                    {[-0.22, 0.22].map((zPos) => (
                        <group key={zPos} position={[0, -0.28, zPos]}>
                            {/* Dikey Bağlantı Parçası (Gövdeye bağlı) */}
                            <mesh position={[0, 0, 0]}>
                                <boxGeometry args={[0.08, 0.12, 0.015]} />
                                <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.3} />
                            </mesh>
                            {/* Yatay Sabitleme Parçası (L'nin alt kısmı) */}
                            <mesh position={[0, -0.06, zPos > 0 ? 0.04 : -0.04]}>
                                <boxGeometry args={[0.08, 0.015, 0.08]} />
                                <meshStandardMaterial color="#FF6600" metalness={0.6} roughness={0.3} />
                            </mesh>
                            {/* Montaj Delikleri (Siyah Noktalar) */}
                            <mesh position={[0, -0.061, zPos > 0 ? 0.05 : -0.05]}>
                                <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
                                <meshStandardMaterial color="#1F2937" />
                            </mesh>
                        </group>
                    ))}
                </group>
            ))}

            {/* D. İÇ PERVANE (Rotor) - Sadece Tam Ortada */}
            <group ref={fanRef} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                {/* Pervane Göbeği */}
                <mesh material={materials.brushedAluminum}>
                    <cylinderGeometry args={[0.12, 0.12, 0.1, 32]} />
                </mesh>

                {/* Pervane Kanatları (8 Adet - Siyah) */}
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.17, 0, 0]}>
                        <boxGeometry args={[0.20, 0.012, 0.06]} />
                        <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.3} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

// Yardımcı: Esnek Kablo Borusu
const FlexibleCable = () => {
    const path = useMemo(() => {
        // Giriş noktasından (0,0,0) başlayıp +30 derece kaymış kutuya (0, 0.05, 0.175) giden kavis
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.04, 0.05),
            new THREE.Vector3(0, 0.06, 0.12),
            new THREE.Vector3(0, 0.06, 0.175),
        ])
        return curve
    }, [])

    return (
        <mesh>
            <tubeGeometry args={[path, 20, 0.012, 8, false]} />
            <meshStandardMaterial color="#1F2937" metalness={0.4} roughness={0.7} />
        </mesh>
    )
}

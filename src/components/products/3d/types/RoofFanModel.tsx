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
        color: '#3B3F45', // Vortice antrasit gri
        metalness: 0.55,
        roughness: 0.40,
        envMapIntensity: 1.0,
    }), [])

    const matteBlackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0F172A', // Slate-900 derin siyah
        metalness: 0.4,
        roughness: 0.6,
    }), [])

    // Kanat materyali (siyah metalik)
    const bladeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#111827',
        metalness: 0.85,
        roughness: 0.15,
        side: THREE.DoubleSide,
    }), [])

    // Vortice Logo Texture (Gerçek Görsel Yükle)
    const logoTexture = useMemo(() => {
        const loader = new THREE.TextureLoader()
        const texture = loader.load(
            `/Vortice_logo.png?v=${Date.now()}`,
            undefined,
            undefined,
            (error) => {
                console.warn('Vortice logo yüklenemedi, fallback kullanılıyor:', error)
            }
        )
        texture.anisotropy = 16
        return texture
    }, [])

    return (
        <group scale={[0.85, 0.85, 0.85]}>

            {/* 1. ALT KAİDE VE TEKNİK ŞASİ (Revize Boyutlar: 1.42m / 10cm Kalınlık) */}
            <mesh position={[0, 0.05, 0]} material={matteBlackMaterial}>
                <boxGeometry args={[1.42, 0.10, 1.42]} />
            </mesh>

            {/* Hava Giriş Flanşı */}
            <mesh position={[0, 0.005, 0]} material={matteBlackMaterial}>
                <cylinderGeometry args={[0.28, 0.32, 0.01, 32]} />
            </mesh>
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matteBlackMaterial}>
                <circleGeometry args={[0.24, 32]} />
            </mesh>

            {/* Zemin Montaj Civataları (4 Köşede - Revize Konum) */}
            {[
                [0.64, 0.64], [-0.64, 0.64], [-0.64, -0.64], [0.64, -0.64]
            ].map((pos, i) => (
                <mesh key={`corner-bolt-${i}`} position={[pos[0], 0.105, pos[1]]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
                </mesh>
            ))}

            {/* Kafes Lamaları İçin Zemin Bağlantı Somunları (4 Ana Eksen - Köşelere Hizalı 45 Derece) */}



            {/* Statik Emiş Boğazı - Plug Fan Inlet Lip'e TEMAS (Kaynak) */}
            <group position={[0, 0.1, 0]}>
                <mesh position={[0, 0.12, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.24, 0.28, 0.24, 64, 1, true]} />
                </mesh>
            </group>

            {/* 2. TEKNİK IZGARA (Tel Kafes) - Revize Edilmiş Geniş Çap ve Detaylar */}
            <group position={[0, 0.325, 0]}>
                {/* 4 Ana Taşıyıcı Lama (Flat Bars) - Köşelere Hizalı (45 Derece) ve Teğet Geniş Yüzey */}
                {[Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].map((rot, i) => (
                    <group key={`support-${i}`} rotation={[0, rot, 0]}>
                        {/* Lama Gövdesi (Teğet Genişlik: 45mm, Radyal Kalınlık: 10mm) */}
                        <mesh position={[0.67, 0, 0]}>
                            <boxGeometry args={[0.01, 0.51, 0.045]} />
                            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
                        </mesh>
                        {/* L-Büküm Ayak (Zemine Basan Kıvrım) - DIŞA Doğru 8cm */}
                        <mesh position={[0.71, -0.22, 0]}>
                            <boxGeometry args={[0.08, 0.01, 0.045]} />
                            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
                        </mesh>
                        {/* L-Ayak Montaj Civatası (Zemine Sabitleme) */}
                        <group position={[0.73, -0.20, 0]}>
                            <mesh>
                                <cylinderGeometry args={[0.02, 0.02, 0.03, 6]} />
                                <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
                            </mesh>
                            <mesh position={[0, 0.02, 0]}>
                                <cylinderGeometry args={[0.01, 0.01, 0.02, 16]} />
                                <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.5} />
                            </mesh>
                        </group>
                        {/* Lama Montaj Civataları (Üst-Orta-Alt) */}
                        {[0.20, 0, -0.20].map((y, j) => (
                            <mesh key={`bolt-${i}-${j}`} position={[0.68, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.008, 0.008, 0.015, 6]} />
                                <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* İnce Dikey Teller (Sayısı artırıldı: 64 adet) */}
                {Array(64).fill(0).map((_, i) => {
                    // Lamalara denk gelen yerleri atla (Her 16 telde bir)
                    if (i % 16 === 0) return null

                    const angle = (i / 64) * Math.PI * 2
                    const r = 0.665 // Lamaların hemen içinden geçecek
                    return (
                        <mesh
                            key={`wire-${i}`}
                            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
                        >
                            <cylinderGeometry args={[0.002, 0.002, 0.51, 4]} />
                            <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
                        </mesh>
                    )
                })}

                {/* Yatay Destek Halkaları (Çap Shroud ile uyumlu) */}
                {Array(8).fill(0).map((_, k) => (
                    <mesh key={`ring-${k}`} position={[0, -0.20 + k * 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.665, 0.002, 8, 64]} />
                        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
                    </mesh>
                ))}
            </group>

            {/* ===== 3. PLUG FAN (BACKWARD CURVED CENTRIFUGAL IMPELLER) ===== */}
            {/* ===== 3. PLUG FAN (BACKWARD CURVED CENTRIFUGAL IMPELLER) - Yüksek Performanslı (H=2x) ===== */}
            <group ref={rotorRef} position={[0, 0.495, 0]}>

                {/* --- ARKA PLAKA (Back Plate / Hub Plate) - Yükseltilmiş --- */}
                <mesh position={[0, 0.28, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.40, 0.40, 0.012, 64]} />
                </mesh>

                {/* --- ÖN PLAKA (Inlet Shroud) - Alçaltılmış --- */}
                <mesh position={[0, -0.28, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.28, 0.40, 0.012, 64]} />
                </mesh>
                {/* Kavisli emiş dudağı (inlet lip) */}
                <mesh position={[0, -0.30, 0]} material={matteBlackMaterial}>
                    <cylinderGeometry args={[0.24, 0.28, 0.04, 64, 1, true]} />
                </mesh>

                {/* --- MOTOR GÖBEĞİ (Hub) - Uzatılmış --- */}
                <mesh material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.055, 0.055, 0.56, 32]} />
                </mesh>
                {/* Göbek flanşı */}
                <mesh position={[0, 0.27, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
                </mesh>

                {/* --- 9 ADET BACKWARD-CURVED KANAT (Yüksekliği Artırılmış) --- */}
                {Array(9).fill(0).map((_, i) => {
                    const baseAngle = (i / 9) * Math.PI * 2
                    return (
                        <group key={`blade-${i}`} rotation={[0, baseAngle, 0]}>
                            {/* Segment 1: Hub yakını */}
                            <mesh position={[0.125, 0, 0]} rotation={[0, -0.10, 0]} material={bladeMaterial}>
                                <boxGeometry args={[0.10, 0.54, 0.008]} />
                            </mesh>
                            {/* Segment 2: İç orta */}
                            <mesh position={[0.21, 0, 0.015]} rotation={[0, -0.28, 0]} material={bladeMaterial}>
                                <boxGeometry args={[0.11, 0.54, 0.008]} />
                            </mesh>
                            {/* Segment 3: Dış orta */}
                            <mesh position={[0.30, 0, 0.045]} rotation={[0, -0.50, 0]} material={bladeMaterial}>
                                <boxGeometry args={[0.11, 0.54, 0.008]} />
                            </mesh>
                            {/* Segment 4: Dış kenar */}
                            <mesh position={[0.37, 0, 0.09]} rotation={[0, -0.72, 0]} material={bladeMaterial}>
                                <boxGeometry args={[0.10, 0.54, 0.008]} />
                            </mesh>
                        </group>
                    )
                })}
            </group>


            {/* 4. & 5. YEKPARE GÖVDE (Shroud + Koni + Radyüs) */}
            <mesh position={[0, 0, 0]} material={darkGreyMaterial}>
                <latheGeometry args={[
                    useMemo(() => [
                        new THREE.Vector2(0.69, 0.58),  // Shroud eteği alt (DIŞA AÇILI/KONİK)
                        new THREE.Vector2(0.65, 0.76),  // Shroud eteği üst
                        new THREE.Vector2(0.60, 0.80),  // Yumuşak geçiş radyüsü 1
                        new THREE.Vector2(0.38, 0.86),  // Yumuşak geçiş radyüsü 2 (Koniye bağlanış)
                        new THREE.Vector2(0.22, 1.28),  // Koni üst
                    ], []),
                    64
                ]} />
            </mesh>

            {/* Shroud üzerindeki L-Braketler (Tek parça döküm üzerinde montaj detayları) */}
            <group position={[0, 0.6625, 0]}>
                {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
                    <group key={`clip-${i}`} rotation={[0, rot, 0]}>
                        <mesh position={[0.64, 0.04, 0]} material={materials.industrialSteel}>
                            <boxGeometry args={[0.05, 0.02, 0.04]} />
                        </mesh>
                        <mesh position={[0.66, 0.08, 0]} material={materials.industrialSteel}>
                            <boxGeometry args={[0.02, 0.08, 0.04]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Vortice Kurumsal Logo (CANVAS TEXTURE - Konik Yüzeye Sıfır Temas - Clipping Fix) */}
            <group position={[0, 1.02, 0.33]} rotation={[-0.36, 0, 0]}>
                <mesh>
                    <planeGeometry args={[0.14, 0.14]} />
                    {logoTexture && <meshStandardMaterial map={logoTexture} transparent={false} side={THREE.DoubleSide} />}
                    {!logoTexture && <meshStandardMaterial color="#008C45" />}
                </mesh>
            </group>

            {/* Gösterge Ünitesi (EŞ MERKEZLİ: Beyaz halka + Kırmızı delik - Konik Yüzeye Sıfır Temas - Clipping Fix) */}
            <group position={[0, 0.90, 0.38]} rotation={[-0.36, 0, 0]}>
                <mesh>
                    <circleGeometry args={[0.035, 32]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[0, 0, 0.005]}>
                    <circleGeometry args={[0.02, 32]} />
                    <meshStandardMaterial color="#EF4444" />
                </mesh>
                <mesh position={[0, 0, 0.010]}>
                    <circleGeometry args={[0.008, 16]} />
                    <meshStandardMaterial color="#111827" />
                </mesh>
            </group>

            {/* 6. ÜST BİTİŞ KAPAĞI - Vida Detaylı */}
            <group position={[0, 1.28, 0]}>
                <mesh position={[0, 0.01, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.208, 0.208, 0.03, 64]} />
                </mesh>
                <mesh position={[0, 0.06, 0]} material={darkGreyMaterial}>
                    <cylinderGeometry args={[0.224, 0.224, 0.08, 64]} />
                </mesh>

                {/* Üst Kapak Montaj Vidaları (6 Adet) */}
                {Array(6).fill(0).map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2
                    return (
                        <mesh key={`top-bolt-${i}`} position={[Math.cos(angle) * 0.18, 0.101, Math.sin(angle) * 0.18]}>
                            <cylinderGeometry args={[0.006, 0.006, 0.005, 12]} />
                            <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
                        </mesh>
                    )
                })}

                {/* Eyebolts (Taşıma Halkaları) */}
                {[-0.10, 0.10].map((x, i) => (
                    <mesh key={`eyebolt-${i}`} position={[x, 0.10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.02, 0.005, 12, 24]} />
                        <meshStandardMaterial color="#3B3F45" metalness={0.4} roughness={0.6} />
                    </mesh>
                ))}
            </group>
        </group >
    )
}




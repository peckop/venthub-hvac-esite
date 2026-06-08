"use client";
import { useFrame } from '@react-three/fiber'
import React, { useMemo,useRef } from 'react'
import * as THREE from 'three'

import { type FanMaterials,useFanMaterials } from '../materials/useFanMaterials'

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
            fanRef.current.rotation.y -= delta * 25
        }
    })

    return (
        <group scale={[0.9, 0.9, 0.9]} rotation={[0, -Math.PI / 4, 0]}>

            {/* A. ANA SİLİNDİRİK GÖVDE (Turuncu - Üç Bölümlü KAYNAKLI BİRLEŞİM) */}
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. Sol Bölüm (Giriş Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, 0.65, 0]} material={materials.jetOrange}>
                    <cylinderGeometry args={[0.32, 0.32, 0.8, 64, 1, true]} />
                </mesh>

                {/* Flanş 1: Sol-Orta Birleşimi */}
                <mesh position={[0, 0.25, 0]} material={materials.jetOrange}>
                    <cylinderGeometry args={[0.34, 0.34, 0.03, 64]} />
                </mesh>

                {/* 2. Orta Bölüm (Motor Bölümü - KÜÇÜK ÇAP - Açık Uçlu) */}
                <mesh position={[0, 0, 0]} material={materials.jetOrange}>
                    <cylinderGeometry args={[0.28, 0.28, 0.5, 64, 1, true]} />
                </mesh>

                {/* Flanş 2: Orta-Sağ Birleşimi */}
                <mesh position={[0, -0.25, 0]} material={materials.jetOrange}>
                    <cylinderGeometry args={[0.34, 0.34, 0.03, 64]} />
                </mesh>

                {/* 3. Sağ Bölüm (Çıkış Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, -0.65, 0]} material={materials.jetOrange}>
                    <cylinderGeometry args={[0.32, 0.32, 0.8, 64, 1, true]} />
                </mesh>

                {/* Sac Et Kalınlığı (Uçlardaki Yuvarlatılmış Kenarlar) */}
                <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange}>
                    <torusGeometry args={[0.32, 0.006, 8, 64]} />
                </mesh>
                <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange}>
                    <torusGeometry args={[0.32, 0.006, 8, 64]} />
                </mesh>

                {/* --- SOL TARAF: İÇ KANATLAR (YATAY - Fotoğraftaki Gibi) --- */}
                <group position={[0, 1.05, 0]}>
                    {[0, -0.12, -0.22].map((xVal, k) => {
                        const r = 0.31;
                        const w = 2 * Math.sqrt(Math.max(0, r * r - xVal * xVal));
                        return (
                            <mesh key={k} position={[xVal, -0.12, 0]} material={materials.jetOrange}>
                                <boxGeometry args={[0.015, 0.25, w]} />
                            </mesh>
                        );
                    })}
                </group>

                {/* --- SAĞ MAZGAL IZGARA (Dairesel Tel Koruma) --- */}
                <group position={[0, -1.05, 0]}>
                    {Array(8).fill(0).map((_, k) => (
                        <mesh key={k} rotation={[0, (k / 8) * Math.PI, 0]} material={materials.jetOrange}>
                            <boxGeometry args={[0.64, 0.01, 0.006]} />
                        </mesh>
                    ))}
                    {[0.12, 0.2, 0.28].map((radius, j) => (
                        <mesh key={`ring-${j}`} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange}>
                            <torusGeometry args={[radius, 0.006, 8, 32]} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* B. GRİ ELEKTRİK KUTUSU */}
            <group position={[0, 0.303, 0.175]} rotation={[0.523, 0, 0]}>
                <mesh material={materials.greyBox}>
                    <boxGeometry args={[0.16, 0.14, 0.10]} />
                </mesh>
                {[0.065, -0.065].map(bx => [0.05, -0.05].map(by => (
                    <mesh key={`${bx}-${by}`} position={[bx, by, 0.051]} material={materials.matteBlack}>
                        <cylinderGeometry args={[0.006, 0.006, 0.012, 8]} />
                    </mesh>
                )))}
            </group>

            {/* Kablo Giriş Rakoru */}
            <group position={[0, 0.28, 0]}>
                <mesh position={[0, 0.03, 0]} material={materials.cableGrey}>
                    <cylinderGeometry args={[0.02, 0.025, 0.06, 16]} />
                </mesh>
                <group position={[0, 0.06, 0]}>
                    <FlexibleCable materials={materials} />
                </group>
            </group>

            {/* C. MONTAJ AYAKLARI */}
            {[-0.35, 0.35].map((xPos) => (
                <group key={xPos} position={[xPos, 0, 0]}>
                    {[-0.22, 0.22].map((zPos) => (
                        <group key={zPos} position={[0, -0.28, zPos]}>
                            <mesh position={[0, 0, 0]} material={materials.jetOrange}>
                                <boxGeometry args={[0.08, 0.12, 0.015]} />
                            </mesh>
                            <mesh position={[0, -0.06, zPos > 0 ? 0.04 : -0.04]} material={materials.jetOrange}>
                                <boxGeometry args={[0.08, 0.015, 0.08]} />
                            </mesh>
                            <mesh position={[0, -0.061, zPos > 0 ? 0.05 : -0.05]} material={materials.cableGrey}>
                                <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
                            </mesh>
                        </group>
                    ))}
                </group>
            ))}

            {/* D. İÇ PERVANE (Rotor) */}
            <group ref={fanRef} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <mesh material={materials.brushedAluminum}>
                    <cylinderGeometry args={[0.12, 0.12, 0.1, 32]} />
                </mesh>
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.17, 0, 0]} material={materials.cableGrey}>
                        <boxGeometry args={[0.20, 0.012, 0.06]} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

const FlexibleCable = ({ materials }: { materials: FanMaterials }) => {
    const path = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.04, 0.05),
            new THREE.Vector3(0, 0.06, 0.12),
            new THREE.Vector3(0, 0.06, 0.175),
        ])
    }, [])

    return (
        <mesh material={materials.cableGrey}>
            <tubeGeometry args={[path, 20, 0.012, 8, false]} />
        </mesh>
    )
}

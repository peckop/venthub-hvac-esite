"use client";
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export function AxialFanModel() {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // BVN REFERENCE STYLE REDESIGN
    // 1. All Black (Glossy/Painted Steel).
    // 2. 7 Sickle Blades (Black).
    // 3. Red Hub Center (Logo area).
    // 4. Dense Wire Guard (Spiral/Concentric).

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    // REFINED SICKLE BLADE GEOMETRY (BVN Style) - Memoized to prevent leaks
    const bladeGeometry = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0)
        // Leading Edge (Hücum Kenarı) - Dışa doğru kavis
        shape.bezierCurveTo(0.1, 0.15, 0.25, 0.22, 0.36, 0.10)
        // Tip (Uç) - Geriye doğru kıvrım
        shape.bezierCurveTo(0.38, 0.05, 0.38, -0.15, 0.35, -0.15)
        // Trailing Edge (Firar Kenarı) - Göbeğe dönüş
        shape.bezierCurveTo(0.25, -0.12, 0.1, -0.08, 0, -0.05)

        const extrudeSettings = {
            depth: 0.015,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 2
        }
        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    return (
        <group position={[0, 0, 0]} scale={[0.85, 0.85, 0.85]} rotation={[0, -Math.PI / 4, 0]}>

            {/* 1. SİLİNDİRİK KOVAN (Black Casing) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={materials.glossyBlack}>
                    <cylinderGeometry args={[0.55, 0.55, 0.5, 64, 1, true]} />
                </mesh>

                {/* Ön ve Arka Flanşlar (Kıvrımlar) */}
                {[0.25, -0.25].map((y, i) => (
                    <group key={i} position={[0, y, 0]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.glossyBlack}>
                            {/* Dışa doğru genişleyen flanş */}
                            <ringGeometry args={[0.55, 0.60, 64]} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 2. MOTOR VE PERVANE (Black & Red) */}
            <group position={[0, 0, 0]}>

                {/* --- PERVANE GRUBU (Dönen Kısım) --- */}
                <group ref={fanRef} position={[0, 0, 0.05]}>
                    {/* Pervane Göbeği (Siyah) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.bladeBlack}>
                        <cylinderGeometry args={[0.16, 0.16, 0.06, 32]} />
                    </mesh>

                    {/* Marka Logosu (Kırmızı Daire) */}
                    <mesh position={[0, 0, 0.031]} rotation={[Math.PI / 2, 0, 0]} material={materials.logoRed}>
                        <circleGeometry args={[0.08, 32]} />
                    </mesh>

                    {/* 7 ADET SİYAH ORAK KANAT */}
                    {Array(7).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
                            <mesh
                                geometry={bladeGeometry}
                                position={[0.14, 0, -0.01]} // Göbeğe montaj
                                rotation={[0.45, 0.15, -0.15]} // Pitch açısı (Hava itme)
                                material={materials.bladeBlack}
                            />
                        </group>
                    ))}
                </group>

                {/* Sabit Motor (Arka) */}
                <group position={[0, 0, -0.1]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.glossyBlack}>
                        <cylinderGeometry args={[0.18, 0.18, 0.25, 32]} />
                    </mesh>
                    {/* Motor Ayakları (3 Kollu) */}
                    {[0, 120, 240].map((angle, i) => (
                        <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0, 0.28, 0]} material={materials.glossyBlack}>
                            <boxGeometry args={[0.04, 0.25, 0.02]} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* 3. TEL KAFES (Dense Wire Guard) - SIKI ARALIKLI */}
            {/* Resimdeki gibi çok sayıda halka */}
            <group position={[0, 0, 0.26]}>
                {/* Konsantrik Halkalar (8 Adet) */}
                {Array(8).fill(0).map((_, i) => {
                    const r = 0.1 + (i * 0.065) // 0.1'den 0.55'e kadar
                    return (
                        <mesh key={`ring-${i}`} material={materials.matteBlack}>
                            <ringGeometry args={[r, r + 0.008, 64]} />
                        </mesh>
                    )
                })}
                {/* Radyal Teller (Haç şeklinde veya yıldız) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, j) => (
                    <mesh key={`radial-${j}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.matteBlack}>
                        <boxGeometry args={[1.1, 0.008, 0.005]} />
                    </mesh>
                ))}
            </group>

            {/* 4. KLEMENS KUTUSU (Üstte Siyah) */}
            <group position={[0.4, 0.35, 0.1]} rotation={[0, 0, 0.2]}>
                <mesh material={materials.glossyBlack}>
                    <boxGeometry args={[0.12, 0.15, 0.08]} />
                </mesh>
                <mesh position={[0, -0.08, 0]} material={materials.glossyBlack}>
                    <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
                </mesh>
            </group>

        </group>
    )
}

"use client";
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'



export function AxialFanModel() {
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

    // Custom Glossy Black Material (Painted Metal)
    const glossyBlack = new THREE.MeshStandardMaterial({
        color: '#111111',
        roughness: 0.3,
        metalness: 0.5,
        side: THREE.DoubleSide
    })

    const bladeBlack = new THREE.MeshStandardMaterial({
        color: '#0f172a', // Slightly bluish black for blades
        roughness: 0.2,
        metalness: 0.2,
        side: THREE.DoubleSide
    })

    const logoRed = new THREE.MeshStandardMaterial({
        color: '#dc2626', // Red-600
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    })

    // REFINED SICKLE BLADE GEOMETRY (BVN Style)
    // Daha agresif kavisli ve uca doğru sivrilen yapı
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    // Leading Edge (Hücum Kenarı) - Dışa doğru kavis
    shape.bezierCurveTo(0.1, 0.15, 0.25, 0.22, 0.36, 0.10)
    // Tip (Uç) - Geriye doğru kıvrım
    shape.bezierCurveTo(0.38, 0.05, 0.38, -0.05, 0.35, -0.15)
    // Trailing Edge (Firar Kenarı) - Göbeğe dönüş
    shape.bezierCurveTo(0.25, -0.12, 0.1, -0.08, 0, -0.05)

    const extrudeSettings = {
        depth: 0.015, // İnce sac/plastik kanat
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelSegments: 2
    }
    const bladeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

    return (
        <group position={[0, 0, 0]} scale={[0.85, 0.85, 0.85]} rotation={[0, -Math.PI / 4, 0]}>

            {/* 1. SİLİNDİRİK KOVAN (Black Casing) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={glossyBlack}>
                    <cylinderGeometry args={[0.55, 0.55, 0.5, 64, 1, true]} />
                </mesh>

                {/* Ön ve Arka Flanşlar (Kıvrımlar) */}
                {[0.25, -0.25].map((y, i) => (
                    <group key={i} position={[0, y, 0]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]} material={glossyBlack}>
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
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={bladeBlack}>
                        <cylinderGeometry args={[0.16, 0.16, 0.06, 32]} />
                    </mesh>

                    {/* Marka Logosu (Kırmızı Daire) */}
                    <mesh position={[0, 0, 0.031]} rotation={[Math.PI / 2, 0, 0]} material={logoRed}>
                        <circleGeometry args={[0.08, 32]} />
                    </mesh>

                    {/* 7 ADET SİYAH ORAK KANAT */}
                    {Array(7).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
                            <mesh
                                geometry={bladeGeometry}
                                position={[0.14, 0, -0.01]} // Göbeğe montaj
                                rotation={[0.45, 0.15, -0.15]} // Pitch açısı (Hava itme)
                                material={bladeBlack}
                            />
                        </group>
                    ))}
                </group>

                {/* Sabit Motor (Arka) */}
                <group position={[0, 0, -0.1]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={glossyBlack}>
                        <cylinderGeometry args={[0.18, 0.18, 0.25, 32]} />
                    </mesh>
                    {/* Motor Ayakları (3 Kollu) */}
                    {[0, 120, 240].map((angle, i) => (
                        <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0, 0.28, 0]} material={glossyBlack}>
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
                        <mesh key={`ring-${i}`}>
                            <ringGeometry args={[r, r + 0.008, 64]} />
                            <meshStandardMaterial color="#000" roughness={0.5} side={THREE.DoubleSide} />
                        </mesh>
                    )
                })}
                {/* Radyal Teller (Haç şeklinde veya yıldız) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <mesh key={`radial-${i}`} rotation={[0, 0, angle * Math.PI / 180]}>
                        <boxGeometry args={[1.1, 0.008, 0.005]} />
                        <meshStandardMaterial color="#000" roughness={0.5} side={THREE.DoubleSide} />
                    </mesh>
                ))}
            </group>

            {/* 4. KLEMENS KUTUSU (Üstte Siyah) */}
            <group position={[0.4, 0.35, 0.1]} rotation={[0, 0, 0.2]}>
                <mesh material={glossyBlack}>
                    <boxGeometry args={[0.12, 0.15, 0.08]} />
                </mesh>
                <mesh position={[0, -0.08, 0]} material={glossyBlack}>
                    <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
                </mesh>
            </group>

        </group>
    )
}





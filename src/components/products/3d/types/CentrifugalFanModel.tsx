"use client";
import { useFrame } from '@react-three/fiber'
import React, { useMemo,useRef } from 'react'
import type { Group } from 'three'
import { ExtrudeGeometry,Shape } from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

/**
 * CentrifugalFanModel (Santrifüj Fan)
 * - Motor: Merkezi tahrik motoru
 * - Housing: Spiral/salyangoz tipi muhafaza
 * - Impeller: Radyal kanatlı, dönen pervane grubu
 */
export const CentrifugalFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const impellerRef = useRef<Group>(null)

    // Dönen pervaneyi animasyonla döndür
    useFrame((state, delta) => {
        if (impellerRef.current) {
            impellerRef.current.rotation.z -= delta * 12
        }
    })

    // İmpeller kanat geometrisi (Geriye kıvrımlı santrifüj kanatlar)
    const impellerBladeGeometry = useMemo(() => {
        const shape = new Shape()
        // Kanat profili - dış kenardan iç kenara
        shape.moveTo(0, 0.12)
        shape.quadraticCurveTo(0.18, 0.10, 0.22, 0)
        shape.quadraticCurveTo(0.18, -0.10, 0, -0.12)
        shape.lineTo(0, 0.12)

        const extrudeSettings = {
            depth: 0.03,
            bevelEnabled: true,
            bevelThickness: 0.004,
            bevelSize: 0.004,
            bevelSegments: 1
        }
        return new ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    // Spiral housing (salyangoz) profili
    const scrollShape = useMemo(() => {
        const shape = new Shape()
        shape.moveTo(0, 0.40)
        shape.lineTo(0.50, 0.40)
        shape.lineTo(0.50, 0.06)
        shape.lineTo(0.28, 0.06)
        shape.quadraticCurveTo(0.34, -0.32, 0, -0.30)
        shape.quadraticCurveTo(-0.34, -0.32, -0.38, 0)
        shape.quadraticCurveTo(-0.38, 0.40, 0, 0.40)
        return shape
    }, [])

    return (
        <group scale={[1, 1, 1]}>

            {/* 1. MOTOR GRUBU (Merkezi/Taban Montajlı) */}
            <group position={[0, -0.30, -0.25]}>
                {/* Motor Gövdesi */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialBlue}>
                    <cylinderGeometry args={[0.14, 0.14, 0.35, 32]} />
                </mesh>

                {/* Soğutma Kanatları */}
                {Array(16).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 8)]} material={materials.industrialBlue}>
                        <boxGeometry args={[0.012, 0.33, 0.32]} />
                    </mesh>
                ))}

                {/* Klemens Kutusu */}
                <group position={[0, 0.18, 0.04]}>
                    <mesh material={materials.darkGrey}>
                        <boxGeometry args={[0.12, 0.10, 0.12]} />
                    </mesh>
                </group>

                {/* Taban Montaj Plakası */}
                <group position={[0, -0.20, 0.02]}>
                    <mesh material={materials.darkGrey}>
                        <boxGeometry args={[0.28, 0.06, 0.28]} />
                    </mesh>
                    <mesh position={[0, -0.04, 0]} material={materials.darkGrey}>
                        <boxGeometry args={[0.34, 0.02, 0.34]} />
                    </mesh>
                </group>
            </group>

            {/* 2. HOUSING (Spiral/Salyangoz Muhafaza) */}
            <group position={[0, 0.05, 0]}>
                {/* Ana Spiral Gövde */}
                <mesh position={[0, 0, -0.10]} material={materials.industrialSteel}>
                    <extrudeGeometry args={[scrollShape, { depth: 0.20, bevelEnabled: false }]} />
                </mesh>

                {/* Emiş Ağzí (Üstte Dairesel) */}
                <group position={[0, 0.36, 0.12]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                        <cylinderGeometry args={[0.20, 0.18, 0.06, 64, 1, true]} />
                    </mesh>
                    <mesh position={[0, 0, 0.03]} material={materials.galvanizedSteel}>
                        <ringGeometry args={[0.18, 0.20, 64]} />
                    </mesh>
                </group>

                {/* Atış Ağzı (Yan Çıkış) */}
                <group position={[0.38, 0.22, 0]}>
                    <mesh material={materials.industrialSteel}>
                        <boxGeometry args={[0.26, 0.30, 0.20]} />
                    </mesh>
                    <mesh position={[0.13, 0, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.015, 0.36, 0.24]} />
                    </mesh>
                    {/* Çıkış Boşluğu */}
                    <mesh position={[0.01, 0.04, 0]} material={materials.matteBlack}>
                        <boxGeometry args={[0.28, 0.24, 0.16]} />
                    </mesh>
                </group>
            </group>

            {/* 3. İMPELLER GRUBU (Dönen Kanatlar) */}
            <group ref={impellerRef} position={[0, 0.05, 0]}>

                {/* İmpeller Göbek (Merkez) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.motorSilver}>
                    <cylinderGeometry args={[0.10, 0.10, 0.08, 32]} />
                </mesh>

                {/* Marka Logosu (Kırmızı) */}
                <mesh position={[0, 0, 0.041]} rotation={[Math.PI / 2, 0, 0]} material={materials.logoRed}>
                    <circleGeometry args={[0.05, 32]} />
                </mesh>

                {/* 12 Adet Geriye Kıvrımlı Kanat */}
                {Array(12).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]}>
                        <mesh
                            geometry={impellerBladeGeometry}
                            position={[0.08, 0, -0.015]}
                            rotation={[0.50, 0, 0]}
                            material={materials.bladeBlack}
                        />
                    </group>
                ))}
            </group>

            {/* 4. KORUMA IZGARASI (Emiş Tarafı) */}
            <group position={[0, 0.36, 0.18]}>
                {[0.06, 0.10, 0.14, 0.18].map((r, i) => (
                    <mesh key={`ring-${i}`} material={materials.industrialBlue}>
                        <torusGeometry args={[r, 0.002, 8, 64]} />
                    </mesh>
                ))}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.industrialBlue}>
                        <boxGeometry args={[0.36, 0.005, 0.005]} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}
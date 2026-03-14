"use client";
import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

// === FLANGE (FLANŞ) ===
interface FlangeProps {
    radius: number
    width?: number // et kalınlığı
    holes?: number // cıvata deliği sayısı
}

export const Flange: React.FC<FlangeProps> = ({ radius, holes = 8 }) => {
    const materials = useFanMaterials()

    // Delikleri simüle etmek için texture veya geometry kullanılabilir
    // Low-poly için basit Torus veya Ring kullanıyoruz

    return (
        <group>
            {/* Ana Halka */}
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                <ringGeometry args={[radius, radius + 0.1, 32]} />
            </mesh>

            {/* Cıvatalar (Instance mesh daha iyi olurdu ama sayı az) */}
            {Array(holes).fill(0).map((_, i) => {
                const angle = (i * Math.PI * 2) / holes
                const r = radius + 0.05
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * r, Math.sin(angle) * r, 0.01]}
                        rotation={[Math.PI / 2, 0, 0]}
                        material={materials.industrialSteel}
                    >
                        <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
                    </mesh>
                )
            })}
        </group>
    )
}

// === CYLINDER HOUSING (SİLİNDİRİK GÖVDE) ===
interface HousingProps { // Renamed from CylinderHousingProps
    radius: number
    length: number
    thickness?: number
    width?: number // Added for the change, will be _width
    color?: string // Added for the change
}

export const Housing: React.FC<HousingProps> = ({ radius, length, thickness = 0.02, width: _width }) => {
    const materials = useFanMaterials()

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.galvanizedSteel} castShadow receiveShadow>
                {/* openEnded: true, side: DoubleSide ile içini de gösterelim */}
                <cylinderGeometry args={[radius, radius, length, 32, 1, true]} />
                <meshStandardMaterial {...materials.galvanizedSteel} side={THREE.DoubleSide} />
            </mesh>

            {/* Gövde kalınlığı illüzyonu için uçlara halkalar */}
            <mesh position={[0, length / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                <ringGeometry args={[radius - thickness, radius, 32]} />
            </mesh>
            <mesh position={[0, -length / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                <ringGeometry args={[radius - thickness, radius, 32]} />
            </mesh>
        </group>
    )
}

// === SNAIL HOUSING (SALYANGOZ GÖVDE) ===
// Bezier curve ile salyangoz formu
export const SnailHousing: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
    const materials = useFanMaterials()

    const shape = useMemo(() => {
        const s = new THREE.Shape()

        // Salyangoz Spirali (Logaritmik spiral yaklaşımı)
        s.moveTo(0.5, 0)

        // Manuel Bezier noktaları (Basitleştirilmiş Salyangoz)
        s.bezierCurveTo(0.5, 0.5, 0.2, 0.8, -0.2, 0.8) // Sağ üstten sola
        s.bezierCurveTo(-0.6, 0.8, -0.8, 0.4, -0.8, 0) // Soldan aşağı
        s.bezierCurveTo(-0.8, -0.5, -0.4, -0.8, 0, -0.8) // Aşağıdan sağa
        s.bezierCurveTo(0.6, -0.8, 1.0, -0.2, 1.2, 0.2) // Çıkış ağzına doğru (Atış)

        // Atış ağzı (Kare çıkış)
        s.lineTo(1.4, 0.8) // Düz çıkış
        s.lineTo(0.8, 0.8) // Üst kenar
        s.lineTo(0.6, 0.2) // İçeri dönüş

        // İç dönüş (Kapanış)
        // s.lineTo(0.5, 0) // Başlangıca dön
        // Basitlik için shape'i kapatmıyoruz, extrude edeceğiz

        return s
    }, [])

    const extrudeSettings = {
        steps: 2,
        depth: 0.6,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2
    }

    return (
        <group scale={scale}>
            {/* Yan Kapaklar (Sac) */}
            <mesh position={[0, 0, 0.3]} material={materials.galvanizedSteel}>
                <shapeGeometry args={[shape]} />
            </mesh>
            <mesh position={[0, 0, -0.3]} rotation={[0, Math.PI, 0]} material={materials.galvanizedSteel}>
                <shapeGeometry args={[shape]} />
            </mesh>

            {/* Extruded Gövde (Sac Şerit) */}
            {/* Not: ShapeGeometry yerine ExtrudeGeometry kullanarak dolu gövde yapabiliriz 
                 veya bir şeridi spiral yolunda extrude edebiliriz.
                 Basit çözüm: ExtrudeGeometry kullanmak.
             */}
            <mesh position={[0, 0, -0.3]} material={materials.galvanizedSteel} castShadow>
                <extrudeGeometry args={[shape, extrudeSettings]} />
            </mesh>

            {/* Kare Çıkış Flanşı */}
            <mesh position={[1.1, 0.5, 0]} rotation={[0, 0, 0.3]} material={materials.industrialSteel}>
                <boxGeometry args={[0.1, 0.6, 0.65]} />
            </mesh>
        </group>
    )
}





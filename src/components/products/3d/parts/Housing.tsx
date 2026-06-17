"use client";
import React, { useEffect,useMemo } from 'react'
import {
    BoxGeometry,
    CylinderGeometry,
    ExtrudeGeometry,
    RingGeometry,
    Shape,
    ShapeGeometry} from 'three'

import { useResolveMaterials } from '../core'

// === FLANGE (FLANŞ) ===
interface FlangeProps {
    radius: number
    width?: number // et kalınlığı
    holes?: number // cıvata deliği sayısı
}

export const Flange: React.FC<FlangeProps> = ({ radius, holes = 8 }) => {
    const materials = useResolveMaterials()

    const geometries = useMemo(() => {
        const ringGeo = new RingGeometry(radius, radius + 0.1, 32)
        const boltGeo = new CylinderGeometry(0.015, 0.015, 0.03, 8)
        return { ringGeo, boltGeo }
    }, [radius])

    useEffect(() => {
        return () => {
            geometries.ringGeo.dispose()
            geometries.boltGeo.dispose()
        }
    }, [geometries])

    return (
        <group>
            {/* Ana Halka */}
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel} geometry={geometries.ringGeo} />

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
                        geometry={geometries.boltGeo}
                    />
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

export const Housing: React.FC<HousingProps> = ({ radius, length, thickness = 0.02, width: _width, color: _color }) => {
    const materials = useResolveMaterials()

    const geometries = useMemo(() => {
        const cylinderGeo = new CylinderGeometry(radius, radius, length, 32, 1, true)
        const ringGeo = new RingGeometry(radius - thickness, radius, 32)
        return { cylinderGeo, ringGeo }
    }, [radius, length, thickness])

    useEffect(() => {
        return () => {
            geometries.cylinderGeo.dispose()
            geometries.ringGeo.dispose()
        }
    }, [geometries])

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={materials.galvanizedSteel} castShadow receiveShadow geometry={geometries.cylinderGeo} />

            {/* Gövde kalınlığı illüzyonu için uçlara halkalar */}
            <mesh position={[0, length / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel} geometry={geometries.ringGeo} />
            <mesh position={[0, -length / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel} geometry={geometries.ringGeo} />
        </group>
    )
}

// === SNAIL HOUSING (SALYANGOZ GÖVDE) ===
// Bezier curve ile salyangoz formu
export const SnailHousing: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
    const materials = useResolveMaterials()

    const shape = useMemo(() => {
        const s = new Shape()

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

        return s
    }, [])

    const geometries = useMemo(() => {
        const sideShapeGeo = new ShapeGeometry(shape)
        const extrudeGeo = new ExtrudeGeometry(shape, {
            steps: 2,
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2
        })
        const outletFlangeGeo = new BoxGeometry(0.1, 0.6, 0.65)
        return { sideShapeGeo, extrudeGeo, outletFlangeGeo }
    }, [shape])

    useEffect(() => {
        return () => {
            geometries.sideShapeGeo.dispose()
            geometries.extrudeGeo.dispose()
            geometries.outletFlangeGeo.dispose()
        }
    }, [geometries])

    return (
        <group scale={scale}>
            {/* Yan Kapaklar (Sac) */}
            <mesh position={[0, 0, 0.3]} material={materials.galvanizedSteel} geometry={geometries.sideShapeGeo} />
            <mesh position={[0, 0, -0.3]} rotation={[0, Math.PI, 0]} material={materials.galvanizedSteel} geometry={geometries.sideShapeGeo} />

            {/* Extruded Gövde (Sac Şerit) */}
            <mesh position={[0, 0, -0.3]} material={materials.galvanizedSteel} castShadow geometry={geometries.extrudeGeo} />

            {/* Kare Çıkış Flanşı */}
            <mesh position={[1.1, 0.5, 0]} rotation={[0, 0, 0.3]} material={materials.industrialSteel} geometry={geometries.outletFlangeGeo} />
        </group>
    )
}

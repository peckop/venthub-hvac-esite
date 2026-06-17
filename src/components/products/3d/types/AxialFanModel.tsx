"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import {
    BoxGeometry,
    CircleGeometry,
    CylinderGeometry,
    ExtrudeGeometry,
    RingGeometry,
    Shape
} from 'three'

import { useResolveMaterials } from '../core'
import { Silencer } from '../parts/Silencer'

interface AxialFanModelProps {
    hasSilencer?: boolean
    silencerRadius?: number
    silencerLength?: number
}

export function AxialFanModel({
    hasSilencer = false,
    silencerRadius = 0.58,
    silencerLength = 0.7
}: AxialFanModelProps) {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)

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
        const shape = new Shape()
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
        return new ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    const casingGeometry = useMemo(() => new CylinderGeometry(0.55, 0.55, 0.5, 64, 1, true), [])
    const flangeGeometry = useMemo(() => new RingGeometry(0.55, 0.60, 64), [])
    const hubGeometry = useMemo(() => new CylinderGeometry(0.16, 0.16, 0.06, 32), [])
    const logoGeometry = useMemo(() => new CircleGeometry(0.08, 32), [])
    const motorGeometry = useMemo(() => new CylinderGeometry(0.18, 0.18, 0.25, 32), [])
    const motorFootGeometry = useMemo(() => new BoxGeometry(0.04, 0.25, 0.02), [])

    const concentricRingGeometries = useMemo(() => {
        return Array(8).fill(0).map((_, i) => {
            const r = 0.1 + (i * 0.065)
            return new RingGeometry(r, r + 0.008, 64)
        })
    }, [])

    const radialWireGeometry = useMemo(() => new BoxGeometry(1.1, 0.008, 0.005), [])
    const klemensBoxGeometry = useMemo(() => new BoxGeometry(0.12, 0.15, 0.08), [])
    const klemensCylinderGeometry = useMemo(() => new CylinderGeometry(0.015, 0.015, 0.04, 8), [])

    useEffect(() => {
        return () => {
            bladeGeometry.dispose()
            casingGeometry.dispose()
            flangeGeometry.dispose()
            hubGeometry.dispose()
            logoGeometry.dispose()
            motorGeometry.dispose()
            motorFootGeometry.dispose()
            concentricRingGeometries.forEach((geo) => geo.dispose())
            radialWireGeometry.dispose()
            klemensBoxGeometry.dispose()
            klemensCylinderGeometry.dispose()
        }
    }, [
        bladeGeometry,
        casingGeometry,
        flangeGeometry,
        hubGeometry,
        logoGeometry,
        motorGeometry,
        motorFootGeometry,
        concentricRingGeometries,
        radialWireGeometry,
        klemensBoxGeometry,
        klemensCylinderGeometry
    ])

    return (
        <group position={[0, 0, 0]} scale={[0.85, 0.85, 0.85]} rotation={[0, -Math.PI / 4, 0]}>

            {/* 0. SILENCER (Susta) - Optional sound attenuation */}
            {hasSilencer && (
                <group position={[0, 0, -0.7]}>
                    <Silencer
                        radius={silencerRadius}
                        length={silencerLength}
                        position={[0, 0, 0]}
                    />
                </group>
            )}

            {/* 1. SİLİNDİRİK KOVAN (Black Casing) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={materials.glossyBlack} geometry={casingGeometry} />

                {/* Ön ve Arka Flanşlar (Kıvrımlar) */}
                {[0.25, -0.25].map((y, i) => (
                    <group key={i} position={[0, y, 0]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.glossyBlack} geometry={flangeGeometry} />
                    </group>
                ))}
            </group>

            {/* 2. MOTOR VE PERVANE (Black & Red) */}
            <group position={[0, 0, 0]}>

                {/* --- PERVANE GRUBU (Dönen Kısım) --- */}
                <group ref={fanRef} position={[0, 0, 0.05]}>
                    {/* Pervane Göbeği (Siyah) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.bladeBlack} geometry={hubGeometry} />

                    {/* Marka Logosu (Kırmızı Daire) */}
                    <mesh position={[0, 0, 0.031]} rotation={[Math.PI / 2, 0, 0]} material={materials.logoRed} geometry={logoGeometry} />

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
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.glossyBlack} geometry={motorGeometry} />
                    {/* Motor Ayakları (3 Kollu) */}
                    {[0, 120, 240].map((angle, i) => (
                        <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]} position={[0, 0.28, 0]} material={materials.glossyBlack} geometry={motorFootGeometry} />
                    ))}
                </group>
            </group>

            {/* 3. TEL KAFES (Dense Wire Guard) - SIKI ARALIKLI */}
            {/* Resimdeki gibi çok sayıda halka */}
            <group position={[0, 0, 0.26]}>
                {/* Konsantrik Halkalar (8 Adet) */}
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={`ring-${i}`} material={materials.matteBlack} geometry={concentricRingGeometries[i]} />
                ))}
                {/* Radyal Teller (Haç şeklinde veya yıldız) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, j) => (
                    <mesh key={`radial-${j}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.matteBlack} geometry={radialWireGeometry} />
                ))}
            </group>

            {/* 4. KLEMENS KUTUSU (Üstte Siyah) */}
            <group position={[0.4, 0.35, 0.1]} rotation={[0, 0, 0.2]}>
                <mesh material={materials.glossyBlack} geometry={klemensBoxGeometry} />
                <mesh position={[0, -0.08, 0]} material={materials.glossyBlack} geometry={klemensCylinderGeometry} />
            </group>

        </group>
    )
}
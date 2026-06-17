"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { Path, Shape, BoxGeometry, CylinderGeometry, ExtrudeGeometry } from 'three'

import { useResolveMaterials } from '../core'

export const NicotraFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)

    // Nicotra Gebhardt DD Serisi - CORRECTED AXIS
    // Salganyoz DİK durur. Mil YATAY (X ekseni) durur.

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.x -= delta * 15 // X ekseninde dönüş (Tekerlek gibi)
        }
    })

    const sideShape = useMemo(() => {
        const shape = new Shape()
        // Logaritmik Spiral Profili
        const segments = 48
        for (let i = 0; i <= segments; i++) {
            const th = (i / segments) * Math.PI * 2.2
            const r = 0.3 + (th / (Math.PI * 2)) * 0.4
            const x = Math.cos(th) * r
            const y = Math.sin(th) * r
            if (i === 0) shape.moveTo(x, y)
            else shape.lineTo(x, y)
        }
        // Atış ağzı
        shape.lineTo(0.5, 0.5)
        shape.lineTo(0.2, 0.5)

        const hole = new Path()
        hole.absarc(0, 0, 0.28, 0, Math.PI * 2, true)
        shape.holes.push(hole)
        return shape
    }, [])

    const baseFrameGeometry = useMemo(() => new BoxGeometry(1.0, 0.05, 1.0), [])
    const vibrationMountGeometry = useMemo(() => new BoxGeometry(0.1, 0.05, 0.1), [])
    const sideShapeGeometry = useMemo(() => new ExtrudeGeometry(sideShape, { depth: 0.02, bevelEnabled: false }), [sideShape])
    const scrollWrapperGeometry = useMemo(() => new CylinderGeometry(0.6, 0.6, 0.6, 32, 1, true, 0, 4.5), [])
    const dischargeGeometry = useMemo(() => new BoxGeometry(0.5, 0.02, 0.64), [])
    const wheelGeometry = useMemo(() => new CylinderGeometry(0.38, 0.38, 0.58, 32, 1, true), [])
    const bladeGeometry = useMemo(() => new BoxGeometry(0.02, 0.58, 0.1), [])
    const motorGeometry = useMemo(() => new CylinderGeometry(0.18, 0.18, 0.3, 32), [])

    useEffect(() => {
        return () => {
            baseFrameGeometry.dispose()
            vibrationMountGeometry.dispose()
            sideShapeGeometry.dispose()
            scrollWrapperGeometry.dispose()
            dischargeGeometry.dispose()
            wheelGeometry.dispose()
            bladeGeometry.dispose()
            motorGeometry.dispose()
        }
    }, [
        baseFrameGeometry,
        vibrationMountGeometry,
        sideShapeGeometry,
        scrollWrapperGeometry,
        dischargeGeometry,
        wheelGeometry,
        bladeGeometry,
        motorGeometry
    ])

    return (
        <group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>

            {/* 1. X-ŞASİ (Base Frame) */}
            <group position={[0, -0.5, 0]}>
                <mesh geometry={baseFrameGeometry} material={materials.galvanizedSteel} />
                {/* Titreşim Takozları */}
                {[0.4, -0.4].map(x => [0.4, -0.4].map(z => (
                    <mesh key={`${x}-${z}`} position={[x, -0.05, z]} geometry={vibrationMountGeometry} material={materials.matteBlack} />
                )))}
            </group>

            {/* 2. SALYANGOZ GÖVDE (Scroll Housing) */}
            <group position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}> {/* Y ekseninde çevir ki X eksenine baksın */}

                {/* Yan Saclar */}
                <mesh position={[0, 0, 0.3]} geometry={sideShapeGeometry} material={materials.galvanizedSteel} />
                <mesh position={[0, 0, -0.32]} geometry={sideShapeGeometry} material={materials.galvanizedSteel} />

                {/* Sırt Sacı (Wrapper) - Basit Silindir Parçası */}
                <mesh rotation={[0, 0, Math.PI / 2]} geometry={scrollWrapperGeometry} material={materials.galvanizedSteel} />

                {/* Atış Ağzı */}
                <group position={[0.4, 0.5, 0]}>
                    <mesh geometry={dischargeGeometry} material={materials.industrialSteel} />
                </group>

            </group>

            {/* 3. ROTOR (Fan Wheel) - X Ekseninde Dönüyor */}
            <group ref={fanRef} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                {/* Sık Kanatlı Çark */}
                <mesh geometry={wheelGeometry} material={materials.galvanizedSteel} />
                {/* Kanatlar */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh
                        key={i}
                        rotation={[0, (i / 24) * Math.PI * 2, 0]}
                        position={[0.36, 0, 0]}
                        geometry={bladeGeometry}
                        material={materials.galvanizedSteel}
                    />
                ))}
            </group>

            {/* 4. MOTOR (Direkt Akuple - Yan Tarafta) */}
            <group position={[-0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh geometry={motorGeometry} material={materials.ral5010} />
            </group>

        </group>
    )
}

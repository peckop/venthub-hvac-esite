"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import {
    BoxGeometry,
    CylinderGeometry,
    ExtrudeGeometry,
    Path,
    RingGeometry,
    Shape} from 'three'

import { useResolveMaterials } from '../core'

export const WallMountedCompactFanModel: React.FC = () => {
    const fanRef = useRef<Group>(null)
    const mats = useResolveMaterials()

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    // 1. PLATE GEOMETRY
    const plateGeometry = useMemo(() => {
        const shape = new Shape()
        shape.moveTo(-0.5, -0.5)
        shape.lineTo(0.5, -0.5)
        shape.lineTo(0.5, 0.5)
        shape.lineTo(-0.5, 0.5)
        shape.lineTo(-0.5, -0.5)

        // Mounting Holes
        const holeRadius = 0.03
        const holeOffset = 0.42
        const corners = [
            [holeOffset, holeOffset], [-holeOffset, holeOffset],
            [holeOffset, -holeOffset], [-holeOffset, -holeOffset]
        ]
        corners.forEach(([x, y]) => {
            const hole = new Path()
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true)
            shape.holes.push(hole)
        })

        // Center Hole
        const centerHole = new Path()
        centerHole.absarc(0, 0, 0.42, 0, Math.PI * 2, true)
        shape.holes.push(centerHole)

        return new ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false })
    }, [])

    // 2. OTHER GEOMETRIES
    const venturiGeometry = useMemo(() => new CylinderGeometry(0.44, 0.42, 0.05, 64, 1, true), [])
    const motorBodyGeometry = useMemo(() => new CylinderGeometry(0.15, 0.15, 0.25, 32), [])
    const finGeometry = useMemo(() => new BoxGeometry(0.02, 0.25, 0.02), [])
    const supportArmGeometry = useMemo(() => new BoxGeometry(0.3, 0.02, 0.02), [])
    const hubGeometry = useMemo(() => new CylinderGeometry(0.08, 0.08, 0.05, 32), [])
    const bladeGeometry = useMemo(() => new BoxGeometry(0.3, 0.12, 0.01), [])
    const standoffPinGeometry = useMemo(() => new CylinderGeometry(0.01, 0.01, 0.2, 8), [])
    const standoffCapGeometry = useMemo(() => new CylinderGeometry(0.02, 0.02, 0.01, 16), [])
    const frameVertGeometry = useMemo(() => new BoxGeometry(0.015, 0.85, 0.015), [])
    const frameHorizGeometry = useMemo(() => new BoxGeometry(0.85, 0.015, 0.015), [])
    const radialWireGeometry = useMemo(() => new BoxGeometry(0.8, 0.008, 0.005), [])
    const klemensBoxGeometry = useMemo(() => new BoxGeometry(0.08, 0.1, 0.06), [])
    const klemensCylinderGeometry = useMemo(() => new CylinderGeometry(0.01, 0.01, 0.04, 8), [])

    const ringGeometries = useMemo(() => {
        return Array(5).fill(0).map((_, i) => {
            return new RingGeometry(0.1 + i * 0.07, 0.108 + i * 0.07, 32)
        })
    }, [])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            plateGeometry.dispose()
            venturiGeometry.dispose()
            motorBodyGeometry.dispose()
            finGeometry.dispose()
            supportArmGeometry.dispose()
            hubGeometry.dispose()
            bladeGeometry.dispose()
            standoffPinGeometry.dispose()
            standoffCapGeometry.dispose()
            frameVertGeometry.dispose()
            frameHorizGeometry.dispose()
            radialWireGeometry.dispose()
            klemensBoxGeometry.dispose()
            klemensCylinderGeometry.dispose()
            ringGeometries.forEach(geo => geo.dispose())
        }
    }, [
        plateGeometry,
        venturiGeometry,
        motorBodyGeometry,
        finGeometry,
        supportArmGeometry,
        hubGeometry,
        bladeGeometry,
        standoffPinGeometry,
        standoffCapGeometry,
        frameVertGeometry,
        frameHorizGeometry,
        radialWireGeometry,
        klemensBoxGeometry,
        klemensCylinderGeometry,
        ringGeometries
    ])

    return (
        <group scale={[0.8, 0.8, 0.8]}>

            {/* 1. DUVAR MONTAJ PLAKASI (Galvaniz) */}
            <group>
                <mesh geometry={plateGeometry} material={mats.galvanizedSteel} />

                {/* Venturi Ağzı */}
                <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} geometry={venturiGeometry} material={mats.galvanizedSteel} />
            </group>

            {/* 2. MOTOR VE PERVANE (Siyah & Turuncu) */}
            <group position={[0, 0, -0.15]}>

                {/* Motor Gövdesi */}
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh geometry={motorBodyGeometry} material={mats.matteBlack} />
                    {/* Soğutma Kanatçıkları */}
                    {Array(8).fill(0).map((_, i) => (
                        <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.16, 0, 0]} geometry={finGeometry} material={mats.matteBlack} />
                    ))}
                </group>

                {/* Motor Kolları */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                        <mesh position={[0.25, 0.1, 0.15]} rotation={[0, 0, -0.2]} geometry={supportArmGeometry} material={mats.matteBlack} />
                    </group>
                ))}

                {/* --- PERVANE (TURUNCU) --- */}
                <group ref={fanRef} position={[0, 0, 0.25]}>
                    {/* Göbek (Siyah) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} geometry={hubGeometry} material={mats.matteBlack} />

                    {/* 5 Kanat - ABSOLUTE ORANGE */}
                    {Array(5).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
                            <mesh position={[0.2, 0, 0]} rotation={[0.3, 0.1, -0.1]} geometry={bladeGeometry} material={mats.safetyOrange} />
                        </group>
                    ))}
                </group>
            </group>

            {/* 3. TEL KAFES VE STANDOFFS (Metalik Gri) */}
            <group position={[0, 0, 0.2]}>

                {/* STANDOFFS (Ayaklar) */}
                {[0.4, -0.4].map(x => [0.4, -0.4].map(y => (
                    <group key={`standoff-${x}-${y}`} position={[x, y, -0.1]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={standoffPinGeometry} material={mats.industrialSteel} />
                        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={standoffCapGeometry} material={mats.industrialSteel} />
                    </group>
                )))}

                {/* IZGARA ÇERÇEVESİ */}
                <group>
                    {[-0.42, 0.42].map(x => (
                        <mesh key={`frame-v-${x}`} position={[x, 0, 0]} geometry={frameVertGeometry} material={mats.industrialSteel} />
                    ))}
                    {[-0.42, 0.42].map(y => (
                        <mesh key={`frame-h-${y}`} position={[0, y, 0]} geometry={frameHorizGeometry} material={mats.industrialSteel} />
                    ))}
                </group>

                {/* HALKALAR */}
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={`ring-${i}`} geometry={ringGeometries[i]} material={mats.industrialSteel} />
                ))}

                {/* RADYAL TELLER */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <mesh key={`rad-${i}`} rotation={[0, 0, (angle * Math.PI) / 180]} geometry={radialWireGeometry} material={mats.industrialSteel} />
                ))}

            </group>

            {/* 4. KLEMENS KUTUSU (Siyah) */}
            <group position={[0.15, 0.15, -0.1]} rotation={[0, 0, 0.5]}>
                <mesh geometry={klemensBoxGeometry} material={mats.matteBlack} />
                <mesh position={[0, -0.05, 0]} geometry={klemensCylinderGeometry} material={mats.matteBlack} />
            </group>

        </group>
    )
}

"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, RingGeometry, Shape } from 'three'

import { useResolveMaterials } from '../core'

export function SmokeExhaustFanModel() {
    const materials = useResolveMaterials()
    const rotorRef = useRef<Group>(null)

    // DUMAN EGZOZ FANI (MAX FILL UPDATE)
    // 1. Blade Length: Extended to 0.51 (Tip Radius 0.69 vs Casing 0.70). Gap = 1cm.
    // 2. Count: 6 Blades.
    // 3. Shape: Broad Sickle (Cleaver).

    useFrame((state, delta) => {
        if (rotorRef.current) {
            rotorRef.current.rotation.z -= delta * 8
        }
    })

    // BLADE GEOMETRY: Long Cleaver - Memoized to prevent leaks
    const bladeGeometry = useMemo(() => {
        const shape = new Shape()

        // Blade Root at (0,0). X is Radial Length. Y is Chord Width.
        // Root Chord
        shape.moveTo(0, -0.05)
        shape.lineTo(0, 0.05)

        // Leading Edge (Long Sickle Curve)
        // Adjust control points to stretch to X=0.51 (Max Fill)
        shape.bezierCurveTo(0.15, 0.12, 0.35, 0.20, 0.51, 0.18) // Tip Leading at X=0.51

        // Tip Edge
        shape.lineTo(0.52, 0.08) // Tip Trailing (slightly further out visually)

        // Trailing Edge
        shape.bezierCurveTo(0.35, -0.02, 0.15, -0.04, 0, -0.05) // Back to root

        const extrudeSettings = {
            depth: 0.015,
            bevelEnabled: true,
            bevelThickness: 0.003,
            bevelSize: 0.003,
            bevelSegments: 2
        }
        return new ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    const casingGeometry = useMemo(() => new CylinderGeometry(0.7, 0.7, 0.8, 64, 1, true), [])
    const flangeRingGeometry = useMemo(() => new RingGeometry(0.7, 0.82, 64), [])
    const flangeCylinderGeometry = useMemo(() => new CylinderGeometry(0.82, 0.82, 0.04, 64, 1, true), [])
    const boltGeometry = useMemo(() => new CylinderGeometry(0.012, 0.012, 0.02, 6), [])
    const standLegGeometry = useMemo(() => new BoxGeometry(0.08, 0.4, 0.04), [])
    const standFootGeometry = useMemo(() => new BoxGeometry(0.1, 0.05, 1.2), [])
    const hubGeometry = useMemo(() => new CylinderGeometry(0.18, 0.18, 0.12, 16), [])
    const hubCapGeometry = useMemo(() => new CylinderGeometry(0.08, 0.14, 0.08, 32), [])
    const motorBodyGeometry = useMemo(() => new CylinderGeometry(0.25, 0.25, 0.45, 32), [])
    const motorJunctionBoxGeometry = useMemo(() => new BoxGeometry(0.12, 0.12, 0.08), [])

    useEffect(() => {
        return () => {
            bladeGeometry.dispose()
            casingGeometry.dispose()
            flangeRingGeometry.dispose()
            flangeCylinderGeometry.dispose()
            boltGeometry.dispose()
            standLegGeometry.dispose()
            standFootGeometry.dispose()
            hubGeometry.dispose()
            hubCapGeometry.dispose()
            motorBodyGeometry.dispose()
            motorJunctionBoxGeometry.dispose()
        }
    }, [
        bladeGeometry,
        casingGeometry,
        flangeRingGeometry,
        flangeCylinderGeometry,
        boltGeometry,
        standLegGeometry,
        standFootGeometry,
        hubGeometry,
        hubCapGeometry,
        motorBodyGeometry,
        motorJunctionBoxGeometry
    ])

    return (
        <group scale={[0.65, 0.65, 0.65]} rotation={[0, -Math.PI / 4, 0]}>

            {/* FRAME & STANDS (Preserved) */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh material={materials.smokeCoating} geometry={casingGeometry} />
            </group>
            {[0.38, -0.38].map((zPos, i) => (
                <group key={`flange-${i}`} position={[0, 0, zPos]}>
                    <mesh material={materials.smokeCoating} geometry={flangeRingGeometry} />
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.smokeCoating} geometry={flangeCylinderGeometry} />
                    {Array(16).fill(0).map((_, b) => (
                        <mesh key={b}
                            position={[0.76 * Math.cos(b * Math.PI / 8), 0.76 * Math.sin(b * Math.PI / 8), (i === 0 ? 0.025 : -0.025)]}
                            rotation={[Math.PI / 2, 0, 0]}
                            material={materials.boltMaterial}
                            geometry={boltGeometry} />
                    ))}
                    <group position={[0, -0.75, 0]}>
                        <mesh position={[-0.55, 0, 0]} material={materials.smokeCoating} geometry={standLegGeometry} />
                        <mesh position={[0.55, 0, 0]} material={materials.smokeCoating} geometry={standLegGeometry} />
                    </group>
                </group>
            ))}
            <group position={[-0.55, -0.92, 0]}>
                <mesh material={materials.smokeCoating} geometry={standFootGeometry} />
            </group>
            <group position={[0.55, -0.92, 0]}>
                <mesh material={materials.smokeCoating} geometry={standFootGeometry} />
            </group>

            {/* ROTOR (Long Blades) */}
            <group ref={rotorRef} position={[0, 0, 0.2]}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh material={materials.castBladeMat} geometry={hubGeometry} />
                    <mesh position={[0, 0.065, 0]} material={materials.matteBlack} geometry={hubCapGeometry} />
                </group>

                {/* 6 Blades */}
                {Array(6).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, i * ((Math.PI * 2) / 6)]}>
                        <group position={[0.18, 0, 0]}>
                            <group rotation={[0.7, 0, 0]}>
                                <mesh geometry={bladeGeometry} material={materials.castBladeMat} />
                            </group>
                        </group>
                    </group>
                ))}
            </group>

            {/* MOTOR */}
            <group position={[0, 0, -0.2]}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh material={materials.smokeCoating} geometry={motorBodyGeometry} />
                </group>
                <group position={[0, 0.3, 0.1]}>
                    <mesh material={materials.smokeCoating} geometry={motorJunctionBoxGeometry} />
                </group>
            </group>
        </group>
    )
}
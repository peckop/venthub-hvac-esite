"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import { BoxGeometry, CylinderGeometry, Group } from 'three'

import { useResolveMaterials } from '../core'

export const PlugFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= 6 * delta
        }
    })

    // Memoized geometries for VRAM optimization
    const inletConeGeo = useMemo(() => new CylinderGeometry(0.38, 0.30, 0.15, 32, 1, true), [])
    const flangeGeo = useMemo(() => new CylinderGeometry(0.40, 0.40, 0.02, 32), [])
    const shroudGeo = useMemo(() => new CylinderGeometry(0.4, 0.25, 0.05, 32, 1, true), [])
    const bladeGeo = useMemo(() => new BoxGeometry(0.015, 0.3, 0.25), [])
    const motorBodyGeo = useMemo(() => new CylinderGeometry(0.18, 0.18, 0.35, 32), [])
    const finGeo = useMemo(() => new BoxGeometry(0.04, 0.35, 0.02), [])
    const klemensGeo = useMemo(() => new BoxGeometry(0.1, 0.1, 0.05), [])
    const baseGeo = useMemo(() => new BoxGeometry(0.6, 0.05, 0.6), [])
    const supportGeo = useMemo(() => new BoxGeometry(0.2, 0.4, 0.02), [])

    // Dispose of all memoized geometries on unmount to clean up VRAM
    useEffect(() => {
        return () => {
            inletConeGeo.dispose()
            flangeGeo.dispose()
            shroudGeo.dispose()
            bladeGeo.dispose()
            motorBodyGeo.dispose()
            finGeo.dispose()
            klemensGeo.dispose()
            baseGeo.dispose()
            supportGeo.dispose()
        }
    }, [
        inletConeGeo,
        flangeGeo,
        shroudGeo,
        bladeGeo,
        motorBodyGeo,
        finGeo,
        klemensGeo,
        baseGeo,
        supportGeo
    ])

    return (
        <group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>

            {/* 1. EMİŞ HUNİSİ (Inlet Cone) - DÜZ SAC KONİ (Halka değil) */}
            <group position={[0, 0, 0.35]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} geometry={inletConeGeo} material={materials.galvanizedSteel} />
                {/* Giriş Flanşı (Düz Şerit) */}
                <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} geometry={flangeGeo} material={materials.galvanizedSteel} />
            </group>

            {/* 2. PLUG FAN PERVANESİ (Backward Curved) */}
            <group ref={fanRef} position={[0, 0, 0]}>
                {/* Arka Disk (Backplate) */}
                <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]} geometry={flangeGeo} material={materials.industrialSteel} />
                {/* Ön Halka (Front Shroud) */}
                <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} geometry={shroudGeo} material={materials.industrialSteel} />

                {/* Kanatlar (7 Adet - Geriye Eğimli) */}
                {Array(7).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
                        <mesh position={[0.25, 0.05, 0]} rotation={[0, 0.5, 0.2]} geometry={bladeGeo} material={materials.safetyOrange} />
                    </group>
                ))}
            </group>

            {/* 3. MOTOR (Arkada - Direkt Akuple) */}
            <group position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
                {/* Motor Gövdesi */}
                <mesh geometry={motorBodyGeo} material={materials.ral7035} />
                {/* Soğutma Kanatçıkları */}
                {Array(12).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]} position={[0.18, 0, 0]} geometry={finGeo} material={materials.industrialSteel} />
                ))}
                {/* Klemens Kutusu */}
                <mesh position={[0.15, 0.1, 0.15]} geometry={klemensGeo} material={materials.matteBlack} />
            </group>

            {/* 4. TABAN KAİDESİ (Base Frame) */}
            <group position={[0, -0.45, -0.2]}>
                <mesh geometry={baseGeo} material={materials.industrialSteel} />
                {/* Motor Destek Ayağı */}
                <mesh position={[0, 0.2, -0.1]} geometry={supportGeo} material={materials.industrialSteel} />
            </group>

        </group>
    )
}

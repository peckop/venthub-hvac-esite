"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry } from 'three'

import { useResolveMaterials } from '../core'

export const RoundDuctFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)

    // MIXED FLOW - SADE TASARIM (NO RINGS)
    // Şişkin Gövde (Cylinder) + Giriş Çıkış (Cylinder) + Kelepçeler (Cylinder Band)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    // Geometries
    const centralBodyGeom = useMemo(() => new CylinderGeometry(0.55, 0.55, 0.7, 32), [])
    const clampGeom = useMemo(() => new CylinderGeometry(0.56, 0.56, 0.1, 32), [])
    const coneGeom = useMemo(() => new CylinderGeometry(0.45, 0.55, 0.3, 32), [])
    const spigotGeom = useMemo(() => new CylinderGeometry(0.45, 0.45, 0.2, 32), [])
    const baseGeom = useMemo(() => new BoxGeometry(1.0, 0.1, 0.6), [])
    const armGeom = useMemo(() => new BoxGeometry(0.1, 0.6, 0.4), [])
    const terminalBoxGeom = useMemo(() => new BoxGeometry(0.3, 0.2, 0.3), [])
    const cableGlandGeom = useMemo(() => new CylinderGeometry(0.04, 0.04, 0.1, 16), [])
    const fanHubGeom = useMemo(() => new CylinderGeometry(0.15, 0.15, 0.1, 32), [])
    const bladeGeom = useMemo(() => new BoxGeometry(0.25, 0.05, 0.4), [])

    useEffect(() => {
        return () => {
            centralBodyGeom.dispose()
            clampGeom.dispose()
            coneGeom.dispose()
            spigotGeom.dispose()
            baseGeom.dispose()
            armGeom.dispose()
            terminalBoxGeom.dispose()
            cableGlandGeom.dispose()
            fanHubGeom.dispose()
            bladeGeom.dispose()
        }
    }, [
        centralBodyGeom,
        clampGeom,
        coneGeom,
        spigotGeom,
        baseGeom,
        armGeom,
        terminalBoxGeom,
        cableGlandGeom,
        fanHubGeom,
        bladeGeom
    ])

    return (
        <group scale={[0.6, 0.6, 0.6]}>

            {/* 1. ANA GÖVDE (Central Body) - SİLİNDİR (Torus Yok) */}
            <group rotation={[0, 0, Math.PI / 2]}>
                <mesh material={materials.ral7035} geometry={centralBodyGeom} />
            </group>

            {/* 2. GİRİŞ/ÇIKIŞ KONİLERİ VE SPIGOTS */}
            <group rotation={[0, 0, Math.PI / 2]}>
                {/* Sol Taraf (Inlet) */}
                <group position={[0, 0.5, 0]}>
                    {/* Kelepçe (Clamp) - SİYAH SİLİNDİR ŞERİT */}
                    {/* Torus DEĞİL, Cylinder kullanıyoruz */}
                    <mesh position={[0, -0.05, 0]} material={materials.matteBlack} geometry={clampGeom} />
                    {/* Koni */}
                    <mesh position={[0, 0.15, 0]} material={materials.ral7035} geometry={coneGeom} />
                    {/* Kanal Bağlantı Ağzı (Spigot) */}
                    <mesh position={[0, 0.35, 0]} material={materials.ral7035} geometry={spigotGeom} />
                </group>

                {/* Sağ Taraf (Outlet) - Simetrik */}
                <group position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                    {/* Kelepçe */}
                    <mesh position={[0, -0.05, 0]} material={materials.matteBlack} geometry={clampGeom} />
                    {/* Koni */}
                    <mesh position={[0, 0.15, 0]} material={materials.ral7035} geometry={coneGeom} />
                    {/* Spigot */}
                    <mesh position={[0, 0.35, 0]} material={materials.ral7035} geometry={spigotGeom} />
                </group>
            </group>

            {/* 3. MONTAJ KAİDESİ (Base Stand) - KUTU PROFİL */}
            <group position={[0, -0.65, 0]}>
                <mesh material={materials.ral7035} geometry={baseGeom} />
                {/* Kollar */}
                <group position={[0, 0.3, 0]}>
                    <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -0.2]} material={materials.ral7035} geometry={armGeom} />
                    <mesh position={[0.4, 0, 0]} rotation={[0, 0, 0.2]} material={materials.ral7035} geometry={armGeom} />
                </group>
            </group>

            {/* 4. HARİCİ KLEMENS KUTUSU (Terminal Box) */}
            <group position={[0, 0.65, 0]}>
                <mesh material={materials.ral7035} geometry={terminalBoxGeom} />
                <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.matteBlack} geometry={cableGlandGeom} />
            </group>

            {/* 5. İÇ PERVANE (Mixed Flow) - SİLİNDİRİK KANATLAR */}
            <group ref={fanRef} rotation={[0, 0, -Math.PI / 2]}>
                <mesh material={materials.fanRed} geometry={fanHubGeom} />
                {/* Kanatlar */}
                {Array(9).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 9) * Math.PI * 2, 0]} position={[0.25, 0, 0]} rotation-y={0.5} material={materials.fanRed} geometry={bladeGeom} />
                ))}
            </group>

        </group>
    )
}

"use client";
import React, { useEffect,useMemo } from 'react'
import * as THREE from 'three'

import { useResolveMaterials } from '../core'

interface MotorProps {
    scale?: number
    color?: 'galvanized' | 'ral7035' | 'blue'
    showMount?: boolean // Alt montaj ayağı
}

export const Motor: React.FC<MotorProps> = ({ scale = 1, color = 'galvanized', showMount = false }) => {
    const materials = useResolveMaterials()

    // Geometrilere ait useMemo tanımlamaları (Hafıza Optimizasyonu)
    const bodyGeom = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 0.8, 32), [])
    const capGeom = useMemo(() => new THREE.CylinderGeometry(0.36, 0.36, 0.05, 32), [])
    const shaftGeom = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16), [])
    const rearBumpGeom = useMemo(() => new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), [])
    const terminalBoxGeom = useMemo(() => new THREE.BoxGeometry(0.25, 0.1, 0.25), [])
    const cableGlandGeom = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), [])
    const mountGeom = useMemo(() => new THREE.BoxGeometry(0.6, 0.1, 0.4), [])

    // VRAM Temizliği: unmount durumunda geometrilerin dispose edilmesi
    useEffect(() => {
        return () => {
            bodyGeom.dispose()
            capGeom.dispose()
            shaftGeom.dispose()
            rearBumpGeom.dispose()
            terminalBoxGeom.dispose()
            cableGlandGeom.dispose()
            mountGeom.dispose()
        }
    }, [bodyGeom, capGeom, shaftGeom, rearBumpGeom, terminalBoxGeom, cableGlandGeom, mountGeom])

    // Motor rengini seç
    const bodyMaterial = useMemo(() => {
        if (color === 'galvanized') return materials.industrialSteel
        if (color === 'ral7035') return materials.ral7035
        return materials.ral5010 // Blue
    }, [color, materials])

    return (
        <group scale={scale}>
            {/* === ANA GÖVDE (Sadece Silindir) === */}
            <mesh 
                rotation={[0, 0, Math.PI / 2]} 
                castShadow 
                receiveShadow 
                material={bodyMaterial} 
                geometry={bodyGeom} 
            />

            {/* === ÖN KAPAK & MİL === */}
            <group position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                {/* Ön Kapak */}
                <mesh material={materials.matteBlack} geometry={capGeom} />
                {/* Mil */}
                <mesh position={[0, 0.15, 0]} material={materials.industrialSteel} geometry={shaftGeom} />
            </group>

            {/* === ARKA KAPAK (Fan Izgarası) === */}
            <group position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                {/* Arka fan kapağı daima siyah kalsın */}
                <mesh material={materials.matteBlack} geometry={capGeom} />
                {/* Arka Çıkıntı */}
                <mesh position={[0, 0.05, 0]} material={materials.matteBlack} geometry={rearBumpGeom} />
            </group>

            {/* === KLEMENS KUTUSU (Terminal Box) === */}
            <group position={[0, 0.36, 0]}>
                <mesh position={[0, 0.05, 0]} material={materials.matteBlack} castShadow geometry={terminalBoxGeom} />
                {/* Kablo Rakoru */}
                <mesh 
                    position={[0.05, 0.05, 0.12]} 
                    rotation={[Math.PI / 2, 0, 0]} 
                    material={materials.industrialSteel} 
                    geometry={cableGlandGeom} 
                />
            </group>

            {/* === MONTAJ AYAĞI (Opsiyonel) === */}
            {showMount && (
                <mesh position={[0, -0.4, 0]} material={materials.industrialSteel} geometry={mountGeom} />
            )}
        </group>
    )
}






"use client";
import React, { useEffect,useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry, InstancedMesh, Object3D,PlaneGeometry } from 'three'

import { useResolveMaterials } from '../core'

export const DomesticFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)
    const gridRef = useRef<InstancedMesh>(null)

    // Referans Görsel 3: Kare, Beyaz/Metalik, Delikli Izgaralı Banyo Fanı (Vortice Quattro vb.)

    // Ön Panel (Kare)
    const panelSize = 1.0 // 1 birim kare
    const panelThickness = 0.08

    // Memoized Geometries
    const panel = useMemo(() => new BoxGeometry(panelSize, panelSize, panelThickness), [panelSize, panelThickness])
    const background = useMemo(() => new PlaneGeometry(panelSize * 0.85, panelSize * 0.85), [panelSize])
    const gridBoxGeo = useMemo(() => new BoxGeometry(panelSize * 0.05, panelSize * 0.05, 0.005), [panelSize])
    const cylinder = useMemo(() => new CylinderGeometry(0.35, 0.35, 0.4, 32), [])
    const plane = useMemo(() => new PlaneGeometry(0.15, 0.05), [])

    const tempObject3D = useMemo(() => new Object3D(), [])

    useEffect(() => {
        if (!gridRef.current) return

        let index = 0
        for (let row = 0; row < 12; row++) {
            for (let col = 0; col < 12; col++) {
                const x = (col - 5.5) * (panelSize * 0.07)
                const y = (row - 5.5) * (panelSize * 0.07)
                tempObject3D.position.set(x, y, 0)
                tempObject3D.updateMatrix()
                gridRef.current.setMatrixAt(index, tempObject3D.matrix)
                index++
            }
        }
        gridRef.current.instanceMatrix.needsUpdate = true
    }, [panelSize, tempObject3D])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            panel.dispose()
            background.dispose()
            gridBoxGeo.dispose()
            cylinder.dispose()
            plane.dispose()
        }
    }, [panel, background, gridBoxGeo, cylinder, plane])

    return (
        // SCALE FIX: 0.25 (Endüstriyeller 0.6-0.7 iken bu 0.25 olmalı)
        <group ref={fanRef} scale={[0.25, 0.25, 0.25]}>
            {/* 1. ÖN PANEL ÇERÇEVESİ (Krom/Parlak Metal veya Beyaz Plastik) */}
            <mesh material={materials.brushedAluminum} geometry={panel} />

            {/* 2. IZGARA ALANI (İç Kısım) */}
            <group position={[0, 0, panelThickness / 2 + 0.01]}>

                {/* Izgara Arkaplanı */}
                <mesh position={[0, 0, -0.01]} material={materials.matteBlack} geometry={background} />

                {/* IZGARA DOKUSU (Grid of holes) using InstancedMesh */}
                <instancedMesh
                    ref={gridRef}
                    args={[gridBoxGeo, materials.industrialSteel, 144]}
                />
            </group>

            {/* 3. ARKA GÖVDE (Duvara giren kısım - Silindir) */}
            <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.ral7035} geometry={cylinder} />

            {/* 4. MARKALAMA (Alt Köşe) */}
            <mesh position={[0.35, -0.4, panelThickness / 2 + 0.02]} material={materials.zincGray} geometry={plane} />
        </group>
    )
}

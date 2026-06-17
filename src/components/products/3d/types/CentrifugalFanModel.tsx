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
    Shape,
    TorusGeometry
} from 'three'

import { useResolveMaterials } from '../core'

/**
 * CentrifugalFanModel (Santrifüj Fan)
 * - Motor: Merkezi tahrik motoru
 * - Housing: Spiral/salyangoz tipi muhafaza
 * - Impeller: Radyal kanatlı, dönen pervane grubu
 */
export const CentrifugalFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const impellerRef = useRef<Group>(null)

    // Dönen pervaneyi animasyonla döndür
    useFrame((_state, delta) => {
        if (impellerRef.current) {
            impellerRef.current.rotation.z -= delta * 12
        }
    })

    // İmpeller kanat geometrisi (Geriye kıvrımlı santrifüj kanatlar)
    const impellerBladeGeometry = useMemo(() => {
        const shape = new Shape()
        // Kanat profili - dış kenardan iç kenara
        shape.moveTo(0, 0.12)
        shape.quadraticCurveTo(0.18, 0.10, 0.22, 0)
        shape.quadraticCurveTo(0.18, -0.10, 0, -0.12)
        shape.lineTo(0, 0.12)

        const extrudeSettings = {
            depth: 0.03,
            bevelEnabled: true,
            bevelThickness: 0.004,
            bevelSize: 0.004,
            bevelSegments: 1
        }
        return new ExtrudeGeometry(shape, extrudeSettings)
    }, [])

    // Spiral housing (salyangoz) profili
    const scrollShape = useMemo(() => {
        const shape = new Shape()
        shape.moveTo(0, 0.40)
        shape.lineTo(0.50, 0.40)
        shape.lineTo(0.50, 0.06)
        shape.lineTo(0.28, 0.06)
        shape.quadraticCurveTo(0.34, -0.32, 0, -0.30)
        shape.quadraticCurveTo(-0.34, -0.32, -0.38, 0)
        shape.quadraticCurveTo(-0.38, 0.40, 0, 0.40)
        return shape
    }, [])

    const scrollGeom = useMemo(() => {
        return new ExtrudeGeometry(scrollShape, { depth: 0.20, bevelEnabled: false })
    }, [scrollShape])

    // Geometriden VRAM temizliği için diğer geometrileri de useMemo ile tanımlıyoruz:
    const motorBodyGeom = useMemo(() => new CylinderGeometry(0.14, 0.14, 0.35, 32), [])
    const coolingFinGeom = useMemo(() => new BoxGeometry(0.012, 0.33, 0.32), [])
    const klemensBoxGeom = useMemo(() => new BoxGeometry(0.12, 0.10, 0.12), [])
    const basePlateGeom1 = useMemo(() => new BoxGeometry(0.28, 0.06, 0.28), [])
    const basePlateGeom2 = useMemo(() => new BoxGeometry(0.34, 0.02, 0.34), [])
    
    const inletCylinderGeom = useMemo(() => new CylinderGeometry(0.20, 0.18, 0.06, 64, 1, true), [])
    const inletRingGeom = useMemo(() => new RingGeometry(0.18, 0.20, 64), [])
    
    const outletBoxGeom1 = useMemo(() => new BoxGeometry(0.26, 0.30, 0.20), [])
    const outletBoxGeom2 = useMemo(() => new BoxGeometry(0.015, 0.36, 0.24), [])
    const outletVoidGeom = useMemo(() => new BoxGeometry(0.28, 0.24, 0.16), [])
    
    const impellerHubGeom = useMemo(() => new CylinderGeometry(0.10, 0.10, 0.08, 32), [])
    const logoGeom = useMemo(() => new CircleGeometry(0.05, 32), [])
    
    const torusGeoms = useMemo(() => {
        return [0.06, 0.10, 0.14, 0.18].map(r => new TorusGeometry(r, 0.002, 8, 64))
    }, [])
    const wireGeom = useMemo(() => new BoxGeometry(0.36, 0.005, 0.005), [])

    useEffect(() => {
        return () => {
            impellerBladeGeometry.dispose()
            scrollGeom.dispose()
            motorBodyGeom.dispose()
            coolingFinGeom.dispose()
            klemensBoxGeom.dispose()
            basePlateGeom1.dispose()
            basePlateGeom2.dispose()
            inletCylinderGeom.dispose()
            inletRingGeom.dispose()
            outletBoxGeom1.dispose()
            outletBoxGeom2.dispose()
            outletVoidGeom.dispose()
            impellerHubGeom.dispose()
            logoGeom.dispose()
            torusGeoms.forEach(g => g.dispose())
            wireGeom.dispose()
        }
    }, [
        impellerBladeGeometry,
        scrollGeom,
        motorBodyGeom,
        coolingFinGeom,
        klemensBoxGeom,
        basePlateGeom1,
        basePlateGeom2,
        inletCylinderGeom,
        inletRingGeom,
        outletBoxGeom1,
        outletBoxGeom2,
        outletVoidGeom,
        impellerHubGeom,
        logoGeom,
        torusGeoms,
        wireGeom
    ])

    return (
        <group scale={[1, 1, 1]}>

            {/* 1. MOTOR GRUBU (Merkezi/Taban Montajlı) */}
            <group position={[0, -0.30, -0.25]}>
                {/* Motor Gövdesi */}
                <mesh rotation={[Math.PI / 2, 0, 0]} geometry={motorBodyGeom} material={materials.industrialBlue} />

                {/* Soğutma Kanatları */}
                {Array(16).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 8)]} geometry={coolingFinGeom} material={materials.industrialBlue} />
                ))}

                {/* Klemens Kutusu */}
                <group position={[0, 0.18, 0.04]}>
                    <mesh geometry={klemensBoxGeom} material={materials.darkGrey} />
                </group>

                {/* Taban Montaj Plakası */}
                <group position={[0, -0.20, 0.02]}>
                    <mesh geometry={basePlateGeom1} material={materials.darkGrey} />
                    <mesh position={[0, -0.04, 0]} geometry={basePlateGeom2} material={materials.darkGrey} />
                </group>
            </group>

            {/* 2. HOUSING (Spiral/Salyangoz Muhafaza) */}
            <group position={[0, 0.05, 0]}>
                {/* Ana Spiral Gövde */}
                <mesh position={[0, 0, -0.10]} geometry={scrollGeom} material={materials.industrialSteel} />

                {/* Emiş Ağzí (Üstte Dairesel) */}
                <group position={[0, 0.36, 0.12]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} geometry={inletCylinderGeom} material={materials.galvanizedSteel} />
                    <mesh position={[0, 0, 0.03]} geometry={inletRingGeom} material={materials.galvanizedSteel} />
                </group>

                {/* Atış Ağzı (Yan Çıkış) */}
                <group position={[0.38, 0.22, 0]}>
                    <mesh geometry={outletBoxGeom1} material={materials.industrialSteel} />
                    <mesh position={[0.13, 0, 0]} geometry={outletBoxGeom2} material={materials.industrialSteel} />
                    {/* Çıkış Boşluğu */}
                    <mesh position={[0.01, 0.04, 0]} geometry={outletVoidGeom} material={materials.matteBlack} />
                </group>
            </group>

            {/* 3. İMPELLER GRUBU (Dönen Kanatlar) */}
            <group ref={impellerRef} position={[0, 0.05, 0]}>

                {/* İmpeller Göbek (Merkez) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} geometry={impellerHubGeom} material={materials.motorSilver} />

                {/* Marka Logosu (Kırmızı) */}
                <mesh position={[0, 0, 0.041]} rotation={[Math.PI / 2, 0, 0]} geometry={logoGeom} material={materials.logoRed} />

                {/* 12 Adet Geriye Kıvrımlı Kanat */}
                {Array(12).fill(0).map((_, i) => (
                    <group key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]}>
                        <mesh
                            geometry={impellerBladeGeometry}
                            position={[0.08, 0, -0.015]}
                            rotation={[0.50, 0, 0]}
                            material={materials.bladeBlack}
                        />
                    </group>
                ))}
            </group>

            {/* 4. KORUMA IZGARASI (Emiş Tarafı) */}
            <group position={[0, 0.36, 0.18]}>
                {torusGeoms.map((geom, i) => (
                    <mesh key={`ring-${i}`} geometry={geom} material={materials.industrialBlue} />
                ))}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]} geometry={wireGeom} material={materials.industrialBlue} />
                ))}
            </group>

        </group>
    )
}
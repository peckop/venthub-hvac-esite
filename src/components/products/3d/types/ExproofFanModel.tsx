"use client";
import React, { useEffect,useMemo } from 'react'
import type { Material } from 'three'
import {
    BoxGeometry,
    CylinderGeometry,
    ExtrudeGeometry,
    PlaneGeometry,
    RingGeometry,
    Shape,
    SphereGeometry,
    TorusGeometry} from 'three'

import { useResolveMaterials } from '../core'

interface BoltProps {
    position: [number, number, number];
    material: Material;
    cylinderGeometry: CylinderGeometry;
    sphereGeometry: SphereGeometry;
}

// Standart Cıvata (Krom) - Performance Optimized
const Bolt: React.FC<BoltProps> = ({ position, material, cylinderGeometry, sphereGeometry }) => (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={material} geometry={cylinderGeometry} />
        <mesh position={[0, 0.01, 0]} material={material} geometry={sphereGeometry} />
    </group>
)

export const ExproofFanModel: React.FC = () => {
    const materials = useResolveMaterials()

    // Salyangoz Formu - Dış Kontur - Memoized
    const scrollShape = useMemo(() => {
        const shape = new Shape()
        shape.moveTo(0, 0.44)
        shape.lineTo(0.58, 0.44)
        shape.lineTo(0.58, 0.08)
        shape.lineTo(0.32, 0.08)
        shape.quadraticCurveTo(0.38, -0.36, 0, -0.35)
        shape.quadraticCurveTo(-0.38, -0.36, -0.44, 0)
        shape.quadraticCurveTo(-0.44, 0.44, 0, 0.44)
        return shape
    }, [])

    // Geometriden VRAM temizliği için tüm geometrileri useMemo ile tanımlıyoruz:
    const motorBodyGeo = useMemo(() => new CylinderGeometry(0.18, 0.18, 0.42, 32), [])
    const coolingFinGeo = useMemo(() => new BoxGeometry(0.015, 0.39, 0.40), [])
    const klemensGeo = useMemo(() => new BoxGeometry(0.16, 0.12, 0.16), [])
    const warningLabelGeo = useMemo(() => new PlaneGeometry(0.08, 0.08), [])
    const rearCoverGeo = useMemo(() => new CylinderGeometry(0.19, 0.185, 0.12, 32), [])
    const mountFoot1Geo = useMemo(() => new BoxGeometry(0.25, 0.08, 0.30), [])
    const mountFoot2Geo = useMemo(() => new BoxGeometry(0.32, 0.02, 0.38), [])
    
    const scrollExtrudeGeo = useMemo(() => {
        return new ExtrudeGeometry(scrollShape, { depth: 0.24, bevelEnabled: false })
    }, [scrollShape])

    const copperHuniGeo = useMemo(() => new CylinderGeometry(0.24, 0.20, 0.04, 64, 1, true), [])
    const copperRingGeo = useMemo(() => new RingGeometry(0.20, 0.24, 64), [])
    
    const boltCylinderGeo = useMemo(() => new CylinderGeometry(0.012, 0.012, 0.02, 6), [])
    const boltSphereGeo = useMemo(() => new SphereGeometry(0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), [])

    const ringGeometries = useMemo(() => {
        return [0.05, 0.10, 0.15, 0.19].map(r => new TorusGeometry(r, 0.003, 8, 64))
    }, [])
    
    const wireGeo = useMemo(() => new BoxGeometry(0.38, 0.006, 0.006), [])

    const exhaustGeo1 = useMemo(() => new BoxGeometry(0.3, 0.35, 0.24), [])
    const exhaustGeo2 = useMemo(() => new BoxGeometry(0.02, 0.40, 0.28), [])
    const exhaustGeo3 = useMemo(() => new BoxGeometry(0.32, 0.28, 0.20), [])

    useEffect(() => {
        return () => {
            motorBodyGeo.dispose()
            coolingFinGeo.dispose()
            klemensGeo.dispose()
            warningLabelGeo.dispose()
            rearCoverGeo.dispose()
            mountFoot1Geo.dispose()
            mountFoot2Geo.dispose()
            scrollExtrudeGeo.dispose()
            copperHuniGeo.dispose()
            copperRingGeo.dispose()
            boltCylinderGeo.dispose()
            boltSphereGeo.dispose()
            ringGeometries.forEach(geo => geo.dispose())
            wireGeo.dispose()
            exhaustGeo1.dispose()
            exhaustGeo2.dispose()
            exhaustGeo3.dispose()
        }
    }, [
        motorBodyGeo,
        coolingFinGeo,
        klemensGeo,
        warningLabelGeo,
        rearCoverGeo,
        mountFoot1Geo,
        mountFoot2Geo,
        scrollExtrudeGeo,
        copperHuniGeo,
        copperRingGeo,
        boltCylinderGeo,
        boltSphereGeo,
        ringGeometries,
        wireGeo,
        exhaustGeo1,
        exhaustGeo2,
        exhaustGeo3
    ])

    return (
        <group>
            {/* 1. MOTOR & KAİDE (YAN MONTAJ) */}
            <group position={[0, 0.35, -0.32]}>
                {/* Motor Gövdesi (Gümüş/Alüminyum) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.motorSilver} geometry={motorBodyGeo} />

                {/* Soğutma Kanatları */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]} material={materials.motorSilver} geometry={coolingFinGeo} />
                ))}

                {/* Klemens Kutusu (Üstte) */}
                <group position={[0, 0.21, 0.05]}>
                    <mesh material={materials.zincGray} geometry={klemensGeo} />
                    {/* Sarı Şimşek Etiketi */}
                    <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.warningYellow} geometry={warningLabelGeo} />
                </group>

                {/* Arka Kapak (Fan Muhafazası) */}
                <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.boltChrome} geometry={rearCoverGeo} />

                {/* --- MONTAJ AYAKLARI (KAİDE) --- */}
                <group position={[0, -0.22, 0.05]}>
                    <mesh material={materials.castIron} geometry={mountFoot1Geo} />
                    <mesh position={[0, -0.05, 0]} material={materials.castIron} geometry={mountFoot2Geo} />
                </group>
            </group>

            {/* 2. SALYANGOZ GÖVDE (SCROLL HOUSING) */}
            <group position={[0, 0.35, 0]}>
                {/* Gövde Extrusion (Siyah Döküm) */}
                <mesh position={[0, 0, -0.12]} material={materials.exproofBlack} geometry={scrollExtrudeGeo} />

                {/* EMİŞ ÜNİTESİ (BAKIR + IZGARA) */}
                <group position={[0, 0, 0.125]}>

                    {/* A. Bakır Huni (Spark Protection Ring) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.copper} geometry={copperHuniGeo} />
                    {/* Bakır Ön Yüzey (Halka) */}
                    <mesh position={[0, 0, 0.02]} material={materials.copper} geometry={copperRingGeo} />

                    {/* B. Vidalar (Halkayı Tutan) */}
                    {[45, 135, 225, 315].map((angle, i) => (
                        <Bolt
                            key={i}
                            position={[
                                Math.cos(angle * Math.PI / 180) * 0.22,
                                Math.sin(angle * Math.PI / 180) * 0.22,
                                0.025
                            ]}
                            material={materials.boltChrome}
                            cylinderGeometry={boltCylinderGeo}
                            sphereGeometry={boltSphereGeo}
                        />
                    ))}

                    {/* C. Koruma Izgarası (Siyah Tel) */}
                    <group position={[0, 0, 0.015]}>
                        {/* Konsentrik Halkalar */}
                        {[0.05, 0.10, 0.15, 0.19].map((r, i) => (
                            <mesh key={`ring-${i}`} material={materials.matteBlack} geometry={ringGeometries[i]} />
                        ))}
                        {/* Radyal Teller */}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.matteBlack} geometry={wireGeo} />
                        ))}
                    </group>
                </group>

                {/* Atış Ağzı (Flanşlı) */}
                <group position={[0.45, 0.26, 0]}>
                    <mesh material={materials.exproofBlack} geometry={exhaustGeo1} />
                    {/* Flanş Plakası */}
                    <mesh position={[0.15, 0, 0]} material={materials.exproofBlack} geometry={exhaustGeo2} />
                    {/* Ağız Boşluğu */}
                    <mesh position={[0.01, 0.05, 0]} material={materials.matteBlack} geometry={exhaustGeo3} />
                </group>
            </group>
        </group>
    )
}

"use client";
import React, { useEffect,useMemo } from 'react'
import * as THREE from 'three'

import { useResolveMaterials } from '../core'

interface BoltProps {
    position: [number, number, number]
    cylinderGeo: THREE.CylinderGeometry
    sphereGeo: THREE.SphereGeometry
    boltChromeMaterial: THREE.Material
}

// Standart Cıvata (Exproof ile AYNI yapı, merkezi materyal)
const Bolt: React.FC<BoltProps> = ({ position, cylinderGeo, sphereGeo, boltChromeMaterial }) => (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={boltChromeMaterial} geometry={cylinderGeo} />
        <mesh position={[0, 0.01, 0]} material={boltChromeMaterial} geometry={sphereGeo} />
    </group>
)

/**
 * SnailFanModel (Standart Santrifüj / Salyangoz Fan)
 */
export const SnailFanModel: React.FC = () => {
    const materials = useResolveMaterials()

    // Salyangoz Formu - Dış Kontur (Exproof ile BİREBİR AYNI)
    const scrollShape = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0.44)
        shape.lineTo(0.58, 0.44)
        shape.lineTo(0.58, 0.08)
        shape.lineTo(0.32, 0.08)
        shape.quadraticCurveTo(0.38, -0.36, 0, -0.35)
        shape.quadraticCurveTo(-0.38, -0.36, -0.44, 0)
        shape.quadraticCurveTo(-0.44, 0.44, 0, 0.44)
        return shape
    }, [])

    // Memoized Geometries to prevent recreation on re-renders
    const geometries = useMemo(() => {
        const boltCylinder = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6)
        const boltSphere = new THREE.SphereGeometry(0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2)
        const motorBody = new THREE.CylinderGeometry(0.18, 0.18, 0.42, 32)
        const fin = new THREE.BoxGeometry(0.015, 0.39, 0.40)
        const klemensBox = new THREE.BoxGeometry(0.16, 0.12, 0.16)
        const label = new THREE.PlaneGeometry(0.08, 0.08)
        const rearCover = new THREE.CylinderGeometry(0.19, 0.185, 0.12, 32)
        const basePlate = new THREE.BoxGeometry(0.25, 0.08, 0.30)
        const baseFoot = new THREE.BoxGeometry(0.32, 0.02, 0.38)
        const extrude = new THREE.ExtrudeGeometry(scrollShape, { depth: 0.24, bevelEnabled: false })
        const inletFunnel = new THREE.CylinderGeometry(0.24, 0.20, 0.04, 64, 1, true)
        const inletRing = new THREE.RingGeometry(0.20, 0.24, 64)
        const toruses = [0.05, 0.10, 0.15, 0.19].map(r => new THREE.TorusGeometry(r, 0.003, 8, 64))
        const wire = new THREE.BoxGeometry(0.38, 0.006, 0.006)
        const outletBox = new THREE.BoxGeometry(0.3, 0.35, 0.24)
        const outletFlange = new THREE.BoxGeometry(0.02, 0.40, 0.28)
        const outletHole = new THREE.BoxGeometry(0.32, 0.28, 0.20)

        return {
            boltCylinder,
            boltSphere,
            motorBody,
            fin,
            klemensBox,
            label,
            rearCover,
            basePlate,
            baseFoot,
            extrude,
            inletFunnel,
            inletRing,
            toruses,
            wire,
            outletBox,
            outletFlange,
            outletHole
        }
    }, [scrollShape])

    // Cleanup geometries on unmount to release GPU memory (AX-10)
    useEffect(() => {
        return () => {
            geometries.boltCylinder.dispose()
            geometries.boltSphere.dispose()
            geometries.motorBody.dispose()
            geometries.fin.dispose()
            geometries.klemensBox.dispose()
            geometries.label.dispose()
            geometries.rearCover.dispose()
            geometries.basePlate.dispose()
            geometries.baseFoot.dispose()
            geometries.extrude.dispose()
            geometries.inletFunnel.dispose()
            geometries.inletRing.dispose()
            geometries.toruses.forEach(t => t.dispose())
            geometries.wire.dispose()
            geometries.outletBox.dispose()
            geometries.outletFlange.dispose()
            geometries.outletHole.dispose()
        }
    }, [geometries])

    return (
        <group>
            {/* 1. MOTOR & KAİDE (YAN MONTAJ) */}
            <group position={[0, 0.35, -0.32]}>
                {/* Motor Gövdesi (Endüstriyel Mavi/Gri) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialBlue} geometry={geometries.motorBody} />

                {/* Soğutma Kanatları */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (Math.PI / 12)]} material={materials.industrialBlue} geometry={geometries.fin} />
                ))}

                {/* Klemens Kutusu (Üstte) */}
                <group position={[0, 0.21, 0.05]}>
                    <mesh material={materials.darkGrey} geometry={geometries.klemensBox} />
                    {/* Etiket */}
                    <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.zincGray} geometry={geometries.label} />
                </group>

                {/* Arka Kapak (Fan Muhafazası) */}
                <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.motorSilver} geometry={geometries.rearCover} />

                {/* --- MONTAJ AYAKLARI (KAİDE) --- */}
                <group position={[0, -0.22, 0.05]}>
                    <mesh material={materials.darkGrey} geometry={geometries.basePlate} />
                    <mesh position={[0, -0.05, 0]} material={materials.darkGrey} geometry={geometries.baseFoot} />
                </group>
            </group>

            {/* 2. SALYANGOZ GÖVDE (SCROLL HOUSING) */}
            <group position={[0, 0.35, 0]}>
                {/* Gövde Extrusion (Endüstriyel Gri Sac) */}
                <mesh position={[0, 0, -0.12]} material={materials.industrialSteel} geometry={geometries.extrude} />

                {/* EMİŞ ÜNİTESİ */}
                <group position={[0, 0, 0.125]}>

                    {/* A. Huni (Galvaniz Gümüş) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel} geometry={geometries.inletFunnel} />
                    {/* Ön Yüzey (Halka) */}
                    <mesh position={[0, 0, 0.02]} material={materials.galvanizedSteel} geometry={geometries.inletRing} />

                    {/* B. Vidalar */}
                    {[45, 135, 225, 315].map((angle, i) => (
                        <Bolt
                            key={i}
                            position={[
                                Math.cos(angle * Math.PI / 180) * 0.22,
                                Math.sin(angle * Math.PI / 180) * 0.22,
                                0.025
                            ]}
                            cylinderGeo={geometries.boltCylinder}
                            sphereGeo={geometries.boltSphere}
                            boltChromeMaterial={materials.boltChrome}
                        />
                    ))}

                    {/* C. Koruma Izgarası */}
                    <group position={[0, 0, 0.015]}>
                        {geometries.toruses.map((torusGeo, i) => (
                            <mesh key={`ring-${i}`} material={materials.industrialBlue} geometry={torusGeo} />
                        ))}
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <mesh key={`wire-${i}`} rotation={[0, 0, angle * Math.PI / 180]} material={materials.industrialBlue} geometry={geometries.wire} />
                        ))}
                    </group>
                </group>

                {/* Atış Ağzı (Flanşlı) */}
                <group position={[0.45, 0.26, 0]}>
                    <mesh material={materials.industrialSteel} geometry={geometries.outletBox} />
                    <mesh position={[0.15, 0, 0]} material={materials.industrialSteel} geometry={geometries.outletFlange} />
                    {/* Ağız Boşluğu */}
                    <mesh position={[0.01, 0.05, 0]} material={materials.matteBlack} geometry={geometries.outletHole} />
                </group>
            </group>
        </group>
    )
}
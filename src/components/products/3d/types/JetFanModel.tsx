"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect,useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CatmullRomCurve3, CylinderGeometry, TorusGeometry, TubeGeometry, Vector3 } from 'three'

import { useResolveMaterials } from '../core'
import { type FanMaterials } from '../materials/useFanMaterials'

export const JetFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const fanRef = useRef<Group>(null)

    // OTOPARK JET FAN (Referans: Kullanıcı Resimleri - DÜZELTME)
    // - Sol taraf: DAMPER KANATLARI (3-4 adet yatay kanat)
    // - Sağ taraf: Radyal mazgal ızgara
    // - Pervane: TAM ORTADA (merkezde)
    // - Montaj: TAVAN ASMA APARATLARI (yukarı doğru)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.y -= delta * 25
        }
    })

    const geometries = useMemo(() => {
        // A. Cylinders
        const cylinder032 = new CylinderGeometry(0.32, 0.32, 0.8, 64, 1, true)
        const cylinder034 = new CylinderGeometry(0.34, 0.34, 0.03, 64)
        const cylinder028 = new CylinderGeometry(0.28, 0.28, 0.5, 64, 1, true)
        const cylinderPin = new CylinderGeometry(0.006, 0.006, 0.012, 8)
        const cylinderRakor = new CylinderGeometry(0.02, 0.025, 0.06, 16)
        const cylinderBolt = new CylinderGeometry(0.008, 0.008, 0.015, 8)
        const cylinderRotor = new CylinderGeometry(0.12, 0.12, 0.1, 32)

        // B. Toruses
        const torus032 = new TorusGeometry(0.32, 0.006, 8, 64)
        const torusRings = [0.12, 0.2, 0.28].map(radius => new TorusGeometry(radius, 0.006, 8, 32))

        // C. Boxes
        const innerBladeGeos = [0, -0.12, -0.22].map((xVal) => {
            const r = 0.31;
            const w = 2 * Math.sqrt(Math.max(0, r * r - xVal * xVal));
            return new BoxGeometry(0.015, 0.25, w);
        })
        const boxMazgal = new BoxGeometry(0.64, 0.01, 0.006)
        const boxGrey = new BoxGeometry(0.16, 0.14, 0.10)
        const boxMountVert = new BoxGeometry(0.08, 0.12, 0.015)
        const boxMountHoriz = new BoxGeometry(0.08, 0.015, 0.08)
        const boxRotorBlade = new BoxGeometry(0.20, 0.012, 0.06)

        return {
            cylinder032,
            cylinder034,
            cylinder028,
            cylinderPin,
            cylinderRakor,
            cylinderBolt,
            cylinderRotor,
            torus032,
            torusRings,
            innerBladeGeos,
            boxMazgal,
            boxGrey,
            boxMountVert,
            boxMountHoriz,
            boxRotorBlade
        }
    }, [])

    useEffect(() => {
        return () => {
            geometries.cylinder032.dispose()
            geometries.cylinder034.dispose()
            geometries.cylinder028.dispose()
            geometries.cylinderPin.dispose()
            geometries.cylinderRakor.dispose()
            geometries.cylinderBolt.dispose()
            geometries.cylinderRotor.dispose()
            geometries.torus032.dispose()
            geometries.torusRings.forEach(geo => geo.dispose())
            geometries.innerBladeGeos.forEach(geo => geo.dispose())
            geometries.boxMazgal.dispose()
            geometries.boxGrey.dispose()
            geometries.boxMountVert.dispose()
            geometries.boxMountHoriz.dispose()
            geometries.boxRotorBlade.dispose()
        }
    }, [geometries])

    return (
        <group scale={[0.9, 0.9, 0.9]} rotation={[0, -Math.PI / 4, 0]}>

            {/* A. ANA SİLİNDİRİK GÖVDE (Turuncu - Üç Bölümlü KAYNAKLI BİRLEŞİM) */}
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. Sol Bölüm (Giriş Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, 0.65, 0]} material={materials.jetOrange} geometry={geometries.cylinder032} />

                {/* Flanş 1: Sol-Orta Birleşimi */}
                <mesh position={[0, 0.25, 0]} material={materials.jetOrange} geometry={geometries.cylinder034} />

                {/* 2. Orta Bölüm (Motor Bölümü - KÜÇÜK ÇAP - Açık Uçlu) */}
                <mesh position={[0, 0, 0]} material={materials.jetOrange} geometry={geometries.cylinder028} />

                {/* Flanş 2: Orta-Sağ Birleşimi */}
                <mesh position={[0, -0.25, 0]} material={materials.jetOrange} geometry={geometries.cylinder034} />

                {/* 3. Sağ Bölüm (Çıkış Tarafı - Büyük Çap - Açık Uçlu) */}
                <mesh position={[0, -0.65, 0]} material={materials.jetOrange} geometry={geometries.cylinder032} />

                {/* Sac Et Kalınlığı (Uçlardaki Yuvarlatılmış Kenarlar) */}
                <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange} geometry={geometries.torus032} />
                <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange} geometry={geometries.torus032} />

                {/* --- SOL TARAF: İÇ KANATLAR (YATAY - Fotoğraftaki Gibi) --- */}
                <group position={[0, 1.05, 0]}>
                    {[0, -0.12, -0.22].map((xVal, k) => (
                        <mesh key={k} position={[xVal, -0.12, 0]} material={materials.jetOrange} geometry={geometries.innerBladeGeos[k]} />
                    ))}
                </group>

                {/* --- SAĞ MAZGAL IZGARA (Dairesel Tel Koruma) --- */}
                <group position={[0, -1.05, 0]}>
                    {Array(8).fill(0).map((_, k) => (
                        <mesh key={k} rotation={[0, (k / 8) * Math.PI, 0]} material={materials.jetOrange} geometry={geometries.boxMazgal} />
                    ))}
                    {[0.12, 0.2, 0.28].map((radius, j) => (
                        <mesh key={`ring-${j}`} rotation={[Math.PI / 2, 0, 0]} material={materials.jetOrange} geometry={geometries.torusRings[j]} />
                    ))}
                </group>
            </group>

            {/* B. GRİ ELEKTRİK KUTUSU */}
            <group position={[0, 0.303, 0.175]} rotation={[0.523, 0, 0]}>
                <mesh material={materials.greyBox} geometry={geometries.boxGrey} />
                {[0.065, -0.065].map(bx => [0.05, -0.05].map(by => (
                    <mesh key={`${bx}-${by}`} position={[bx, by, 0.051]} material={materials.matteBlack} geometry={geometries.cylinderPin} />
                )))}
            </group>

            {/* Kablo Giriş Rakoru */}
            <group position={[0, 0.28, 0]}>
                <mesh position={[0, 0.03, 0]} material={materials.cableGrey} geometry={geometries.cylinderRakor} />
                <group position={[0, 0.06, 0]}>
                    <FlexibleCable materials={materials} />
                </group>
            </group>

            {/* C. MONTAJ AYAKLARI */}
            {[-0.35, 0.35].map((xPos) => (
                <group key={xPos} position={[xPos, 0, 0]}>
                    {[-0.22, 0.22].map((zPos) => (
                        <group key={zPos} position={[0, -0.28, zPos]}>
                            <mesh position={[0, 0, 0]} material={materials.jetOrange} geometry={geometries.boxMountVert} />
                            <mesh position={[0, -0.06, zPos > 0 ? 0.04 : -0.04]} material={materials.jetOrange} geometry={geometries.boxMountHoriz} />
                            <mesh position={[0, -0.061, zPos > 0 ? 0.05 : -0.05]} material={materials.cableGrey} geometry={geometries.cylinderBolt} />
                        </group>
                    ))}
                </group>
            ))}

            {/* D. İÇ PERVANE (Rotor) */}
            <group ref={fanRef} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <mesh material={materials.brushedAluminum} geometry={geometries.cylinderRotor} />
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.17, 0, 0]} material={materials.cableGrey} geometry={geometries.boxRotorBlade} />
                ))}
            </group>
        </group>
    )
}

const FlexibleCable = ({ materials }: { materials: FanMaterials }) => {
    const path = useMemo(() => {
        return new CatmullRomCurve3([
            new Vector3(0, 0, 0),
            new Vector3(0, 0.04, 0.05),
            new Vector3(0, 0.06, 0.12),
            new Vector3(0, 0.06, 0.175),
        ])
    }, [])

    const tubeGeo = useMemo(() => {
        return new TubeGeometry(path, 20, 0.012, 8, false)
    }, [path])

    useEffect(() => {
        return () => {
            tubeGeo.dispose()
        }
    }, [tubeGeo])

    return (
        <mesh material={materials.cableGrey} geometry={tubeGeo} />
    )
}

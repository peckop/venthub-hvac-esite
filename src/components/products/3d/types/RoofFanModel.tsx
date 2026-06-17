"use client";
"use no memo";
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import {
    BoxGeometry,
    CircleGeometry,
    CylinderGeometry,
    DoubleSide,
    LatheGeometry,
    MeshStandardMaterial,
    PlaneGeometry,
    TorusGeometry,
    Vector2,
} from 'three'

import { useResolveMaterials } from '../core'

// Pre-allocate Vector2 instances for LatheGeometry to prevent allocations inside render/useFrame
const LATHE_POINTS = [
    new Vector2(0.69, 0.58),  // Shroud eteği alt (DIŞA AÇILI/KONİK)
    new Vector2(0.65, 0.76),  // Shroud eteği üst
    new Vector2(0.60, 0.80),  // Yumuşak geçiş radyüsü 1
    new Vector2(0.38, 0.86),  // Yumuşak geçiş radyüsü 2 (Koniye bağlanış)
    new Vector2(0.22, 1.28),  // Koni üst
]

export const RoofFanModel: React.FC = () => {
    const materials = useResolveMaterials()
    const rotorRef = useRef<Group>(null)

    // Vortice Torrette TR-ED Serisi - Teknik İyileştirme
    // - Oranlar: Büyük Konik Başlık / Dar Alt Izgara
    // - Rotor: Backward Curved Plug Fan
    // - Detaylar: Eyebolts ve Yağmur Korumalı Shroud

    useFrame((_state, delta) => {
        if (rotorRef.current) {
            rotorRef.current.rotation.y -= delta * 6
        }
    })

    // Vortice Logo Texture - useTexture handles caching & disposal
    const logoTexture = useTexture('/Vortice_logo.png')
    if (logoTexture) logoTexture.anisotropy = 16

    // Memoize custom material for the logo
    const logoMat = useMemo(() => {
        return new MeshStandardMaterial({
            map: logoTexture,
            transparent: false,
            side: DoubleSide
        })
    }, [logoTexture])

    // Memoize all geometries to avoid recreation on each render pass
    const geometries = useMemo(() => {
        const basePlateGeo = new BoxGeometry(1.42, 0.10, 1.42)
        const inletFlangeGeo = new CylinderGeometry(0.28, 0.32, 0.01, 32)
        const inletFlangeCircleGeo = new CircleGeometry(0.24, 32)
        const boltGeo = new CylinderGeometry(0.015, 0.015, 0.04, 8)
        const staticInletGeo = new CylinderGeometry(0.24, 0.28, 0.24, 64, 1, true)
        const supportLamaGeo = new BoxGeometry(0.01, 0.51, 0.045)
        const supportFootGeo = new BoxGeometry(0.08, 0.01, 0.045)
        const supportBoltNutGeo = new CylinderGeometry(0.02, 0.02, 0.03, 6)
        const supportBoltStudGeo = new CylinderGeometry(0.01, 0.01, 0.02, 16)
        const supportBoltSideGeo = new CylinderGeometry(0.008, 0.008, 0.015, 6)
        const wireGeo = new CylinderGeometry(0.002, 0.002, 0.51, 4)
        const ringGeo = new TorusGeometry(0.665, 0.002, 8, 64)
        const rotorBackPlateGeo = new CylinderGeometry(0.40, 0.40, 0.012, 64)
        const rotorFrontPlateGeo = new CylinderGeometry(0.28, 0.40, 0.012, 64)
        const rotorInletLipGeo = new CylinderGeometry(0.24, 0.28, 0.04, 64, 1, true)
        const rotorHubGeo = new CylinderGeometry(0.055, 0.055, 0.56, 32)
        const rotorHubFlangeGeo = new CylinderGeometry(0.08, 0.08, 0.02, 32)
        const bladeNarrowGeo = new BoxGeometry(0.10, 0.54, 0.008)
        const bladeWideGeo = new BoxGeometry(0.11, 0.54, 0.008)
        const latheGeo = new LatheGeometry(LATHE_POINTS, 64)
        const bracketHorizontalGeo = new BoxGeometry(0.05, 0.02, 0.04)
        const bracketVerticalGeo = new BoxGeometry(0.02, 0.08, 0.04)
        const logoPlaneGeo = new PlaneGeometry(0.14, 0.14)
        const logoWhiteCircleGeo = new CircleGeometry(0.035, 32)
        const logoRedCircleGeo = new CircleGeometry(0.02, 32)
        const logoCenterCircleGeo = new CircleGeometry(0.008, 16)
        const topCapLowerGeo = new CylinderGeometry(0.208, 0.208, 0.03, 64)
        const topCapUpperGeo = new CylinderGeometry(0.224, 0.224, 0.08, 64)
        const topCapBoltGeo = new CylinderGeometry(0.006, 0.006, 0.005, 12)
        const eyeboltTorusGeo = new TorusGeometry(0.02, 0.005, 12, 24)

        return {
            basePlateGeo,
            inletFlangeGeo,
            inletFlangeCircleGeo,
            boltGeo,
            staticInletGeo,
            supportLamaGeo,
            supportFootGeo,
            supportBoltNutGeo,
            supportBoltStudGeo,
            supportBoltSideGeo,
            wireGeo,
            ringGeo,
            rotorBackPlateGeo,
            rotorFrontPlateGeo,
            rotorInletLipGeo,
            rotorHubGeo,
            rotorHubFlangeGeo,
            bladeNarrowGeo,
            bladeWideGeo,
            latheGeo,
            bracketHorizontalGeo,
            bracketVerticalGeo,
            logoPlaneGeo,
            logoWhiteCircleGeo,
            logoRedCircleGeo,
            logoCenterCircleGeo,
            topCapLowerGeo,
            topCapUpperGeo,
            topCapBoltGeo,
            eyeboltTorusGeo,
        }
    }, [])

    // Clean up VRAM on unmount by disposing of all geometries and the custom material
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach((geo) => geo.dispose())
            logoMat.dispose()
        }
    }, [geometries, logoMat])

    return (
        <group scale={[0.85, 0.85, 0.85]}>

            {/* 1. ALT KAİDE VE TEKNİK ŞASİ (Revize Boyutlar: 1.42m / 10cm Kalınlık) */}
            <mesh
                position={[0, 0.05, 0]}
                geometry={geometries.basePlateGeo}
                material={materials.matteBlack}
            />

            {/* Hava Giriş Flanşı */}
            <mesh
                position={[0, 0.005, 0]}
                geometry={geometries.inletFlangeGeo}
                material={materials.matteBlack}
            />
            <mesh
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                geometry={geometries.inletFlangeCircleGeo}
                material={materials.matteBlack}
            />

            {/* Zemin Montaj Civataları (4 Köşede - Revize Konum) */}
            {[
                [0.64, 0.64], [-0.64, 0.64], [-0.64, -0.64], [0.64, -0.64]
            ].map((pos, i) => (
                <mesh
                    key={`corner-bolt-${i}`}
                    position={[pos[0], 0.105, pos[1]]}
                    geometry={geometries.boltGeo}
                    material={materials.industrialSteel}
                />
            ))}

            {/* Statik Emiş Boğazı - Plug Fan Inlet Lip'e TEMAS (Kaynak) */}
            <group position={[0, 0.1, 0]}>
                <mesh
                    position={[0, 0.12, 0]}
                    geometry={geometries.staticInletGeo}
                    material={materials.matteBlack}
                />
            </group>

            {/* 2. TEKNİK IZGARA (Tel Kafes) - Revize Edilmiş Geniş Çap ve Detaylar */}
            <group position={[0, 0.325, 0]}>
                {/* 4 Ana Taşıyıcı Lama (Flat Bars) - Köşelere Hizalı (45 Derece) ve Teğet Geniş Yüzey */}
                {[Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].map((rot, i) => (
                    <group key={`support-${i}`} rotation={[0, rot, 0]}>
                        {/* Lama Gövdesi (Teğet Genişlik: 45mm, Radyal Kalınlık: 10mm) */}
                        <mesh
                            position={[0.67, 0, 0]}
                            geometry={geometries.supportLamaGeo}
                            material={materials.darkGrey}
                        />
                        {/* L-Büküm Ayak (Zemine Basan Kıvrım) - DIŞA Doğru 8cm */}
                        <mesh
                            position={[0.71, -0.22, 0]}
                            geometry={geometries.supportFootGeo}
                            material={materials.darkGrey}
                        />
                        {/* L-Ayak Montaj Civatası (Zemine Sabitleme) */}
                        <group position={[0.73, -0.20, 0]}>
                            <mesh
                                geometry={geometries.supportBoltNutGeo}
                                material={materials.industrialSteel}
                            />
                            <mesh
                                position={[0, 0.02, 0]}
                                geometry={geometries.supportBoltStudGeo}
                                material={materials.castBladeMat}
                            />
                        </group>
                        {/* Lama Montaj Civataları (Üst-Orta-Alt) */}
                        {[0.20, 0, -0.20].map((y, j) => (
                            <mesh
                                key={`bolt-${i}-${j}`}
                                position={[0.68, y, 0]}
                                rotation={[0, 0, Math.PI / 2]}
                                geometry={geometries.supportBoltSideGeo}
                                material={materials.industrialSteel}
                            />
                        ))}
                    </group>
                ))}

                {/* İnce Dikey Teller (Sayısı artırıldı: 64 adet) */}
                {Array(64).fill(0).map((_, i) => {
                    // Lamalara denk gelen yerleri atla (Her 16 telde bir)
                    if (i % 16 === 0) return null

                    const angle = (i / 64) * Math.PI * 2
                    const r = 0.665 // Lamaların hemen içinden geçecek
                    return (
                        <mesh
                            key={`wire-${i}`}
                            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
                            geometry={geometries.wireGeo}
                            material={materials.bladeBlack}
                        />
                    )
                })}

                {/* Yatay Destek Halkaları (Çap Shroud ile uyumlu) */}
                {Array(8).fill(0).map((_, k) => (
                    <mesh
                        key={`ring-${k}`}
                        position={[0, -0.20 + k * 0.055, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                        geometry={geometries.ringGeo}
                        material={materials.bladeBlack}
                    />
                ))}
            </group>

            {/* ===== 3. PLUG FAN (BACKWARD CURVED CENTRIFUGAL IMPELLER) ===== */}
            <group ref={rotorRef} position={[0, 0.495, 0]}>

                {/* --- ARKA PLAKA (Back Plate / Hub Plate) - Yükseltilmiş --- */}
                <mesh
                    position={[0, 0.28, 0]}
                    geometry={geometries.rotorBackPlateGeo}
                    material={materials.matteBlack}
                />

                {/* --- ÖN PLAKA (Inlet Shroud) - Alçaltılmış --- */}
                <mesh
                    position={[0, -0.28, 0]}
                    geometry={geometries.rotorFrontPlateGeo}
                    material={materials.matteBlack}
                />
                {/* Kavisli emiş dudağı (inlet lip) */}
                <mesh
                    position={[0, -0.30, 0]}
                    geometry={geometries.rotorInletLipGeo}
                    material={materials.matteBlack}
                />

                {/* --- MOTOR GÖBEĞİ (Hub) - Uzatılmış --- */}
                <mesh
                    geometry={geometries.rotorHubGeo}
                    material={materials.industrialSteel}
                />
                {/* Göbek flanşı */}
                <mesh
                    position={[0, 0.27, 0]}
                    geometry={geometries.rotorHubFlangeGeo}
                    material={materials.industrialSteel}
                />

                {/* --- 9 ADET BACKWARD-CURVED KANAT (Yüksekliği Artırılmış) --- */}
                {Array(9).fill(0).map((_, i) => {
                    const baseAngle = (i / 9) * Math.PI * 2
                    return (
                        <group key={`blade-${i}`} rotation={[0, baseAngle, 0]}>
                            {/* Segment 1: Hub yakını */}
                            <mesh
                                position={[0.125, 0, 0]}
                                rotation={[0, -0.10, 0]}
                                geometry={geometries.bladeNarrowGeo}
                                material={materials.roofBlade}
                            />
                            {/* Segment 2: İç orta */}
                            <mesh
                                position={[0.21, 0, 0.015]}
                                rotation={[0, -0.28, 0]}
                                geometry={geometries.bladeWideGeo}
                                material={materials.roofBlade}
                            />
                            {/* Segment 3: Dış orta */}
                            <mesh
                                position={[0.30, 0, 0.045]}
                                rotation={[0, -0.50, 0]}
                                geometry={geometries.bladeWideGeo}
                                material={materials.roofBlade}
                            />
                            {/* Segment 4: Dış kenar */}
                            <mesh
                                position={[0.37, 0, 0.09]}
                                rotation={[0, -0.72, 0]}
                                geometry={geometries.bladeNarrowGeo}
                                material={materials.roofBlade}
                            />
                        </group>
                    )
                })}
            </group>

            {/* 4. & 5. YEKPARE GÖVDE (Shroud + Koni + Radyüs) */}
            <mesh
                position={[0, 0, 0]}
                geometry={geometries.latheGeo}
                material={materials.roofAntracite}
            />

            {/* Shroud üzerindeki L-Braketler (Tek parça döküm üzerinde montaj detayları) */}
            <group position={[0, 0.6625, 0]}>
                {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
                    <group key={`clip-${i}`} rotation={[0, rot, 0]}>
                        <mesh
                            position={[0.64, 0.04, 0]}
                            geometry={geometries.bracketHorizontalGeo}
                            material={materials.industrialSteel}
                        />
                        <mesh
                            position={[0.66, 0.08, 0]}
                            geometry={geometries.bracketVerticalGeo}
                            material={materials.industrialSteel}
                        />
                    </group>
                ))}
            </group>

            {/* Vortice Kurumsal Logo (CANVAS TEXTURE - Konik Yüzeye Sıfır Temas - Clipping Fix) */}
            <group position={[0, 1.02, 0.33]} rotation={[-0.36, 0, 0]}>
                <mesh
                    geometry={geometries.logoPlaneGeo}
                    material={logoTexture ? logoMat : materials.vorticeGreen}
                />
            </group>

            {/* Gösterge Ünitesi (EŞ MERKEZLİ: Beyaz halka + Kırmızı delik - Konik Yüzeye Sıfır Temas - Clipping Fix) */}
            <group position={[0, 0.90, 0.38]} rotation={[-0.36, 0, 0]}>
                <mesh
                    geometry={geometries.logoWhiteCircleGeo}
                    material={materials.plasticWhite}
                />
                <mesh
                    position={[0, 0, 0.005]}
                    geometry={geometries.logoRedCircleGeo}
                    material={materials.logoRed}
                />
                <mesh
                    position={[0, 0, 0.010]}
                    geometry={geometries.logoCenterCircleGeo}
                    material={materials.bladeBlack}
                />
            </group>

            {/* 6. ÜST BİTİŞ KAPAĞI - Vida Detaylı */}
            <group position={[0, 1.28, 0]}>
                <mesh
                    position={[0, 0.01, 0]}
                    geometry={geometries.topCapLowerGeo}
                    material={materials.roofAntracite}
                />
                <mesh
                    position={[0, 0.06, 0]}
                    geometry={geometries.topCapUpperGeo}
                    material={materials.roofAntracite}
                />

                {/* Üst Kapak Montaj Vidaları (6 Adet) */}
                {Array(6).fill(0).map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2
                    return (
                        <mesh
                            key={`top-bolt-${i}`}
                            position={[Math.cos(angle) * 0.18, 0.101, Math.sin(angle) * 0.18]}
                            geometry={geometries.topCapBoltGeo}
                            material={materials.boltChrome}
                        />
                    )
                })}

                {/* Eyebolts (Taşıma Halkaları) */}
                {[-0.10, 0.10].map((x, i) => (
                    <mesh
                        key={`eyebolt-${i}`}
                        position={[x, 0.10, 0]}
                        rotation={[0, 0, Math.PI / 2]}
                        geometry={geometries.eyeboltTorusGeo}
                        material={materials.castIron}
                    />
                ))}
            </group>
        </group >
    )
}

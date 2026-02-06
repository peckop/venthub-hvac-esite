import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const DomesticFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // Referans Görsel 3: Kare, Beyaz/Metalik, Delikli Izgaralı Banyo Fanı (Vortice Quattro vb.)

    // Ön Panel (Kare)
    const panelSize = 1.0 // 1 birim kare
    const panelThickness = 0.08

    // WC/Banyo Fanı - Küçük Plastik
    // Konut tipi olduğu için, endüstriyel fanların yanında çok küçük görünmeli (15x15cm).

    // WC/Banyo Fanı - Küçük Plastik
    // Konut tipi olduğu için, endüstriyel fanların yanında çok küçük görünmeli (15x15cm).

    // useFrame: Konut tipi fanın dışı (menfez) dönmez. İçindeki pervane de görünmüyor.
    // O yüzden animasyon iptal edildi.

    return (
        // SCALE FIX: 0.25 (Endüstriyeller 0.6-0.7 iken bu 0.25 olmalı)
        <group ref={fanRef} position={[0, 0, 0]} scale={[0.25, 0.25, 0.25]}>
            {/* 1. ÖN PANEL ÇERÇEVESİ (Krom/Parlak Metal veya Beyaz Plastik) */}
            {/* DÜZELTME: chrome -> brushedAluminum */}
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[panelSize, panelSize, panelThickness]} />
            </mesh>

            {/* 2. IZGARA ALANI (İç Kısım) */}
            <group position={[0, 0, panelThickness / 2 + 0.01]}>

                {/* Izgara Arkaplanı */}
                <mesh position={[0, 0, -0.01]} material={materials.matteBlack}>
                    <planeGeometry args={[panelSize * 0.85, panelSize * 0.85]} />
                </mesh>

                {/* IZGARA DOKUSU (Grid of holes) */}

                {Array(12).fill(0).map((_, row) => (
                    Array(12).fill(0).map((_, col) => {
                        const x = (col - 5.5) * (panelSize * 0.07)
                        const y = (row - 5.5) * (panelSize * 0.07)
                        return (
                            // DÜZELTME: aluminum -> industrialSteel
                            <mesh key={`grid-${row}-${col}`} position={[x, y, 0]} material={materials.industrialSteel}>
                                <boxGeometry args={[panelSize * 0.05, panelSize * 0.05, 0.005]} />
                            </mesh>
                        )
                    })
                ))}
            </group>

            {/* 3. ARKA GÖVDE (Duvara giren kısım - Silindir) */}
            {/* DÜZELTME: plasticWhite -> ral7035 */}
            <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.ral7035}>
                <cylinderGeometry args={[0.35, 0.35, 0.4, 32]} />
            </mesh>

            {/* 4. MARKALAMA (Alt Köşe) */}
            <mesh position={[0.35, -0.4, panelThickness / 2 + 0.02]}>
                <planeGeometry args={[0.15, 0.05]} />
                <meshBasicMaterial color="#94a3b8" /> {/* Gri Logo */}
            </mesh>

        </group>
    )
}

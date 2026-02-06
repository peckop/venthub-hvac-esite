import React from 'react'
import { useFanMaterials } from '../materials/useFanMaterials'

export const RoofFanModel: React.FC = () => {
    const materials = useFanMaterials()

    // Referans Görsel 1: Köşeli, galvaniz, şapkalı çatı fanı (C Tipi)

    // Kasa Boyutları
    const baseWidth = 1.2
    const baseHeight = 0.5
    const hatWidth = 1.3
    const hatHeight = 0.4

    return (
        <group position={[0, -0.4, 0]}>
            {/* 1. ALT KAİDE (Kare Kasa) */}
            <mesh position={[0, baseHeight / 2, 0]} material={materials.galvanizedSteel}>
                <boxGeometry args={[baseWidth, baseHeight, baseWidth]} />
            </mesh>

            {/* 2. KAFESLİ BÖLÜM (Yanlar) */}
            {/* Kafes dokusu yerine temsili ızgara çubukları kullanacağız (Performans için) */}
            <group position={[0, baseHeight / 2, 0]}>
                {/* 4 Köşeye Dikmeler */}
                {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map((corner, i) => (
                    <mesh key={`pole-${i}`} position={[corner[0] * (baseWidth / 2 - 0.02), 0, corner[1] * (baseWidth / 2 - 0.02)]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.04, baseHeight, 0.04]} />
                    </mesh>
                ))}

                {/* Yatay Teller (Temsili Kafes) */}
                {Array(6).fill(0).map((_, i) => {
                    const y = (i - 2.5) * (baseHeight / 7)
                    return (
                        <group key={`wire-${i}`} position={[0, y, 0]}>
                            {/* Ön/Arka Teller */}
                            <mesh position={[0, 0, baseWidth / 2]} material={materials.matteBlack}>
                                <boxGeometry args={[baseWidth - 0.1, 0.005, 0.005]} />
                            </mesh>
                            <mesh position={[0, 0, -baseWidth / 2]} material={materials.matteBlack}>
                                <boxGeometry args={[baseWidth - 0.1, 0.005, 0.005]} />
                            </mesh>
                            {/* Sağ/Sol Teller */}
                            <mesh position={[baseWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.matteBlack}>
                                <boxGeometry args={[baseWidth - 0.1, 0.005, 0.005]} />
                            </mesh>
                            <mesh position={[-baseWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.matteBlack}>
                                <boxGeometry args={[baseWidth - 0.1, 0.005, 0.005]} />
                            </mesh>
                        </group>
                    )
                })}
            </group>

            {/* 3. İÇ FAN (Siluet) */}
            <mesh position={[0, baseHeight / 2, 0]} material={materials.brushedAluminum}>
                <cylinderGeometry args={[0.4, 0.4, baseHeight - 0.1, 32]} />
            </mesh>

            {/* 4. ŞAPKA (Üst Kapak - Piramit benzeri) */}
            <group position={[0, baseHeight + 0.05, 0]}>
                {/* Şapka Tabanı (Düz Plaka) */}
                <mesh position={[0, 0, 0]} material={materials.galvanizedSteel}>
                    <boxGeometry args={[hatWidth, 0.05, hatWidth]} />
                </mesh>

                {/* Şapka Gövdesi (Kesik Piramit - 4 Köşeli Cylinder ile yapılır) */}
                <mesh position={[0, hatHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[hatWidth * 0.4, hatWidth * 0.95, hatHeight, 4]} />
                </mesh>

                {/* En Üst Düz Kapak */}
                <mesh position={[0, hatHeight, 0]} material={materials.galvanizedSteel}>
                    <boxGeometry args={[hatWidth * 0.45, 0.02, hatWidth * 0.45]} />
                </mesh>
            </group>

            {/* 5. DETAYLAR (Vidalar vs) */}
            {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map((corner, i) => (
                <mesh key={`screw-${i}`} position={[corner[0] * (hatWidth / 2 - 0.1), baseHeight + 0.08, corner[1] * (hatWidth / 2 - 0.1)]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.02, 0.02, 0.05, 8]} />
                </mesh>
            ))}

        </group>
    )
}

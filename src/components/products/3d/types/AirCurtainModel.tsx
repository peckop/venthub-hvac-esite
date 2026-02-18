import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export function AirCurtainModel() {
    const drumRef = useRef<THREE.Group>(null)
    const materials = useFanMaterials()

    // Animasyon: İç tambur fanın (Cross-Flow) X ekseni etrafında dönmesi
    useFrame((state, delta) => {
        if (drumRef.current) {
            drumRef.current.rotation.x -= delta * 12
        }
    })

    return (
        <group scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 2, 0]}>

            {/* 1. ANA GÖVDE (Body) - Metalik Gri */}
            <mesh name="Body" material={materials.brushedAluminum}>
                <boxGeometry args={[2.5, 0.5, 0.5]} />
            </mesh>

            {/* Yan Kapaklar - Daha koyu metalik */}
            {[-1.23, 1.23].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.05, 0.51, 0.51]} />
                </mesh>
            ))}

            {/* 2. SERVİS KAPAĞI (Service Cover) - Üst Panel */}
            <mesh name="ServiceCover" position={[0, 0.255, 0]} material={materials.ral7035}>
                <boxGeometry args={[2.4, 0.02, 0.45]} />
            </mesh>

            {/* 3. İÇ TAMBUR FAN (Cross-Flow Drum) */}
            <group ref={drumRef} position={[0, 0, -0.05]}>
                {/* Mil - X ekseni boyunca uzanır */}
                <mesh rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.02, 0.02, 2.3, 12]} />
                </mesh>

                {/* Kanatçık Halkaları (Diskler) - X ekseni boyunca dizilir */}
                {Array(18).fill(0).map((_, i) => (
                    <mesh
                        key={`ring-${i}`}
                        position={[1.15 - (i * 0.13), 0, 0]}
                        rotation={[0, 0, Math.PI / 2]}
                        material={materials.industrialSteel}
                    >
                        <cylinderGeometry args={[0.15, 0.15, 0.01, 32, 1, true]} />
                    </mesh>
                ))}

                {/* Boyuna Kanatlar - Mil etrafında dairesel dizilim */}
                {Array(12).fill(0).map((_, i) => (
                    <group key={`blade-row-${i}`} rotation={[(i / 12) * Math.PI * 2, 0, 0]}>
                        <mesh
                            position={[0, 0.14, 0]}
                            rotation={[0, 0, Math.PI / 2]}
                        >
                            <boxGeometry args={[0.01, 2.3, 0.04]} />
                            <meshStandardMaterial {...materials.industrialSteel} side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* 4. ISITICI BATARYA (Heating Coil) - Bakır/Kırmızı Detay */}
            <group position={[0, -0.15, 0.15]}>
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={`coil-${i}`} position={[0, (i - 3.5) * 0.05, 0]} material={materials.safetyOrange}>
                        <boxGeometry args={[2.3, 0.01, 0.1]} />
                    </mesh>
                ))}
            </group>

            {/* 5. ÜFLEME IZGARASI (Outlet Grille) - Ayarlanabilir Kanatlar */}
            <group position={[0, -0.26, 0.12]}>
                {[-0.08, -0.04, 0, 0.04, 0.08].map((z, i) => (
                    <mesh key={`grille-${i}`} position={[0, 0, z]} rotation={[0.4, 0, 0]} material={materials.matteBlack}>
                        <boxGeometry args={[2.3, 0.005, 0.03]} />
                    </mesh>
                ))}
            </group>

            {/* 6. KONTROL PANELİ & LOGO ALANI */}
            <group position={[1.1, 0, 0.251]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.2, 0.3, 0.01]} />
                </mesh>
                <mesh position={[0, 0.08, 0.01]}>
                    <circleGeometry args={[0.02, 16]} />
                    <meshBasicMaterial color="#22c55e" />
                </mesh>
            </group>

        </group>
    )
}

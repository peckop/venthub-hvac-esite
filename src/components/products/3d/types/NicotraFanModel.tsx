import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const NicotraFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // Nicotra Gebhardt DD Serisi - CORRECTED AXIS
    // Salganyoz DİK durur. Mil YATAY (X ekseni) durur.

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.x -= delta * 15 // X ekseninde dönüş (Tekerlek gibi)
        }
    })

    const sideShape = useMemo(() => {
        const shape = new THREE.Shape()
        // Logaritmik Spiral Profili
        const segments = 48
        for (let i = 0; i <= segments; i++) {
            const th = (i / segments) * Math.PI * 2.2
            const r = 0.3 + (th / (Math.PI * 2)) * 0.4
            const x = Math.cos(th) * r
            const y = Math.sin(th) * r
            if (i === 0) shape.moveTo(x, y)
            else shape.lineTo(x, y)
        }
        // Atış ağzı
        shape.lineTo(0.5, 0.5)
        shape.lineTo(0.2, 0.5)

        const hole = new THREE.Path()
        hole.absarc(0, 0, 0.28, 0, Math.PI * 2, true)
        shape.holes.push(hole)
        return shape
    }, [])

    return (
        <group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>

            {/* 1. X-ŞASİ (Base Frame) */}
            <group position={[0, -0.5, 0]}>
                <mesh material={materials.galvanizedSteel}>
                    <boxGeometry args={[1.0, 0.05, 1.0]} />
                </mesh>
                {/* Titreşim Takozları */}
                {[0.4, -0.4].map(x => [0.4, -0.4].map(z => (
                    <mesh key={`${x}-${z}`} position={[x, -0.05, z]} material={materials.matteBlack}>
                        <boxGeometry args={[0.1, 0.05, 0.1]} />
                    </mesh>
                )))}
            </group>

            {/* 2. SALYANGOZ GÖVDE (Scroll Housing) */}
            <group position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}> {/* Y ekseninde çevir ki X eksenine baksın */}

                {/* Yan Saclar */}
                <mesh position={[0, 0, 0.3]} material={materials.galvanizedSteel}>
                    <extrudeGeometry args={[sideShape, { depth: 0.02, bevelEnabled: false }]} />
                </mesh>
                <mesh position={[0, 0, -0.32]} material={materials.galvanizedSteel}>
                    <extrudeGeometry args={[sideShape, { depth: 0.02, bevelEnabled: false }]} />
                </mesh>

                {/* Sırt Sacı (Wrapper) - Basit Silindir Parçası */}
                <mesh rotation={[0, 0, Math.PI / 2]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.6, 0.6, 0.6, 32, 1, true, 0, 4.5]} />
                    <meshStandardMaterial side={THREE.DoubleSide} {...materials.galvanizedSteel} />
                </mesh>

                {/* Atış Ağzı */}
                <group position={[0.4, 0.5, 0]}>
                    <mesh material={materials.industrialSteel}>
                        <boxGeometry args={[0.5, 0.02, 0.64]} />
                    </mesh>
                </group>

            </group>

            {/* 3. ROTOR (Fan Wheel) - X Ekseninde Dönüyor */}
            <group ref={fanRef} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                {/* Sık Kanatlı Çark */}
                <mesh material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.38, 0.38, 0.58, 32, 1, true]} />
                    <meshStandardMaterial side={THREE.DoubleSide} {...materials.galvanizedSteel} />
                </mesh>
                {/* Kanatlar */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 24) * Math.PI * 2, 0]} position={[0.36, 0, 0]}>
                        <boxGeometry args={[0.02, 0.58, 0.1]} />
                    </mesh>
                ))}
            </group>

            {/* 4. MOTOR (Direkt Akuple - Yan Tarafta) */}
            <group position={[-0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <mesh material={materials.ral5010}>
                    <cylinderGeometry args={[0.18, 0.18, 0.3, 32]} />
                </mesh>
            </group>

        </group>
    )
}

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const WallMountedCompactFanModel: React.FC = () => {
    // CRITICAL FIX: DO NOT USE useFanMaterials hook for spreading props.
    // It causes "White Material" bug because THREE.Material instances cannot be spread into JSX.
    // We define plain colors here.

    const fanRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    // 1. PLATE GEOMETRY
    const plateGeometry = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(-0.5, -0.5)
        shape.lineTo(0.5, -0.5)
        shape.lineTo(0.5, 0.5)
        shape.lineTo(-0.5, 0.5)
        shape.lineTo(-0.5, -0.5)

        // Mounting Holes
        const holeRadius = 0.03
        const holeOffset = 0.42
        const corners = [
            [holeOffset, holeOffset], [-holeOffset, holeOffset],
            [holeOffset, -holeOffset], [-holeOffset, -holeOffset]
        ]
        corners.forEach(([x, y]) => {
            const hole = new THREE.Path()
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true)
            shape.holes.push(hole)
        })

        // Center Hole
        const centerHole = new THREE.Path()
        centerHole.absarc(0, 0, 0.42, 0, Math.PI * 2, true)
        shape.holes.push(centerHole)

        return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false })
    }, [])

    // --- COLOR PALETTE (Hardcoded for Safety) ---
    const COLORS = {
        PLATE: '#94a3b8', // Galvanized Steel
        BLACK_PARTS: '#1e293b', // Matte Black (Motor, Hub)
        BLADE_ORANGE: '#ea580c', // Safety Orange (Requested Color)
        WIRE_GUARD: '#64748b' // Industrial Steel
    }

    return (
        <group scale={[0.8, 0.8, 0.8]}>

            {/* 1. DUVAR MONTAJ PLAKASI (Galvaniz) */}
            <group>
                <mesh geometry={plateGeometry}>
                    <meshStandardMaterial
                        color={COLORS.PLATE}
                        roughness={0.6}
                        metalness={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Venturi Ağzı */}
                <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.44, 0.42, 0.05, 64, 1, true]} />
                    <meshStandardMaterial
                        color={COLORS.PLATE}
                        roughness={0.6}
                        metalness={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {/* 2. MOTOR VE PERVANE (Siyah & Turuncu) */}
            <group position={[0, 0, -0.15]}>

                {/* Motor Gövdesi */}
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.15, 0.15, 0.25, 32]} />
                        <meshStandardMaterial color={COLORS.BLACK_PARTS} roughness={0.8} />
                    </mesh>
                    {/* Soğutma Kanatçıkları */}
                    {Array(8).fill(0).map((_, i) => (
                        <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.16, 0, 0]}>
                            <boxGeometry args={[0.02, 0.25, 0.02]} />
                            <meshStandardMaterial color={COLORS.BLACK_PARTS} roughness={0.8} />
                        </mesh>
                    ))}
                </group>

                {/* Motor Kolları */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                        <mesh position={[0.25, 0.1, 0.15]} rotation={[0, 0, -0.2]}>
                            <boxGeometry args={[0.3, 0.02, 0.02]} />
                            <meshStandardMaterial color={COLORS.BLACK_PARTS} roughness={0.8} />
                        </mesh>
                    </group>
                ))}

                {/* --- PERVANE (TURUNCU) --- */}
                <group ref={fanRef} position={[0, 0, 0.25]}>
                    {/* Göbek (Siyah) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
                        <meshStandardMaterial color={COLORS.BLACK_PARTS} />
                    </mesh>

                    {/* 5 Kanat - ABSOLUTE ORANGE */}
                    {Array(5).fill(0).map((_, i) => (
                        <group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
                            <mesh position={[0.2, 0, 0]} rotation={[0.3, 0.1, -0.1]}>
                                <boxGeometry args={[0.3, 0.12, 0.01]} />
                                <meshStandardMaterial
                                    color={COLORS.BLADE_ORANGE}
                                    emissive={COLORS.BLADE_ORANGE}
                                    emissiveIntensity={0.2} // Rengi patlatmak için hafif emissive
                                    roughness={0.4}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        </group>
                    ))}
                </group>
            </group>

            {/* 3. TEL KAFES VE STANDOFFS (Metalik Gri) */}
            <group position={[0, 0, 0.2]}>

                {/* STANDOFFS (Ayaklar) */}
                {[0.4, -0.4].map(x => [0.4, -0.4].map(y => (
                    <group key={`standoff-${x}-${y}`} position={[x, y, -0.1]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
                            <meshStandardMaterial color={COLORS.WIRE_GUARD} metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
                            <meshStandardMaterial color={COLORS.WIRE_GUARD} metalness={0.8} roughness={0.2} />
                        </mesh>
                    </group>
                )))}

                {/* IZGARA ÇERÇEVESİ */}
                <group>
                    {[-0.42, 0.42].map(x => (
                        <mesh key={`frame-v-${x}`} position={[x, 0, 0]}>
                            <boxGeometry args={[0.015, 0.85, 0.015]} />
                            <meshStandardMaterial color={COLORS.WIRE_GUARD} metalness={0.8} roughness={0.2} />
                        </mesh>
                    ))}
                    {[-0.42, 0.42].map(y => (
                        <mesh key={`frame-h-${y}`} position={[0, y, 0]}>
                            <boxGeometry args={[0.85, 0.015, 0.015]} />
                            <meshStandardMaterial color={COLORS.WIRE_GUARD} metalness={0.8} roughness={0.2} />
                        </mesh>
                    ))}
                </group>

                {/* HALKALAR */}
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={`ring-${i}`}>
                        <ringGeometry args={[0.1 + i * 0.07, 0.108 + i * 0.07, 32]} />
                        <meshStandardMaterial
                            color={COLORS.WIRE_GUARD}
                            metalness={0.8}
                            roughness={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}

                {/* RADYAL TELLER */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <mesh key={`rad-${i}`} rotation={[0, 0, (angle * Math.PI) / 180]}>
                        <boxGeometry args={[0.8, 0.008, 0.005]} />
                        <meshStandardMaterial
                            color={COLORS.WIRE_GUARD}
                            metalness={0.8}
                            roughness={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}

            </group>

            {/* 4. KLEMENS KUTUSU (Siyah) */}
            <group position={[0.15, 0.15, -0.1]} rotation={[0, 0, 0.5]}>
                <mesh>
                    <boxGeometry args={[0.08, 0.1, 0.06]} />
                    <meshStandardMaterial color={COLORS.BLACK_PARTS} />
                </mesh>
                <mesh position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.04, 8]} />
                    <meshStandardMaterial color={COLORS.BLACK_PARTS} />
                </mesh>
            </group>

        </group>
    )
}

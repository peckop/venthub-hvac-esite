import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stilize 3D İkonlar - Her kategori için benzersiz geometrik şekiller
 * 
 * Performans için basit geometriler kullanılıyor.
 * Tüm ikonlar döner ve parıldar.
 */

interface Category3DIconProps {
    categorySlug: string
    color?: string
    scale?: number
    rotating?: boolean
}

// Kategori bazlı renk paleti
const CATEGORY_COLORS: Record<string, string> = {
    'fanlar': '#06b6d4',                          // Cyan
    'hava-perdeleri': '#3b82f6',                  // Blue
    'isi-geri-kazanim-cihazlari': '#10b981',      // Emerald
    'hiz-kontrolu-cihazlari': '#f97316',          // Orange
    'hava-temizleyiciler-anti-viral-urunler': '#8b5cf6', // Violet
    'nem-alma-cihazlari': '#0ea5e9',              // Sky
    'flexible-hava-kanallari': '#eab308',         // Yellow
    'aksesuarlar': '#ec4899',                     // Pink
}

// Fan - Dönen kanatlar
const FanIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.z += delta * 2
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            {/* Merkez hub */}
            <mesh>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* 4 Kanat */}
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0.35, 0, 0]}>
                    <boxGeometry args={[0.5, 0.15, 0.02]} />
                    <meshStandardMaterial
                        color={color}
                        metalness={0.6}
                        roughness={0.3}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Hava Perdesi - Dikey akış çizgileri
const AirCurtainIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)
    const timeRef = useRef(0)

    useFrame((_, delta) => {
        timeRef.current += delta
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(timeRef.current * 0.5) * 0.1
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            {/* Ana kutu */}
            <mesh>
                <boxGeometry args={[0.8, 0.2, 0.15]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Akış çizgileri */}
            {[-0.25, 0, 0.25].map((x, i) => (
                <mesh key={i} position={[x, -0.35, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={0.5 + i * 0.15}
                        emissive={color}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Isı Geri Kazanım - İç içe kutular
const HeatRecoveryIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.3
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            {/* Dış kutu */}
            <mesh>
                <boxGeometry args={[0.6, 0.5, 0.4]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} transparent opacity={0.6} />
            </mesh>
            {/* İç çekirdek */}
            <mesh>
                <boxGeometry args={[0.35, 0.3, 0.25]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.8}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
            {/* Oklar */}
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[0.08, 0.15, 4]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.08, 0.15, 4]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}

// Hız Kontrol - Kadran
const SpeedControlIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const needleRef = useRef<THREE.Mesh>(null)
    const timeRef = useRef(0)

    useFrame((_, delta) => {
        timeRef.current += delta
        if (needleRef.current) {
            needleRef.current.rotation.z = Math.sin(timeRef.current * 2) * 0.8 - 0.4
        }
    })

    return (
        <group scale={scale}>
            {/* Kadran */}
            <mesh>
                <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
                <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Çerçeve */}
            <mesh>
                <torusGeometry args={[0.4, 0.03, 8, 32]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* İğne */}
            <mesh ref={needleRef} position={[0, 0, 0.05]}>
                <boxGeometry args={[0.35, 0.04, 0.02]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}

// Hava Temizleyici - Parçacık filtresi
const AirPurifierIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            {/* Ana gövde */}
            <mesh>
                <cylinderGeometry args={[0.3, 0.35, 0.6, 16]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Üst ızgara */}
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.28, 0.28, 0.05, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Işık halkası */}
            <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.32, 0.02, 8, 32]} />
                <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    )
}

// Nem Alma - Damla + kutu
const DehumidifierIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const dropRef = useRef<THREE.Mesh>(null)
    const timeRef = useRef(0)

    useFrame((_, delta) => {
        timeRef.current += delta
        if (dropRef.current) {
            dropRef.current.position.y = Math.sin(timeRef.current * 3) * 0.05 + 0.25
        }
    })

    return (
        <group scale={scale}>
            {/* Kutu */}
            <mesh>
                <boxGeometry args={[0.5, 0.6, 0.3]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Damla */}
            <mesh ref={dropRef} position={[0, 0.25, 0.2]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                    color="#0ea5e9"
                    transparent
                    opacity={0.7}
                    emissive="#0ea5e9"
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    )
}

// Flexible Kanal - Kıvrımlı silindir
const FlexibleDuctIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)
    const timeRef = useRef(0)

    useFrame((_, delta) => {
        timeRef.current += delta
        if (groupRef.current) {
            groupRef.current.rotation.x = Math.sin(timeRef.current) * 0.1
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            {/* Segmentli kanal */}
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[0, (i - 2) * 0.12, 0]}>
                    <torusGeometry args={[0.25, 0.08, 8, 32]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? color : '#94a3b8'}
                        metalness={0.7}
                        roughness={0.3}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Aksesuarlar - Dişli + araçlar
const AccessoriesIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const gearRef = useRef<THREE.Mesh>(null)

    useFrame((_, delta) => {
        if (gearRef.current) {
            gearRef.current.rotation.z += delta * 0.5
        }
    })

    return (
        <group scale={scale}>
            {/* Ana dişli */}
            <mesh ref={gearRef}>
                <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Merkez delik */}
            <mesh>
                <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
            </mesh>
        </group>
    )
}

// Genel alt kategori ikonu
const GenericSubcategoryIcon: React.FC<{ color: string; scale: number }> = ({ color, scale }) => {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.3
        }
    })

    return (
        <group ref={groupRef} scale={scale}>
            <mesh>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.6}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    )
}

/**
 * Ana bileşen - Kategori slug'ına göre doğru ikonu render eder
 */
const Category3DIcon: React.FC<Category3DIconProps> = ({
    categorySlug,
    color,
    scale = 1,
}) => {
    const iconColor = color || CATEGORY_COLORS[categorySlug] || '#06b6d4'

    const iconMap: Record<string, React.ReactNode> = {
        'fanlar': <FanIcon color={iconColor} scale={scale} />,
        'hava-perdeleri': <AirCurtainIcon color={iconColor} scale={scale} />,
        'isi-geri-kazanim-cihazlari': <HeatRecoveryIcon color={iconColor} scale={scale} />,
        'hiz-kontrolu-cihazlari': <SpeedControlIcon color={iconColor} scale={scale} />,
        'hava-temizleyiciler-anti-viral-urunler': <AirPurifierIcon color={iconColor} scale={scale} />,
        'nem-alma-cihazlari': <DehumidifierIcon color={iconColor} scale={scale} />,
        'flexible-hava-kanallari': <FlexibleDuctIcon color={iconColor} scale={scale} />,
        'aksesuarlar': <AccessoriesIcon color={iconColor} scale={scale} />,
    }

    return iconMap[categorySlug] || <GenericSubcategoryIcon color={iconColor} scale={scale} />
}

export default Category3DIcon

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Category3DIconProps {
    categorySlug: string
    color?: string
    scale?: number
}

interface IconMaterials {
    whiteABS: THREE.MeshStandardMaterial
    industrialSteel: THREE.MeshStandardMaterial
    brushedAluminum: THREE.MeshStandardMaterial
    aluminumFlex: THREE.MeshStandardMaterial
    matteBlack: THREE.MeshStandardMaterial
    filterMedia: THREE.MeshStandardMaterial
    rubberBlack: THREE.MeshStandardMaterial
    chrome: THREE.MeshStandardMaterial
}

// =============================================================================
// FİZİKSEL MATERYALLER
// =============================================================================
const useMaterials = () => {
    return useMemo(() => ({
        whiteABS: new THREE.MeshStandardMaterial({
            color: '#f1f5f9',
            roughness: 0.3,
            metalness: 0.1,
        }),
        industrialSteel: new THREE.MeshStandardMaterial({
            color: '#64748b',
            roughness: 0.5,
            metalness: 0.6,
        }),
        brushedAluminum: new THREE.MeshStandardMaterial({
            color: '#94a3b8',
            roughness: 0.25,
            metalness: 0.85,
        }),
        aluminumFlex: new THREE.MeshStandardMaterial({
            color: '#b8c4ce',
            roughness: 0.2,
            metalness: 0.88,
        }),
        matteBlack: new THREE.MeshStandardMaterial({
            color: '#1e293b',
            roughness: 0.85,
            metalness: 0.1,
        }),
        filterMedia: new THREE.MeshStandardMaterial({
            color: '#fafaf9',
            roughness: 0.95,
            metalness: 0.0,
        }),
        rubberBlack: new THREE.MeshStandardMaterial({
            color: '#0f172a',
            roughness: 0.98,
            metalness: 0.0,
        }),
        chrome: new THREE.MeshStandardMaterial({
            color: '#e2e8f0',
            roughness: 0.1,
            metalness: 0.95,
        }),
    }), [])
}

// =============================================================================
// 1. ESNEK KANAL (İç katman olmadan, tek katman)
// =============================================================================
const FlexDuctModel: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const spiralRef = useRef<THREE.Group>(null)

    // MEKSİKA DALGASI - Dalga bir uçtan diğerine ilerler
    const createWaveCurve = (time: number) => {
        const points: THREE.Vector3[] = []
        const segments = 30

        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const x = (t - 0.5) * 2.4

            // Meksika dalgası: Dalga t boyunca ilerler
            // sin(t * 2π - time) -> dalga sağa doğru hareket eder
            const wavePhase = t * Math.PI * 2 - time * 2
            const waveAmplitude = Math.sin(t * Math.PI) * 0.3 // Uçlarda 0, ortada max
            const y = Math.sin(wavePhase) * waveAmplitude

            points.push(new THREE.Vector3(x, y, 0))
        }

        return new THREE.CatmullRomCurve3(points)
    }

    useFrame((state) => {
        if (!meshRef.current || !spiralRef.current) return
        const time = state.clock.elapsedTime

        // Dalga animasyonu
        const curve = createWaveCurve(time)
        const newGeometry = new THREE.TubeGeometry(curve, 64, 0.28, 24, false)
        meshRef.current.geometry.dispose()
        meshRef.current.geometry = newGeometry

        const spiralCount = spiralRef.current.children.length
        for (let i = 0; i < spiralCount; i++) {
            const t = i / (spiralCount - 1)
            const point = curve.getPoint(t)
            const tangent = curve.getTangent(t)

            const child = spiralRef.current.children[i]
            child.position.copy(point)

            const quaternion = new THREE.Quaternion()
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent)
            child.quaternion.copy(quaternion)
        }
    })

    const initialCurve = createWaveCurve(0)
    const spiralCount = 20

    return (
        <group>
            {/* TEK KATMAN - Ana Tüp */}
            <mesh ref={meshRef} material={materials.aluminumFlex}>
                <tubeGeometry args={[initialCurve, 64, 0.28, 24, false]} />
            </mesh>

            {/* SPİRO yapısı */}
            <group ref={spiralRef}>
                {Array(spiralCount).fill(0).map((_, i) => (
                    <mesh key={i} material={materials.industrialSteel}>
                        <torusGeometry args={[0.29, 0.018, 8, 24]} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 2. FAN
// =============================================================================
const FanIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    const rotorRef = useRef<THREE.Group>(null)
    const airFlowRef = useRef<THREE.Group>(null)
    const inletFlowRef = useRef<THREE.Group>(null)
    const rotationRef = useRef(0)

    const fanSpeed = 4

    useFrame((_, delta) => {
        if (rotorRef.current) {
            rotorRef.current.rotation.z -= delta * fanSpeed
            rotationRef.current = rotorRef.current.rotation.z
        }

        if (airFlowRef.current) {
            airFlowRef.current.rotation.z = rotationRef.current
        }

        if (inletFlowRef.current) {
            inletFlowRef.current.rotation.z = rotationRef.current * 0.5
        }
    })

    return (
        <group>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                <cylinderGeometry args={[0.7, 0.7, 0.35, 32, 1, true]} />
            </mesh>

            <mesh position={[0, 0, 0.175]} material={materials.industrialSteel}>
                <torusGeometry args={[0.7, 0.04, 8, 32]} />
            </mesh>

            <mesh position={[0, 0, -0.175]} material={materials.industrialSteel}>
                <torusGeometry args={[0.7, 0.04, 8, 32]} />
            </mesh>

            <group position={[0, 0, -0.25]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.18, 0.18, 0.15, 16]} />
                </mesh>
            </group>

            {[0, 120, 240].map((angle, i) => (
                <mesh
                    key={i}
                    position={[
                        0.4 * Math.cos(angle * Math.PI / 180),
                        0.4 * Math.sin(angle * Math.PI / 180),
                        -0.175
                    ]}
                    rotation={[0, 0, angle * Math.PI / 180]}
                    material={materials.industrialSteel}
                >
                    <boxGeometry args={[0.5, 0.04, 0.02]} />
                </mesh>
            ))}

            <group ref={rotorRef} position={[0, 0, 0.02]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                </mesh>

                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                        <mesh
                            position={[0.38, 0, 0]}
                            rotation={[0.2, 0, 0]}
                            material={materials.brushedAluminum}
                        >
                            <boxGeometry args={[0.52, 0.15, 0.02]} />
                        </mesh>
                    </group>
                ))}
            </group>

            <group ref={inletFlowRef} position={[0, 0, -0.4]}>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <InletAirStream key={i} angle={angle} />
                ))}
            </group>

            <group ref={airFlowRef} position={[0, 0, 0.3]}>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <OutletAirStream key={i} angle={angle} />
                ))}
            </group>
        </group>
    )
}

const InletAirStream: React.FC<{ angle: number }> = ({ angle }) => {
    const streamRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!streamRef.current) return
        const time = state.clock.elapsedTime

        streamRef.current.children.forEach((child: THREE.Object3D, i) => {
            const meshChild = child as THREE.Mesh
            const material = meshChild.material as THREE.MeshBasicMaterial
            const progress = ((time * 1.5 + i * 0.4) % 1.0)
            const z = -0.5 + progress * 0.6
            const r = 0.5 - progress * 0.15

            const rad = (angle * Math.PI) / 180
            child.position.set(r * Math.cos(rad), r * Math.sin(rad), z)
            material.opacity = 0.3 + progress * 0.2
        })
    })

    return (
        <group ref={streamRef}>
            {[0, 1, 2].map((i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshBasicMaterial color="#94a3b8" transparent opacity={0.3} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}

const OutletAirStream: React.FC<{ angle: number }> = ({ angle }) => {
    const streamRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!streamRef.current) return
        const time = state.clock.elapsedTime

        streamRef.current.children.forEach((child: THREE.Object3D, i) => {
            const meshChild = child as THREE.Mesh
            const material = meshChild.material as THREE.MeshBasicMaterial
            const progress = ((time * 2 + i * 0.3) % 1.5)
            const z = progress
            const r = 0.25 + progress * 0.12

            const rad = (angle * Math.PI) / 180
            child.position.set(r * Math.cos(rad), r * Math.sin(rad), z)
            material.opacity = Math.max(0, 0.5 - progress * 0.3)
        })
    })

    return (
        <group ref={streamRef}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.03, 6, 6]} />
                    <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}

// =============================================================================
// 3. HAVA PERDESİ (Belirgin Mavi/Kırmızı Renk Geçişi)
// =============================================================================
const AirCurtainIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group>
            <mesh position={[0, 0.35, 0]} material={materials.whiteABS}>
                <boxGeometry args={[2.5, 0.45, 0.45]} />
            </mesh>

            <group position={[0, 0.35, 0.23]}>
                {[-0.15, -0.09, -0.03, 0.03, 0.09, 0.15].map((y, i) => (
                    <mesh key={i} position={[0, y, 0]} material={materials.brushedAluminum}>
                        <boxGeometry args={[2.3, 0.015, 0.03]} />
                    </mesh>
                ))}
            </group>

            <mesh position={[0, 0.10, 0.1]} material={materials.matteBlack}>
                <boxGeometry args={[2.3, 0.02, 0.08]} />
            </mesh>

            {[-1.3, 1.3].map((x, i) => (
                <mesh key={i} position={[x, 0.35, 0]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.06, 0.45, 0.45]} />
                </mesh>
            ))}

            <AirCurtainFlow />
        </group>
    )
}

const AirCurtainFlow: React.FC = () => {
    const curtainRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!curtainRef.current) return
        const time = state.clock.elapsedTime

        // Renk geçişi: 0 = tam mavi, 1 = tam kırmızı (~2.5 saniye döngü)
        const colorPhase = (Math.sin(time * 1.0) + 1) / 2

        curtainRef.current.children.forEach((child: THREE.Object3D, i) => {
            const meshChild = child as THREE.Mesh
            const material = meshChild.material as THREE.MeshBasicMaterial
            // PARLAK renkler - Mavi: #0ea5e9, Kırmızı: #ef4444
            const r = 0.055 + colorPhase * 0.88  // 0.055 -> 0.937
            const g = 0.647 - colorPhase * 0.38  // 0.647 -> 0.267
            const b = 0.914 - colorPhase * 0.65  // 0.914 -> 0.267

            material.color.setRGB(r, g, b)

            // Daha görünür opacity
            material.opacity = 0.25 + Math.sin(time * 2 + i * 0.2) * 0.08
        })
    })

    return (
        <group ref={curtainRef} position={[0, -0.5, 0.1]}>
            {Array(20).fill(0).map((_, i) => (
                <mesh key={i} position={[(i - 9.5) * 0.12, 0, 0]}>
                    <planeGeometry args={[0.08, 1.2]} />
                    <meshBasicMaterial
                        color="#0ea5e9"
                        transparent
                        opacity={0.25}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    )
}

// =============================================================================
// 4. HAVA TEMİZLEYİCİ (4 Taraf Giriş + Üst Yüzey Çıkış)
// =============================================================================
const DepuroIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group position={[0, -0.4, 0]}>
            {/* Ana Gövde */}
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[0.8, 1.7, 0.55]} />
            </mesh>

            {/* === 4 TARAF GİRİŞ MENFEZLER === */}
            {/* Ön */}
            <group position={[0, -0.5, 0.28]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.65, 0.5, 0.02]} />
                </mesh>
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, (i - 2) * 0.09, 0.02]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.6, 0.012, 0.012]} />
                    </mesh>
                ))}
            </group>

            {/* Arka */}
            <group position={[0, -0.5, -0.28]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.65, 0.5, 0.02]} />
                </mesh>
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, (i - 2) * 0.09, -0.02]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.6, 0.012, 0.012]} />
                    </mesh>
                ))}
            </group>

            {/* Sol */}
            <group position={[-0.41, -0.5, 0]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                </mesh>
                {Array(4).fill(0).map((_, i) => (
                    <mesh key={i} position={[-0.02, (i - 1.5) * 0.11, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.012, 0.012, 0.35]} />
                    </mesh>
                ))}
            </group>

            {/* Sağ */}
            <group position={[0.41, -0.5, 0]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.02, 0.5, 0.4]} />
                </mesh>
                {Array(4).fill(0).map((_, i) => (
                    <mesh key={i} position={[0.02, (i - 1.5) * 0.11, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.012, 0.012, 0.35]} />
                    </mesh>
                ))}
            </group>

            {/* === ÜST YÜZEY TEMİZ HAVA ÇIKIŞ MENFEZİ === */}
            <group position={[0, 0.86, 0]}>
                <mesh material={materials.whiteABS}>
                    <boxGeometry args={[0.7, 0.02, 0.45]} />
                </mesh>
                {/* Perfore delikler */}
                {Array(5).fill(0).map((_, row) => (
                    Array(6).fill(0).map((_, col) => (
                        <mesh
                            key={`${row}-${col}`}
                            position={[(col - 2.5) * 0.11, 0.015, (row - 2) * 0.08]}
                            rotation={[Math.PI / 2, 0, 0]}
                            material={materials.matteBlack}
                        >
                            <boxGeometry args={[0.07, 0.05, 0.015]} />
                        </mesh>
                    ))
                ))}
            </group>

            {/* Kontrol Paneli */}
            <mesh position={[0, 0.3, 0.29]} material={materials.matteBlack}>
                <boxGeometry args={[0.3, 0.15, 0.02]} />
            </mesh>

            {/* LED */}
            <mesh position={[0, 0.3, 0.31]}>
                <circleGeometry args={[0.02, 12]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>

            {/* Tekerlekler */}
            {[[-0.25, -0.9, 0.15], [0.25, -0.9, 0.15]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.045, 0.045, 0.04, 12]} />
                </mesh>
            ))}

            <AirPurifierFlow />
        </group>
    )
}

const AirPurifierFlow: React.FC = () => {
    const dirtyRef = useRef<THREE.Group>(null)
    const cleanRef = useRef<THREE.Group>(null)

    // Kirli partiküller: 4 taraftan
    const dirtyParticles = useMemo(() => {
        const particles: {
            x: number; y: number; z: number;
            startX: number; startY: number; startZ: number;
            targetX: number; targetY: number; targetZ: number;
            size: number;
            speed: number;
        }[] = []
        // Her taraftan 4 partikül
        for (let side = 0; side < 4; side++) {
            for (let j = 0; j < 4; j++) {
                let startX, startY, startZ, targetX, targetY, targetZ

                if (side === 0) { // Ön
                    startX = (Math.random() - 0.5) * 0.5
                    startY = -0.5
                    startZ = 0.8
                    targetX = startX * 0.5
                    targetY = -0.5
                    targetZ = 0.28
                } else if (side === 1) { // Arka
                    startX = (Math.random() - 0.5) * 0.5
                    startY = -0.5
                    startZ = -0.8
                    targetX = startX * 0.5
                    targetY = -0.5
                    targetZ = -0.28
                } else if (side === 2) { // Sol
                    startX = -0.9
                    startY = -0.5
                    startZ = (Math.random() - 0.5) * 0.3
                    targetX = -0.41
                    targetY = -0.5
                    targetZ = startZ * 0.5
                } else { // Sağ
                    startX = 0.9
                    startY = -0.5
                    startZ = (Math.random() - 0.5) * 0.3
                    targetX = 0.41
                    targetY = -0.5
                    targetZ = startZ * 0.5
                }

                particles.push({
                    x: startX, y: startY, z: startZ,
                    startX, startY, startZ,
                    targetX, targetY, targetZ,
                    size: 0.018 + Math.random() * 0.012,
                    speed: 0.4 + Math.random() * 0.2
                })
            }
        }
        return particles
    }, [])

    // Temiz partiküller: Üst yüzeyden - DAHA GÖRÜNÜR
    const cleanParticles = useMemo(() => {
        const particles: {
            x: number;
            y: number;
            z: number;
            speed: number;
            phase: number;
            size: number;
        }[] = []
        // 5x5 grid = 25 partikül (daha fazla)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                particles.push({
                    x: (col - 2) * 0.12,
                    y: 0.9,
                    z: (row - 2) * 0.09,
                    speed: 0.4 + Math.random() * 0.2, // Daha hızlı
                    phase: Math.random() * Math.PI * 2,
                    size: 0.022 + Math.random() * 0.012 // %20 küçültüldü
                })
            }
        }
        return particles
    }, [])

    useFrame((state, delta) => {
        // Kirli hava: 4 taraftan menfeze
        if (dirtyRef.current) {
            dirtyRef.current.children.forEach((child: THREE.Object3D, i) => {
                const meshChild = child as THREE.Mesh
                const material = meshChild.material as THREE.MeshBasicMaterial
                const p = dirtyParticles[i]
                const dx = p.targetX - p.x
                const dy = p.targetY - p.y
                const dz = p.targetZ - p.z
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

                if (dist > 0.08) {
                    p.x += (dx / dist) * delta * p.speed
                    p.y += (dy / dist) * delta * p.speed
                    p.z += (dz / dist) * delta * p.speed
                    material.opacity = 0.7
                } else {
                    material.opacity -= delta * 3
                    if (material.opacity <= 0) {
                        p.x = p.startX
                        p.y = p.startY
                        p.z = p.startZ
                        material.opacity = 0.7
                    }
                }
                child.position.set(p.x, p.y, p.z)
            })
        }

        // Temiz hava: Üstten yukarı - DAHA BELİRGİN
        if (cleanRef.current) {
            const time = state.clock.elapsedTime
            cleanRef.current.children.forEach((child: THREE.Object3D, i) => {
                const meshChild = child as THREE.Mesh
                const material = meshChild.material as THREE.MeshBasicMaterial
                const p = cleanParticles[i]
                const progress = ((time * p.speed + p.phase) % 1.2) / 1.2

                // Daha yüksek çıkış
                child.position.set(p.x, 0.9 + progress * 1.0, p.z)

                // Başlangıçta parlak, sonra yavaşça kaybol
                const opacityValue = progress < 0.3
                    ? 0.85 // Başlangıç: çok parlak
                    : Math.max(0, 0.85 - (progress - 0.3) * 1.2)
                material.opacity = opacityValue
            })
        }
    })

    return (
        <>
            <group ref={dirtyRef}>
                {dirtyParticles.map((p, i) => (
                    <mesh key={i}>
                        <sphereGeometry args={[p.size, 6, 6]} />
                        <meshBasicMaterial color="#78716c" transparent opacity={0.7} />
                    </mesh>
                ))}
            </group>

            <group ref={cleanRef}>
                {cleanParticles.map((p, i) => (
                    <mesh key={i}>
                        <sphereGeometry args={[p.size, 8, 8]} />
                        <meshBasicMaterial color="#67e8f9" transparent opacity={0.85} />
                    </mesh>
                ))}
            </group>
        </>
    )
}

// =============================================================================
// 5. NEM ALMA CİHAZI
// =============================================================================
const DehumidifierIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group position={[0, -0.35, 0]}>
            <mesh material={materials.whiteABS}>
                <boxGeometry args={[0.9, 1.25, 0.5]} />
            </mesh>

            <group position={[0, 0.15, 0.26]}>
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, (i - 2) * 0.1, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.75, 0.012, 0.012]} />
                    </mesh>
                ))}
            </group>

            <mesh position={[0, -0.48, 0.05]} material={materials.chrome}>
                <boxGeometry args={[0.55, 0.18, 0.28]} />
            </mesh>

            {[[-0.3, -0.67, 0], [0.3, -0.67, 0]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
                </mesh>
            ))}

            <CondensationDrops />
        </group>
    )
}

const CondensationDrops: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null)
    const drops = useMemo(() => Array(4).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 0.35,
        y: 0.35,
        speed: 0.8 + Math.random() * 0.3
    })), [])

    useFrame((_, delta) => {
        if (!groupRef.current) return
        groupRef.current.children.forEach((child: THREE.Object3D, i) => {
            const d = drops[i]
            d.y -= delta * d.speed
            if (d.y < -0.38) {
                d.y = 0.35
                d.x = (Math.random() - 0.5) * 0.35
            }
            child.position.set(d.x, d.y, 0.28)
        })
    })

    return (
        <group ref={groupRef}>
            {drops.map((_, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
                </mesh>
            ))}
        </group>
    )
}

// =============================================================================
// 6. HRV
// =============================================================================
const HRVIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group position={[0, -0.25, 0]}>
            <mesh material={materials.whiteABS}>
                <boxGeometry args={[1.2, 1.3, 0.65]} />
            </mesh>

            {[
                [-0.35, 0.7, 0.12], [0.35, 0.7, 0.12],
                [-0.35, 0.7, -0.12], [0.35, 0.7, -0.12]
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
                </mesh>
            ))}

            <mesh position={[0, 0.1, 0.33]} material={materials.matteBlack}>
                <boxGeometry args={[0.35, 0.18, 0.02]} />
            </mesh>

            <CrossFlowAnimation />
        </group>
    )
}

const CrossFlowAnimation: React.FC = () => {
    const freshRef = useRef<THREE.Group>(null)
    const staleRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (freshRef.current) {
            freshRef.current.children.forEach((child: THREE.Object3D) => {
                child.position.x += delta * 0.5
                if (child.position.x > 0.45) child.position.x = -0.45
            })
        }
        if (staleRef.current) {
            staleRef.current.children.forEach((child: THREE.Object3D) => {
                child.position.x -= delta * 0.5
                if (child.position.x < -0.45) child.position.x = 0.45
            })
        }
    })

    return (
        <group position={[0, 0.75, 0]}>
            <group ref={freshRef}>
                {[-0.25, 0, 0.25].map((x, i) => (
                    <mesh key={i} position={[x, 0, 0.12]}>
                        <sphereGeometry args={[0.028, 6, 6]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>
            <group ref={staleRef}>
                {[-0.12, 0.12, 0.38].map((x, i) => (
                    <mesh key={i} position={[x, 0, -0.12]}>
                        <sphereGeometry args={[0.028, 6, 6]} />
                        <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 7. HIZ KONTROL
// =============================================================================
const SpeedControlIcon: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    const ledRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (ledRef.current) {
            const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
            (ledRef.current.material as THREE.MeshBasicMaterial).opacity = pulse
        }
    })

    return (
        <group>
            <mesh material={materials.whiteABS}>
                <boxGeometry args={[0.65, 1.1, 0.35]} />
            </mesh>

            <mesh position={[0, 0.28, 0.18]} material={materials.matteBlack}>
                <boxGeometry args={[0.45, 0.25, 0.02]} />
            </mesh>

            <mesh ref={ledRef} position={[0, 0.28, 0.2]}>
                <planeGeometry args={[0.35, 0.12]} />
                <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
            </mesh>

            <group position={[0, -0.25, 0.18]}>
                {Array(3).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, i * 0.06 - 0.06, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.45, 0.01, 0.012]} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 8. YEDEK PARÇA SETİ
// =============================================================================
const SparePartsSet: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group>
            <group position={[-0.55, 0.35, 0]} scale={0.6}>
                <mesh material={materials.industrialSteel}>
                    <boxGeometry args={[0.45, 0.35, 0.05]} />
                </mesh>
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={i} position={[(i - 2) * 0.08, 0, 0.02]} rotation={[0, 0.1, 0]} material={materials.filterMedia}>
                        <boxGeometry args={[0.006, 0.28, 0.035]} />
                    </mesh>
                ))}
            </group>

            <group position={[0.5, 0.4, 0]} rotation={[0.35, 0.25, 0]} scale={0.7}>
                <mesh material={materials.rubberBlack}>
                    <torusGeometry args={[0.18, 0.02, 8, 20]} />
                </mesh>
            </group>

            <group position={[0, 0, 0.08]} rotation={[0.15, 0.35, 0]} scale={0.55}>
                <mesh material={materials.chrome}>
                    <torusGeometry args={[0.15, 0.03, 8, 20]} />
                </mesh>
                <mesh material={materials.chrome}>
                    <torusGeometry args={[0.07, 0.02, 8, 20]} />
                </mesh>
                {Array(6).fill(0).map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2
                    return (
                        <mesh key={i} position={[0.11 * Math.cos(angle), 0.11 * Math.sin(angle), 0]} material={materials.chrome}>
                            <sphereGeometry args={[0.022, 8, 8]} />
                        </mesh>
                    )
                })}
            </group>

            <group position={[-0.45, -0.4, 0]} rotation={[0.25, -0.15, 0.08]} scale={0.5}>
                <mesh material={materials.brushedAluminum}>
                    <boxGeometry args={[0.45, 0.1, 0.015]} />
                </mesh>
            </group>

            <group position={[0.45, -0.35, 0]} scale={0.6}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.chrome}>
                    <cylinderGeometry args={[0.08, 0.08, 0.22, 12]} />
                </mesh>
                <mesh position={[-0.025, 0, 0.11]} material={materials.matteBlack}>
                    <boxGeometry args={[0.015, 0.025, 0.025]} />
                </mesh>
                <mesh position={[0.025, 0, 0.11]} material={materials.matteBlack}>
                    <boxGeometry args={[0.015, 0.025, 0.025]} />
                </mesh>
            </group>
        </group>
    )
}

// =============================================================================
// ANA BİLEŞEN
// =============================================================================
const Category3DIcon: React.FC<Category3DIconProps> = ({
    categorySlug,
    color = '#06b6d4',
    scale = 1
}) => {
    const materials = useMaterials(color)

    const IconComponent = useMemo(() => {
        const slug = categorySlug.toLowerCase()

        if (slug.includes('fan')) return FanIcon
        if (slug.includes('hava-perde')) return AirCurtainIcon
        if (slug.includes('flexible') || slug.includes('kanal')) return FlexDuctModel
        if (slug.includes('isi-geri') || slug.includes('hrv')) return HRVIcon
        if (slug.includes('aksesuar') || slug.includes('yedek')) return SparePartsSet
        if (slug.includes('hiz') || slug.includes('kontrol')) return SpeedControlIcon
        if (slug.includes('temizle') || slug.includes('depuro')) return DepuroIcon
        if (slug.includes('nem')) return DehumidifierIcon

        return FanIcon
    }, [categorySlug])

    return (
        <group scale={scale} key={categorySlug}>
            <pointLight position={[3, 3, 3]} intensity={2.5} color="#ffffff" />
            <pointLight position={[-2, -1, 2]} intensity={0.7} color="#94a3b8" />
            <ambientLight intensity={0.35} />
            <IconComponent materials={materials} />
        </group>
    )
}

export default Category3DIcon

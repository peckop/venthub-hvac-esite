import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FanRenderer } from './3d/FanRenderer'
import { useFanMaterials } from './3d/materials/useFanMaterials'
import { AxialFanModel } from './3d/types/AxialFanModel'
import { getModelOffset } from '../../utils/3dModelOffsets'

interface Category3DIconProps {
    categorySlug: string
    color?: string
    scale?: number
    modelPosition?: [number, number, number] // Optional override
}

// ... FlexDuct, AirCurtain vs. AYNI (Kopyala) ...
// Kodun tam çalışması için önceki adımlardaki bileşenleri buraya tekrar ekliyorum.
// HIZ KONTROL ve CATEGORY3DICON mantığını değiştiriyorum.

const FlexDuctModel: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null)
    const spiralRef = useRef<THREE.Group>(null)
    const materials = useFanMaterials()
    const createWaveCurve = (time: number) => {
        const points: THREE.Vector3[] = []
        const segments = 30
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const x = (t - 0.5) * 2.4
            const wavePhase = t * Math.PI * 2 - time * 2
            const waveAmplitude = Math.sin(t * Math.PI) * 0.3
            const y = Math.sin(wavePhase) * waveAmplitude
            points.push(new THREE.Vector3(x, y, 0))
        }
        return new THREE.CatmullRomCurve3(points)
    }
    useFrame((state) => {
        if (!meshRef.current || !spiralRef.current) return
        const time = state.clock.elapsedTime
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
            <mesh ref={meshRef} material={materials.brushedAluminum}>
                <tubeGeometry args={[initialCurve, 64, 0.28, 24, false]} />
            </mesh>
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

const AirCurtainIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
        <group>
            <mesh position={[0, 0.35, 0]} material={materials.brushedAluminum}>
                <boxGeometry args={[2.5, 0.45, 0.45]} />
            </mesh>
            <group position={[0, 0.35, 0.23]}>
                {[-0.15, -0.09, -0.03, 0.03, 0.09, 0.15].map((y, i) => (
                    <mesh key={i} position={[0, y, 0]} material={materials.industrialSteel}>
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
        const colorPhase = (Math.sin(time * 1.0) + 1) / 2
        curtainRef.current.children.forEach((child: THREE.Object3D, i) => {
            const meshChild = child as THREE.Mesh
            const material = meshChild.material as THREE.MeshBasicMaterial
            const r = 0.055 + colorPhase * 0.88
            const g = 0.647 - colorPhase * 0.38
            const b = 0.914 - colorPhase * 0.65
            material.color.setRGB(r, g, b)
            material.opacity = 0.25 + Math.sin(time * 2 + i * 0.2) * 0.08
        })
    })
    return (
        <group ref={curtainRef} position={[0, -0.5, 0.1]}>
            {Array(20).fill(0).map((_, i) => (
                <mesh key={i} position={[(i - 9.5) * 0.12, 0, 0]}>
                    <planeGeometry args={[0.08, 1.2]} />
                    <meshBasicMaterial color="#0ea5e9" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}

const DepuroIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
        // FIX: position offset REMOVED — AutoCenter handles centering. 
        // Internal offsets fight with AutoCenter and cause "strain".
        <group>
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[0.8, 1.7, 0.55]} />
            </mesh>
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
            <group position={[0, 0.86, 0]}>
                <mesh material={materials.ral7035}>
                    <boxGeometry args={[0.7, 0.02, 0.45]} />
                </mesh>
            </group>
            <mesh position={[0, 0.3, 0.29]} material={materials.matteBlack}>
                <boxGeometry args={[0.3, 0.15, 0.02]} />
            </mesh>
            <mesh position={[0, 0.3, 0.31]}>
                <circleGeometry args={[0.02, 12]} />
                <meshBasicMaterial color="#22c55e" />
            </mesh>
            <AirPurifierFlow />
        </group>
    )
}

const AirPurifierFlow: React.FC = () => {
    const dirtyRef = useRef<THREE.Group>(null)
    const cleanRef = useRef<THREE.Group>(null)

    useFrame((state, _delta) => {
        const time = state.clock.elapsedTime
        if (cleanRef.current) {
            cleanRef.current.children.forEach((child, i) => {
                const speed = 0.4 + (i % 4) * 0.15
                // Üst menfez Y=0.86'da — parçacıklar 0.87'den başlayıp 1.5'e kadar çıkıyor
                const phase = (time * speed + i * 0.3) % 1.0
                child.position.y = 0.87 + phase * 0.6
                child.position.x = Math.sin(time * 1.5 + i) * 0.12
                // Yukarı çıktıkça solar (0'dan 1'e gidince opacity 1'den 0'a)
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
                mat.opacity = Math.max(0, 1 - phase * 1.2)
            })
        }
        if (dirtyRef.current) {
            dirtyRef.current.children.forEach((child, i) => {
                const speed = 0.3 + (i % 3) * 0.15
                const progress = (time * speed + i * 0.4) % 1.0
                // Kirli hava: alt menfezden (Y=-0.5) gövde içine (Y=-0.3) çekiliyor
                child.position.y = -0.5 + progress * 0.2
                child.position.x = Math.cos(time * 2 + i) * 0.08
                child.position.z = 0.28 + Math.sin(time * 4 + i) * 0.03
                const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
                mat.opacity = (1 - progress) * 0.5
            })
        }
    })

    return (
        <group>
            <group ref={cleanRef}>
                {Array(15).fill(0).map((_, i) => (
                    <mesh key={`c - ${i} `} position={[(Math.random() - 0.5) * 0.3, 0.5, (Math.random() - 0.5) * 0.2]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshBasicMaterial color="#67e8f9" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>
            <group ref={dirtyRef}>
                {Array(15).fill(0).map((_, i) => (
                    <mesh key={`d - ${i} `} position={[(Math.random() - 0.5) * 0.6, -0.6, 0.3]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshBasicMaterial color="#475569" transparent opacity={0.7} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

const DehumidifierIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
        // FIX: position offset REMOVED — AutoCenter handles centering.
        <group>
            <mesh material={materials.ral7035}>
                <boxGeometry args={[0.9, 1.25, 0.5]} />
            </mesh>
            <group position={[0, 0.15, 0.26]}>
                {Array(5).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, (i - 2) * 0.1, 0]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.75, 0.012, 0.012]} />
                    </mesh>
                ))}
            </group>
            {[-0.3, 0.3].map((x, i) => (
                <mesh key={i} position={[x, -0.67, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
                </mesh>
            ))}
            <CondensationDrops />
        </group>
    )
}

const CondensationDrops: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null)
    const drops = useMemo(() => Array(6).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 0.4,
        y: 0.35,
        speed: 0.5 + Math.random() * 0.5,
        offset: Math.random() * Math.PI
    })), [])

    useFrame((_, delta) => {
        if (!groupRef.current) return
        groupRef.current.children.forEach((child, i) => {
            const d = drops[i]
            d.y -= delta * d.speed
            if (d.y < -0.4) {
                d.y = 0.35
                d.x = (Math.random() - 0.5) * 0.4
            }
            child.position.set(d.x, d.y, 0.28)
        })
    })

    return (
        <group ref={groupRef}>
            {drops.map((_, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    )
}

const HRVIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
        // FIX: position offset REMOVED — AutoCenter handles centering.
        <group>
            <mesh material={materials.ral7035}>
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
            <CrossFlowAnimation />
        </group>
    )
}

const CrossFlowAnimation: React.FC = () => {
    const cleanRef = useRef<THREE.Group>(null)
    const dirtyRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const t = state.clock.elapsedTime
        if (cleanRef.current) {
            cleanRef.current.position.x = (t * 0.5) % 1.5 - 0.75
        }
        if (dirtyRef.current) {
            dirtyRef.current.position.x = -((t * 0.5) % 1.5 - 0.75)
        }
    })

    return (
        <group position={[0, 0, 0.35]}>
            <group ref={cleanRef}>
                <mesh>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshBasicMaterial color="#3b82f6" />
                </mesh>
            </group>
            <group ref={dirtyRef} position={[0, 0.3, 0]}>
                <mesh>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshBasicMaterial color="#ef4444" />
                </mesh>
            </group>
        </group>
    )
}

// =============================================================================
// HIZ KONTROL (Revize 5: MAT EKRAN)
// =============================================================================
const SpeedControlIcon: React.FC = () => {
    const materials = useFanMaterials()

    return (
        <group>
            {/* --- KASA (PASLANMAZ/INOX) --- */}
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[0.7, 0.9, 0.3]} />
            </mesh>

            {/* Ön Panel Çerçevesi */}
            <mesh position={[0, 0, 0.151]} material={materials.industrialSteel}>
                <boxGeometry args={[0.62, 0.82, 0.002]} />
            </mesh>

            {/* --- EKRAN (TEMİZ CAM - Digital Clear) --- */}
            {/* Karıncalanma olmaması için texture/noise yok, saf parlak siyah malzeme */}
            <mesh position={[0, 0.15, 0.152]}>
                <planeGeometry args={[0.58, 0.48]} />
                <meshPhysicalMaterial
                    color="#000000"
                    roughness={0.05} // Çok pürüzsüz (Cam)
                    metalness={0.9}
                    clearcoat={1.0}
                    clearcoatRoughness={0.0}
                    emissive="#000000"
                />
            </mesh>

            {/* Ekran UI (Basit Geometri - Texture kullanmadan) */}
            <group position={[0, 0.15, 0.153]} scale={0.7}>
                {/* 1. Fan Speed Göstergesi (Bar) */}
                <group position={[0, 0.1, 0]}>
                    {/* Arkaplan Barı */}
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[0.6, 0.04]} />
                        <meshBasicMaterial color="#1e293b" />
                    </mesh>
                    {/* Doluluk Barı (Yeşil - %75) */}
                    <mesh position={[-0.075, 0, 0.001]}>
                        <planeGeometry args={[0.45, 0.04]} />
                        <meshBasicMaterial color="#22c55e" toneMapped={false} /> {/* Parlak Yeşil */}
                    </mesh>
                </group>

                {/* 2. Dijital Rakam (Basit kutularla 88.8 simülasyonu veya sadece bir kutu) */}
                {/* Rakam yerine "RUN" ledi simülasyonu */}
                <mesh position={[0, -0.15, 0]}>
                    <circleGeometry args={[0.03, 16]} />
                    <meshBasicMaterial color="#3b82f6" toneMapped={false} /> {/* Mavi Led */}
                </mesh>
            </group>

            {/* --- BUTONLAR --- */}
            <group position={[0, -0.25, 0.155]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.07, 0.07, 0.03, 32]} />
                </mesh>
                <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                    <boxGeometry args={[0.015, 0.08, 0.02]} />
                </mesh>
                <mesh position={[-0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            </group>

            {/* Kablo Rakorları */}
            {[-0.15, 0.15].map((x, i) => (
                <mesh key={i} position={[x, -0.5, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
                </mesh>
            ))}
        </group>
    )
}

const AccessoryIcon: React.FC = () => {
    const materials = useFanMaterials()
    const bladeRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (bladeRef.current) {
            const angle = Math.sin(state.clock.elapsedTime * 0.5) * 0.4
            bladeRef.current.children.forEach(child => {
                child.rotation.x = angle
            })
        }
    })

    return (
        // FIX: position offset REMOVED — AutoCenter handles centering.
        <group scale={[0.65, 0.65, 0.65]}>

            {/* 1. MOTORLU DAMPER (Sol-Arka) */}
            <group position={[-0.4, 0, -0.2]}>
                <mesh material={materials.galvanizedSteel}><boxGeometry args={[0.8, 0.8, 0.3]} /></mesh>
                <mesh position={[0, 0, 0]} material={materials.matteBlack}><planeGeometry args={[0.75, 0.75]} /><mesh position={[0, 0, 0.16]} /></mesh>
                {/* Kanatlar */}
                <group ref={bladeRef} position={[0, 0, 0.18]}>
                    {[0.2, 0, -0.2].map((y, i) => (
                        <mesh key={i} position={[0, y, 0]} material={materials.brushedAluminum}><boxGeometry args={[0.7, 0.18, 0.02]} /></mesh>
                    ))}
                </group>
                {/* Motor */}
                <mesh position={[0.45, 0, 0]} material={materials.safetyOrange}><boxGeometry args={[0.15, 0.25, 0.15]} /></mesh>
            </group>

            {/* 2. FLEXIBLE CONNECTOR (Sağ-Arka) */}
            {/* Silindirik branda bağlantısı */}
            <group position={[0.5, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
                {/* Flanşlar */}
                <mesh position={[0, 0.25, 0]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.3, 0.3, 0.05, 32]} /></mesh>
                <mesh position={[0, -0.25, 0]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.3, 0.3, 0.05, 32]} /></mesh>
                {/* Kumaş (Branda) */}
                <mesh material={materials.matteBlack}><cylinderGeometry args={[0.28, 0.28, 0.45, 32]} /></mesh>
                {/* Boğumlar */}
                {[0.1, 0, -0.1].map((y, i) => (
                    <mesh key={i} position={[0, y, 0]}><torusGeometry args={[0.285, 0.01, 16, 32]} /><meshStandardMaterial color="#333" /></mesh>
                ))}
            </group>

            {/* 3. MENFEZ / ANEMOSTAD (Ön-Orta) */}
            <group position={[0.1, -0.3, 0.3]} rotation={[-Math.PI / 4, 0, 0]}>
                <mesh material={materials.ral7035}><boxGeometry args={[0.6, 0.6, 0.05]} /></mesh>
                {/* Kanatçıklar */}
                {[0.15, 0.05, -0.05, -0.15].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.03]} rotation={[0.4, 0, 0]} material={materials.brushedAluminum}>
                        <boxGeometry args={[0.5, 0.08, 0.005]} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

// ============================================================
// MODEL KONUMLAMA STRATEJİSİ (v6 - STABLE DETERMINISTIC)
// ============================================================
// AutoCenter KALDIRILDI (MegaMenu'da beyaz ekran sorununa yol açtı).
// Tekrar deterministik offset tablosuna dönüldü.
//
// 1. Fanlar: getModelOffset(slug, 'centered') -> 3dModelOffsets.ts
// 2. İkonlar: ICON_Y_OFFSETS tablosu
// ============================================================

// Fan olmayan modeller için centered offset tablosu
const ICON_Y_OFFSETS: Record<string, number> = {
    // AirCurtainIcon: gövde Y=0.35'te (height=0.45) → merkez Y=0.35 → offset=-0.35
    'hava-perdeleri': -0.35,
    // DepuroIcon: gövde Y=0'da.
    // Kullanıcı "yukarı kaymış" dedi, offset'i düşür (0.15 -> 0.05)
    'hava-temizleyiciler': 0.05,
    'hava-temizleyiciler-anti-viral-urunler': 0.05,
    // DehumidifierIcon
    'nem-alma-cihazlari': 0,
    'nem-alma': 0,
    // HRVIcon
    'isi-geri-kazanim-cihazlari': 0,
    'isi-geri-kazanim': 0,
    // AccessoryIcon
    'aksesuarlar': 0,
    'yedek-parca': 0,
    // AxialFanModel
    'fanlar': 0,
    // FlexDuctModel
    'flexible-hava-kanallari': 0,
    'flexible': 0,
    // Hız Kontrol
    'hiz': 0,
    'kontrol': 0,
}

// Bounding Box hatalarını manuel düzeltmek için (Gerekirse buraya ekle)
const MANUAL_FIXAR_OFFSETS: Record<string, number> = {
    // Örn: 'siginak': -0.1
}

const Category3DIcon: React.FC<Category3DIconProps> = ({ categorySlug, scale = 1, modelPosition }) => {
    const safeSlug = (categorySlug || '').toLowerCase()

    // Pozisyon belirleme
    let position: [number, number, number] = [0, 0, 0]

    if (modelPosition) {
        position = modelPosition
    } else if (safeSlug in ICON_Y_OFFSETS) {
        position = [0, ICON_Y_OFFSETS[safeSlug], 0]
    } else if (safeSlug.includes('hiz') || safeSlug.includes('kontrol')) {
        position = [0, 0, 0]
    } else {
        // Fan Modelleri: 3dModelOffsets.ts kullan
        // Eğer manuel fix varsa onu ekle
        let yBase = 0
        for (const key in MANUAL_FIXAR_OFFSETS) {
            if (safeSlug.includes(key)) {
                yBase = MANUAL_FIXAR_OFFSETS[key]
                break
            }
        }

        // 3dModelOffsets.ts'den gelen değer
        const calculatedOffset = getModelOffset(undefined, safeSlug, 'centered')
        position = [0 + calculatedOffset[0], yBase + calculatedOffset[1], 0 + calculatedOffset[2]]
    }

    // İçeriği memoize et
    const content = useMemo(() => {
        if (safeSlug === 'fanlar') return <AxialFanModel />
        if (safeSlug.includes('hiz') || safeSlug.includes('kontrol')) return <SpeedControlIcon />

        switch (safeSlug) {
            case 'flexible-hava-kanallari':
            case 'flexible':
                return <FlexDuctModel />
            case 'hava-perdeleri':
                return <AirCurtainIcon />
            case 'hava-temizleyiciler-anti-viral-urunler':
            case 'hava-temizleyiciler':
                return <DepuroIcon />
            case 'nem-alma-cihazlari':
            case 'nem-alma':
                return <DehumidifierIcon />
            case 'isi-geri-kazanim-cihazlari':
            case 'isi-geri-kazanim':
                return <HRVIcon />
            case 'aksesuarlar':
            case 'yedek-parca':
                return <AccessoryIcon />
            default:
                return <FanRenderer slug={safeSlug} />
        }
    }, [safeSlug])

    return (
        <group scale={scale} position={position}>
            {content}
        </group>
    )
}

export default Category3DIcon

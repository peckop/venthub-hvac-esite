import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FanRenderer } from './3d/FanRenderer'
import { useFanMaterials } from './3d/materials/useFanMaterials'
import { AxialFanModel } from './3d/types/AxialFanModel'
import { getModelPlacement, ModelContext } from '../../utils/3dModelOffsets'
import { SmartCenterScale } from './3d/SmartCenterScale'

interface Category3DIconProps {
    categorySlug: string
    color?: string
    scale?: number
    modelPosition?: [number, number, number]
    offsetContext?: ModelContext // 'centered' | 'orbital' | 'grounded'
}

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

// Profesyonel modeller (AirCurtainModel, AirPurifierModel vb.) artık FanRenderer üzerinden çağrılıyor.
// Bu dosyadaki geçici çizimler kademeli olarak temizleniyor.

const DehumidifierIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
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

const SpeedControlIcon: React.FC = () => {
    const materials = useFanMaterials()
    return (
        <group>
            <mesh material={materials.brushedAluminum}>
                <boxGeometry args={[0.7, 0.9, 0.3]} />
            </mesh>
            <mesh position={[0, 0, 0.151]} material={materials.industrialSteel}>
                <boxGeometry args={[0.62, 0.82, 0.002]} />
            </mesh>
            <mesh position={[0, 0.15, 0.152]}>
                <planeGeometry args={[0.58, 0.48]} />
                <meshPhysicalMaterial color="#000000" roughness={0.05} metalness={0.9} clearcoat={1.0} clearcoatRoughness={0.0} emissive="#000000" />
            </mesh>
            <group position={[0, 0.15, 0.153]} scale={0.7}>
                <group position={[0, 0.1, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[0.6, 0.04]} />
                        <meshBasicMaterial color="#1e293b" />
                    </mesh>
                    <mesh position={[-0.075, 0, 0.001]}>
                        <planeGeometry args={[0.45, 0.04]} />
                        <meshBasicMaterial color="#22c55e" toneMapped={false} />
                    </mesh>
                </group>
                <mesh position={[0, -0.15, 0]}>
                    <circleGeometry args={[0.03, 16]} />
                    <meshBasicMaterial color="#3b82f6" toneMapped={false} />
                </mesh>
            </group>
            <group position={[0, -0.25, 0.155]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.07, 0.07, 0.03, 32]} />
                </mesh>
                <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]} material={materials.galvanizedSteel}>
                    <boxGeometry args={[0.015, 0.08, 0.02]} />
                </mesh>
            </group>
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
        <group scale={[0.65, 0.65, 0.65]}>
            <group position={[-0.4, 0, -0.2]}>
                <mesh material={materials.galvanizedSteel}><boxGeometry args={[0.8, 0.8, 0.3]} /></mesh>
                <group ref={bladeRef} position={[0, 0, 0.18]}>
                    {[0.2, 0, -0.2].map((y, i) => (
                        <mesh key={i} position={[0, y, 0]} material={materials.brushedAluminum}><boxGeometry args={[0.7, 0.18, 0.02]} /></mesh>
                    ))}
                </group>
                <mesh position={[0.45, 0, 0]} material={materials.safetyOrange}><boxGeometry args={[0.15, 0.25, 0.15]} /></mesh>
            </group>
            <group position={[0.5, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
                <mesh position={[0, 0.25, 0]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.3, 0.3, 0.05, 32]} /></mesh>
                <mesh position={[0, -0.25, 0]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.3, 0.3, 0.05, 32]} /></mesh>
                <mesh material={materials.matteBlack}><cylinderGeometry args={[0.28, 0.28, 0.45, 32]} /></mesh>
            </group>
        </group>
    )
}

// NOT: Tüm offsetler artık merkezi src/utils/3dModelOffsets.ts içinden yönetiliyor.
// Hava perdeleri, aksesuarlar vb. için yerel liste kaldırıldı.
interface Category3DIconProps {
    categorySlug: string
    scale?: number
    offsetContext?: 'grounded' | 'centered' | 'orbital'
    modelType?: string // [NEW] Kesin model eşleşmesi için
}

const Category3DIcon: React.FC<Category3DIconProps> = ({ categorySlug, scale = 1, offsetContext = 'centered', modelType }) => {
    const safeSlug = (categorySlug || '').toLowerCase()
    // SmartCenterScale: Sadece 'centered' (Kategori Grid, Mega Menu) için aktif.
    // 'orbital' (Ana Sayfa) ve 'grounded' (Ürün Detay) için manuel offsetler kullanılır.
    // SmartCenterScale: Sadece 'centered' (Kategori Grid, Mega Menu) için aktif.
    // 'orbital' (Ana Sayfa) ve 'grounded' (Ürün Detay) için manuel offsetler kullanılır.
    const useSmartCenter = offsetContext === 'centered'

    const content = useMemo(() => {
        if (safeSlug === 'fanlar') return <AxialFanModel />
        if (safeSlug.includes('hiz') || safeSlug.includes('kontrol')) return <SpeedControlIcon />

        switch (safeSlug) {
            case 'flexible-hava-kanallari':
            case 'flexible':
                return <FlexDuctModel />
            case 'hava-perdeleri':
                return <FanRenderer slug={safeSlug} />
            case 'hava-temizleyiciler-anti-viral-urunler':
            case 'hava-temizleyiciler':
                return <FanRenderer slug={safeSlug} />
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
                return <FanRenderer slug={safeSlug} modelType={modelType} /> // [FIX] modelType geçirildi
        }
    }, [safeSlug, modelType])

    // Placement logic
    const placement = useMemo(() => {
        // modelPosition prop is deprecated but kept for compatibility if passed explicitly
        // (Though it is not part of the interface anymore, we handle it if it exists in props via ...rest or if re-added)

        // DEBUG: Exproof veya diğer modellerin neden pozisyon almadığını görmek için
        // console.log(`[Category3DIcon] Slug: ${safeSlug}, ModelType: ${modelType}, Context: ${offsetContext}`);

        if (useSmartCenter) {
            // Centered context doesn't use modelType strict layout usually, but we pass it anyway
            const p = getModelPlacement(modelType, safeSlug, 'centered')
            return p
        }
        // Orbital & Grounded (Detailed View)
        const p = getModelPlacement(modelType, safeSlug, offsetContext)

        return p
    }, [safeSlug, offsetContext, useSmartCenter, modelType])

    // Apply manual scale from config
    const finalScale = scale * (placement.scale || 1)

    if (useSmartCenter) {
        return (
            <group scale={finalScale}>
                <SmartCenterScale targetSize={1.4} enabled={true} shift={placement.position}>
                    <group rotation={placement.rotation}>
                        {content}
                    </group>
                </SmartCenterScale>
            </group>
        )
    }

    return (
        <group scale={finalScale} position={placement.position} rotation={placement.rotation}>
            {content}
        </group>
    )
}

export default Category3DIcon




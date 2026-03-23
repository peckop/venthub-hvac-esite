'use client';

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Float, Box, Html } from '@react-three/drei'
import { MousePointerClick, ChevronLeft, ChevronRight } from 'lucide-react'

// =============================================================================
// T─░PLER VE ARAY├£ZLER
// =============================================================================
export interface IconMaterials {
    whiteABS: THREE.Material
    industrialSteel: THREE.Material
    brushedAluminum: THREE.Material
    aluminumFlex: THREE.Material
    matteBlack: THREE.Material
    filterMedia: THREE.Material
    rubberBlack: THREE.Material
    chrome: THREE.Material
}

interface Category3DIconProps {
    categorySlug: string; modelType?: string; offsetContext?: string
    materials?: IconMaterials
    hovered?: boolean
    isFrontCard?: boolean
    shouldShowTapHint?: boolean
    shouldShowDragHint?: boolean
    hintStage?: 'idle' | 'tap' | 'drag' | 'scroll' | 'down' | 'finished'
    DetailedModel?: React.ComponentType | null
    scale?: number
}

// =============================================================================
// F─░Z─░KSEL MATERYAL KANCASI
// =============================================================================
const useIconMaterials = (): IconMaterials => {
    return useMemo(() => ({
        whiteABS: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.3, metalness: 0.1 }),
        industrialSteel: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, metalness: 0.6 }),
        brushedAluminum: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.25, metalness: 0.85 }),
        aluminumFlex: new THREE.MeshStandardMaterial({ color: '#b8c4ce', roughness: 0.2, metalness: 0.88 }),
        matteBlack: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85, metalness: 0.1 }),
        filterMedia: new THREE.MeshStandardMaterial({ color: '#fafaf9', roughness: 0.95, metalness: 0.0 }),
        rubberBlack: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.98, metalness: 0.0 }),
        chrome: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.1, metalness: 0.95 }),
    }), [])
}

// =============================================================================
// 1. ESNEK KANAL MODEL─░
// =============================================================================
const FlexDuctModel: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const spiralRef = useRef<THREE.Group>(null)

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

    const initialCurve = useMemo(() => createWaveCurve(0), [])

    return (
        <group>
            <mesh ref={meshRef} material={materials.aluminumFlex}>
                <tubeGeometry args={[initialCurve, 64, 0.28, 24, false]} />
            </mesh>
            <group ref={spiralRef}>
                {Array(20).fill(0).map((_, i) => (
                    <mesh key={i} material={materials.industrialSteel}>
                        <torusGeometry args={[0.29, 0.018, 8, 24]} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 2. FAN MODEL─░
// =============================================================================
const FanModel: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    const rotorRef = useRef<THREE.Group>(null)
    useFrame((_, delta) => {
        if (rotorRef.current) rotorRef.current.rotation.z -= delta * 4
    })

    return (
        <group>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                <cylinderGeometry args={[0.7, 0.7, 0.35, 32, 1, true]} />
            </mesh>
            <mesh position={[0, 0, 0.175]} material={materials.industrialSteel}><torusGeometry args={[0.7, 0.04, 8, 32]} /></mesh>
            <mesh position={[0, 0, -0.175]} material={materials.industrialSteel}><torusGeometry args={[0.7, 0.04, 8, 32]} /></mesh>
            <group ref={rotorRef} position={[0, 0, 0.02]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}><cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /></mesh>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <group key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                        <mesh position={[0.38, 0, 0]} rotation={[0.2, 0, 0]} material={materials.brushedAluminum}><boxGeometry args={[0.52, 0.15, 0.02]} /></mesh>
                    </group>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 3. HAVA PERDES─░ MODEL─░
// =============================================================================
const AirCurtainModel: React.FC<{ materials: IconMaterials; isHeated?: boolean }> = ({ materials, isHeated }) => {
    const flowRef = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (!flowRef.current) return
        const time = state.clock.elapsedTime
        const colorPhase = (Math.sin(time * 1.0) + 1) / 2
        flowRef.current.children.forEach((child, i) => {
            const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
            const r = 0.055 + colorPhase * 0.88
            const g = 0.647 - colorPhase * 0.38
            const b = 0.914 - colorPhase * 0.65
            m.color.setRGB(r, g, b)
            m.opacity = 0.25 + Math.sin(time * 2 + i * 0.2) * 0.08
        })
    })

    return (
        <group>
            <mesh position={[0, 0.35, 0]} material={materials.whiteABS}><boxGeometry args={[2.5, 0.45, 0.45]} /></mesh>
            {isHeated && <Box args={[2.3, 0.02, 0.08]} position={[0, 0.1, 0.1]} material={materials.matteBlack} />}
            <group ref={flowRef} position={[0, -0.5, 0.1]}>
                {Array(15).fill(0).map((_, i) => (
                    <mesh key={i} position={[(i - 7) * 0.15, 0, 0]}>
                        <planeGeometry args={[0.08, 1.2]} />
                        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// =============================================================================
// 4. HAVA TEM─░ZLEY─░C─░ (DEPURO)
// =============================================================================
const DepuroModel: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group position={[0, -0.4, 0]}>
            <mesh material={materials.brushedAluminum}><boxGeometry args={[0.8, 1.7, 0.55]} /></mesh>
            <mesh position={[0, 0.3, 0.29]} material={materials.matteBlack}><boxGeometry args={[0.3, 0.15, 0.02]} /></mesh>
            <mesh position={[0, 0.3, 0.31]}><circleGeometry args={[0.02, 12]} /><meshBasicMaterial color="#22c55e" /></mesh>
        </group>
    )
}

// =============================================================================
// 5. HRV MODEL─░
// =============================================================================
const HRVModel: React.FC<{ materials: IconMaterials }> = ({ materials }) => {
    return (
        <group position={[0, -0.25, 0]}>
            <mesh material={materials.whiteABS}><boxGeometry args={[1.2, 1.3, 0.65]} /></mesh>
            {[[-0.35, 0.7, 0.12], [0.35, 0.7, 0.12], [-0.35, 0.7, -0.12], [0.35, 0.7, -0.12]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
                </mesh>
            ))}
        </group>
    )
}

// =============================================================================
// ANA B─░LE┼ŞEN (CATEGORY 3D ICON)
// =============================================================================
const Category3DIcon: React.FC<Category3DIconProps> = ({
    categorySlug,
    hovered,
    isFrontCard,
    shouldShowTapHint,
    shouldShowDragHint,
    hintStage,
    DetailedModel,
    scale = 1
}) => {
    const materials = useIconMaterials()
    const meshRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
            if (hovered) meshRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.2
        }
    })

    const IconComponent = useMemo(() => {
        const slug = categorySlug.toLowerCase()
        if (slug.includes('fan')) return FanModel
        if (slug.includes('hava-perde') || slug.includes('isitici')) return AirCurtainModel
        if (slug.includes('flexible') || slug.includes('kanal')) return FlexDuctModel
        if (slug.includes('isi-geri') || slug.includes('hrv')) return HRVModel
        if (slug.includes('temizle') || slug.includes('depuro')) return DepuroModel
        return FanModel
    }, [categorySlug])

    const showTapHint = shouldShowTapHint && hintStage === 'tap'
    const showLabel = !isFrontCard || hintStage === 'finished'

    return (
        <group ref={meshRef}>
            <pointLight position={[3, 3, 3]} intensity={2.5} />
            <ambientLight intensity={0.4} />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} scale={[scale, scale, scale]}>
                {DetailedModel ? <DetailedModel /> : <IconComponent materials={materials} />}
            </Float>

            {isFrontCard && showTapHint && (
                <Html position={[0, 0, 1]} center>
                    <div className="animate-bounce bg-white/90 p-2 rounded-full shadow-lg border border-primary-navy/20">
                        <MousePointerClick className="text-primary-navy" size={24} />
                    </div>
                </Html>
            )}

            {isFrontCard && shouldShowDragHint && hintStage === 'drag' && (
                <Html position={[0, 1.5, 0]} center>
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                        <ChevronLeft className="text-cyan-400 animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Tut Çevir</span>
                        <ChevronRight className="text-cyan-400 animate-pulse" />
                    </div>
                </Html>
            )}

            {showLabel && (
                <Html position={[0, -1.2, 0]} center>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{categorySlug}</span>
                    </div>
                </Html>
            )}
        </group>
    )
}

export default Category3DIcon

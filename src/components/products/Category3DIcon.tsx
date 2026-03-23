'use client';

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Box, Cylinder, Sphere, Torus, Html, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { 
    MousePointerClick, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react'

// --- Types ---
export interface IconMaterials {
    primary: THREE.Material
    secondary: THREE.Material
    glass: THREE.Material
    matteBlack: THREE.Material
    galvanizedSteel: THREE.Material
    copper: THREE.Material
    glowingCyan: THREE.Material
}

// --- AIR CURTAIN MODEL (PREMIUM) ---
const AirCurtainModel: React.FC<{ isHeated?: boolean; showMixed?: boolean }> = ({ isHeated, showMixed }) => {
    return (
        <group>
            <Box args={[3, 0.8, 0.8]} castShadow>
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </Box>
            <Box args={[2.8, 0.1, 0.6]} position={[0, -0.36, 0.1]}>
                <meshStandardMaterial color="#1e293b" />
            </Box>
            {isHeated && (
                <group position={[0, 0, 0.45]}>
                    <Cylinder args={[0.02, 0.02, 2.6, 8]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={2} />
                    </Cylinder>
                </group>
            )}
            {showMixed && (
                <group position={[0, -1, 0]}>
                    <Cylinder args={[1.4, 1.4, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} >
                        <meshStandardMaterial color="#38bdf8" transparent opacity={0.1} />
                    </Cylinder>
                </group>
            )}
        </group>
    )
}

const FanIcon: React.FC<{ _materials: IconMaterials }> = () => (
    <group>
        <Cylinder args={[1, 1, 0.4, 32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Box args={[0.1, 1.8, 0.05]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color="#1e40af" />
        </Box>
        <Box args={[0.1, 1.8, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
            <meshStandardMaterial color="#1e40af" />
        </Box>
    </group>
)

const DepuroIcon: React.FC<{ _materials: IconMaterials }> = () => (
    <group>
        <Box args={[1.2, 2, 1.2]} castShadow>
            <meshStandardMaterial color="#f8fafc" metalness={0.1} roughness={0.8} />
        </Box>
        <Box args={[1, 0.8, 0.1]} position={[0, 0.4, 0.56]}>
            <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.5} />
        </Box>
    </group>
)

const DehumidifierIcon: React.FC<{ _materials: IconMaterials }> = () => (
    <group>
        <Box args={[1.5, 1.8, 1]} castShadow>
            <meshStandardMaterial color="#e2e8f0" />
        </Box>
        <Torus args={[0.3, 0.05, 16, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0.51]}>
            <meshStandardMaterial color="#3b82f6" />
        </Torus>
    </group>
)

const HRVIcon: React.FC<{ _materials: IconMaterials }> = () => (
    <group>
        <Box args={[2, 0.8, 2]} castShadow>
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
        </Box>
        <Cylinder args={[0.3, 0.3, 0.4, 16]} position={[-0.8, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#475569" />
        </Cylinder>
        <Cylinder args={[0.3, 0.3, 0.4, 16]} position={[0.8, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#475569" />
        </Cylinder>
    </group>
)

const SpeedControlIcon: React.FC<{ _materials: IconMaterials }> = () => (
    <group>
        <Box args={[1.2, 1.2, 0.4]} castShadow>
            <meshStandardMaterial color="#f1f5f9" />
        </Box>
        <Cylinder args={[0.3, 0.3, 0.2, 32]} position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#1e40af" />
        </Cylinder>
        <Sphere args={[0.05, 16, 16]} position={[0.4, 0.4, 0.21]}>
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" />
        </Sphere>
    </group>
)

const GenericIcon: React.FC = () => (
    <Box args={[1, 1, 1]} castShadow>
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.5} />
    </Box>
)

interface Category3DIconProps {
    categorySlug: string
    materials?: IconMaterials
    hovered?: boolean
    isFrontCard?: boolean
    shouldShowTapHint?: boolean
    shouldShowDragHint?: boolean
    hintStage?: 'idle' | 'tap' | 'drag' | 'scroll' | 'down' | 'finished'
    onStageChange?: (stage: 'idle' | 'tap' | 'drag' | 'scroll' | 'down' | 'finished') => void
    DetailedModel?: React.ComponentType | null
    scale?: number; offsetContext?: string; modelType?: string
}

function Loader() {
    const { progress } = useProgress()
    return <Html center><div className="text-white text-[10px] font-bold">{progress.toFixed(0)}%</div></Html>
}

const Category3DIcon: React.FC<Category3DIconProps> = ({
    categorySlug,
    materials,
    hovered,
    isFrontCard,
    shouldShowTapHint,
    shouldShowDragHint,
    hintStage,
    DetailedModel,
    scale = 1
}) => {
    const meshRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
            if (hovered) {
                meshRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 2) * 0.2
            }
        }
    })

    const IconComponent = useMemo(() => {
        const slug = categorySlug.toLowerCase()
        if (slug.includes('fan')) return FanIcon
        if (slug.includes('depuro')) return DepuroIcon
        if (slug.includes('nem-alma')) return DehumidifierIcon
        if (slug.includes('isi-geri-kazanim')) return HRVIcon
        if (slug.includes('hiz-kontrol')) return SpeedControlIcon
        if (slug.includes('hava-perdesi')) {
            const isHeated = slug.includes('isitici')
            const showMixed = slug === 'hava-perdeleri'
            const WrappedAirCurtain: React.FC<{ _materials: IconMaterials }> = () => (
                <AirCurtainModel isHeated={isHeated} showMixed={showMixed} />
            )
            return WrappedAirCurtain
        }
        return GenericIcon
    }, [categorySlug])

    const iconElement = useMemo(() => {
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: "#94a3b8" });
        const defaultMats: IconMaterials = {
            primary: fallbackMaterial,
            secondary: fallbackMaterial,
            glass: fallbackMaterial,
            matteBlack: fallbackMaterial,
            galvanizedSteel: fallbackMaterial,
            copper: fallbackMaterial,
            glowingCyan: fallbackMaterial
        };
        const Comp = IconComponent as React.ComponentType<{ _materials: IconMaterials }>
        return <Comp _materials={materials || defaultMats} />
    }, [IconComponent, materials])

    const showTapHint = shouldShowTapHint && hintStage === 'tap'
    const showLabel = !isFrontCard || hintStage === 'finished'

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} scale={[scale, scale, scale]}>
                <React.Suspense fallback={<Loader />}>
                    {DetailedModel ? <DetailedModel /> : iconElement}
                </React.Suspense>
            </Float>

            {/* Tap Hint */}
            {isFrontCard && showTapHint && (
                <Html position={[0, 0, 1]} center>
                    <div className="animate-bounce bg-white/90 p-2 rounded-full shadow-lg border border-primary-navy/20">
                        <MousePointerClick className="text-primary-navy" size={24} />
                    </div>
                </Html>
            )}

            {/* Drag Hint */}
            {isFrontCard && shouldShowDragHint && hintStage === 'drag' && (
                <Html position={[0, 1.5, 0]} center>
                    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                        <ChevronLeft className="text-cyan-400 animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Tut Çevir</span>
                        <ChevronRight className="text-cyan-400 animate-pulse" />
                    </div>
                </Html>
            )}

            {/* Label */}
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

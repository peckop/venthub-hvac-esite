'use client'

import { 
    ContactShadows,
    Environment, 
    Html,
    OrbitControls, 
    PerspectiveCamera, 
    useGLTF} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import React, { Suspense } from 'react'

import type { ThreeDMetadata } from '../../types/media.types'

interface ThreeDAuthorityProps {
    metadata: ThreeDMetadata
    className?: string
}

function Model({ url, hotspots }: { url: string, hotspots?: ThreeDMetadata['hotspots'] }) {
    const { scene } = useGLTF(url)
    
    return (
        <group>
            <primitive object={scene} />
            {hotspots?.map((spot, idx) => (
                <Html key={idx} position={spot.position}>
                    <div className="group relative">
                        <div className="w-4 h-4 bg-primary-navy rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse" />
                        <div className="absolute left-6 top-0 hidden group-hover:block bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-xl border border-slate-200 w-48 z-10">
                            <p className="text-xs font-black text-industrial-gray uppercase mb-1">{spot.label}</p>
                            {spot.description && <p className="text-xs text-steel-gray leading-tight">{spot.description}</p>}
                        </div>
                    </div>
                </Html>
            ))}
        </group>
    )
}

/**
 * P01-012: ThreeDAuthority
 * Gerçek 3D ürün modellerini (GLB/GLTF) interaktif olarak render eder.
 * Performans için 'Click-to-Load' stratejisini kullanır.
 */
export default function ThreeDAuthority({ metadata, className = '' }: ThreeDAuthorityProps) {
    const [isStarted, setIsStarted] = React.useState(false)

    if (!isStarted) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative rounded-3xl bg-slate-50 border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center cursor-pointer group ${className}`}
                style={{ minHeight: '400px' }}
                onClick={() => setIsStarted(true)}
            >
                <div className="text-center z-10 space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <div className="w-8 h-8 border-2 border-primary-navy border-t-transparent rounded-full animate-spin-slow opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-navy rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-black text-industrial-gray uppercase tracking-hvac-normal">3D Interactive View</p>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Click to Initialize Engine</p>
                    </div>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-3 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </motion.div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative rounded-3xl bg-slate-50 border border-slate-200 shadow-inner overflow-hidden ${className}`}
            style={{ minHeight: '400px' }}
        >
            {/* Use 'always' when autoRotate needs continuous rendering, 'demand' for static scenes */}
            <Canvas shadows="percentage" frameloop={metadata.config?.autoRotate ? 'always' : 'demand'} dpr={[1, 1.5]}>
                <PerspectiveCamera makeDefault position={[0, 0, metadata.config?.initialZoom ?? 5]} fov={45} />
                
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                <Suspense fallback={
                    <Html center>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-primary-navy border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading 3D Model</p>
                        </div>
                    </Html>
                }>
                    <Model url={metadata.modelUrl} hotspots={metadata.hotspots} />
                    
                    <Environment preset={metadata.config?.environment ?? 'studio'} />
                    
                    {metadata.config?.shadows !== false && (
                        <ContactShadows 
                            position={[0, -1.5, 0]} 
                            opacity={0.4} 
                            scale={10} 
                            blur={2.5} 
                            far={4} 
                        />
                    )}
                </Suspense>

                <OrbitControls 
                    makeDefault
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={metadata.config?.autoRotate ?? false}
                />
            </Canvas>

            {/* Help Overlay */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-hvac-normal">3D Interactive View • Drag to Rotate</p>
                </div>
            </div>
        </motion.div>
    )
}

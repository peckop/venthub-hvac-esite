"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube, Environment, ContactShadows, Html, useProgress } from '@react-three/drei'
import { FanRenderer } from './FanRenderer'
import {
    RotateCcw,
    Triangle,
    BoxSelect,
    Repeat,
    RefreshCw,
    ChevronLeft,
    Globe
} from 'lucide-react'
import { getModelPlacement } from '../../../utils/3dModelOffsets'

function Loader() {
    const { progress } = useProgress()
    return <Html center><div className="text-primary-navy font-bold text-sm bg-white/80 px-2 py-1 rounded">{progress.toFixed(0)}%</div></Html>
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }
    render() {
        if (this.state.hasError) {
            return (
                <Html center>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-lg text-center w-64">
                        <div className="text-red-600 font-bold mb-1 text-sm">3D Model Yüklenemedi</div>
                        <div className="text-[10px] text-red-500 break-words">{this.state.error?.message?.slice(0, 100)}</div>
                    </div>
                </Html>
            )
        }
        return this.props.children
    }
}

function ModelRotator({ children, enabled, rotationRef }: { children: React.ReactNode, enabled: boolean, rotationRef: React.MutableRefObject<THREE.Group | null> }) {
    const { gl, camera } = useThree()
    const isDragging = useRef(false)
    const previousMouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = gl.domElement
        const handlePointerDown = (e: PointerEvent) => {
            if (!enabled || e.button !== 0) return
            isDragging.current = true
            previousMouse.current = { x: e.clientX, y: e.clientY }
        }
        const handlePointerUp = () => { isDragging.current = false }
        const handlePointerMove = (e: PointerEvent) => {
            if (!enabled || !isDragging.current || !rotationRef.current) return
            const dx = e.clientX - previousMouse.current.x
            const dy = e.clientY - previousMouse.current.y
            previousMouse.current = { x: e.clientX, y: e.clientY }
            const speed = 0.005
            const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
            const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
            rotationRef.current.rotateOnWorldAxis(camUp, dx * speed)
            rotationRef.current.rotateOnWorldAxis(camRight, dy * speed)
        }
        canvas.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointermove', handlePointerMove)
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointermove', handlePointerMove)
        }
    }, [enabled, gl, camera, rotationRef])
    return <group ref={rotationRef}>{children}</group>
}

interface Product3DViewerProps {
    slug?: string
    modelType?: string
    isFullscreen?: boolean
    onToggleFullscreen?: () => void
    onClose?: () => void
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
    slug,
    modelType,
    isFullscreen = false,
    onClose
}) => {
    const [showGrid, setShowGrid] = useState(true)
    const [autoRotate, setAutoRotate] = useState(false)
    const [showViewMenu, setShowViewMenu] = useState(false)
    const [rotationMode, setRotationMode] = useState<'orbit' | 'free'>('orbit')
    
    const controlsRef = useRef<any>(null)
    const modelGroupRef = useRef<THREE.Group | null>(null)

    const tb = isFullscreen
        ? { icon: 18, font: 'text-[8px]', pad: 'p-1.5', minW: 'min-w-[40px]', div: 'h-7', top: 'top-4' }
        : { icon: 13, font: 'text-[6px]', pad: 'p-1', minW: 'min-w-[28px]', div: 'h-5', top: 'top-2' }

    const handleReset = useCallback(() => {
        setAutoRotate(false)
        setRotationMode('orbit')
        setShowGrid(true)
        if (controlsRef.current) { controlsRef.current.reset() }
        if (modelGroupRef.current) { modelGroupRef.current.rotation.set(0, 0, 0) }
    }, [])

    const handleViewChange = (view: 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso') => {
        setAutoRotate(false)
        setShowViewMenu(false)
        if (!controlsRef.current) return
        if (modelGroupRef.current) { modelGroupRef.current.rotation.set(0, 0, 0) }
        const dist = 3.5
        const cam = controlsRef.current.object
        controlsRef.current.target.set(0, 0, 0)
        cam.up.set(0, 1, 0)
        switch (view) {
            case 'front': cam.position.set(0, 0, dist); break
            case 'top': cam.position.set(0, dist, 0); cam.up.set(0, 0, -1); break
            case 'right': cam.position.set(dist, 0, 0); break
            case 'back': cam.position.set(0, 0, -dist); break
            case 'bottom': cam.position.set(0, -dist, 0); cam.up.set(0, 0, 1); break
            case 'left': cam.position.set(-dist, 0, 0); break
            case 'iso': cam.position.set(dist * 0.7, dist * 0.7, dist * 0.7); break
        }
        controlsRef.current.update()
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            switch (e.key.toLowerCase()) {
                case 'g': setShowGrid(prev => !prev); break
                case 'r': handleReset(); break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleReset])

    const placement = getModelPlacement(modelType, slug, 'grounded')

    return (
        <div className={`relative w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#cde0f5_100%)] ${isFullscreen ? 'fixed inset-0 z-[10000]' : 'rounded-xl overflow-hidden border border-light-gray'}`}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [2, 2, 2.8], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={2048} />
                <Environment preset="city" />
                <Suspense fallback={<Loader />}>
                    <ErrorBoundary>
                        {slug && (
                            <group position={[0, 0, 0]}>
                                <ModelRotator enabled={rotationMode === 'free'} rotationRef={modelGroupRef}>
                                    <group position={placement.position} rotation={placement.rotation}>
                                        <FanRenderer slug={slug} modelType={modelType} scale={1} />
                                    </group>
                                </ModelRotator>
                            </group>
                        )}
                    </ErrorBoundary>
                </Suspense>
                <group position={[0, -2.5, 0]}>
                    <ContactShadows opacity={0.45} scale={20} blur={2.5} far={4.5} resolution={1024} color="#000000" />
                    {showGrid && <Grid infiniteGrid fadeDistance={60} fadeStrength={4} sectionColor="#1e40af" cellColor="#94a3b8" sectionThickness={1.2} cellThickness={0.6} args={[20, 20]} />}
                </group>
                <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
                    <GizmoViewcube font="bold 50px Inter, sans-serif" opacity={0.9} color="#ffffff" hoverColor="#f8fafc" textColor="#475569" strokeColor="#cbd5e1" faces={['Sağ', 'Sol', 'Üst', 'Alt', 'Ön', 'Arka']} />
                </GizmoHelper>
                <OrbitControls ref={controlsRef} makeDefault enableRotate={rotationMode === 'orbit'} enableZoom={true} enablePan={true} maxPolarAngle={Math.PI} autoRotate={autoRotate} autoRotateSpeed={0.5} />
            </Canvas>

            <div className={`absolute ${tb.top} left-1/2 -translate-x-1/2 z-[100] pointer-events-auto`}>
                <div className={`flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-gray-300 shadow-xl`}>
                    {onClose && (
                        <button onClick={onClose} className={`flex items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 hover:text-primary-navy transition-all`}>
                            <ChevronLeft size={tb.icon} strokeWidth={2} /><span className={`${tb.font} font-bold leading-none`}>GERİ</span>
                        </button>
                    )}
                    <div className="relative">
                        <button onClick={() => setShowViewMenu(!showViewMenu)} className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 ${tb.minW} transition-all`}>
                            <BoxSelect size={tb.icon} strokeWidth={1.5} /><span className={`${tb.font} font-bold leading-none`}>GÖRÜNÜM</span>
                        </button>
                        {showViewMenu && (
                            <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-lg border border-gray-200 shadow-2xl z-[200]">
                                {[{ key: 'front', label: 'Ön' }, { key: 'back', label: 'Arka' }, { key: 'left', label: 'Sol' }, { key: 'right', label: 'Sağ' }, { key: 'top', label: 'Üst' }, { key: 'bottom', label: 'Alt' }].map(v => (
                                    <button key={v.key} onClick={() => handleViewChange(v.key as any)} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors">{v.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={handleReset} className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 ${tb.minW} transition-all`}>
                        <RefreshCw size={tb.icon} strokeWidth={1.5} /><span className={`${tb.font} font-bold leading-none`}>RESET</span>
                    </button>
                    <button onClick={() => setRotationMode(rotationMode === 'orbit' ? 'free' : 'orbit')} className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${rotationMode === 'free' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
                        {rotationMode === 'orbit' ? <RotateCcw size={tb.icon} strokeWidth={1.5} /> : <Globe size={tb.icon} strokeWidth={1.5} />}
                        <span className={`${tb.font} font-bold leading-none`}>{rotationMode === 'orbit' ? 'ORBİT' : 'FREE'}</span>
                    </button>
                    <button onClick={() => setAutoRotate(!autoRotate)} disabled={rotationMode === 'free'} className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${autoRotate ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
                        <Repeat size={tb.icon} className={autoRotate ? 'animate-spin' : ''} strokeWidth={1.5} />
                        <span className={`${tb.font} font-bold leading-none`}>OTO</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-30">
                <div className="bg-white/90 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                    <Triangle size={14} className="text-primary-navy fill-current" />
                    <span className="font-bold text-primary-navy text-xs">VentHub 3D</span>
                </div>
            </div>
        </div>
    )
}

export default Product3DViewer

"use client"
import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube, Environment, ContactShadows, Html, useProgress } from '@react-three/drei'
import { FanRenderer } from './FanRenderer'
import {
    RotateCcw,
    Triangle,
    X,
    Eye,
    EyeOff,
    Layers,
    Maximize2,
    Minimize2,
    MessageSquare,
    BoxSelect,
    Settings2,
    Repeat,
    HelpCircle,
    Box,
    RefreshCw,
    ChevronLeft,
    Globe,
    Grid3X3
} from 'lucide-react'
import { getModelPlacement } from '../../../utils/3dModelOffsets'

// ── HELPER COMPONENT: LOADER ──────────────────────────────────────────────
function Loader() {
    const { progress } = useProgress()
    return <Html center><div className="text-primary-navy font-bold text-sm bg-white/80 px-2 py-1 rounded">{progress.toFixed(0)}%</div></Html>
}

// ── HELPER COMPONENT: ERROR BOUNDARY ──────────────────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("3D Viewer Error:", error, errorInfo)
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

// ── HELPER COMPONENT: OBJECT ROTATOR (Object-centric rotation) ─────────────
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

        const handlePointerUp = () => {
            isDragging.current = false
        }

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
    onToggleFullscreen,
    onClose
}) => {
    // ── STATE ─────────────────────────────────────────────────────────────
    const [showGrid, setShowGrid] = useState(true)
    const [autoRotate, setAutoRotate] = useState(false)
    const [explode, setExplode] = useState(0) // 0 to 1
    const [selectedPart, setSelectedPart] = useState<string | null>(null)
    const [isolatedPart, setIsolatedPart] = useState<string | null>(null)
    const [hiddenParts, setHiddenParts] = useState<string[]>([])
    const [displayStyle, setDisplayStyle] = useState<'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines'>('shadedEdges')
    const [showViewMenu, setShowViewMenu] = useState(false)
    const [showStyleMenu, setShowStyleMenu] = useState(false)
    const [rotationMode, setRotationMode] = useState<'orbit' | 'free'>('orbit')
    const [enableTooltip, setEnableTooltip] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controlsRef = useRef<any>(null)
    const modelGroupRef = useRef<THREE.Group | null>(null)

    // Responsive toolbar sizing
    const tb = isFullscreen
        ? { icon: 18, font: 'text-[8px]', pad: 'p-1.5', minW: 'min-w-[40px]', div: 'h-7', slider: 'w-14 h-1.5', sliderMin: 'min-w-[50px]', sliderPx: 'px-1.5', gap: 'gap-0.5', p: 'p-1', round: 'rounded-lg', top: 'top-4', helpRight: 'right-14' }
        : { icon: 13, font: 'text-[6px]', pad: 'p-1', minW: 'min-w-[28px]', div: 'h-5', slider: 'w-10 h-1', sliderMin: 'min-w-[36px]', sliderPx: 'px-1', gap: 'gap-px', p: 'p-0.5', round: 'rounded-md', top: 'top-2', helpRight: 'right-10' }

    // ── ACTIONS ───────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        setExplode(0)
        setSelectedPart(null)
        setIsolatedPart(null)
        setHiddenParts([])
        setAutoRotate(false)
        setDisplayStyle('shadedEdges')
        setRotationMode('orbit') // Default to ORBIT on reset
        setShowGrid(true)        // Show Grid on reset
        if (controlsRef.current) {
            controlsRef.current.reset()
        }
        if (modelGroupRef.current) {
            modelGroupRef.current.rotation.set(0, 0, 0)
        }
    }, [])

    const handleIsolate = useCallback(() => {
        if (selectedPart) {
            setIsolatedPart(selectedPart)
        }
    }, [selectedPart])

    const handleHide = useCallback(() => {
        if (selectedPart) {
            setHiddenParts(prev => [...prev, selectedPart])
            setSelectedPart(null) // Deselect after hiding
        }
    }, [selectedPart])

    const handleShowAll = () => {
        setIsolatedPart(null)
        setHiddenParts([])
    }

    // ── VIEW LOGIC ────────────────────────────────────────────────────────
    const handleViewChange = (view: 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso') => {
        setAutoRotate(false)
        setShowViewMenu(false)
        setShowStyleMenu(false)
        if (!controlsRef.current) return

        // Reset model rotation so standard views are aligned correctly
        if (modelGroupRef.current) {
            modelGroupRef.current.rotation.set(0, 0, 0)
        }

        const dist = 3.5
        const cam = controlsRef.current.object

        // Reset target to center
        controlsRef.current.target.set(0, 0, 0)

        // Reset UP vector to standard Y-up for most views to prevent roll
        cam.up.set(0, 1, 0)

        switch (view) {
            case 'front':
                cam.position.set(0, 0, dist)
                break
            case 'top':
                cam.position.set(0, dist, 0)
                cam.up.set(0, 0, -1) // Top view needs Z-up alignment (top of screen is -Z)
                break
            case 'right':
                cam.position.set(dist, 0, 0)
                break
            case 'back':
                cam.position.set(0, 0, -dist)
                break
            case 'bottom':
                cam.position.set(0, -dist, 0)
                cam.up.set(0, 0, 1) // Bottom view alignment
                break
            case 'left':
                cam.position.set(-dist, 0, 0)
                break
            case 'iso':
                cam.position.set(dist * 0.7, dist * 0.7, dist * 0.7)
                break
        }

        controlsRef.current.update()
    }

    // ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

            switch (e.key.toLowerCase()) {
                case 'w': setDisplayStyle(prev => prev === 'shaded' ? 'wireframe' : prev === 'wireframe' ? 'shadedEdges' : prev === 'shadedEdges' ? 'hiddenLines' : 'shaded'); break
                case 'g': setShowGrid(prev => !prev); break
                case 'r': handleReset(); break
                case 'e': setExplode(prev => prev > 0 ? 0 : 0.5); break
                case 'h': if (selectedPart) handleHide(); break
                case 'i': if (selectedPart) handleIsolate(); break
                case 'escape':
                    setSelectedPart(null)
                    setIsolatedPart(null)
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleReset, selectedPart, handleHide, handleIsolate]) // Re-bind when selection changes



    // ── MODEL POSITIONING LOGIC ───────────────────────────────────────────
    const getModelPlacementData = useCallback(() => {
        return getModelPlacement(modelType, slug, 'grounded')
    }, [modelType, slug])

    const placement = getModelPlacementData()

    return (
        <div className={`relative w-full h-full bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#cde0f5_100%)] ${isFullscreen ? 'fixed inset-0 z-[10000]' : 'rounded-xl overflow-hidden border border-light-gray'}`}>

            {/* ── 3D CANVAS ────────────────────────────────────────────────── */}
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [2, 2, 2.8], fov: 40 }} // Aggressive zoom closer
                gl={{ alpha: true }}
                onPointerMissed={() => setSelectedPart(null)}
            >

                {/* Manual Scene Composition (Pro CAD Style) */}
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={2048} />
                <Environment preset="city" />

                <Suspense fallback={<Loader />}>
                    <ErrorBoundary>
                        {slug && (
                            /* Model centered at origin for correct rotation pivot */
                            <group position={[0, 0, 0]}>
                                <ModelRotator enabled={rotationMode === 'free'} rotationRef={modelGroupRef}>
                                    <group position={placement.position} rotation={placement.rotation}>
                                        <FanRenderer
                                            slug={slug}
                                            modelType={modelType}
                                            scale={1}
                                            explode={explode}
                                            onPartClick={(name) => {
                                                setSelectedPart(name)
                                                setAutoRotate(false)
                                            }}
                                            selectedPart={selectedPart}
                                            isolatedPart={isolatedPart}
                                            hiddenParts={hiddenParts}
                                            displayStyle={displayStyle}
                                            enableTooltip={enableTooltip}
                                        />
                                    </group>
                                </ModelRotator>
                            </group>
                        )}
                    </ErrorBoundary>
                </Suspense>

                {/* Ground Plane (Grid + Shadows) */}
                <group position={[0, -2.5, 0]}>
                    <ContactShadows opacity={0.45} scale={20} blur={2.5} far={4.5} resolution={1024} color="#000000" />
                    {showGrid && (
                        <Grid
                            infiniteGrid
                            fadeDistance={60}
                            fadeStrength={4}
                            sectionColor="#1e40af"
                            cellColor="#94a3b8"
                            sectionThickness={1.2}
                            cellThickness={0.6}
                            args={[20, 20]}
                        />
                    )}
                </group>

                {/* Orientation Gizmo (Bottom-Right) - PRO STYLE */}
                <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
                    <GizmoViewcube
                        font="bold 50px Inter, sans-serif"
                        opacity={0.9}
                        color="#ffffff"
                        hoverColor="#f8fafc"
                        textColor="#475569" // Slate-600 (Professional Gray)
                        strokeColor="#cbd5e1" // Slate-300 (Subtle Border)
                        faces={['Sağ', 'Sol', 'Üst', 'Alt', 'Ön', 'Arka']}
                    />
                </GizmoHelper>

                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    enableRotate={rotationMode === 'orbit'}
                    enableZoom={true}
                    enablePan={true}
                    maxPolarAngle={Math.PI}
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* ── UI: TOP RIGHT ACTIONS (Close & Help) ─────────────────────── */}
            <div className="absolute top-4 right-4 z-30 pointer-events-auto flex flex-col items-end gap-2">
                {isFullscreen && (
                    <button onClick={onClose} className="bg-white/90 p-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors">
                        <X size={18} />
                    </button>
                )}

            </div>

            {/* ── UI: BOTTOM LEFT BADGE (Moved to avoid overlap) ───────────── */}
            <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                    <Triangle size={14} className="fill-current text-primary-navy" />
                    <span className="font-bold text-primary-navy text-xs">VentHub 3D</span>
                    <span className="text-[9px] font-medium text-white bg-primary-navy px-1.5 py-0.5 rounded">CAD</span>
                </div>
            </div>

            {/* ── UI: SOLIDWORKS STYLE HEADS-UP TOOLBAR ─────────────────────────── */}
            <div className={`absolute ${tb.top} left-1/2 -translate-x-1/2 z-[100] pointer-events-auto`}>
                <div className={`flex items-center ${tb.gap} bg-white/95 backdrop-blur-md ${tb.p} ${tb.round} border border-gray-300 shadow-xl ring-1 ring-black/5`}>

                    {/* ── BACK (only when onClose provided) ──────────── */}
                    {onClose && (
                        <>
                            <button
                                onClick={onClose}
                                className={`flex items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 hover:text-primary-navy transition-all`}
                                title="Fotoğraflara Dön"
                            >
                                <ChevronLeft size={tb.icon} strokeWidth={2} />
                                <span className={`${tb.font} font-bold leading-none`}>GERİ</span>
                            </button>
                            <div className={`w-px ${tb.div} bg-gray-200`} />
                        </>
                    )}

                    {/* ── VIEW ORIENTATION (Dropdown) ──────────── */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowViewMenu(!showViewMenu); setShowStyleMenu(false); }}
                            className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 ${tb.minW} transition-all ${showViewMenu ? 'bg-blue-50 text-blue-600' : ''}`}
                            title="Görünüm Oryantasyonu"
                        >
                            <BoxSelect size={tb.icon} strokeWidth={1.5} />
                            <span className={`${tb.font} font-bold leading-none`}>GÖRÜNÜM</span>
                        </button>
                        {showViewMenu && (
                            <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-lg border border-gray-200 shadow-2xl overflow-hidden z-[200]">
                                <div className="px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Standart Görünüşler</span>
                                </div>
                                {[
                                    { key: 'front', label: 'Ön Görünüş', icon: '▫' },
                                    { key: 'back', label: 'Arka Görünüş', icon: '▪' },
                                    { key: 'left', label: 'Sol Görünüş', icon: '▯' },
                                    { key: 'right', label: 'Sağ Görünüş', icon: '▯' },
                                    { key: 'top', label: 'Üst Görünüş', icon: '▬' },
                                    { key: 'bottom', label: 'Alt Görünüş', icon: '▭' },
                                    { key: 'iso', label: 'İzometrik', icon: '◇' },
                                ].map(v => (
                                    <button
                                        key={v.key}
                                        onClick={() => {
                                            handleViewChange(v.key as 'front' | 'top' | 'right' | 'back' | 'bottom' | 'left' | 'iso')
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                                    >
                                        <span className="text-sm w-4 text-center text-gray-400">{v.icon}</span>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── RESET ──────────── */}
                    <button
                        onClick={handleReset}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 ${tb.minW} transition-all`}
                        title="Sıfırla (R)"
                    >
                        <RefreshCw size={tb.icon} strokeWidth={1.5} />
                        <span className={`${tb.font} font-bold leading-none`}>SIFIRLA</span>
                    </button>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── ROTATION MODE TOGGLE ──────────── */}
                    <button
                        onClick={() => {
                            const next = rotationMode === 'orbit' ? 'free' : 'orbit'
                            setRotationMode(next)
                            if (next === 'free') setAutoRotate(false)
                        }}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${rotationMode === 'free' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title={rotationMode === 'orbit' ? 'Serbest Dönüş (Trackball)' : 'Standart Orbit Dönüşü'}
                    >
                        {rotationMode === 'orbit' ? <RotateCcw size={tb.icon} strokeWidth={1.5} /> : <Globe size={tb.icon} strokeWidth={1.5} />}
                        <span className={`${tb.font} font-bold leading-none`}>{rotationMode === 'orbit' ? 'ORBİT' : 'SERBEST'}</span>
                    </button>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── AUTO ROTATE ──────────── */}
                    <button
                        onClick={() => { if (rotationMode === 'orbit') setAutoRotate(!autoRotate) }}
                        disabled={rotationMode === 'free'}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${rotationMode === 'free' ? 'opacity-30 cursor-not-allowed text-gray-400' : autoRotate ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title={rotationMode === 'free' ? 'Serbest modda kullanılamaz' : 'Otomatik Döndürme'}
                    >
                        <Repeat size={tb.icon} className={autoRotate && rotationMode === 'orbit' ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} strokeWidth={1.5} />
                        <span className={`${tb.font} font-bold leading-none`}>OTOMATİK</span>
                    </button>

                    {/* ── GRID ──────────── */}
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${showGrid ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Izgara Aç/Kapat (G)"
                    >
                        <Grid3X3 size={tb.icon} strokeWidth={1.5} />
                        <span className={`${tb.font} font-bold leading-none`}>IZGARA</span>
                    </button>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── DISPLAY STYLE (Dropdown) ──────────── */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowStyleMenu(!showStyleMenu); setShowViewMenu(false); }}
                            className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded hover:bg-gray-100 text-gray-600 ${tb.minW} transition-all ${showStyleMenu ? 'bg-blue-50 text-blue-600' : ''}`}
                            title="Görüntü Stili"
                        >
                            {displayStyle === 'wireframe' ? <Grid3X3 size={tb.icon} strokeWidth={1.5} /> : displayStyle === 'hiddenLines' ? <Eye size={tb.icon} strokeWidth={1.5} /> : displayStyle === 'shadedEdges' ? <BoxSelect size={tb.icon} strokeWidth={1.5} /> : <Box size={tb.icon} strokeWidth={1.5} />}
                            <span className={`${tb.font} font-bold leading-none`}>{displayStyle === 'shadedEdges' ? 'KENARLI' : displayStyle === 'shaded' ? 'GÖLGELİ' : displayStyle === 'wireframe' ? 'TEL KAFES' : 'HLR'}</span>
                        </button>
                        {showStyleMenu && (
                            <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-lg border border-gray-200 shadow-2xl overflow-hidden z-[200]">
                                <div className="px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Görüntü Stili</span>
                                </div>
                                {[
                                    { key: 'shadedEdges', label: 'GÖLGELİ VE KENARLI', desc: 'Keskin kenarlar', icon: <BoxSelect size={14} /> },
                                    { key: 'shaded', label: 'GÖLGELİ', desc: 'Yumuşak görünüm', icon: <Box size={14} /> },
                                    { key: 'wireframe', label: 'TEL KAFES', desc: 'Sadece tel çerçeve', icon: <Grid3X3 size={14} /> },
                                    { key: 'hiddenLines', label: 'ARKA KENARLARI GİZLE', desc: 'Teknik resim modu', icon: <Eye size={14} /> },
                                ].map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => {
                                            setDisplayStyle(s.key as 'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines');
                                            setShowStyleMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${displayStyle === s.key ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <span className={displayStyle === s.key ? 'text-blue-600' : 'text-gray-400'}>{s.icon}</span>
                                        <div>
                                            <div className={`text-xs ${displayStyle === s.key ? 'font-bold' : 'font-medium'}`}>{s.label}</div>
                                            <div className="text-[9px] text-gray-400">{s.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── EXPLODE SLIDER ──────────── */}
                    <div className={`flex flex-col items-center gap-0.5 ${tb.sliderPx} ${tb.sliderMin}`}>
                        <span className={`${tb.font} font-bold text-gray-500`}>PATLAT</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={explode}
                            onChange={(e) => {
                                setExplode(parseFloat(e.target.value))
                                setAutoRotate(false)
                            }}
                            className={`${tb.slider} bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600`}
                        />
                    </div>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── TOOLTIP TOGGLE ──────────── */}
                    <button
                        onClick={() => setEnableTooltip(!enableTooltip)}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${enableTooltip ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Parça İsimlerini Göster/Gizle"
                    >
                        <MessageSquare size={tb.icon} strokeWidth={1.5} />
                        <span className={`${tb.font} font-bold leading-none`}>İSİM</span>
                    </button>

                    <div className={`w-px ${tb.div} bg-gray-200`} />

                    {/* ── FULLSCREEN ──────────── */}
                    <button
                        onClick={onToggleFullscreen}
                        className={`flex flex-col items-center gap-0.5 ${tb.pad} rounded transition-all ${tb.minW} ${isFullscreen ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-100 text-gray-600'}`}
                        title={isFullscreen ? "Küçült" : "Tam Ekran"}
                    >
                        {isFullscreen ? <Minimize2 size={tb.icon + 1} strokeWidth={1.5} /> : <Maximize2 size={tb.icon + 1} strokeWidth={1.5} />}
                        <span className={`${tb.font} font-bold leading-none`}>{isFullscreen ? 'KÜÇÜLT' : 'TAM'}</span>
                    </button>
                </div>
            </div>

            {/* ── UI: MOUSE HELP TOOLTIP (Top Right, hover) ───────────── */}
            <div className={`absolute ${tb.top} ${tb.helpRight} z-30 pointer-events-auto group/help`}>
                <button className={`bg-white/80 backdrop-blur-sm ${tb.pad} ${tb.round} border border-gray-200 shadow-sm text-gray-400 hover:text-gray-600 transition-colors`}>
                    <HelpCircle size={tb.icon} strokeWidth={1.5} />
                </button>
                <div className="hidden group-hover/help:block absolute top-full right-0 mt-1 w-44 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl p-2.5 z-[200]">
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1.5">Kontroller</div>
                    <div className="space-y-1 text-[10px] text-gray-600">
                        <div className="flex items-center gap-2"><span className="font-bold text-gray-800 w-16">Sol Tık</span> Döndür</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-gray-800 w-16">Sağ Tık</span> Kaydır</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-gray-800 w-16">Scroll</span> Yakınlaştır</div>
                        <div className="flex items-center gap-2"><span className="font-bold text-gray-800 w-16">Parça Tık</span> Seç / İzole</div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200 text-[9px] text-gray-400">
                        Mod: <span className="font-bold text-gray-600">{rotationMode === 'orbit' ? 'Orbit (Standart)' : 'Serbest (Trackball)'}</span>
                    </div>
                </div>
            </div>

            {/* ── UI: PART PROPERTIES PANEL (OPTIMIZED) ────────────── */}
            {(selectedPart || isolatedPart || hiddenParts.length > 0) && (
                <div className="absolute top-20 left-4 w-52 bg-white/95 backdrop-blur-md border border-gray-300 shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-left-4 z-30 transform transition-all duration-300 ease-out">

                    {/* Panel Header */}
                    <div className="bg-gray-100 px-2 py-1.5 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                            <Settings2 size={10} /> ÖZELLİK YÖNETİCİSİ
                        </span>
                        {(selectedPart || isolatedPart) && (
                            <button onClick={() => { setSelectedPart(null); setIsolatedPart(null) }} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-2">
                        {/* Selected Part Name */}
                        {selectedPart && (
                            <div className="mb-2">
                                <div className="text-[9px] text-gray-400 font-semibold mb-0.5">SEÇİLİ PARÇA</div>
                                <div className="text-xs font-bold text-gray-800 leading-tight">{selectedPart}</div>
                            </div>
                        )}

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                            {/* ISOLATE */}
                            {selectedPart && (
                                <button
                                    onClick={handleIsolate}
                                    disabled={!!isolatedPart}
                                    className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded border transition-all ${isolatedPart
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 opacity-100'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    <Eye size={14} />
                                    <span className="text-[9px] font-bold">TEK GÖSTER</span>
                                </button>
                            )}

                            {/* HIDE */}
                            {selectedPart && !isolatedPart && (
                                <button
                                    onClick={handleHide}
                                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    <EyeOff size={14} />
                                    <span className="text-[9px] font-bold">GİZLE</span>
                                </button>
                            )}
                        </div>

                        {/* RECOVERY BUTTONS */}
                        {(isolatedPart || hiddenParts.length > 0) && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <button
                                    onClick={handleShowAll}
                                    className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-bold transition-colors"
                                >
                                    <Layers size={12} />
                                    {isolatedPart ? 'İZOLASYONU KALDIR' : `GİZLENENLERİ GÖSTER (${hiddenParts.length})`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}




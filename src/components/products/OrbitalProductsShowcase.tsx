import React, { useRef, useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Environment, Float, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { MousePointerClick, ChevronLeft, ChevronRight } from 'lucide-react'
import { ORBITAL_CAROUSEL_CONFIG as CONFIG } from '@/config/orbitalCarouselConfig'



import Category3DIcon from './Category3DIcon'

interface ProductItem {
    id: string
    title: string
    image: string
    categorySlug?: string
}

interface OrbitalProductsShowcaseProps {
    items: ProductItem[]
    onCardClick?: (itemId: string, event?: MouseEvent) => void
    externalPause?: boolean
    onFocusedItemChange?: (itemId: string | null) => void
    onFrontCardChange?: (itemId: string) => void // Dönerken önde olan kart
    modelScale?: number // New prop for controlling 3D model scale
    containerHeight?: string | number // New prop for container height
    skipHints?: boolean // Alt kategoriye geçince hint animasyonunu atla
}

// Global rotation state management
interface SharedState {
    rotation: number
    target: number | null
    velocity: number
    pauseUntil: number
    startTime: number
    isReady: boolean // Animation trigger
}

/**
 * Sahne Zemini ve Efektler (Hemen Yüklenir)
 */
const Stage: React.FC<{
    sharedState: React.MutableRefObject<SharedState>
}> = ({ sharedState }) => {
    // Animasyon frame'i
    useFrame(() => {
        // Sadece re-render tetiklemek için, asıl hesap component içinde
    })

    // Yarıçap animasyonu - isReady false ise 0, true ise zamanla artar
    const getRadius = () => {
        if (!sharedState.current.isReady) return 0
        const elapsed = (Date.now() - sharedState.current.startTime) / 2000
        return CONFIG.radius * (1 - Math.pow(1 - Math.min(1, Math.max(0, elapsed)), 3))
    }

    const currentRadius = getRadius()

    return (
        <group>
            {/* Genişleyen Halka - LIFTED to -0.8 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                <ringGeometry args={[Math.max(0.1, currentRadius - 0.08), currentRadius + 0.08, 64]} />
                <meshBasicMaterial color="#0891b2" transparent opacity={0.1 * (currentRadius / CONFIG.radius)} />
            </mesh>

            {/* Zemin - LIFTED to -1.6 (relative deeper) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
                <circleGeometry args={[12, 64]} />
                <meshStandardMaterial
                    color="#050a15"
                    metalness={CONFIG.floorMetalness}
                    roughness={0.3}
                />
            </mesh>
            <Sparkles count={CONFIG.particleCount} scale={16} size={2} speed={0.2} opacity={0.3} color={CONFIG.glowColor} />
        </group>
    )
}

/**
 * Ürün Kartları ve Mantığı (Suspense İçinde)
 */
const CarouselItems: React.FC<{
    items: ProductItem[]
    isPaused: boolean
    onHover: (h: boolean) => void
    dragDelta: number
    onInteract: () => void
    sharedState: React.MutableRefObject<SharedState>
    isDraggingRef: React.MutableRefObject<boolean>
    setIsDragging: (val: boolean) => void
    onCardClick?: (itemId: string, event?: MouseEvent) => void
    onFocusedItemChange?: (itemId: string | null) => void
    onFrontCardChange?: (itemId: string) => void
    shouldShowTapHint: boolean
    shouldShowDragHint: boolean
    hintStage: 'idle' | 'tap' | 'drag' | 'cooldown' | 'finished'
    onStageChange: (stage: 'idle' | 'tap' | 'drag' | 'cooldown' | 'finished') => void
    modelScale: number
    onReady: () => void
}> = ({ items, isPaused, onHover, dragDelta, onInteract, sharedState, isDraggingRef, setIsDragging, onCardClick, onFocusedItemChange, onFrontCardChange, shouldShowTapHint, shouldShowDragHint, hintStage, onStageChange, modelScale, onReady }) => {
    const { camera } = useThree()
    const lastFrontCardRef = useRef<string | null>(null)
    const [frontCardId, setFrontCardId] = useState<string | null>(null)
    const frontCardChangeCountRef = useRef(0)
    const hasBeenFocusedRef = useRef(false)
    const swayOffsetRef = useRef(0)

    // Notify ready state
    useEffect(() => {
        onReady()
    }, [onReady])

    useFrame((state, delta) => {
        // ... (Kameranın nefes alma efekti vs buraya taşınmalı veya Stage'de de olabilir ama kamera manipulasyonu burada kalsın)
        // ... (Kameranın nefes alma efekti vs buraya taşınmalı veya Stage'de de olabilir ama kamera manipulasyonu burada kalsın)
        camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * CONFIG.cameraBreathAmplitude
        // FIXED: Remove vertical camera wobble to stop "synchronized jumping" effect
        camera.position.y = CONFIG.cameraHeight

        // ... (Mevcut mantık kodları aynen kalacak)
        const now = Date.now()

        // Animasyon başlamadıysa çık
        if (!sharedState.current.isReady) return

        const elapsed = (now - sharedState.current.startTime) / 2000
        const entryProgress = Math.min(1, Math.max(0, elapsed))

        const isPausedByClick = now < sharedState.current.pauseUntil
        const friction = 0.95

        // ... (Rest of logic: Target Mode, Drag Mode, Momentum, Auto Rotate, Snap)
        // TARGET MODU AKTİF İSE
        if (sharedState.current.target !== null) {
            if (isDraggingRef.current) isDraggingRef.current = false
            const diff = sharedState.current.target - sharedState.current.rotation
            if (Math.abs(diff) < 0.002) {
                sharedState.current.rotation = sharedState.current.target
                sharedState.current.target = null
                sharedState.current.velocity = 0
            } else {
                sharedState.current.rotation += diff * 0.2
            }
        }
        // DRAG MODU
        else if (isDraggingRef.current && Math.abs(dragDelta) > 0.5) {
            const dragSpeed = dragDelta * 0.005
            sharedState.current.rotation += dragSpeed
            sharedState.current.velocity = dragSpeed / Math.max(delta, 0.016)
            sharedState.current.pauseUntil = 0
        }
        // MOMENTUM
        else if (Math.abs(sharedState.current.velocity) > 0.01) {
            sharedState.current.rotation += sharedState.current.velocity * delta
            sharedState.current.velocity *= friction
        }
        // OTO DÖNÜŞ
        else if (!isPaused && !isPausedByClick && entryProgress >= 0.8 && !isDraggingRef.current) {
            let currentSpeed = delta * CONFIG.autoRotateSpeed
            if (shouldShowDragHint) {
                currentSpeed *= 0.05
                const t = state.clock.elapsedTime % 3
                const step = (Math.PI * 2) / items.length
                const maxSway = step * 0.8
                let targetSway = 0
                if (t < 1.0) targetSway = Math.sin(t * Math.PI) * maxSway
                else if (t < 2.0) targetSway = -Math.sin((t - 1.0) * Math.PI) * maxSway
                else targetSway = 0 // Wait
                const swayDelta = targetSway - swayOffsetRef.current
                sharedState.current.rotation += swayDelta
                swayOffsetRef.current = targetSway
            } else {
                if (swayOffsetRef.current !== 0) {
                    sharedState.current.rotation -= swayOffsetRef.current
                    swayOffsetRef.current = 0
                }
            }
            sharedState.current.rotation -= currentSpeed
        }
        // SNAP
        else if (!isDraggingRef.current && sharedState.current.target === null && Math.abs(sharedState.current.velocity) < 0.01) {
            const total = items.length
            const currentRot = sharedState.current.rotation
            const step = (Math.PI * 2) / total
            const closestTarget = Math.round(-currentRot / step) * step
            const diff = -closestTarget - currentRot
            const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
            if (Math.abs(shortestDiff) < 0.001) sharedState.current.rotation = -closestTarget
            else sharedState.current.rotation += shortestDiff * 0.1
        }

        // Logic check for reset
        const currentTime = Date.now()
        const isCarouselRotating = sharedState.current.target === null && currentTime > sharedState.current.pauseUntil && !isPaused
        if (isCarouselRotating && hasBeenFocusedRef.current) {
            frontCardChangeCountRef.current = 0
            hasBeenFocusedRef.current = false
            onStageChange('idle')
            if (onFocusedItemChange) onFocusedItemChange(null)
        } else if (sharedState.current.target !== null) {
            hasBeenFocusedRef.current = true
        }

        // Front Card Check
        if (items.length > 0) {
            const total = items.length
            const step = (Math.PI * 2) / total
            let frontIndex = Math.round(-sharedState.current.rotation / step) % total
            if (frontIndex < 0) frontIndex += total
            const frontItem = items[frontIndex]
            if (frontItem && frontItem.id !== lastFrontCardRef.current) {
                lastFrontCardRef.current = frontItem.id
                setFrontCardId(frontItem.id)
                frontCardChangeCountRef.current += 1
                const count = frontCardChangeCountRef.current
                if (hintStage === 'idle' && count >= 2) onStageChange('tap')
                if (onFrontCardChange && sharedState.current.target === null) onFrontCardChange(frontItem.id)
            }
        }
    })

    return (
        <group>
            {items.map((item, i) => (
                <OrbitalCard
                    key={item.id}
                    item={item}
                    index={i}
                    total={items.length}
                    sharedState={sharedState}

                    onHover={onHover}
                    onBringToFront={() => {
                        // Duplicate logic from handleBringToFront since it was inside SceneContent
                        onInteract()
                        const total = items.length
                        const baseAngle = (i / total) * Math.PI * 2
                        const currentRot = sharedState.current.rotation
                        const targetPos = -baseAngle
                        const diff = targetPos - currentRot
                        const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
                        if (Math.abs(shortestDiff) < 0.01 && sharedState.current.target === null) return
                        isDraggingRef.current = false
                        sharedState.current.target = currentRot + shortestDiff
                        sharedState.current.velocity = 0
                        sharedState.current.pauseUntil = Date.now() + 4000
                    }}
                    setIsDragging={setIsDragging}
                    isDraggingRef={isDraggingRef}
                    onCardClick={onCardClick}
                    onFocusedItemChange={onFocusedItemChange}
                    isFrontCard={frontCardId === item.id}
                    shouldShowTapHint={shouldShowTapHint}
                    shouldShowDragHint={shouldShowDragHint}
                    modelScale={modelScale}
                />
            ))}
        </group>
    )
}

/**
 * Tek bir ürün kartı
 */
const OrbitalCard: React.FC<{
    item: ProductItem
    index: number
    total: number
    sharedState: React.MutableRefObject<SharedState>

    onHover: (hovering: boolean) => void
    onBringToFront: (index: number) => void
    setIsDragging: (dragging: boolean) => void
    isDraggingRef: React.MutableRefObject<boolean>
    onCardClick?: (itemId: string, event?: MouseEvent) => void
    onFocusedItemChange?: (itemId: string | null) => void
    isFrontCard: boolean
    shouldShowTapHint: boolean
    shouldShowDragHint: boolean
    modelScale: number // Receive modelScale
}> = ({ item, index, total, sharedState, onHover, onBringToFront, setIsDragging, isDraggingRef, onCardClick, onFocusedItemChange, isFrontCard, shouldShowTapHint: externalShouldShowHint, shouldShowDragHint, modelScale }) => {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const navigate = useNavigate()
    const [hovered, setHover] = useState(false)
    const [isNearFront, setIsNearFront] = useState(false)
    const [showTapHint, setShowTapHint] = useState(false) // El ikonu görünürlüğü

    // Robust Click Logiği için Ref'ler
    const pointerDownPos = useRef({ x: 0, y: 0 })
    const pointerDownTime = useRef(0)
    // FIX: Re-render storm prevention — only set state when value actually changes
    const lastIsNearRef = useRef(false)

    // El ikonu görünüm timer'ı
    // SceneContent'ten externalShouldShowHint true gelirse: 4sn göster, sonra gizle
    useEffect(() => {
        if (!isFrontCard || !externalShouldShowHint) {
            setShowTapHint(false)
            return
        }

        // Göster
        setShowTapHint(true)
        // 4sn sonra gizle
        const hideTimer = setTimeout(() => setShowTapHint(false), 4000)

        return () => {
            clearTimeout(hideTimer)
        }
    }, [isFrontCard, externalShouldShowHint])

    const texture = useMemo(() => {
        if (item.categorySlug) return null
        const tex = new THREE.TextureLoader().load(item.image)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [item.image, item.categorySlug])



    useFrame(() => {
        if (!groupRef.current) return

        // 1. Entry Animation
        const now = Date.now()
        const elapsed = (now - sharedState.current.startTime) / 2000
        const entryProgress = Math.min(1, Math.max(0, elapsed))
        const easeOutCubic = 1 - Math.pow(1 - entryProgress, 3)

        // 2. Calculate Position
        const baseAngle = (index / total) * Math.PI * 2
        const currentAngle = baseAngle + sharedState.current.rotation

        const currentRadius = CONFIG.radius * easeOutCubic

        const x = Math.sin(currentAngle) * currentRadius
        const z = Math.cos(currentAngle) * currentRadius
        // const tiltRad = (CONFIG.tilt * Math.PI) / 180
        // REMOVED WOBBLE: Set fixed Y to 0.8.
        // AutoCenter centers the model at 0.
        // Ring is at -0.8.
        // We lift the whole group to +0.8 so the CENTER is at +0.8.
        // This ensures even tall models (bottom at -0.2) clear the ring (-0.8).
        const y = 0.8

        groupRef.current.position.set(x, y, z)
        // FIXED: Look at the center but maintain same Y height to avoid tilting down
        groupRef.current.lookAt(0, y, 0)

        // 3. Scale & Visibility
        const isNear = z > currentRadius * 0.3
        // FIX: Only trigger React re-render when value ACTUALLY changes
        if (isNear !== lastIsNearRef.current) {
            lastIsNearRef.current = isNear
            setIsNearFront(isNear)
        }

        const normalizedZ = currentRadius > 0 ? (z + currentRadius) / (currentRadius * 2) : 0.5
        const baseScale = CONFIG.backScale + (CONFIG.frontScale - CONFIG.backScale) * normalizedZ

        // 🎯 HOVER ZOOM: 3D Derinlik Efekti
        const hoverZOffset = hovered ? CONFIG.hoverZOffset : 0 // Kameraya doğru öne çıkar
        const hoverScaleBoost = hovered ? CONFIG.hoverScale : baseScale
        const finalScale = hoverScaleBoost * easeOutCubic

        // Position'a z-offset ekle (hover'da kart öne gelir)
        const targetZ = z + hoverZOffset
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.12)

        // 🎯 PULSE EFFECT DISABLED: Fixed scale to prevent "tick" jumping
        const pulseMultiplier = 1

        // OLD PULSE LOGIC REMOVED
        const pulsedScale = finalScale * pulseMultiplier

        // Scale uygulama
        if (meshRef.current && !item.categorySlug) {
            // 2D Plane Scale
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, pulsedScale, 0.15)
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, pulsedScale, 0.15)

            const mat = meshRef.current.material as THREE.MeshStandardMaterial
            if (mat) mat.opacity = easeOutCubic
        } else if (groupRef.current) {
            // 3D Icon Scale - Wrapper group'a uygula
            const iconGroup = groupRef.current.getObjectByName('icon-wrapper')
            if (iconGroup) {
                // FIX: Use modelScale prop instead of hardcoded 1.5
                const s = pulsedScale * modelScale
                iconGroup.scale.lerp(new THREE.Vector3(s, s, s), 0.15)
            }
        }
    })



    const triggerAction = useCallback((event?: MouseEvent) => {
        // KRİTİK: Sürükleme modunu ANINDA kapat (hem state hem ref)
        setIsDragging(false)
        isDraggingRef.current = false

        // Kartın en önde olup olmadığını kontrol et
        const baseAngle = (index / total) * Math.PI * 2
        const currentRot = sharedState.current.rotation
        const targetPos = -baseAngle
        const diff = targetPos - currentRot
        const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
        const isAlreadyAtFront = Math.abs(shortestDiff) < 0.15 // Yaklaşık önde

        if (isAlreadyAtFront) {
            // Zaten öndeyse -> alt kategoriye geç

            if (onCardClick) {
                onCardClick(item.id, event)
            }
        } else {
            // Önde değilse -> öne getir

            onBringToFront(index)

            // Parent'a bildir: Bu kart odaklandı
            if (onFocusedItemChange) {
                onFocusedItemChange(item.id)
            }
        }
    }, [index, total, sharedState, onBringToFront, setIsDragging, isDraggingRef, onCardClick, item.id, onFocusedItemChange])

    // Sadece onClick kullan - basit ve güvenilir
    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()

        // Drag/Click Ayrımı: Mouse'un basıldığı yer ile bırakıldığı yer arasındaki mesafeyi ölç
        const downX = pointerDownPos.current.x
        const downY = pointerDownPos.current.y
        const upX = e.nativeEvent.clientX
        const upY = e.nativeEvent.clientY

        const distance = Math.sqrt(Math.pow(upX - downX, 2) + Math.pow(upY - downY, 2))

        // Eğer 10px'ten fazla hareket edildiyse, bu bir "Tut Çevir" aksiyonudur, tıklama değildir.
        if (distance > 10) return

        triggerAction(e.nativeEvent)
    }, [triggerAction])

    // PointerDown/Up - sadece sürükleme tespiti için (tıklama değil)
    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
        pointerDownTime.current = Date.now()
    }, [])

    const handlePointerUp = useCallback((_e: ThreeEvent<PointerEvent>) => {
        // Artık tıklama burada işlenmiyor - onClick kullanılıyor
    }, [])

    const handleDoubleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        // Çift tık: Direkt kategori sayfasına git
        navigate(`/category/${item.id}`)
    }, [navigate, item.id])

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation() // Sadece BU kart hover alsın, arkadakiler almasın
        setHover(true)
        onHover(true)
        document.body.style.cursor = 'pointer'
    }

    const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHover(false)
        onHover(false)
        document.body.style.cursor = 'auto'
    }

    const showLabel = (hovered || isNearFront)

    return (
        <group ref={groupRef}>
            {/* REMOVED FLOAT: Stopped bobbing effect */}
            {/* Hitbox */}
            <mesh
                position={[0, 0, 0.1]}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onDoubleClick={handleDoubleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <boxGeometry args={[CONFIG.cardWidth, CONFIG.cardHeight, 1.5]} />
                <meshBasicMaterial visible={false} />
            </mesh>

            {/* GÖRÜNÜR KART */}
            {item.categorySlug ? (
                <group name="icon-wrapper" scale={modelScale} rotation={[0, Math.PI, 0]}>
                    {/* Model veya İkon */}
                    <Suspense fallback={null}>
                        <Category3DIcon
                            categorySlug={item.categorySlug || ''}
                            scale={1}
                        // modelPosition prop is removed to enable AutoCenter
                        />
                    </Suspense>
                </group>
            ) : (
                <mesh ref={meshRef}>
                    <planeGeometry args={[CONFIG.cardWidth, CONFIG.cardHeight]} />
                    <meshStandardMaterial
                        map={texture || undefined}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        emissive={hovered ? CONFIG.glowColor : '#000000'}
                        emissiveIntensity={hovered ? CONFIG.emissiveIntensity * 1.5 : 0}
                    />
                </mesh>
            )}

            {/* Drag Hint - Profesyonel */}
            {isFrontCard && shouldShowDragHint && (
                <Float
                    speed={0.5}
                    rotationIntensity={0}
                    floatIntensity={0.3}
                >
                    <Html
                        position={[0, 1.5, 0]}
                        center
                        distanceFactor={8}
                        occlude={false}
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-24">
                                {/* Sol ok */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md animate-pulse" />
                                    <div className="relative w-[72px] h-[72px] rounded-full border border-cyan-500/50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                        <div className="w-9 h-9 text-cyan-300 animate-pulse">
                                            <ChevronLeft strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>

                                {/* Sağ ok */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md animate-pulse" />
                                    <div className="relative w-[72px] h-[72px] rounded-full border border-cyan-500/50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                        <div className="w-9 h-9 text-cyan-300 animate-pulse">
                                            <ChevronRight strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
                                <span className="text-sm font-medium text-slate-200 uppercase tracking-wider">Tut Çevir</span>
                            </div>
                        </div>
                    </Html>
                </Float>
            )}

            {/* Tap Hint - Profesyonel */}
            {isFrontCard && !hovered && showTapHint && (
                <Html
                    position={[0, 0, 0.5]}
                    center
                    distanceFactor={5}
                    occlude={false}
                    style={{ pointerEvents: 'none', transition: 'opacity 0.3s', opacity: 1 }}
                >
                    <div className="relative">
                        {/* Pulsating ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />

                        {/* Static outer ring */}
                        <div className="relative w-16 h-16 rounded-full border border-cyan-500/60 backdrop-blur-sm bg-cyan-950/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <MousePointerClick className="w-8 h-8 text-cyan-300" strokeWidth={1.5} />
                        </div>
                    </div>
                </Html>
            )}

            {/* Label */}
            {showLabel && (
                <Html
                    position={[0, -CONFIG.cardHeight / 2 - 0.4, 0.5]}
                    center
                    distanceFactor={6}
                    occlude={false}
                    style={{ pointerEvents: 'none', transition: 'opacity 0.5s', opacity: 1 }}
                >
                    <div
                        className="text-xs md:text-sm font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg"
                        style={{
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${hovered ? CONFIG.glowColor : 'rgba(34,211,238,0.3)'}`,
                            color: hovered ? CONFIG.glowColor : '#fff',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }}
                    >
                        {item.title}
                    </div>
                </Html>
            )}
        </group>
    )
}

/**
 * Ana bileşen
 */
const OrbitalProductsShowcase: React.FC<OrbitalProductsShowcaseProps> = ({ items, onCardClick, externalPause = false, onFocusedItemChange, onFrontCardChange, modelScale = 1.5, containerHeight = 500, skipHints = false }) => {
    const [isPaused, setIsPaused] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragDelta, setDragDelta] = useState(0)
    // DISABLED: Hints removed per user request

    const [focusedItemId, setFocusedItemId] = useState<string | null>(null)


    // Resize Hack (Minimal) - Keep ensuring layout
    useEffect(() => {
        const timers = [50, 200, 500].map(delay =>
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, delay)
        )
        return () => timers.forEach(t => clearTimeout(t))
    }, [])

    // skipHints=true ise (alt kategori seviyesi) hint animasyonlarını atla
    const [hintStage, setHintStage] = useState<'idle' | 'tap' | 'drag' | 'cooldown' | 'finished'>(skipHints ? 'finished' : 'idle')
    const isDraggingRef = useRef(false)

    // Shared State with isReady flag
    const sharedState = useRef<SharedState>({
        rotation: 0,
        target: null,
        velocity: 0,
        pauseUntil: 0,
        startTime: 0, // 0 means not started
        isReady: false
    })

    // Handler for when Items are loaded
    const handleItemsReady = useCallback(() => {
        if (!sharedState.current.isReady) {
            sharedState.current.isReady = true
            sharedState.current.startTime = Date.now()
        }
    }, [])

    // Stage Cooldown
    useEffect(() => {
        if (hintStage !== 'cooldown') return
        const timer = setTimeout(() => setHintStage('finished'), 15000)
        return () => clearTimeout(timer)
    }, [hintStage])

    // Stage Tap -> Drag
    useEffect(() => {
        if (hintStage !== 'tap') return
        const timer = setTimeout(() => setHintStage('drag'), 4000)
        return () => clearTimeout(timer)
    }, [hintStage])

    // Stage Drag -> Cooldown
    useEffect(() => {
        if (hintStage !== 'drag') return
        const timer = setTimeout(() => setHintStage('cooldown'), 3000)
        return () => clearTimeout(timer)
    }, [hintStage])

    const shouldShowTapHint = hintStage === 'tap'
    const shouldShowDragHint = hintStage === 'drag'

    // DISABLED: Cycle Hint Logic
    /*
    useEffect(() => {
        if (focusedItemId) {
            setShowHint(false)
            return
        }
        let showTimer: NodeJS.Timeout
        let hideTimer: NodeJS.Timeout
        const cycleHint = () => {
            setShowHint(true)
            hideTimer = setTimeout(() => {
                setShowHint(false)
                showTimer = setTimeout(cycleHint, 30000)
            }, 5000)
        }
        cycleHint()
        return () => {
            clearTimeout(showTimer)
            clearTimeout(hideTimer)
        }
    }, [focusedItemId])
    */

    const handleSetIsDragging = useCallback((val: boolean) => {
        setIsDragging(val)
        isDraggingRef.current = val
    }, [])



    const handleFocusedItemChangeInternal = useCallback((itemId: string | null) => {
        setFocusedItemId(itemId)
        if (onFocusedItemChange) onFocusedItemChange(itemId)
    }, [onFocusedItemChange])

    // Re-implementing pointer logic provided by parent div
    const lastX = useRef(0)
    const handlePointerDownFull = (e: React.PointerEvent) => {
        if (focusedItemId) return
        isDraggingRef.current = true
        setIsDragging(true)
        lastX.current = e.clientX
        setDragDelta(0)
    }
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDraggingRef.current || focusedItemId) return
        const delta = e.clientX - lastX.current
        lastX.current = e.clientX
        setDragDelta(delta)
    }
    const handlePointerUp = () => {
        isDraggingRef.current = false
        setIsDragging(false)
        setTimeout(() => setDragDelta(0), 50)
    }

    return (
        <div
            className="w-full relative touch-none cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDownFull}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ backgroundColor: CONFIG.backgroundColor, height: containerHeight }}
        >
            <Canvas
                shadows
                frameloop="always"
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 1.5]}
                camera={{
                    position: [0, CONFIG.cameraHeight, CONFIG.cameraDistance],
                    fov: CONFIG.cameraFOV
                }}
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 12, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

                {/* Zemin ve Sparkles - HEMEN GÖRÜNÜR */}
                <Stage sharedState={sharedState} />

                {/* Ağır Modeller ve Environment - YÜKLENİNCE GELİR */}
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    <CarouselItems
                        items={items}
                        isPaused={isPaused || isDragging || externalPause}
                        onHover={setIsPaused}
                        isDraggingRef={isDraggingRef}
                        dragDelta={dragDelta}
                        onInteract={() => { }}
                        sharedState={sharedState}
                        setIsDragging={handleSetIsDragging}
                        onCardClick={onCardClick}
                        onFocusedItemChange={handleFocusedItemChangeInternal}
                        onFrontCardChange={onFrontCardChange}
                        shouldShowTapHint={shouldShowTapHint}
                        shouldShowDragHint={shouldShowDragHint}
                        hintStage={hintStage}
                        onStageChange={setHintStage}
                        modelScale={modelScale}
                        onReady={handleItemsReady}
                    />
                </Suspense>
            </Canvas>

            {/* UI Hints */}
            {/* UI Hints DISABLED */}
            {/* 
            {showHint && !focusedItemId && sharedState.current.isReady && (
                <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 hidden md:block animate-fade-in">
                    <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-700/50 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800/60 border border-slate-700/50">
                                <Move className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                                <span className="text-xs font-medium text-slate-200">Tut Çevir</span>
                            </div>
                            <span className="text-slate-600">•</span>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800/60 border border-slate-700/50">
                                <MousePointerClick className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                                <span className="text-xs font-medium text-slate-200">Seç</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            */}
            {/* focusedItemHint REMOVED: üstteki başlık zaten aynı bilgiyi veriyor */}

            {/* Sol-Sağ Gradient */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />
        </div>
    )
}

export default OrbitalProductsShowcase

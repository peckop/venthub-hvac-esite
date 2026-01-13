import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Environment, Float, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { ORBITAL_CAROUSEL_CONFIG as CONFIG } from '@/config/orbitalCarouselConfig'

interface ProductItem {
    id: string
    title: string
    image: string
}

interface OrbitalProductsShowcaseProps {
    items: ProductItem[]
    onCardClick?: (itemId: string) => void
}

// Global rotation state management via Refs (High Performance)
interface SharedState {
    rotation: number
    target: number | null
    velocity: number
    pauseUntil: number
    startTime: number
}

/**
 * Tek bir ürün kartı
 */
const OrbitalCard: React.FC<{
    item: ProductItem
    index: number
    total: number
    sharedState: React.MutableRefObject<SharedState>
    isPaused: boolean
    onHover: (hovering: boolean) => void
    onBringToFront: (index: number) => void
    setIsDragging: (dragging: boolean) => void
    isDraggingRef: React.MutableRefObject<boolean>
    onCardClick?: (itemId: string) => void
}> = ({ item, index, total, sharedState, isPaused, onHover, onBringToFront, setIsDragging, isDraggingRef, onCardClick }) => {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const navigate = useNavigate()
    const [hovered, setHover] = useState(false)
    const [isNearFront, setIsNearFront] = useState(false)

    // Robust Click Logiği için Ref'ler
    const pointerDownPos = useRef({ x: 0, y: 0 })
    const pointerDownTime = useRef(0)

    const texture = useMemo(() => {
        const tex = new THREE.TextureLoader().load(item.image)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [item.image])

    useFrame(() => {
        if (!groupRef.current || !meshRef.current) return

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
        const tiltRad = (CONFIG.tilt * Math.PI) / 180
        const y = Math.sin(currentAngle) * Math.sin(tiltRad) * currentRadius * 0.25

        groupRef.current.position.set(x, y, z)
        groupRef.current.lookAt(0, 0, 0)

        // 3. Scale & Visibility
        const isNear = z > currentRadius * 0.3
        setIsNearFront(isNear)

        const normalizedZ = currentRadius > 0 ? (z + currentRadius) / (currentRadius * 2) : 0.5
        const baseScale = CONFIG.backScale + (CONFIG.frontScale - CONFIG.backScale) * normalizedZ

        // 🎯 HOVER ZOOM: 3D Derinlik Efekti
        const hoverZOffset = hovered ? CONFIG.hoverZOffset : 0 // Kameraya doğru öne çıkar
        const hoverScaleBoost = hovered ? CONFIG.hoverScale : baseScale
        const finalScale = hoverScaleBoost * easeOutCubic

        // Position'a z-offset ekle (hover'da kart öne gelir)
        const targetZ = z + hoverZOffset
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.12)

        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, finalScale, 0.15)
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, finalScale, 0.15)

        const mat = meshRef.current.material as THREE.MeshStandardMaterial
        if (mat) mat.opacity = easeOutCubic
    })

    const triggerAction = useCallback(() => {
        // KRİTİK: Sürükleme modunu ANINDA kapat (hem state hem ref)
        setIsDragging(false)
        isDraggingRef.current = false

        onBringToFront(index)

        // Quick View Panel'i aç (eğer callback varsa)
        if (onCardClick) {
            onCardClick(item.id)
        }
    }, [index, onBringToFront, setIsDragging, isDraggingRef, onCardClick, item.id])

    // Standart onClick
    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        triggerAction()
    }, [triggerAction])

    // Manuel "Robust" Click Detection
    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        pointerDownPos.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
        pointerDownTime.current = Date.now()
    }, [])

    const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        const now = Date.now()
        const duration = now - pointerDownTime.current
        const dist = Math.sqrt(
            Math.pow(e.nativeEvent.clientX - pointerDownPos.current.x, 2) +
            Math.pow(e.nativeEvent.clientY - pointerDownPos.current.y, 2)
        )

        // Sürükleme yoksa tıkla!
        if (duration < 300 && dist < 15) {
            triggerAction()
        }
    }, [triggerAction])

    const handleDoubleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
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
            <Float
                speed={isPaused ? 0 : 1.5}
                rotationIntensity={0.03}
                floatIntensity={CONFIG.floatIntensity}
            >
                {/* GÖRÜNÜR KART VE HİTBOX - Aynı yöne bakıyorlar */}
                {/* Hitbox: Kalın kutu, kartla aynı pozisyonda */}
                <mesh
                    position={[0, 0, 0.1]}
                    onClick={handleClick}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onDoubleClick={handleDoubleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    {/* Kalın kutu: Açılı kartlarda bile tıklanabilir */}
                    <boxGeometry args={[CONFIG.cardWidth, CONFIG.cardHeight, 1.5]} />
                    <meshBasicMaterial visible={false} />
                </mesh>

                {/* GÖRÜNÜR KART */}
                <mesh ref={meshRef}>
                    <planeGeometry args={[CONFIG.cardWidth, CONFIG.cardHeight]} />
                    <meshStandardMaterial
                        map={texture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        emissive={hovered ? CONFIG.glowColor : '#000000'}
                        emissiveIntensity={hovered ? CONFIG.emissiveIntensity * 1.5 : 0}
                    />
                </mesh>
            </Float>

            {showLabel && (
                <Html
                    position={[0, -CONFIG.cardHeight / 2 - 0.4, 0.5]}
                    center
                    distanceFactor={6}
                    occlude={false}
                    style={{
                        pointerEvents: 'none',
                        transition: 'opacity 0.5s',
                        opacity: 1
                    }}
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
 * Sahne Mantığı
 */
const SceneContent: React.FC<{
    items: ProductItem[]
    isPaused: boolean
    onHover: (h: boolean) => void
    dragDelta: number
    onInteract: () => void
    sharedState: React.MutableRefObject<SharedState>
    isDraggingRef: React.MutableRefObject<boolean>
    setIsDragging: (val: boolean) => void
    onCardClick?: (itemId: string) => void
}> = ({ items, isPaused, onHover, dragDelta, onInteract, sharedState, isDraggingRef, setIsDragging, onCardClick }) => {
    const { camera } = useThree()

    // Kartı öne getirme
    const handleBringToFront = useCallback((index: number) => {
        onInteract()

        const total = items.length
        const baseAngle = (index / total) * Math.PI * 2
        const currentRot = sharedState.current.rotation

        const targetPos = -baseAngle
        const diff = targetPos - currentRot
        const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff))

        if (Math.abs(shortestDiff) < 0.01 && sharedState.current.target === null) {
            // Zaten öndeyse, kart detayını açma veya pasif durma aksiyonu buraya gelebilir
            return
        }

        // ÖNCELİKLE: Dragging'i zorla kapat (güvenlik)
        isDraggingRef.current = false

        sharedState.current.target = currentRot + shortestDiff
        sharedState.current.velocity = 0
        sharedState.current.pauseUntil = Date.now() + 4000

        console.warn("Bringing to front", index, "target:", sharedState.current.target)
    }, [items.length, onInteract, sharedState, isDraggingRef])

    useFrame((state, delta) => {
        const now = Date.now()

        const elapsed = (now - sharedState.current.startTime) / 2000
        const entryProgress = Math.min(1, Math.max(0, elapsed))

        const isPausedByClick = now < sharedState.current.pauseUntil
        const friction = 0.95

        // TARGET MODU AKTİF İSE: Her şeyi durdur, sadece target'a git
        if (sharedState.current.target !== null) {
            // Güvenlik: isDragging'i zorla kapat
            if (isDraggingRef.current) {
                isDraggingRef.current = false
            }

            const diff = sharedState.current.target - sharedState.current.rotation
            if (Math.abs(diff) < 0.002) {
                sharedState.current.rotation = sharedState.current.target
                sharedState.current.target = null
                sharedState.current.velocity = 0
            } else {
                // Daha hızlı animasyon (0.15 -> 0.2)
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
            sharedState.current.rotation -= delta * CONFIG.autoRotateSpeed
        }
        // SNAP-TO-CENTER (Mıknatıslanma)
        // Eğer hiçbir hareket yoksa ve bir yere gitmiyorsak, en yakın kartı ortaya çek
        else if (!isDraggingRef.current && sharedState.current.target === null && Math.abs(sharedState.current.velocity) < 0.01) {
            const total = items.length
            const currentRot = sharedState.current.rotation
            const step = (Math.PI * 2) / total

            // En yakın kartın hedefini bul
            const closestTarget = Math.round(-currentRot / step) * step
            const diff = -closestTarget - currentRot
            const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff))

            // Eğer çok küçük bir fark varsa direkt eşitle (titremeyi önle)
            if (Math.abs(shortestDiff) < 0.001) {
                sharedState.current.rotation = -closestTarget
            } else {
                // Yavaşça merkeze çek (smooth snap)
                sharedState.current.rotation += shortestDiff * 0.1
            }
        }

        camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * CONFIG.cameraBreathAmplitude
        camera.position.y = CONFIG.cameraHeight + Math.sin(state.clock.elapsedTime * 0.08) * 0.02
    })

    const currentRadius = CONFIG.radius * (1 - Math.pow(1 - Math.min(1, Math.max(0, (Date.now() - sharedState.current.startTime) / 2000)), 3))

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
                <ringGeometry args={[Math.max(0.1, currentRadius - 0.08), currentRadius + 0.08, 64]} />
                <meshBasicMaterial color="#0891b2" transparent opacity={0.1 * (currentRadius / CONFIG.radius)} />
            </mesh>

            {items.map((item, i) => (
                <OrbitalCard
                    key={item.id}
                    item={item}
                    index={i}
                    total={items.length}
                    sharedState={sharedState}
                    isPaused={isPaused}
                    onHover={onHover}
                    onBringToFront={handleBringToFront}
                    setIsDragging={setIsDragging}
                    isDraggingRef={isDraggingRef}
                    onCardClick={onCardClick}
                />
            ))}

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
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
 * Ana bileşen
 */
const OrbitalProductsShowcase: React.FC<OrbitalProductsShowcaseProps> = ({ items, onCardClick }) => {
    const [isPaused, setIsPaused] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragDelta, setDragDelta] = useState(0)
    const [showHint, setShowHint] = useState(true)
    const lastX = useRef(0)

    // Drag Conflict Çözümü: Ref ile anlık takip
    const isDraggingRef = useRef(false)

    const sharedState = useRef<SharedState>({
        rotation: 0,
        target: null,
        velocity: 0,
        pauseUntil: 0,
        startTime: 0
    })

    useEffect(() => {
        sharedState.current.startTime = Date.now()
        sharedState.current.rotation = 0
        sharedState.current.target = null

        setShowHint(true)
        const timer = setTimeout(() => setShowHint(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    const hideHint = useCallback(() => setShowHint(false), [])

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true)
        isDraggingRef.current = true
        lastX.current = e.clientX
        hideHint()
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDraggingRef.current) {
            setDragDelta(e.clientX - lastX.current)
            lastX.current = e.clientX
        }
    }

    const handlePointerUp = () => {
        setIsDragging(false)
        isDraggingRef.current = false
        setDragDelta(0)
    }

    // GERÇEK fonksiyon - Child'lara geçilecek
    const handleSetIsDragging = useCallback((val: boolean) => {
        setIsDragging(val)
        isDraggingRef.current = val
        if (!val) {
            setDragDelta(0) // Drag bitince delta'yı da sıfırla
        }
    }, [])

    return (
        <div
            className="w-full h-[500px] md:h-[550px] relative select-none touch-none"
            style={{ backgroundColor: CONFIG.backgroundColor }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <Canvas
                shadows
                gl={{ antialias: true }}
                dpr={[1, 1.5]}
                camera={{
                    position: [0, CONFIG.cameraHeight, CONFIG.cameraDistance],
                    fov: CONFIG.cameraFOV
                }}
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 12, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
                <Environment preset="city" />

                <SceneContent
                    items={items}
                    isPaused={isPaused || isDragging}
                    onHover={setIsPaused}
                    isDraggingRef={isDraggingRef}
                    dragDelta={dragDelta}
                    onInteract={hideHint}
                    sharedState={sharedState}
                    setIsDragging={handleSetIsDragging}
                    onCardClick={onCardClick}
                />
            </Canvas>
            {/* Hint overlay */}
            {showHint && (
                <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 hidden md:block">
                    <div className="bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-cyan-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
                        <div className="flex items-center gap-4 text-white text-sm">
                            <span className="flex items-center gap-2"><span className="text-cyan-400">↔</span> Sürükle Çevir</span>
                            <span className="text-cyan-500/50">•</span>
                            <span className="flex items-center gap-2"><span className="text-cyan-400">👆</span> Tıkla Seç</span>
                            <span className="text-cyan-500/50">•</span>
                            <span className="flex items-center gap-2"><span className="text-cyan-400">🖱️</span> Çift Tıkla İncele</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />
        </div>
    )
}

export default OrbitalProductsShowcase

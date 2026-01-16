import React, { useRef, useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Environment, Float, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
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
    onCardClick?: (itemId: string, event?: MouseEvent) => void
    onFocusedItemChange?: (itemId: string | null) => void
    isFrontCard?: boolean
    shouldShowTapHint?: boolean // SceneContent'ten gelen el ikonu gösterme kararı
}> = ({ item, index, total, sharedState, isPaused, onHover, onBringToFront, setIsDragging, isDraggingRef, onCardClick, onFocusedItemChange, isFrontCard, shouldShowTapHint: externalShouldShowHint }) => {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const navigate = useNavigate()
    const [hovered, setHover] = useState(false)
    const [isNearFront, setIsNearFront] = useState(false)
    const [showTapHint, setShowTapHint] = useState(false) // El ikonu görünürlüğü

    // Robust Click Logiği için Ref'ler
    const pointerDownPos = useRef({ x: 0, y: 0 })
    const pointerDownTime = useRef(0)

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

        // 🎯 PULSE EFFECT: Focus olan kart hafifçe büyüyüp küçülür ("nefes alır")
        // sharedState.target null ise ve isFrontCard ise = kart sabitlenmiş demek
        let pulseMultiplier = 1
        if (isFrontCard && sharedState.current.target === null) {
            // Sin dalgası ile yumuşak pulse: 0.97 - 1.03 arası
            const pulseSpeed = 2 // Hız (saniyede kaç döngü)
            pulseMultiplier = 1 + Math.sin(now * 0.003 * pulseSpeed) * 0.03
        }
        const pulsedScale = finalScale * pulseMultiplier

        // Scale uygulama
        if (meshRef.current && !item.categorySlug) {
            // 2D Plane Scale
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, pulsedScale, 0.15)
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, pulsedScale, 0.15)

            const mat = meshRef.current.material as THREE.MeshStandardMaterial
            if (mat) mat.opacity = easeOutCubic
        } else {
            // 3D Icon Scale - Wrapper group'a uygula
            const iconGroup = groupRef.current.getObjectByName('icon-wrapper')
            if (iconGroup) {
                const s = pulsedScale * 1.5
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

                {/* GÖRÜNÜR KART (3D ICON VEYA PLANE) */}
                {item.categorySlug ? (
                    <group name="icon-wrapper" scale={0.8} rotation={[0, Math.PI, 0]}>
                        {/* Rotation PI çünkü kartlar merkeze bakıyor, ikonlar da bize baksın */}
                        <Category3DIcon categorySlug={item.categorySlug} scale={1} />
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
            </Float>

            {/* El ikonu overlay - sadece en öndeki kartta */}
            {isFrontCard && !hovered && showTapHint && (
                <Html
                    position={[0, 0, 0.5]}
                    center
                    distanceFactor={5}
                    occlude={false}
                    style={{
                        pointerEvents: 'none',
                        transition: 'opacity 0.5s',
                        opacity: 1
                    }}
                >
                    <div className="text-5xl animate-bounce" style={{ animationDuration: '1s' }}>
                        👆
                    </div>
                </Html>
            )}

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
    onCardClick?: (itemId: string, event?: MouseEvent) => void
    onFocusedItemChange?: (itemId: string | null) => void
    onFrontCardChange?: (itemId: string) => void // Dönerken önde olan kart
}> = ({ items, isPaused, onHover, dragDelta, onInteract, sharedState, isDraggingRef, setIsDragging, onCardClick, onFocusedItemChange, onFrontCardChange }) => {
    const { camera } = useThree()
    const lastFrontCardRef = useRef<string | null>(null) // Debounce için
    const [frontCardId, setFrontCardId] = useState<string | null>(null) // En öndeki kart ID
    const frontCardChangeCountRef = useRef(0) // Kaç kez önde kart değişti
    const [shouldShowTapHint, setShouldShowTapHint] = useState(false) // Bu kartta el ikonu gösterilsin mi
    const hasBeenFocusedRef = useRef(false) // Hiç focus oldu mu?

    // focusedItemId null olduğunda (carousel tekrar dönüyor) sayıcıyı sıfırla
    // onFocusedItemChange null ile çağrıldığında burada da sıfırlama yapmalıyız
    // Bu bir "side effect" olarak items değiştiğinde de sıfırlanır
    useEffect(() => {
        // items değiştiğinde her şeyi sıfırla
        frontCardChangeCountRef.current = 0
        setShouldShowTapHint(false)
        lastFrontCardRef.current = null
        hasBeenFocusedRef.current = false
    }, [items.length])

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

        // Carousel tekrar dönmeye başladığında sayıcıyı sıfırla
        // Koşullar: target null + pauseUntil doldu + isPaused false (mouse yok) + daha önce focus olmuştu
        const currentTime = Date.now()
        const isCarouselRotating = sharedState.current.target === null && currentTime > sharedState.current.pauseUntil && !isPaused

        if (isCarouselRotating && hasBeenFocusedRef.current) {
            // Carousel gerçekten döndü, tüm sistemi sıfırla
            frontCardChangeCountRef.current = 0
            hasBeenFocusedRef.current = false
            setShouldShowTapHint(false)
            // Parent'a bildir: focusedItemId artık null (sayfa ilk yüklenmiş gibi)
            if (onFocusedItemChange) {
                onFocusedItemChange(null)
            }
        } else if (sharedState.current.target !== null) {
            // Bir kart focus'ta, işaretle
            hasBeenFocusedRef.current = true
        }

        // Dönerken önde olan kartı tespit et ve parent'a bildir
        if (items.length > 0) {
            const total = items.length
            const step = (Math.PI * 2) / total
            // En öndeki kart index'ini hesapla (rotation'a göre)
            let frontIndex = Math.round(-sharedState.current.rotation / step) % total
            if (frontIndex < 0) frontIndex += total
            const frontItem = items[frontIndex]
            if (frontItem && frontItem.id !== lastFrontCardRef.current) {
                lastFrontCardRef.current = frontItem.id
                setFrontCardId(frontItem.id) // Local state güncelle

                // Sayacı artır
                frontCardChangeCountRef.current += 1
                const count = frontCardChangeCountRef.current

                // El ikonu gösterme mantığı:
                // 1. kart: HAYIR (ilk kart, bilgi balonu var)
                // 2. kart: EVET
                // 3. kart: HAYIR
                // 4. kart: HAYIR
                // 5. kart: EVET (2 + 3 = 5)
                // 6. kart: HAYIR
                // 7. kart: HAYIR
                // 8. kart: EVET (5 + 3 = 8)
                // Pattern: count === 2 || (count > 2 && (count - 2) % 3 === 0)
                const showHint = count === 2 || (count > 2 && (count - 2) % 3 === 0)
                setShouldShowTapHint(showHint)

                if (onFrontCardChange && sharedState.current.target === null) {
                    onFrontCardChange(frontItem.id) // Parent'a bildir
                }
            }
        }
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
                    onFocusedItemChange={onFocusedItemChange}
                    isFrontCard={item.id === frontCardId}
                    shouldShowTapHint={item.id === frontCardId && shouldShowTapHint}
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
const OrbitalProductsShowcase: React.FC<OrbitalProductsShowcaseProps> = ({ items, onCardClick, externalPause = false, onFocusedItemChange, onFrontCardChange }) => {
    const [isPaused, setIsPaused] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragDelta, setDragDelta] = useState(0)
    const [showHint, setShowHint] = useState(true)
    const [focusedItemId, setFocusedItemId] = useState<string | null>(null) // Odaklanmış kart
    const [showFocusedHint, setShowFocusedHint] = useState(false) // Focus hint periyodik gösterimi
    const lastX = useRef(0)

    // Drag Conflict Çözümü: Ref ile anlık takip
    const isDraggingRef = useRef(false)

    const sharedState = useRef<SharedState>({
        rotation: 0,
        target: null,
        velocity: 0,
        pauseUntil: 0,
        startTime: Date.now() // FIX: İlk frame'den itibaren doğru değer
    })

    // İlk mount'ta ve carousel dönmeye başladığında hint timer'ı başlat
    // focusedItemId null olduğunda (carousel tekrar dönüyor) döngüyü yeniden başlat
    useEffect(() => {
        // Eğer bir kart focus'taysa, ilk hint'i gösterme
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
                // 30sn sonra tekrar göster
                showTimer = setTimeout(cycleHint, 30000)
            }, 5000)
        }

        // İlk gösterim
        cycleHint()

        return () => {
            clearTimeout(showTimer)
            clearTimeout(hideTimer)
        }
    }, [focusedItemId])

    // items değiştiğinde animasyonu yeniden başlat (level geçişleri için)
    useEffect(() => {
        sharedState.current.startTime = Date.now()
        sharedState.current.rotation = 0
        sharedState.current.target = null
    }, [items.length])

    // Focus hint periyodik timer: focusedItemId set olduğunda 5sn görünür, 30sn gizli, tekrar
    useEffect(() => {
        if (!focusedItemId) {
            setShowFocusedHint(false)
            return
        }

        let showTimer: NodeJS.Timeout
        let hideTimer: NodeJS.Timeout

        const cycleFocusedHint = () => {
            setShowFocusedHint(true)
            hideTimer = setTimeout(() => {
                setShowFocusedHint(false)
                showTimer = setTimeout(cycleFocusedHint, 30000)
            }, 5000)
        }

        cycleFocusedHint()

        return () => {
            clearTimeout(showTimer)
            clearTimeout(hideTimer)
        }
    }, [focusedItemId])

    const hideHint = useCallback(() => setShowHint(false), [])

    // Internal wrapper: Local state'i güncelle + parent'a bildir
    const handleFocusedItemChangeInternal = useCallback((itemId: string | null) => {
        setFocusedItemId(itemId)
        setShowHint(false) // İlk hint'i kapat
        if (onFocusedItemChange) {
            onFocusedItemChange(itemId)
        }
    }, [onFocusedItemChange])

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
                {/* Environment HDRI yüklemesi async - Suspense ile sararak carousel unmount'ını engelliyoruz */}
                <Suspense fallback={null}>
                    <Environment preset="city" />
                </Suspense>

                <SceneContent
                    items={items}
                    isPaused={isPaused || isDragging || externalPause}
                    onHover={setIsPaused}
                    isDraggingRef={isDraggingRef}
                    dragDelta={dragDelta}
                    onInteract={hideHint}
                    sharedState={sharedState}
                    setIsDragging={handleSetIsDragging}
                    onCardClick={onCardClick}
                    onFocusedItemChange={handleFocusedItemChangeInternal}
                    onFrontCardChange={onFrontCardChange}
                />
            </Canvas>
            {/* Initial Hint overlay */}
            {showHint && !focusedItemId && (
                <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 hidden md:block">
                    <div className="bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-cyan-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
                        <div className="flex items-center gap-4 text-white text-sm">
                            <span className="flex items-center gap-2"><span className="text-cyan-400">↔</span> Sürükle Çevir</span>
                            <span className="text-cyan-500/50">•</span>
                            <span className="flex items-center gap-2"><span className="text-cyan-400">👆</span> Tıkla Seç</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Context-aware Hint: Kart öne geldiğinde - periyodik gösterim */}
            {focusedItemId && showFocusedHint && (
                <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                    <div className="bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-cyan-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
                        <div className="flex items-center gap-4 text-white text-sm">
                            <span className="flex items-center gap-2"><span className="text-cyan-400">👆</span> Tek Tık: Alt Kategoriler</span>
                            <span className="text-cyan-500/50">•</span>
                            <span className="flex items-center gap-2"><span className="text-cyan-400">🖱️</span> Çift Tık: Ürün Sayfası</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Sol-Sağ Gradient ve Sürükle İşareti */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />

            {/* Sürükleme işareti - aralıklı beliren sol-sağ oklar */}
            {showHint && !focusedItemId && (
                <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-cyan-400/80 text-4xl animate-pulse hidden md:block">
                        ←
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-cyan-400/80 text-4xl animate-pulse hidden md:block">
                        →
                    </div>
                </>
            )}
        </div>
    )
}

export default OrbitalProductsShowcase

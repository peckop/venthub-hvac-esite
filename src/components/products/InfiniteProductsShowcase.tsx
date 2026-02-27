import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Environment, Float, Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'

interface ProductItem {
    id: string
    title: string
    image: string
}

interface InfiniteProductsShowcaseProps {
    items: ProductItem[]
}

/**
 * Individual Product Card with Image and Title
 * - Hover zoom effect
 * - Click navigation to category
 */
const ProductCard: React.FC<{
    item: ProductItem
    index: number
    total: number
    gap: number
    scrollOffset: React.MutableRefObject<number>
    isPaused: boolean
    onHover: (hovering: boolean) => void
}> = ({ item, index, total, gap, scrollOffset, isPaused, onHover }) => {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const router = useRouter()
    const [hovered, setHover] = useState(false)

    // Load texture
    const texture = React.useMemo(() => {
        const tex = new THREE.TextureLoader().load(item.image)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [item.image])

    useFrame(() => {
        if (!groupRef.current) return

        const offset = scrollOffset.current
        const sphereWidth = total * gap

        // Current position in the loop
        let xPos = (index * gap) - (offset * sphereWidth)

        // Wrap around logic for infinite scroll
        while (xPos < -sphereWidth / 2) xPos += sphereWidth
        while (xPos > sphereWidth / 2) xPos -= sphereWidth

        groupRef.current.position.x = xPos

        // Subtle rotation facing center
        groupRef.current.rotation.y = -xPos * 0.06

        // Hover zoom effect (scale up to 115%)
        if (meshRef.current) {
            const targetScale = hovered ? 1.15 : 1.0
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.12)
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.12)
        }
    })

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        router.push(`/category/${item.id}`)
    }

    const handlePointerOver = () => {
        setHover(true)
        onHover(true)
        document.body.style.cursor = 'pointer'
    }

    const handlePointerOut = () => {
        setHover(false)
        onHover(false)
        document.body.style.cursor = 'auto'
    }

    return (
        <group ref={groupRef}>
            <Float speed={isPaused ? 0 : 2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.03, 0.03]}>
                {/* Product Image Plane */}
                <mesh
                    ref={meshRef}
                    onClick={handleClick}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                >
                    <planeGeometry args={[3, 4]} />
                    <meshStandardMaterial
                        map={texture}
                        transparent
                        side={THREE.DoubleSide}
                        emissive={hovered ? '#22d3ee' : '#000000'}
                        emissiveIntensity={hovered ? 0.3 : 0}
                    />
                </mesh>

                {/* Hover glow ring */}
                {hovered && (
                    <mesh position={[0, 0, -0.1]}>
                        <ringGeometry args={[2.2, 2.4, 32]} />
                        <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} />
                    </mesh>
                )}

                {/* Title Label - 3D Text positioned below card */}
                <Text
                    position={[0, -2.5, 0]}
                    fontSize={0.28}
                    color={hovered ? '#22d3ee' : '#ffffff'}
                    anchorX="center"
                    anchorY="top"
                    outlineWidth={0.025}
                    outlineColor={hovered ? '#0e7490' : '#0891b2'}
                >
                    {item.title}
                </Text>
            </Float>
        </group>
    )
}

/**
 * Scene Content with Auto-Scroll + Hover Pause
 */
const SceneContent: React.FC<{ items: ProductItem[]; isPaused: boolean; onHover: (h: boolean) => void }> = ({ items, isPaused, onHover }) => {
    const gap = 4.5
    const scrollOffset = useRef(0)
    const { camera } = useThree()

    // Auto-scroll - pauses on hover
    useFrame((state, delta) => {
        if (!isPaused) {
            // Increment scroll offset for continuous flow
            scrollOffset.current += delta * 0.025 // Slow scrolling

            // Keep offset in 0-1 range (wraps around)
            if (scrollOffset.current > 1) scrollOffset.current -= 1
        }

        // Subtle camera breathing for life
        camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.25
        camera.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
    })

    return (
        <group position={[0, 0, 0]}>
            {/* Product Cards */}
            {items.map((item, i) => (
                <ProductCard
                    key={item.id}
                    item={item}
                    index={i}
                    total={items.length}
                    gap={gap}
                    scrollOffset={scrollOffset}
                    isPaused={isPaused}
                    onHover={onHover}
                />
            ))}

            {/* Dark Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
                <planeGeometry args={[60, 60]} />
                <meshStandardMaterial color="#030712" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Atmospheric Particles */}
            <Sparkles count={80} scale={15} size={3} speed={isPaused ? 0.1 : 0.3} opacity={0.4} color="#22d3ee" />
        </group>
    )
}

/**
 * Main 3D Showcase Component
 * - Auto-scroll with hover pause
 * - Hover zoom on cards
 * - Click navigation to categories
 */
const InfiniteProductsShowcase: React.FC<InfiniteProductsShowcaseProps> = ({ items }) => {
    const [isPaused, setIsPaused] = useState(false)

    return (
        <div className="w-full h-[550px] relative">
            <Canvas
                shadows
                gl={{ antialias: true }}
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 10], fov: 40 }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
                <Environment preset="city" />

                <SceneContent items={items} isPaused={isPaused} onHover={setIsPaused} />
            </Canvas>

            {/* Overlay Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-cyan-500/60 text-xs font-mono tracking-widest uppercase">
                {isPaused ? '⏸ Duraklatıldı • Tıkla ve Keşfet' : 'Otomatik Akış • Üzerine Gel Duraksatmak İçin'}
            </div>

            {/* Left/Right gradient fade for infinite feel */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none" />
        </div>
    )
}

export default InfiniteProductsShowcase






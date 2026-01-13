import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Image, Float, shaderMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

/**
 * Holographic Shader Material
 * Adds a premium "technological sheen" and scanline effect over the image
 */
const HolographicMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#22d3ee'),
        uTexture: new THREE.Texture(),
        uOpacity: 1.0
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        
        // Dynamic scanline
        float scanline = sin(vUv.y * 200.0 - uTime * 2.0) * 0.05;
        
        // Holographic sheen (diagonal movement)
        float sheen = max(0.0, sin(vUv.x * 5.0 + vUv.y * 5.0 + uTime) * 0.2);
        
        // Edge glow
        float edge = 1.0 - smoothstep(0.4, 0.5, length(vUv - 0.5));
        
        // Final composition: Original Image + Tech Overlay
        vec3 finalColor = texColor.rgb + (uColor * (sheen + scanline));
        
        // Boost vibrancy for the "Cinematic" look
        finalColor = mix(finalColor, finalColor * 1.2, 0.5);

        gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
    }
    `
)

extend({ HolographicMaterial })

// ThreeElements is used in the module declaration below
import type { ThreeElements as _ThreeElements } from '@react-three/fiber'

declare module '@react-three/fiber' {
    interface ThreeElements {
        holographicMaterial: _ThreeElements['shaderMaterial'] & {
            uTime?: number
            uColor?: THREE.Color
            uTexture?: THREE.Texture
            uOpacity?: number
        }
    }
}

/**
 * Cinematic 3D Card
 * Renders the image with depth, floating animation, and holographic overlay
 */
const CinematicCard: React.FC<{ image: string }> = ({ image }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
        }
        // Subtle tilt based on mouse position (Parallax)
        if (meshRef.current) {
            const { x, y } = state.mouse
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.2, 0.1)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.2, 0.1)
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
            <group>
                {/* Main Card with Image */}
                <Image
                    ref={meshRef}
                    url={image}
                    transparent
                    scale={[4, 3]}
                    toneMapped={false}
                />

                {/* Back Glow / Halo */}
                <mesh position={[0, 0, -0.1]} scale={[4.5, 3.5, 1]}>
                    <planeGeometry />
                    <meshBasicMaterial color="#0891b2" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>
        </Float>
    )
}

interface BlueprintCanvasProps {
    type?: 'fan' | 'unit' | 'box'
    image?: string
    className?: string
}

const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ image, className }) => {
    // Fallback if no image is provided
    if (!image) return null;

    return (
        <ErrorBoundaryFallback>
            <div className={`w-full h-full min-h-[200px] ${className}`}>
                <Canvas shadows={false} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />

                    {/* Atmospheric Lighting */}
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="#22d3ee" />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

                    <Suspense fallback={null}>
                        <CinematicCard image={image} />

                        {/* Environmental Particles for "Space" feel */}
                        <Sparkles count={30} scale={4} size={2} speed={0.4} opacity={0.5} color="#22d3ee" />
                    </Suspense>
                </Canvas>
            </div>
        </ErrorBoundaryFallback>
    )
}

/** 
 * Local error boundary to prevent the whole page from crashing if WebGL fails
 */
class ErrorBoundaryFallback extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="flex items-center justify-center h-full text-cyan-500/50 text-xs">3D Render Error</div>;
        return this.props.children;
    }
}

export default BlueprintCanvas

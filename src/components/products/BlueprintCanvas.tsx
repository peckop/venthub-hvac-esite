'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { Float, shaderMaterial } from '@react-three/drei'

// Custom Holographic Shader Material
const HolographicMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: null,
        uOpacity: 1.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uOpacity;

    void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        
        // Holographic scanline effect
        float scanline = sin(vUv.y * 100.0 + uTime * 5.0) * 0.1;
        float glitchness = sin(uTime * 10.0) * 0.05;
        
        // Blueprint blue color
        vec3 blueTint = vec3(0.0, 0.5, 1.0);
        
        // Edge highlighting (fresnel-like)
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        
        vec3 finalColor = texColor.rgb + blueTint * (fresnel + scanline);
        
        // Boost vibrancy for the "Cinematic" look
        finalColor = mix(finalColor, finalColor * 1.2, 0.5);

        gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
    }
    `
)

extend({ HolographicMaterial })

declare module '@react-three/fiber' {
    interface ThreeElements {
        holographicMaterial: {
            uTexture: THREE.Texture;
            uOpacity?: number;
            uTime?: number;
            transparent?: boolean;
        }
    }
}

/**
 * Cinematic 3D Card
 * Renders the image with depth, floating animation, and holographic overlay
 */
const CinematicCard: React.FC<{ image: string }> = ({ image }) => {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        // Subtle tilt based on mouse position (Parallax)
        if (meshRef.current) {
            const { x, y } = state.mouse
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y * 0.2, 0.1)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x * 0.2, 0.1)

            // Update shader time
            const material = meshRef.current.material as THREE.ShaderMaterial;
            if (material && material.uniforms && material.uniforms.uTime) {
                material.uniforms.uTime.value = state.clock.getElapsedTime();
            }
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
            <group>
                {/* Main Card with Image & Holographic Overlay */}
                <mesh ref={meshRef}>
                    <planeGeometry args={[4, 3]} />
                    <holographicMaterial 
                        transparent 
                        uTexture={new THREE.TextureLoader().load(image)} 
                        uOpacity={0.9}
                    />
                </mesh>

                {/* Ambient Glow behind the card */}
                <mesh position={[0, 0, -0.1]}>
                    <planeGeometry args={[4.2, 3.2]} />
                    <meshBasicMaterial color="#0066ff" transparent opacity={0.1} />
                </mesh>
            </group>
        </Float>
    )
}

interface BlueprintCanvasProps {
    image: string
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ image }) => {
    return (
        <div className="w-full h-full min-h-[400px] relative group overflow-hidden rounded-3xl bg-[#05070A] border border-white/5 shadow-2xl">
            {/* Dark Tech Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} 
            />
            
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <CinematicCard image={image} />
            </Canvas>

            {/* Corner Tech Decor */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest leading-none">Scanning Blueprint...</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <div className="w-24 h-[1px] bg-white/10" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Object Reference: P-501</span>
                </div>
                <div className="text-right">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Cinematic Mode</span>
                    <div className="mt-1 flex gap-1 justify-end">
                        <div className="w-3 h-[2px] bg-cyan-500" />
                        <div className="w-1 h-[2px] bg-white/20" />
                        <div className="w-1 h-[2px] bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Subtle Overlay Vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
        </div>
    )
}

export default BlueprintCanvas;

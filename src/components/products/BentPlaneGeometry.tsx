import { useCursor, useScroll } from '@react-three/drei'
import { shaderMaterial } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { extend } from '@react-three/fiber'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Mesh, ShaderMaterial } from 'three'
import { Color, DoubleSide, MathUtils, PlaneGeometry, SRGBColorSpace, Texture, TextureLoader } from 'three'

import { Routes } from '../../utils/routes'

/**
 * Bent Plane Shader Material
 * Curves the geometry based on the X position to create a cylindrical/carousel effect.
 */
const BentPlaneMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: new Texture(),
        uScrollOffset: 0,
        uHover: 0,
        uColor: new Color('#22d3ee') // Cyan glow
    },
    // Vertex Shader
    `
      varying vec2 vUv;
      varying float vElevation;
      uniform float uTime;
      uniform float uScrollOffset;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Bending logic: Curve Z based on X distance from center
        float curveStrength = 0.25;
        float distanceFromCenter = abs(pos.x);

        // Apply curvature
        pos.z -= pow(distanceFromCenter, 2.0) * curveStrength;

        // Pass elevation for fragment shading
        vElevation = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    // Fragment Shader
    `
      uniform sampler2D uTexture;
      uniform float uHover;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vec4 texColor = texture2D(uTexture, vUv);

        // Holographic scanline effect
        float scanline = sin(vUv.y * 100.0) * 0.05;

        // Edge darkening based on curvature (elevation)
        float shade = smoothstep(-2.0, 0.0, vElevation);

        // Hover glow
        vec3 glow = uColor * uHover * 0.3;

        // Final Mix
        vec3 finalColor = texColor.rgb * shade + glow + scanline;

        gl_FragColor = vec4(finalColor, texColor.a);
      }
    `
)

extend({ BentPlaneMaterial })

// ThreeElements is used in the module declaration below
import type { ThreeElements as _ThreeElements } from '@react-three/fiber'

declare module '@react-three/fiber' {
    interface ThreeElements {
        bentPlaneMaterial: _ThreeElements['shaderMaterial'] & {
            uTexture?: Texture
            uHover?: number
            uColor?: Color
        }
    }
}

interface BentPlaneGeometryProps {
    image: string
    id: string
    position?: [number, number, number]
}

// Module-level TextureLoader to avoid instantiating it inside components
const textureLoader = new TextureLoader()

/**
 * BentPlaneGeometry - Individual curved product card
 * Note: Position is now controlled by parent ProductCard component
 */
const BentPlaneGeometry: React.FC<BentPlaneGeometryProps> = ({ image, id, position = [0, 0, 0] }) => {
    const router = useRouter()
    const meshRef = useRef<Mesh>(null)
    const materialRef = useRef<ShaderMaterial>(null)
    const scroll = useScroll()

    const [hovered, setHover] = useState(false)

    // Change cursor on hover
    useCursor(hovered)

    // Load texture
    const texture = useMemo(() => {
        const tex = textureLoader.load(image)
        tex.colorSpace = SRGBColorSpace
        return tex
    }, [image])

    // Move inline geometry to useMemo to prevent re-creation on every render
    const geometry = useMemo(() => new PlaneGeometry(3, 4, 32, 32), [])

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            geometry.dispose()
        }
    }, [geometry])

    useEffect(() => {
        return () => {
            texture.dispose()
        }
    }, [texture])

    useFrame((_, delta) => {
        if (!meshRef.current || !materialRef.current) return

        // Clamp delta to prevent massive jumps when tab is inactive/lagging
        const clampedDelta = Math.min(delta, 0.1)
        // Lerp factor adjusted to match ~0.1 speed at 60 FPS in a frame-independent way
        const lerpFactor = 1 - Math.exp(-6.32 * clampedDelta)

        // Update shader uniforms
        if (materialRef.current.uniforms.uScrollOffset) {
            materialRef.current.uniforms.uScrollOffset.value = scroll.offset
        }
        materialRef.current.uniforms.uHover.value = MathUtils.lerp(
            materialRef.current.uniforms.uHover.value,
            hovered ? 1 : 0,
            lerpFactor
        )

        // Scale on hover for zoom effect (frame-independent)
        const targetScale = hovered ? 1.1 : 1.0
        meshRef.current.scale.x = MathUtils.lerp(meshRef.current.scale.x, targetScale, lerpFactor)
        meshRef.current.scale.y = MathUtils.lerp(meshRef.current.scale.y, targetScale, lerpFactor)
    })

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        router.push(Routes.category(id))
    }

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            geometry={geometry}
        >
            <bentPlaneMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
                side={DoubleSide}
            />
        </mesh>
    )
}

export default BentPlaneGeometry






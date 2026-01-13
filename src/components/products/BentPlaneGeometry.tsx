import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScroll, useCursor } from '@react-three/drei'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'

/**
 * Bent Plane Shader Material
 * Curves the geometry based on the X position to create a cylindrical/carousel effect.
 */
const BentPlaneMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: new THREE.Texture(),
        uScrollOffset: 0,
        uHover: 0,
        uColor: new THREE.Color('#22d3ee') // Cyan glow
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

declare global {
    namespace JSX {
        interface IntrinsicElements {
            bentPlaneMaterial: any
        }
    }
}

interface BentPlaneGeometryProps {
    image: string
    id: string
    position?: [number, number, number]
    gap?: number
    index: number
    total: number
}

/**
 * BentPlaneGeometry - Individual curved product card
 * Note: Position is now controlled by parent ProductCard component
 */
const BentPlaneGeometry: React.FC<BentPlaneGeometryProps> = ({ image, id, position = [0, 0, 0], index, total, gap = 4 }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<any>(null)
    const scroll = useScroll()
    const navigate = useNavigate()
    const [hovered, setHover] = useState(false)

    // Change cursor on hover
    useCursor(hovered)

    // Load texture
    const texture = useMemo(() => new THREE.TextureLoader().load(image), [image])
    texture.colorSpace = THREE.SRGBColorSpace

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return

        // Update shader uniforms
        materialRef.current.uScrollOffset = scroll.offset
        materialRef.current.uHover = THREE.MathUtils.lerp(materialRef.current.uHover, hovered ? 1 : 0, 0.1)

        // Scale on hover for zoom effect
        const targetScale = hovered ? 1.1 : 1.0
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1)
    })

    const handleClick = (e: any) => {
        e.stopPropagation()
        navigate(`/category/${id}`)
    }

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <planeGeometry args={[3, 4, 32, 32]} />
            <bentPlaneMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export default BentPlaneGeometry

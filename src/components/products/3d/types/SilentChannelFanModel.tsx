"use client";
/*
   SILENT CHANNEL FAN MODEL (Sessiz Kanal Tipi Fan)
   ------------------------------------------------
   Refined for "Engineering Art" realism.
   - Monolithic Injection Molded Casing (Dark Grey)
   - Yellow Insulation Layer + Green Perforated Liner
   - Realistic Step Transition & Assembly Recess
   - PRECISE MOUNTING CHASSIS (Phase 29 - Monolithic Abkant & Rib Separation)
   - Phase 36: Interactive & Explodable
   - Phase 37: Pro-level hover highlight, 3D tooltip, useMemo materials
*/

import React, { useMemo, useState, useCallback } from "react"
import * as THREE from "three"
import { Text, RoundedBox, useCursor, Html, Edges } from "@react-three/drei"

// ── MATERIALS ───────────────────────────────────────────────
const getMaterial = (
    baseMat: THREE.MeshStandardMaterial,
    isTransparent: boolean,
    displayStyle: string = 'shaded',
    highlight: boolean = false
): THREE.MeshStandardMaterial => {
    const mat = baseMat.clone()

    if (displayStyle === 'hiddenLines') {
        mat.color.set('#ffffff')
        mat.roughness = 1.0
        mat.metalness = 0.0
        mat.emissive.set('#ffffff')
        mat.emissiveIntensity = 0.3
        mat.transparent = false
        mat.opacity = 1
        mat.depthWrite = true
    } else if (isTransparent) {
        mat.transparent = true
        mat.opacity = 0.2
        mat.depthWrite = false
    } else {
        mat.transparent = false
        mat.opacity = 1
        mat.depthWrite = true
    }

    mat.wireframe = displayStyle === 'wireframe'

    if (highlight) {
        mat.emissive = new THREE.Color('#1a6fff')
        mat.emissiveIntensity = 0.35
    }
    return mat
}

const EdgeOverlay = ({ displayStyle }: { displayStyle: string }) => {
    if (displayStyle !== 'shadedEdges' && displayStyle !== 'hiddenLines') return null
    return <Edges
        threshold={12}
        color={displayStyle === 'hiddenLines' ? '#000000' : '#555555'}
        linewidth={displayStyle === 'hiddenLines' ? 2 : 1}
    />
}

const baseMats = {
    darkPlastic: new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        roughness: 0.6,
        metalness: 0.2,
    }),
    vorticeGreen: new THREE.MeshStandardMaterial({
        color: "#009933",
        roughness: 0.4,
        metalness: 0.0,
        emissive: "#003300",
        emissiveIntensity: 0.1
    }),
    insulationYellow: new THREE.MeshStandardMaterial({
        color: "#F4D03F",
        roughness: 0.9,
        metalness: 0.0,
    }),
    greenPerforated: new THREE.MeshStandardMaterial({
        color: "#2ECC71",
        roughness: 0.7,
        metalness: 0.1,
    })
}

/* ─────────────────────────────────────────────────────
   COMPONENT: MOUNTING CHASSIS (Bottom Base)
   ───────────────────────────────────────────────────── */
function MountingChassis({ bodyHalfLen, neckLen, neckRad, bRad, material, displayStyle }: { bodyHalfLen: number, neckLen: number, neckRad: number, bRad: number, material: THREE.Material, displayStyle: string }) {
    const chassisWidth = neckRad * 2.2
    const chassisLen = (bodyHalfLen + neckLen) * 2

    const ledgeLen = neckLen * 0.8
    const wallZ = (chassisLen / 2) - ledgeLen

    const baseThick = 0.012
    const wallThick = 0.012
    const wallHeight = bRad * 0.9
    const yBase = -bRad

    const baseExtrudeSettings = { depth: baseThick, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002 }
    const baseShape = useMemo(() => {
        const s = new THREE.Shape()
        const w = chassisWidth / 2
        const l = chassisLen / 2
        s.moveTo(-w, -l); s.lineTo(w, -l); s.lineTo(w, l); s.lineTo(-w, l); s.closePath()

        const slotW = 0.02; const slotL = chassisLen * 0.5; const slotR = slotW / 2
        for (const xOff of [-w * 0.6, w * 0.6]) {
            const hole = new THREE.Path()
            hole.moveTo(xOff + slotR, -slotL / 2)
            hole.lineTo(xOff + slotW - slotR, -slotL / 2)
            hole.quadraticCurveTo(xOff + slotW, -slotL / 2, xOff + slotW, -slotL / 2 + slotR)
            hole.lineTo(xOff + slotW, slotL / 2 - slotR)
            hole.quadraticCurveTo(xOff + slotW, slotL / 2, xOff + slotW - slotR, slotL / 2)
            hole.lineTo(xOff + slotR, slotL / 2)
            hole.quadraticCurveTo(xOff, slotL / 2, xOff, slotL / 2 - slotR)
            hole.lineTo(xOff, -slotL / 2 + slotR)
            hole.quadraticCurveTo(xOff, -slotL / 2, xOff + slotR, -slotL / 2)
            s.holes.push(hole)
        }
        return s
    }, [chassisWidth, chassisLen])

    const wallExtrudeSettings = { depth: wallThick, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002 }
    const wallShape = useMemo(() => {
        const s = new THREE.Shape()
        const w = chassisWidth / 2
        const h = wallHeight
        s.moveTo(-w, 0); s.lineTo(-w, h); s.lineTo(-(neckRad * 0.99), h)
        s.absarc(0, h, neckRad, Math.PI, 2 * Math.PI, false)
        s.lineTo(w, h); s.lineTo(w, 0); s.closePath()
        return s
    }, [chassisWidth, wallHeight, neckRad])

    const SideGusset = ({ x, z }: { x: number, z: number }) => {
        const ribH = wallHeight * 0.6
        const ribBase = ledgeLen * 0.95
        const ribThick = 0.008
        const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(0, ribH); shape.lineTo(ribBase, 0); shape.closePath()
        return (
            <mesh position={[x, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
                <extrudeGeometry args={[shape, { depth: ribThick, bevelEnabled: false }]} />
                <primitive object={material} />
                <EdgeOverlay displayStyle={displayStyle} />
            </mesh>
        )
    }

    const FaceRib = ({ x, z }: { x: number, z: number }) => {
        const ribW = 0.015; const ribH = wallHeight * 0.5; const ribD = 0.004
        const shape = new THREE.Shape(); const w = ribW / 2; const chamfer = 0.005
        shape.moveTo(-w, 0); shape.lineTo(-w, ribH - chamfer); shape.lineTo(-w + chamfer, ribH); shape.lineTo(w - chamfer, ribH); shape.lineTo(w, ribH - chamfer); shape.lineTo(w, 0); shape.closePath()
        return (
            <mesh position={[x, 0, z]}>
                <extrudeGeometry args={[shape, { depth: ribD, bevelEnabled: false }]} />
                <primitive object={material} />
                <EdgeOverlay displayStyle={displayStyle} />
            </mesh>
        )
    }

    const AbkantFillet = () => (
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.005, chassisWidth, 8, 1, false, 0, Math.PI]} />
            <primitive object={material} />
            <EdgeOverlay displayStyle={displayStyle} />
        </mesh>
    )

    return (
        <group position={[0, yBase, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, baseThick / 2, 0]}>
                <extrudeGeometry args={[baseShape, baseExtrudeSettings]} />
                <primitive object={material} />
                <EdgeOverlay displayStyle={displayStyle} />
            </mesh>
            <group position={[0, 0, wallZ]}>
                <mesh position={[0, 0, wallThick]}>
                    <extrudeGeometry args={[wallShape, wallExtrudeSettings]} />
                    <primitive object={material} />
                    <EdgeOverlay displayStyle={displayStyle} />
                </mesh>
                <SideGusset x={-chassisWidth / 2 + 0.004} z={wallThick + 0.002} />
                <SideGusset x={chassisWidth / 2 - 0.004} z={wallThick + 0.002} />
                <group position={[0, 0, wallThick + 0.001]}>
                    <FaceRib x={-chassisWidth * 0.25} z={0} />
                    <FaceRib x={-chassisWidth * 0.1} z={0} />
                    <FaceRib x={chassisWidth * 0.1} z={0} />
                    <FaceRib x={chassisWidth * 0.25} z={0} />
                </group>
                <group position={[0, 0.008, wallThick]} rotation={[0, 0, Math.PI / 2]}><AbkantFillet /></group>
            </group>
            <group position={[0, 0, -wallZ]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0, wallThick]}>
                    <extrudeGeometry args={[wallShape, wallExtrudeSettings]} />
                    <primitive object={material} />
                    <EdgeOverlay displayStyle={displayStyle} />
                </mesh>
                <SideGusset x={-chassisWidth / 2 + 0.004} z={wallThick + 0.002} />
                <SideGusset x={chassisWidth / 2 - 0.004} z={wallThick + 0.002} />
                <group position={[0, 0, wallThick + 0.001]}>
                    <FaceRib x={-chassisWidth * 0.25} z={0} />
                    <FaceRib x={-chassisWidth * 0.1} z={0} />
                    <FaceRib x={chassisWidth * 0.1} z={0} />
                    <FaceRib x={chassisWidth * 0.25} z={0} />
                </group>
                <group position={[0, 0.008, wallThick]} rotation={[0, 0, Math.PI / 2]}><AbkantFillet /></group>
            </group>
        </group>
    )
}

// ── INTERACTIVE PART WRAPPER (Typed) ─────────────────────────
interface InteractivePartProps {
    name: string
    children: React.ReactNode
    onPartClick?: (partName: string) => void
    selectedPart?: string | null
    isolatedPart?: string | null
    hiddenParts?: string[]
    onHover?: (partName: string | null) => void
}

const InteractivePart: React.FC<InteractivePartProps> = ({ name, children, onPartClick, onHover, hiddenParts, isolatedPart }) => {
    const [hovered, setHover] = useState(false)
    useCursor(hovered)

    if (hiddenParts?.includes(name)) return null
    if (isolatedPart && isolatedPart !== name) return null

    return (
        <group
            onClick={(e) => {
                e.stopPropagation()
                onPartClick?.(name)
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
                setHover(true)
                onHover?.(name)
            }}
            onPointerOut={(e) => {
                e.stopPropagation()
                setHover(false)
                onHover?.(null)
            }}
        >
            {children}
        </group>
    )
}

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────── */
interface SilentChannelFanModelProps {
    explode?: number
    onPartClick?: (partName: string) => void
    selectedPart?: string | null
    isolatedPart?: string | null
    hiddenParts?: string[]
    displayStyle?: 'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines'
    enableTooltip?: boolean
}

export function SilentChannelFanModel({ explode = 0, onPartClick, selectedPart, isolatedPart, hiddenParts = [], displayStyle = 'shaded', enableTooltip = false }: SilentChannelFanModelProps) {

    const [hoveredPart, setHoveredPart] = useState<string | null>(null)

    // DIMENSIONS
    const bRad = 0.32
    const sphereEndRad = 0.2625
    const neckRad = sphereEndRad * 0.75
    const wallThick = 0.006
    const insThick = 0.006
    const linerThick = 0.004

    const rCaseIn = neckRad - wallThick
    const rInsIn = rCaseIn - insThick

    const bodyHalfLen = 0.54
    const neckLen = 0.075 * 0.75
    const ductLen = 0.075 * 0.75
    const internalAssemblyLen = bodyHalfLen * 2

    const phiLimit = Math.asin(sphereEndRad / bRad)
    const naturalHeight = bRad * Math.cos(phiLimit)
    const compensatoryStretch = naturalHeight > 0.01 ? bodyHalfLen / naturalHeight : 1

    // ── MEMOIZED MATERIALS ──────────────────────────────────
    const isGhost = useCallback((partName: string) => !!(isolatedPart && isolatedPart !== partName), [isolatedPart])

    const matDark = useMemo(() => getMaterial(baseMats.darkPlastic, isGhost('Dış Gövde (Plastik)'), displayStyle, hoveredPart === 'Dış Gövde (Plastik)' || selectedPart === 'Dış Gövde (Plastik)'), [displayStyle, hoveredPart, selectedPart, isGhost])
    const matGreen = useMemo(() => getMaterial(baseMats.vorticeGreen, isGhost('Elektrik Bağlantı Kutusu'), displayStyle, false), [displayStyle, isGhost])
    const matYellow = useMemo(() => getMaterial(baseMats.insulationYellow, isGhost('Akustik İzolasyon (Sarı Sünger)'), displayStyle, hoveredPart === 'Akustik İzolasyon (Sarı Sünger)' || selectedPart === 'Akustik İzolasyon (Sarı Sünger)'), [displayStyle, hoveredPart, selectedPart, isGhost])
    const matLiner = useMemo(() => getMaterial(baseMats.greenPerforated, isGhost('İç Cidar (Delikli Sac)'), displayStyle, hoveredPart === 'İç Cidar (Delikli Sac)' || selectedPart === 'İç Cidar (Delikli Sac)'), [displayStyle, hoveredPart, selectedPart, isGhost])
    const matChassis = useMemo(() => getMaterial(baseMats.darkPlastic, isGhost('Montaj Ayağı / Şasi'), displayStyle, hoveredPart === 'Montaj Ayağı / Şasi' || selectedPart === 'Montaj Ayağı / Şasi'), [displayStyle, hoveredPart, selectedPart, isGhost])
    const matBox = useMemo(() => getMaterial(baseMats.darkPlastic, isGhost('Elektrik Bağlantı Kutusu'), displayStyle, hoveredPart === 'Elektrik Bağlantı Kutusu' || selectedPart === 'Elektrik Bağlantı Kutusu'), [displayStyle, hoveredPart, selectedPart, isGhost])

    // ── EXPLOSION OFFSETS ──────────────────────────────────
    const expY = explode * 0.8
    const expZ = explode * 0.5
    const expBox = explode * 0.5

    return (
        <group>

            {/* 3D FLOATING TOOLTIP */}
            {enableTooltip && hoveredPart && (
                <Html
                    center
                    distanceFactor={4}
                    position={[0, bRad + 0.15, 0]}
                    style={{ pointerEvents: 'none' }}
                >
                    <div style={{
                        background: 'rgba(15,23,42,0.92)',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        letterSpacing: '0.02em',
                    }}>
                        {hoveredPart}
                    </div>
                </Html>
            )}

            {/* 1. CHASSIS / MOUNTING FEET */}
            <InteractivePart name="Montaj Ayağı / Şasi" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                <group position={[0, -expY, 0]}>
                    <MountingChassis bodyHalfLen={bodyHalfLen} neckLen={neckLen} neckRad={neckRad} bRad={bRad} material={matChassis} displayStyle={displayStyle} />
                </group>
            </InteractivePart>

            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 2. OUTER SHELL */}
                <InteractivePart name="Dış Gövde (Plastik)" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                    <group position={[0, 0, expZ]}>
                        <mesh scale={[1, compensatoryStretch, 1]}>
                            <sphereGeometry args={[bRad, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit]} />
                            <primitive object={matDark} />
                            <EdgeOverlay displayStyle={displayStyle} />
                        </mesh>

                        {/* NECK + DUCTS */}
                        <group position={[0, bodyHalfLen + (neckLen + ductLen) / 2, 0]}>
                            <mesh>
                                <cylinderGeometry args={[neckRad, neckRad, neckLen + ductLen, 64, 1, true]} />
                                <primitive object={matDark} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </mesh>
                        </group>
                        <group position={[0, -(bodyHalfLen + (neckLen + ductLen) / 2), 0]}>
                            <mesh>
                                <cylinderGeometry args={[neckRad, neckRad, neckLen + ductLen, 64, 1, true]} />
                                <primitive object={matDark} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </mesh>
                        </group>

                        {/* STEPS */}
                        <group position={[0, bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh>
                                <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                                <primitive object={matDark} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </mesh>
                        </group>
                        <group position={[0, -bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh>
                                <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                                <primitive object={matDark} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </mesh>
                        </group>
                    </group>
                </InteractivePart>


                {/* 3. INTERNAL ASSEMBLY */}
                <group position={[0, explode * 1.5, 0]}>

                    {/* YELLOW INSULATION */}
                    <InteractivePart name="Akustik İzolasyon (Sarı Sünger)" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                        <mesh>
                            <cylinderGeometry args={[rCaseIn, rInsIn, internalAssemblyLen, 64, 1, true]} />
                            <primitive object={matYellow} />
                            <EdgeOverlay displayStyle={displayStyle} />
                        </mesh>
                    </InteractivePart>

                    {/* GREEN LINER */}
                    <InteractivePart name="İç Cidar (Delikli Sac)" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                        <group position={[0, explode * 0.5, 0]}>
                            <mesh>
                                <cylinderGeometry args={[rInsIn, rInsIn, internalAssemblyLen, 64, 1, true]} />
                                <primitive object={matLiner} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </mesh>
                            <mesh>
                                <cylinderGeometry args={[rInsIn - linerThick / 2, rInsIn - linerThick / 2, internalAssemblyLen - 0.02, 32, 48, true]} />
                                <meshBasicMaterial color="#003300" wireframe={true} transparent={true} opacity={0.2} side={THREE.DoubleSide} />
                            </mesh>
                        </group>
                    </InteractivePart>

                </group>


                {/* 4. BRANDING & BOX */}
                <InteractivePart name="Elektrik Bağlantı Kutusu" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                    <group position={[bRad - 0.04 + expBox, 0, 0]}>

                        {/* BRANDING PLATE */}
                        <group position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, -Math.PI / 2]}>
                            <mesh>
                                <planeGeometry args={[0.22, 0.1]} />
                                <primitive object={matGreen} />
                            </mesh>
                            <Text position={[0, 0, 0.001]} fontSize={0.045} color="#ffffff" anchorX="center" anchorY="middle">
                                VORTICE
                            </Text>
                        </group>

                        {/* BOX */}
                        <group position={[0.10, 0, 0]}>
                            <RoundedBox args={[0.19, 0.35, 0.28]} radius={0.04} smoothness={4}>
                                <primitive object={matBox} />
                                <EdgeOverlay displayStyle={displayStyle} />
                            </RoundedBox>
                        </group>
                    </group>
                </InteractivePart>

            </group>
        </group>
    )
}





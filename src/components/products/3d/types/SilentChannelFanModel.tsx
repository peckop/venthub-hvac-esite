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

import { Edges, Html, RoundedBox, Text, useCursor } from "@react-three/drei"
import React, { useEffect, useMemo, useState } from "react"
import type { Material } from 'three'
import { CylinderGeometry, ExtrudeGeometry, Path, PlaneGeometry, Shape, SphereGeometry } from 'three'

import { useResolveMaterials } from "../core"

const VORTICE_LABEL = 'VORTICE'

// ── HELPERS ───────────────────────────────────────────────

/**
 * EdgeOverlay Component
 */
const EdgeOverlay = ({ displayStyle }: { displayStyle: string }) => {
    if (displayStyle !== 'shadedEdges' && displayStyle !== 'hiddenLines') return null
    return <Edges
        threshold={12}
        color={displayStyle === 'hiddenLines' ? '#000000' : '#555555'}
        linewidth={displayStyle === 'hiddenLines' ? 2 : 1}
    />
}

/* ─────────────────────────────────────────────────────
   COMPONENT: MOUNTING CHASSIS (Bottom Base)
   ───────────────────────────────────────────────────── */
function MountingChassis({ bodyHalfLen, neckLen, neckRad, bRad, material, displayStyle }: { bodyHalfLen: number, neckLen: number, neckRad: number, bRad: number, material: Material, displayStyle: string }) {
    const chassisWidth = neckRad * 2.2
    const chassisLen = (bodyHalfLen + neckLen) * 2

    const wallZ = (chassisLen / 2) - neckLen * 0.8
    const wallHeight = bRad * 0.9

    const baseThick = 0.012
    const wallThick = 0.012

    const baseExtrudeSettings = useMemo(() => ({ depth: baseThick, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002 }), [baseThick])
    const baseShape = useMemo(() => {
        const s = new Shape()
        const w = chassisWidth / 2
        const l = chassisLen / 2
        s.moveTo(-w, -l); s.lineTo(w, -l); s.lineTo(w, l); s.lineTo(-w, l); s.closePath()

        const slotW = 0.02; const slotL = chassisLen * 0.5; const slotR = slotW / 2
        for (const xOff of [-w * 0.6, w * 0.6]) {
            const hole = new Path()
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

    const wallExtrudeSettings = useMemo(() => ({ depth: wallThick, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002 }), [wallThick])
    const wallShape = useMemo(() => {
        const s = new Shape()
        const w = chassisWidth / 2
        const h = wallHeight
        s.moveTo(-w, 0); s.lineTo(-w, h); s.lineTo(-(neckRad * 0.99), h)
        s.absarc(0, h, neckRad, Math.PI, 2 * Math.PI, false)
        s.lineTo(w, h); s.lineTo(w, 0); s.closePath()
        return s
    }, [chassisWidth, wallHeight, neckRad])

    // Memoized Geometries
    const baseGeometry = useMemo(() => new ExtrudeGeometry(baseShape, baseExtrudeSettings), [baseShape, baseExtrudeSettings])
    const wallGeometry = useMemo(() => new ExtrudeGeometry(wallShape, wallExtrudeSettings), [wallShape, wallExtrudeSettings])

    useEffect(() => {
        return () => {
            baseGeometry.dispose()
        }
    }, [baseGeometry])

    useEffect(() => {
        return () => {
            wallGeometry.dispose()
        }
    }, [wallGeometry])

    return (
        <group position={[0, -bRad, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, baseThick / 2, 0]} material={material} geometry={baseGeometry}>
                <EdgeOverlay displayStyle={displayStyle} />
            </mesh>
            <group position={[0, 0, wallZ]}>
                <mesh position={[0, 0, wallThick]} material={material} geometry={wallGeometry}>
                    <EdgeOverlay displayStyle={displayStyle} />
                </mesh>
            </group>
            <group position={[0, 0, -wallZ]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0, wallThick]} material={material} geometry={wallGeometry}>
                    <EdgeOverlay displayStyle={displayStyle} />
                </mesh>
            </group>
        </group>
    )
}

// ── INTERACTIVE PART WRAPPER ─────────────────────────
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
    const materials = useResolveMaterials()
    const [hoveredPart, setHoveredPart] = useState<string | null>(null)

    // DIMENSIONS
    const bRad = 0.32
    const sphereEndRad = 0.2625
    const neckRad = sphereEndRad * 0.75
    const bodyHalfLen = 0.54
    const internalAssemblyLen = bodyHalfLen * 2
    const phiLimit = Math.asin(sphereEndRad / bRad)
    const naturalHeight = bRad * Math.cos(phiLimit)
    const compensatoryStretch = naturalHeight > 0.01 ? bodyHalfLen / naturalHeight : 1

    // Memoized Geometries
    const sphereGeometry = useMemo(
        () => new SphereGeometry(bRad, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit),
        [bRad, phiLimit]
    )

    const cylinderGeometry = useMemo(
        () => new CylinderGeometry(neckRad - 0.006, neckRad - 0.012, internalAssemblyLen, 64, 1, true),
        [neckRad, internalAssemblyLen]
    )

    const planeGeometry = useMemo(
        () => new PlaneGeometry(0.22, 0.1),
        []
    )

    // Clean up VRAM on unmount
    useEffect(() => {
        return () => {
            sphereGeometry.dispose()
        }
    }, [sphereGeometry])

    useEffect(() => {
        return () => {
            cylinderGeometry.dispose()
        }
    }, [cylinderGeometry])

    useEffect(() => {
        return () => {
            planeGeometry.dispose()
        }
    }, [planeGeometry])

    return (
        <group>
            {enableTooltip && hoveredPart && (
                <Html center distanceFactor={4} position={[0, bRad + 0.15, 0]} style={{ pointerEvents: 'none' }}>
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
                    }}>
                        {hoveredPart}
                    </div>
                </Html>
            )}

            {/* 1. CHASSIS / MOUNTING FEET */}
            <InteractivePart name="Montaj Ayağı / Şasi" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                <group position={[0, -explode * 0.8, 0]}>
                    <MountingChassis bodyHalfLen={bodyHalfLen} neckLen={0.056} neckRad={neckRad} bRad={bRad} material={materials.matteBlack} displayStyle={displayStyle} />
                </group>
            </InteractivePart>

            <group rotation={[0, 0, Math.PI / 2]}>
                {/* 2. OUTER SHELL */}
                <InteractivePart name="Dış Gövde (Plastik)" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                    <group position={[0, 0, explode * 0.5]}>
                        <mesh scale={[1, compensatoryStretch, 1]} material={materials.matteBlack} geometry={sphereGeometry}>
                            <EdgeOverlay displayStyle={displayStyle} />
                        </mesh>
                    </group>
                </InteractivePart>

                {/* 3. INTERNAL ASSEMBLY */}
                <group position={[0, explode * 1.5, 0]}>
                    {/* YELLOW INSULATION */}
                    <InteractivePart name="Akustik İzolasyon (Sarı Sünger)" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                        <mesh material={materials.jetOrange} geometry={cylinderGeometry}> {/* Using jetOrange as representative for insulation if exact missing */}
                            <EdgeOverlay displayStyle={displayStyle} />
                        </mesh>
                    </InteractivePart>
                </group>

                {/* 4. BRANDING & BOX */}
                <InteractivePart name="Elektrik Bağlantı Kutusu" onPartClick={onPartClick} selectedPart={selectedPart} isolatedPart={isolatedPart} hiddenParts={hiddenParts} onHover={setHoveredPart}>
                    <group position={[bRad - 0.04 + explode * 0.5, 0, 0]}>
                        {/* BRANDING PLATE */}
                        <group position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, -Math.PI / 2]}>
                            <mesh material={materials.vorticeGreen} geometry={planeGeometry}>
                            </mesh>
                            <Text position={[0, 0, 0.001]} fontSize={0.045} color="#ffffff" anchorX="center" anchorY="middle">{VORTICE_LABEL}</Text>
                        </group>
                        {/* BOX */}
                        <group position={[0.10, 0, 0]}>
                            <RoundedBox args={[0.19, 0.35, 0.28]} radius={0.04} smoothness={4} material={materials.matteBlack}>
                                <EdgeOverlay displayStyle={displayStyle} />
                            </RoundedBox>
                        </group>
                    </group>
                </InteractivePart>
            </group>
        </group>
    )
}

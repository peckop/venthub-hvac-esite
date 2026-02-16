import React from 'react'
import * as THREE from 'three'
import { Text, RoundedBox } from '@react-three/drei'

// Materials
const mats = {
    darkPlastic: new THREE.MeshStandardMaterial({
        color: '#2d2d30',
        roughness: 0.65,
        metalness: 0.2,
        side: THREE.DoubleSide
    }),
    vorticeGreen: new THREE.MeshStandardMaterial({
        color: '#44bd32',
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    }),
    greenShiny: new THREE.MeshStandardMaterial({
        color: '#44bd32',
        roughness: 0.2,
        metalness: 0.3,
        side: THREE.DoubleSide
    }),
    // Perforated Liner - Full Green Plastic
    greenPerforated: new THREE.MeshStandardMaterial({
        color: '#44bd32',
        roughness: 0.5,
        side: THREE.DoubleSide
    }),
    insulationYellow: new THREE.MeshStandardMaterial({
        color: '#f39c12',
        roughness: 0.9,
        side: THREE.DoubleSide
    }),
    silverMetal: new THREE.MeshStandardMaterial({
        color: '#bdc3c7',
        roughness: 0.3,
        metalness: 0.9
    })
}


/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────── */
export function SilentChannelFanModel() {

    // DIMENSIONS
    const bRad = 0.32  // Shell Radius (Reduced to 0.32 for flatter curve)
    const sphereEndRad = 0.2625 // Radius where the sphere ("kavis") ends (FIXED)
    const neckRad = sphereEndRad * 0.75 // (~0.197) FIXED
    const iRad = 0.17  // Inner Liner Radius (Fits inside neckRad)

    // Lengths
    const bodyHalfLen = 0.54
    const neckLen = 0.075 // Reduced by 50%
    const ductLen = 0.075 // Reduced by 50%

    // Calculation for Sphere Crop
    const phiLimit = Math.asin(sphereEndRad / bRad)
    const naturalHeight = bRad * Math.cos(phiLimit)
    const compensatoryStretch = naturalHeight > 0.01 ? bodyHalfLen / naturalHeight : 1

    // Total Liner Length
    const totalLength = (bodyHalfLen + neckLen + ductLen) * 2

    return (
        <group position={[0, -0.6, 0]} scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}>
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. OUTER SHELL (Dark Grey) */}
                <mesh scale={[1, compensatoryStretch, 1]}>
                    <sphereGeometry args={[bRad, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit]} />
                    <primitive object={mats.darkPlastic} />
                </mesh>

                {/* Shell Ribs REMOVED */}

                {/* 2. THE STEP TRANSITION (Solid Face - 90 Degree Step) */}
                {/* Connection between Sphere Edge (sphereEndRad) and Neck (neckRad) */}

                {/* +Y Step Face */}
                <group position={[0, bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <mesh rotation={[0, 0, 0]}>
                        <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>
                {/* -Y Step Face */}
                <group position={[0, -bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <mesh rotation={[0, 0, 0]}>
                        <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>

                {/* 3. NECK / CLAMP SURFACE (The 25% Smaller Pipe) */}
                {/* "Bu çap bir boru gibi olacak açılı değil" */}

                {/* +Y Neck */}
                <group position={[0, bodyHalfLen + neckLen / 2, 0]}>
                    <mesh>
                        <cylinderGeometry args={[neckRad, neckRad, neckLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>

                {/* -Y Neck */}
                <group position={[0, -(bodyHalfLen + neckLen / 2), 0]}>
                    <mesh>
                        <cylinderGeometry args={[neckRad, neckRad, neckLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>


                {/* 4. BLACK DUCTS (Extend after neck) */}
                <group position={[0, bodyHalfLen + neckLen + ductLen / 2, 0]}>
                    <mesh>
                        <cylinderGeometry args={[neckRad, neckRad, ductLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>
                <group position={[0, -(bodyHalfLen + neckLen + ductLen / 2), 0]}>
                    <mesh>
                        <cylinderGeometry args={[neckRad, neckRad, ductLen, 64, 1, true]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>
                </group>


                {/* 5. INTERNAL LINER (Full Green Perforated) */}
                {/* No Internal Fan Blades as requested */}
                <group>
                    <mesh>
                        <cylinderGeometry args={[iRad, iRad, totalLength, 64, 1, true]} />
                        <primitive object={mats.greenPerforated} />
                    </mesh>
                    <mesh>
                        <cylinderGeometry args={[iRad - 0.002, iRad - 0.002, totalLength - 0.05, 32, 48, true]} />
                        <meshBasicMaterial color="#003300" wireframe={true} transparent={true} opacity={0.35} side={THREE.DoubleSide} />
                    </mesh>
                </group>


                {/* 6. BRANDING */}
                <group position={[bRad - 0.01, 0, 0]} rotation={[0, Math.PI / 2, -Math.PI / 2]}>
                    <mesh>
                        <planeGeometry args={[0.22, 0.1]} />
                        <primitive object={mats.vorticeGreen} />
                    </mesh>
                    <Text position={[0, 0, 0.001]} fontSize={0.045} color="#ffffff" anchorX="center" anchorY="middle">
                        VORTICE
                    </Text>
                </group>

                {/* 7. ELECTRIC BOX - Simplified & Rounded */}
                <group position={[bRad - 0.04, 0, 0]}>
                    <group position={[0.10, 0, 0]}>
                        <RoundedBox args={[0.19, 0.35, 0.28]} radius={0.04} smoothness={4}>
                            <primitive object={mats.darkPlastic} />
                        </RoundedBox>
                    </group>
                </group>

                {/* 8. MOUNTING TRAY - DELETED */}
                {/* User: "fan gövdesinin alt tabanlığını tamamen sil" */}

            </group >
        </group >
    )
}

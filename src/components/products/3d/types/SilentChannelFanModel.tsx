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
    const bRad = 0.32  // Shell Radius (Max)
    const sphereEndRad = 0.2625 // Radius where the sphere ("kavis") ends
    const neckRad = sphereEndRad * 0.75 // (~0.197)
    const wallThick = 0.006 // ~3mm Casing Thickness
    const insThick = 0.006  // ~3mm Insulation Thickness (Yellow)
    const linerThick = 0.004 // ~2mm Liner Thickness (Green)

    // Radii transitions
    const rCaseIn = neckRad - wallThick
    const rInsIn = rCaseIn - insThick

    // Lengths
    const bodyHalfLen = 0.54
    const neckLen = 0.075 * 0.75 // Reduced by 25%
    const ductLen = 0.075 * 0.75 // Reduced by 25%

    const internalAssemblyLen = bodyHalfLen * 2 // Stops exactly at the step start

    // Calculation for Sphere Crop
    const phiLimit = Math.asin(sphereEndRad / bRad)
    const naturalHeight = bRad * Math.cos(phiLimit)
    const compensatoryStretch = naturalHeight > 0.01 ? bodyHalfLen / naturalHeight : 1

    return (
        <group position={[0, -0.6, 0]} scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}>
            <group rotation={[0, 0, Math.PI / 2]}>

                {/* 1. CASING - MONOLITHIC SHELL (Double Walled) */}
                <group>
                    {/* OUTER SHELL */}
                    <mesh scale={[1, compensatoryStretch, 1]}>
                        <sphereGeometry args={[bRad, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>

                    {/* INNER SHELL (Offset by wallThick) */}
                    <mesh scale={[1, compensatoryStretch, 1]}>
                        <sphereGeometry args={[bRad - wallThick, 64, 32, 0, Math.PI * 2, phiLimit, Math.PI - 2 * phiLimit]} />
                        <primitive object={mats.darkPlastic} />
                    </mesh>

                    {/* STEP FACES (Outer & Inner closing the step) */}
                    {/* +Y Step */}
                    <group position={[0, bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                        {/* Inner Step Wall */}
                        <mesh position={[0, 0, wallThick]}>
                            <ringGeometry args={[neckRad - wallThick, sphereEndRad - wallThick, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>
                    {/* -Y Step */}
                    <group position={[0, -bodyHalfLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <ringGeometry args={[neckRad, sphereEndRad * 0.99, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                        {/* Inner Step Wall */}
                        <mesh position={[0, 0, -wallThick]}>
                            <ringGeometry args={[neckRad - wallThick, sphereEndRad - wallThick, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>

                    {/* NECK AND DUCT (Double Walled) */}
                    {/* +Y Section */}
                    <group position={[0, bodyHalfLen + (neckLen + ductLen) / 2, 0]}>
                        {/* Outer Tube */}
                        <mesh>
                            <cylinderGeometry args={[neckRad, neckRad, neckLen + ductLen, 64, 1, true]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                        {/* Inner Tube */}
                        <mesh>
                            <cylinderGeometry args={[neckRad - wallThick, neckRad - wallThick, neckLen + ductLen, 64, 1, true]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>

                    {/* -Y Section */}
                    <group position={[0, -(bodyHalfLen + (neckLen + ductLen) / 2), 0]}>
                        {/* Outer Tube */}
                        <mesh>
                            <cylinderGeometry args={[neckRad, neckRad, neckLen + ductLen, 64, 1, true]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                        {/* Inner Tube */}
                        <mesh>
                            <cylinderGeometry args={[neckRad - wallThick, neckRad - wallThick, neckLen + ductLen, 64, 1, true]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>

                    {/* END CAPS (Closing the 3mm gap at the duct tips) */}
                    <group position={[0, bodyHalfLen + neckLen + ductLen, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <ringGeometry args={[neckRad - wallThick, neckRad, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>
                    <group position={[0, -(bodyHalfLen + neckLen + ductLen), 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <mesh>
                            <ringGeometry args={[neckRad - wallThick, neckRad, 32]} />
                            <primitive object={mats.darkPlastic} />
                        </mesh>
                    </group>
                </group>


                {/* 5. INTERNAL ASSEMBLY (Insulation + Liner) */}
                {/* User: "kademenin başladığı yere kadar sağlı sollu olsun" (Stops at step points) */}
                <group>
                    {/* YELLOW INSULATION (3mm Wall) */}
                    <mesh>
                        <cylinderGeometry args={[rCaseIn, rInsIn, internalAssemblyLen, 64, 1, true]} />
                        <primitive object={mats.insulationYellow} />
                    </mesh>

                    {/* PERFORATED GREEN LINER (Dual Walled - 2mm Thickness) */}
                    <group>
                        {/* Outer face of liner */}
                        <mesh>
                            <cylinderGeometry args={[rInsIn, rInsIn, internalAssemblyLen, 64, 1, true]} />
                            <primitive object={mats.greenPerforated} />
                        </mesh>
                        {/* Inner face of liner */}
                        <mesh>
                            <cylinderGeometry args={[rInsIn - linerThick, rInsIn - linerThick, internalAssemblyLen, 64, 1, true]} />
                            <primitive object={mats.greenPerforated} />
                        </mesh>
                        {/* Internal Perforation Visualization (Shadow effect) */}
                        <mesh>
                            <cylinderGeometry args={[rInsIn - linerThick / 2, rInsIn - linerThick / 2, internalAssemblyLen - 0.02, 32, 48, true]} />
                            <meshBasicMaterial color="#003300" wireframe={true} transparent={true} opacity={0.2} side={THREE.DoubleSide} />
                        </mesh>

                        {/* LINER END CAPS (Closing the gap at the internal assembly ends - within the sphere) */}
                        <group position={[0, internalAssemblyLen / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh>
                                <ringGeometry args={[rInsIn - linerThick, rInsIn, 32]} />
                                <primitive object={mats.greenPerforated} />
                            </mesh>
                            {/* Also closing the insulation gap at this point */}
                            <mesh>
                                <ringGeometry args={[rInsIn, rCaseIn, 32]} />
                                <primitive object={mats.insulationYellow} />
                            </mesh>
                        </group>
                        <group position={[0, -internalAssemblyLen / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh>
                                <ringGeometry args={[rInsIn - linerThick, rInsIn, 32]} />
                                <primitive object={mats.greenPerforated} />
                            </mesh>
                            {/* Also closing the insulation gap at this point */}
                            <mesh>
                                <ringGeometry args={[rInsIn, rCaseIn, 32]} />
                                <primitive object={mats.insulationYellow} />
                            </mesh>
                        </group>
                    </group>
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

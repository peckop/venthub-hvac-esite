import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { BoxGeometry, CylinderGeometry, SphereGeometry } from 'three'

import { useResolveMaterials } from '../../core'

interface InternalFanRotorProps {
    radius?: number
    spinSpeed?: number
    position?: [number, number, number]
    rotation?: [number, number, number]
    isSelected?: boolean
    isIsolated?: boolean
    isHidden?: boolean
    onClick?: () => void
    explode?: number
}

const InternalFanRotor: React.FC<InternalFanRotorProps> = ({
    radius = 0.25,
    spinSpeed = 10,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    isSelected,
    isIsolated,
    isHidden,
    onClick,
    explode = 0
}) => {
    const groupRef = useRef<Group>(null)
    const materials = useResolveMaterials()
    const bladeCount = 6

    useFrame((_, delta) => {
        if (groupRef.current && !isHidden && isIsolated !== false) {
            groupRef.current.rotation.y += delta * (isSelected ? 0 : spinSpeed)
        }
    })

    // Memoize geometries to avoid reconstruct cycles in R3F
    const geometries = useMemo(() => {
        const cylinderGeo = new CylinderGeometry(radius * 0.22, radius * 0.22, 0.08, 16)
        const sphereGeo = new SphereGeometry(radius * 0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)
        const boxGeo = new BoxGeometry(radius * 0.75, 0.012, radius * 0.35)

        return {
            cylinderGeo,
            sphereGeo,
            boxGeo
        }
    }, [radius])

    // Clean up VRAM on unmount or when geometries are recreated
    useEffect(() => {
        return () => {
            Object.values(geometries).forEach((geo) => geo.dispose())
        }
    }, [geometries])

    if (isHidden || (isIsolated === false)) return null

    const bladeMaterial = isSelected ? materials.safetyOrange : materials.vorticeGreen

    return (
        <group 
            position={position} 
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation()
                onClick?.()
            }}
        >
            <group ref={groupRef}>
                <mesh geometry={geometries.cylinderGeo} material={materials.matteBlack} castShadow />
                
                <mesh position={[0, 0.04, 0]} geometry={geometries.sphereGeo} material={materials.matteBlack} castShadow />

                {Array.from({ length: bladeCount }).map((_, i) => (
                    <group key={i} rotation={[0, (i * Math.PI * 2) / bladeCount, 0]}>
                        <mesh 
                            position={[radius * 0.58 + (explode * 0.1), 0, 0]} 
                            rotation={[0.4, 0, 0.05]} 
                            geometry={geometries.boxGeo}
                            material={bladeMaterial}
                            castShadow
                            receiveShadow
                        />
                    </group>
                ))}
            </group>
        </group>
    )
}

export default InternalFanRotor


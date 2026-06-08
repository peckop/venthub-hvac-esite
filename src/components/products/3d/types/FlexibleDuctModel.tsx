"use client";
import { useFrame } from '@react-three/fiber'
import React, { useMemo,useRef } from 'react'
import * as THREE from 'three'

import { useFanMaterials } from '../materials/useFanMaterials'

/**
 * @component FlexibleDuctModel
 * @description Meksika dalgası animasyonlu, fiziksel tabanlı esnek hava kanalı modeli.
 */
export function FlexibleDuctModel() {
    const _materials = useFanMaterials()
    const meshRef = useRef<THREE.Mesh>(null)
    const spiralRef = useRef<THREE.Group>(null)

    // Animasyonlu dalga eğrisi oluşturucu
    const createWaveCurve = (time: number) => {
        const points: THREE.Vector3[] = []
        const segments = 30

        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const x = (t - 0.5) * 2.4
            const wavePhase = t * Math.PI * 2 - time * 2
            const waveAmplitude = Math.sin(t * Math.PI) * 0.3 
            const y = Math.sin(wavePhase) * waveAmplitude
            points.push(new THREE.Vector3(x, y, 0))
        }
        return new THREE.CatmullRomCurve3(points)
    }

    useFrame((state) => {
        if (!meshRef.current || !spiralRef.current) return
        const time = state.clock.elapsedTime

        // Dinamik geometri güncelleme
        const curve = createWaveCurve(time)
        const newGeometry = new THREE.TubeGeometry(curve, 64, 0.28, 24, false)
        meshRef.current.geometry.dispose()
        meshRef.current.geometry = newGeometry

        // Spiral halkaları eğri boyunca diz
        const spiralCount = spiralRef.current.children.length
        for (let i = 0; i < spiralCount; i++) {
            const t = i / (spiralCount - 1)
            const point = curve.getPoint(t)
            const tangent = curve.getTangent(t)

            const child = spiralRef.current.children[i]
            child.position.copy(point)

            const quaternion = new THREE.Quaternion()
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent)
            child.quaternion.copy(quaternion)
        }
    })

    const initialCurve = useMemo(() => createWaveCurve(0), [])
    const spiralCount = 20

    return (
        <group scale={[1.2, 1.2, 1.2]}>
            {/* Ana Kanal Gövdesi */}
            <mesh ref={meshRef}>
                <tubeGeometry args={[initialCurve, 64, 0.28, 24, false]} />
                <meshStandardMaterial 
                    color="#b8c4ce" 
                    roughness={0.2} 
                    metalness={0.88} 
                />
            </mesh>

            {/* Dış Tel/Spiro Yapısı */}
            <group ref={spiralRef}>
                {Array(spiralCount).fill(0).map((_, i) => (
                    <mesh key={i}>
                        <torusGeometry args={[0.29, 0.018, 8, 24]} />
                        <meshStandardMaterial 
                            color="#64748b" 
                            roughness={0.5} 
                            metalness={0.6} 
                        />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

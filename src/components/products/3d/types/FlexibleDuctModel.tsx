"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { CatmullRomCurve3, Quaternion, TorusGeometry, TubeGeometry, Vector3 } from 'three'

import { useResolveMaterials } from '../core'

/**
 * Animasyonlu dalga eğrisi oluşturucu helper
 */
function createWaveCurve(waveTime: number, pointsPool: Vector3[]) {
    const segments = 30

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const x = (t - 0.5) * 2.4
        const wavePhase = t * Math.PI * 2 - waveTime
        const waveAmplitude = Math.sin(t * Math.PI) * 0.3 
        const y = Math.sin(wavePhase) * waveAmplitude
        pointsPool[i].set(x, y, 0)
    }
    return new CatmullRomCurve3(pointsPool)
}

/**
 * @component FlexibleDuctModel
 * @description Meksika dalgası animasyonlu, fiziksel tabanlı esnek hava kanalı modeli.
 */
export function FlexibleDuctModel() {
    const { brushedAluminum, castBladeMat } = useResolveMaterials()
    const meshRef = useRef<Mesh>(null)
    const spiralRef = useRef<Group>(null)
    const timeRef = useRef(0)

    // Pool Vector3 and Quaternion to avoid allocations per frame
    const pool = useMemo(() => {
        const pointsArray: Vector3[] = []
        for (let i = 0; i <= 30; i++) {
            pointsArray.push(new Vector3())
        }
        return {
            points: pointsArray,
            point: new Vector3(),
            tangent: new Vector3(),
            quaternion: new Quaternion(),
            up: new Vector3(0, 0, 1)
        }
    }, [])

    const initialCurve = useMemo(() => createWaveCurve(0, pool.points), [pool])

    const initialTubeGeo = useMemo(() => {
        return new TubeGeometry(initialCurve, 64, 0.28, 24, false)
    }, [initialCurve])

    const torusGeo = useMemo(() => {
        return new TorusGeometry(0.29, 0.018, 8, 24)
    }, [])

    useEffect(() => {
        const currentMesh = meshRef.current
        if (currentMesh) {
            currentMesh.geometry = initialTubeGeo
        }
        return () => {
            if (currentMesh && currentMesh.geometry) {
                currentMesh.geometry.dispose()
            } else {
                initialTubeGeo.dispose()
            }
            torusGeo.dispose()
        }
    }, [initialTubeGeo, torusGeo])

    useFrame((_, delta) => {
        if (!meshRef.current || !spiralRef.current) return
        timeRef.current += delta * 2

        // Dinamik geometri güncelleme
        const curve = createWaveCurve(timeRef.current, pool.points)
        const newGeometry = new TubeGeometry(curve, 64, 0.28, 24, false)
        meshRef.current.geometry.dispose()
        meshRef.current.geometry = newGeometry

        // Spiral halkaları eğri boyunca diz
        const spiralCount = spiralRef.current.children.length
        for (let i = 0; i < spiralCount; i++) {
            const t = i / (spiralCount - 1)
            curve.getPoint(t, pool.point)
            curve.getTangent(t, pool.tangent)

            const child = spiralRef.current.children[i]
            child.position.copy(pool.point)

            pool.quaternion.setFromUnitVectors(pool.up, pool.tangent)
            child.quaternion.copy(pool.quaternion)
        }
    })

    const spiralCount = 20

    return (
        <group scale={[1.2, 1.2, 1.2]}>
            {/* Ana Kanal Gövdesi */}
            <mesh ref={meshRef} material={brushedAluminum} />

            {/* Dış Tel/Spiro Yapısı */}
            <group ref={spiralRef}>
                {Array(spiralCount).fill(0).map((_, i) => (
                    <mesh key={i} geometry={torusGeo} material={castBladeMat} />
                ))}
            </group>
        </group>
    )
}

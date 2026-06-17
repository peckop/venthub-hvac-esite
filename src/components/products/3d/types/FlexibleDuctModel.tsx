"use client";
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { CatmullRomCurve3, Quaternion, TorusGeometry, TubeGeometry, Vector3 } from 'three'

import { useResolveMaterials } from '../core'

/**
 * Animasyonlu dalga eğrisi noktalarını yerinde günceller
 */
function updateWaveCurve(waveTime: number, pointsPool: Vector3[]) {
    const segments = 30

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const x = (t - 0.5) * 2.4
        const wavePhase = t * Math.PI * 2 - waveTime
        const waveAmplitude = Math.sin(t * Math.PI) * 0.3 
        const y = Math.sin(wavePhase) * waveAmplitude
        pointsPool[i].set(x, y, 0)
    }
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
            curve: new CatmullRomCurve3(pointsArray),
            point: new Vector3(),
            tangent: new Vector3(),
            quaternion: new Quaternion(),
            up: new Vector3(0, 0, 1)
        }
    }, [])

    const initialTubeGeo = useMemo(() => {
        updateWaveCurve(0, pool.points)
        return new TubeGeometry(pool.curve, 64, 0.28, 24, false)
    }, [pool])

    const torusGeo = useMemo(() => {
        return new TorusGeometry(0.29, 0.018, 8, 24)
    }, [])

    useEffect(() => {
        return () => {
            initialTubeGeo.dispose()
            torusGeo.dispose()
        }
    }, [initialTubeGeo, torusGeo])

    useFrame((_, delta) => {
        if (!meshRef.current || !spiralRef.current) return
        timeRef.current += delta * 2

        // Dinamik geometri güncelleme
        updateWaveCurve(timeRef.current, pool.points)

        const pos = initialTubeGeo.attributes.position
        const posArray = pos.array as Float32Array
        for (let i = 0; i <= 64; i++) {
            const u = i / 64
            pool.curve.getPoint(u, pool.point)       // P
            pool.curve.getTangent(u, pool.tangent)   // T (normalize)
            const bx = pool.tangent.y, by = -pool.tangent.x   // e2 = (T.y,-T.x,0)
            const bl = Math.hypot(bx, by) || 1
            const e2x = bx / bl, e2y = by / bl
            for (let j = 0; j <= 24; j++) {
                const v = j / 24 * Math.PI * 2
                const c = -Math.cos(v), s = Math.sin(v)   // -cos: three.js TubeGeometry böyle üretir
                const idx = (i * 25 + j) * 3
                posArray[idx]     = pool.point.x + 0.28 * (s * e2x)
                posArray[idx + 1] = pool.point.y + 0.28 * (s * e2y)
                posArray[idx + 2] = pool.point.z + 0.28 * (c * 1)   // e1 = (0,0,1)
            }
        }
        pos.needsUpdate = true
        initialTubeGeo.computeVertexNormals()
        initialTubeGeo.computeBoundingBox()      // ŞART: yoksa kamera oynayınca kanal kaybolur (culling)
        initialTubeGeo.computeBoundingSphere()

        // Spiral halkaları eğri boyunca diz
        const spiralCount = spiralRef.current.children.length
        for (let i = 0; i < spiralCount; i++) {
            const t = i / (spiralCount - 1)
            pool.curve.getPoint(t, pool.point)
            pool.curve.getTangent(t, pool.tangent)

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
            <mesh ref={meshRef} geometry={initialTubeGeo} material={brushedAluminum} />

            {/* Dış Tel/Spiro Yapısı */}
            <group ref={spiralRef}>
                {Array(spiralCount).fill(0).map((_, i) => (
                    <mesh key={i} geometry={torusGeo} material={castBladeMat} />
                ))}
            </group>
        </group>
    )
}

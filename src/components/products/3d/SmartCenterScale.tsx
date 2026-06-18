"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef, useState } from 'react'
import type { Group } from 'three'
import { Box3, Vector3, Sphere, Matrix4, Mesh } from 'three'

interface SmartCenterScaleProps {
    children: React.ReactNode
    enabled?: boolean
    targetSize?: number     // Hedef boyut (normalizasyon için)
    shift?: [number, number, number] // Ekstra manuel kaydırma
    visibleDelay?: number   // Kaç frame sonra gösterilsin (flicker önleme)
    alignment?: 'center' | 'bottom' // Hizalama tipi
}

// Module-level pooled variables to avoid per-frame allocations inside useFrame
const tempBox = new Box3()
const tempCenter = new Vector3()
const tempSize = new Vector3()
const tempSphere = new Sphere()
const tempInverse = new Matrix4()
const tempMatrix = new Matrix4()
const tempMeshBox = new Box3()

/**
 * Centered local bounding box calculator to prevent parent rotations from distorting measurements.
 */
function getLocalBoundingBox(root: Group, targetBox: Box3) {
    targetBox.makeEmpty()
    root.updateMatrixWorld(true)
    tempInverse.copy(root.matrixWorld).invert()

    root.traverse((child) => {
        if ((child as Mesh).isMesh) {
            const mesh = child as Mesh
            if (mesh.geometry) {
                if (!mesh.geometry.boundingBox) {
                    mesh.geometry.computeBoundingBox()
                }
                tempMeshBox.copy(mesh.geometry.boundingBox)
                tempMatrix.copy(mesh.matrixWorld).premultiply(tempInverse)
                tempMeshBox.applyMatrix4(tempMatrix)
                targetBox.union(tempMeshBox)
            }
        }
    })
}

/**
 * SmartCenterScale: Profesyonel 3D Normalizasyon Bileşeni (v3 - B10 Standardı Uyumlu)
 */
export const SmartCenterScale: React.FC<SmartCenterScaleProps> = ({
    children,
    enabled = true,
    targetSize = 1.0,
    shift = [0, 0, 0],
    visibleDelay = 3,
    alignment = 'center'
}) => {
    const groupRef = useRef<Group>(null)
    const innerGroupRef = useRef<Group>(null)
    const [isVisible, setIsVisible] = useState(false)
    const isLocked = useRef(false)
    const frameCount = useRef(0)

    useFrame(() => {
        if (!enabled || isLocked.current || !innerGroupRef.current) return

        frameCount.current++

        // İlk birkaç frame: Geometrilerin yüklenmesini bekler
        if (frameCount.current < visibleDelay) return

        // 1. Bounding Box hesapla (Rotasyon bağımsız, yerel koordinatlarda)
        getLocalBoundingBox(innerGroupRef.current, tempBox)
        if (tempBox.isEmpty()) {
            return
        }

        // 2. Bounding Sphere Çapı ile Normalizasyon (Standart §B10)
        tempBox.getBoundingSphere(tempSphere)
        const diameter = tempSphere.radius * 2
        const scaleFactor = diameter > 0 ? targetSize / diameter : 1

        tempBox.getCenter(tempCenter)
        tempBox.getSize(tempSize)

        // 3. Hizalama Offset'i
        let yOffset = -tempCenter.y
        if (alignment === 'bottom') {
            yOffset = -tempCenter.y + (tempSize.y / 2)
        }

        // 4. Uygulama (İç gruba normalizasyon ve merkezleme uygula)
        innerGroupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)
        innerGroupRef.current.position.set(
            -tempCenter.x * scaleFactor,
            yOffset * scaleFactor,
            -tempCenter.z * scaleFactor
        )

        // 5. Sonuçları Kilitler ve Görünür Yap
        setIsVisible(true)
        isLocked.current = true
    })

    // Fallback: Eğer hesaplama bir şekilde takılırsa 500ms sonra zorla göster
    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <group ref={groupRef} position={shift} visible={isVisible || !enabled}>
            <group ref={innerGroupRef}>
                {children}
            </group>
        </group>
    )
}

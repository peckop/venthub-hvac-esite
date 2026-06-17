"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef, useState } from 'react'
import type { Group } from 'three'
import { Box3, Vector3 } from 'three'

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

/**
 * SmartCenterScale: Profesyonel 3D Normalizasyon Bileşeni
 * 
 * Özellikler:
 * 1. Otomatik Merkezleme: Modelin geometrik merkezini hesaplar ve (0,0,0) noktasına taşır.
 * 2. Otomatik Ölçekleme (Normalize): Modeli hedef boyuta (targetSize) sığacak şekilde ölçekler.
 * 3. Flicker Önleme: Hesaplama bitene kadar modeli gizler (white screen ve zıplama sorunu çözümü).
 * 4. Performans: Hesaplamayı bir kez yapar ve dondurur (Lock).
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
    const [isVisible, setIsVisible] = useState(false)
    const isLocked = useRef(false)
    const frameCount = useRef(0)

    useFrame(() => {
        if (!enabled || isLocked.current || !groupRef.current) return

        frameCount.current++

        // İlk birkaç frame: Geometrilerin yüklenmesini bekler
        if (frameCount.current < visibleDelay) return

        // 1. Ölçüm için geçici sıfırlama
        groupRef.current.position.set(0, 0, 0)
        groupRef.current.scale.set(1, 1, 1)
        groupRef.current.updateMatrixWorld(true)

        // 2. Bounding Box hesapla
        tempBox.setFromObject(groupRef.current)
        if (tempBox.isEmpty()) {
            console.warn('[SmartCenterScale] Empty bounding box for object', groupRef.current)
            return
        }

        // 3. Merkez ve Boyut bilgisi al
        tempBox.getCenter(tempCenter)
        tempBox.getSize(tempSize)

        // 4. Normalizasyon Ölçeği (En büyük kenarı baz al)
        const maxDim = Math.max(tempSize.x, tempSize.y, tempSize.z)
        const scaleFactor = maxDim > 0 ? targetSize / maxDim : 1

        // 5. Hizalama Offset'i
        let yOffset = -tempCenter.y
        if (alignment === 'bottom') {
            yOffset = -tempCenter.y + (tempSize.y / 2)
        }

        // 6. Uygulama
        // Merkeze/Tabana çek, shift ekle
        groupRef.current.position.set(
            -tempCenter.x + shift[0],
            yOffset + shift[1],
            -tempCenter.z + shift[2]
        )
        groupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor)

        // 7. Sonuçları Kilitler ve Görünür Yap
        setIsVisible(true)
        isLocked.current = true
    })

    // Fallback: Eğer hesaplama bir şekilde takılırsa 500ms sonra zorla göster
    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <group ref={groupRef} visible={isVisible || !enabled}>
            {children}
        </group>
    )
}






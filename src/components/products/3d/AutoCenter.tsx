"use client";
import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

/**
 * Otomatik Merkezleme Bileşeni (v2 - STABLE)
 * 
 * SORUN: Eski versiyon `useLayoutEffect` + `Box3.setFromObject()` kullanıyordu.
 *   - `setFromObject()` TÜM alt objeleri (animasyonlu parçacıklar dahil) tarar.
 *   - Parçacıklar hareket ettikçe bounding box merkezi kayar → model zıplar.
 *   - Parent re-render olduğunda (örn: hover state) `useLayoutEffect` tekrar tetiklenir.
 *
 * ÇÖZÜM: "Bir Kere Hesapla, Sonsuza Kadar Sabitle" stratejisi.
 *   - İlk birkaç frame'de bounding box'ı hesapla (geometrilerin yüklenmesini bekle).
 *   - Sonra kilitle ve bir daha dokunma.
 *   - `children` prop'undaki değişikliklere TEPKİ VERME.
 * 
 * @param shift - [x, y, z] Manuel kaydırma (Opsiyonel). Otomatik merkezleme üzerine eklenir.
 */
export const AutoCenter: React.FC<{ children: React.ReactNode; enabled?: boolean; shift?: [number, number, number] }> = ({ children, enabled = true, shift = [0, 0, 0] }) => {
    const groupRef = useRef<THREE.Group>(null)
    const isLocked = useRef(false)
    const frameCount = useRef(0)

    useFrame(() => {
        // Kilitlenmişse veya devre dışıysa hiçbir şey yapma
        if (isLocked.current || !enabled || !groupRef.current) return

        frameCount.current++

        // İlk 3 frame'i bekle: geometrilerin ve malzemelerin yüklenmesi için
        // (React Three Fiber bazen ilk frame'de geometrileri oluşturur)
        if (frameCount.current < 3) return

        // 1. Pozisyonu sıfırla (doğru ölçüm için)
        groupRef.current.position.set(0, 0, 0)
        groupRef.current.updateMatrixWorld(true)

        // 2. Bounding Box hesapla
        const box = new THREE.Box3().setFromObject(groupRef.current)

        // 3. Box geçerli mi kontrol et
        if (box.isEmpty()) return

        const center = new THREE.Vector3()
        box.getCenter(center)

        // 4. Offset hesapla ve uygula
        const yOffset = -center.y + shift[1]
        const xOffset = shift[0]
        const zOffset = shift[2]

        groupRef.current.position.set(xOffset, yOffset, zOffset)

        // 5. KİLİTLE — bir daha hesaplama
        isLocked.current = true
    })

    return <group ref={groupRef}>{children}</group>
}





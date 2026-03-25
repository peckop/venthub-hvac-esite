"use client";
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export interface AirCurtainModelProps {
    isHeated?: boolean
    showMixed?: boolean
}

export function AirCurtainModel({ isHeated = false, showMixed = false }: AirCurtainModelProps) {
    const drumRef = useRef<THREE.Group>(null)
    const materials = useFanMaterials()

    // Animasyon: İç tambur fanın (Cross-Flow) X ekseni etrafında dönmesi
    useFrame((state, delta) => {
        if (drumRef.current) {
            drumRef.current.rotation.x -= delta * 12
        }
    })

    return (
        <group scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 2, 0]}>

            {/* 1. ANA GÖVDE (Body) - Mat Siyah (VentHub Standard) */}
            <mesh name="Body" material={materials.matteBlack}>
                <boxGeometry args={[2.5, 0.5, 0.5]} />
            </mesh>

            {/* VentHub Marka Etiketi - Gövde üzerine eklendi */}
            <group position={[0, 0, 0.252]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.4, 0.12, 0.005]} />
                </mesh>
                <mesh position={[0, 0, 0.003]}>
                    <planeGeometry args={[0.38, 0.1]} />
                    <Html transform distanceFactor={0.5} position={[0, 0, 0.001]}>
                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-sm shadow-inner select-none pointer-events-none border border-blue-200">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span className="text-[10px] font-black text-primary-navy tracking-tighter">VentHub</span>
                        </div>
                    </Html>
                </mesh>
            </group>

            {/* Yan Kapaklar - Siyah Termoplastik (Vortice Side Panels) */}
            {[-1.23, 1.23].map((x, i) => (
                <mesh key={i} position={[x, 0, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.05, 0.52, 0.52]} />
                </mesh>
            ))}

            {/* 2. SERVİS KAPAĞI / ARKA PANEL - Siyah Boyalı Sac (Vortice Rear Panel) */}
            <mesh name="RearPanel" position={[0, 0, -0.255]} material={materials.matteBlack}>
                <boxGeometry args={[2.4, 0.45, 0.02]} />
            </mesh>

            {/* Üst Panel - Siyah */}
            <mesh name="TopPanel" position={[0, 0.255, 0]} material={materials.matteBlack}>
                <boxGeometry args={[2.4, 0.02, 0.45]} />
            </mesh>

            {/* 3. İÇ TAMBUR FAN (Cross-Flow Drum) */}
            <group ref={drumRef} position={[0, 0, -0.05]}>
                <mesh rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.02, 0.02, 2.3, 12]} />
                </mesh>
                {Array(18).fill(0).map((_, i) => (
                    <mesh
                        key={`ring-${i}`}
                        position={[1.15 - (i * 0.13), 0, 0]}
                        rotation={[0, 0, Math.PI / 2]}
                        material={materials.industrialSteel}
                    >
                        <cylinderGeometry args={[0.15, 0.15, 0.01, 32, 1, true]} />
                    </mesh>
                ))}
            </group>

            {/* 4. ISITICI BATARYA (Heating Coil) - Sadece Isıtıcılı Modellerde Belirgin */}
            <group position={[0, -0.15, 0.15]} visible={isHeated || showHeatedParts()}>
                {Array(8).fill(0).map((_, i) => (
                    <mesh key={`coil-${i}`} position={[0, (i - 3.5) * 0.05, 0]} material={materials.safetyOrange}>
                        <boxGeometry args={[2.3, 0.01, 0.1]} />
                    </mesh>
                ))}
            </group>

            {/* 5. ÜFLEME IZGARASI & AKIŞ SİMÜLASYONU */}
            <group position={[0, -0.26, 0.12]}>
                <mesh position={[0, -0.01, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[2.35, 0.02, 0.22]} />
                </mesh>
                {[-0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09].map((z, i) => (
                    <mesh key={`grille-${i}`} position={[0, 0, z]} rotation={[0.4, 0, 0]} material={materials.matteBlack}>
                        <boxGeometry args={[2.32, 0.01, 0.035]} />
                    </mesh>
                ))}

                {/* Dinamik Hava Akışı */}
                <AirFlow key={`flow-${isHeated}-${showMixed}`} isHeated={isHeated} showMixed={showMixed} />
            </group>

            {/* 6. VORTICE STİLİ IR SENSÖR & KONTROL PANELİ */}
            <group position={[1.1, 0, 0.251]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.22, 0.18, 0.01]} />
                </mesh>
                {/* IR Sensör / Durum LED'i */}
                <mesh position={[0, 0.04, 0.01]}>
                    <circleGeometry args={[0.015, 16]} />
                    <meshBasicMaterial color={isHeated ? "#f97316" : "#22c55e"} />
                </mesh>
                {/* IR Penceresi */}
                <mesh position={[0, -0.04, 0.01]}>
                    <planeGeometry args={[0.1, 0.05]} />
                    <meshBasicMaterial color="#1a1a1a" />
                </mesh>
            </group>

        </group>
    )
}

// ── AIRFLOW ANIMATION (Horizontal-Slice Gradient Curtain) ──────────────────────
// Fizik: Laminer hava akışı ızgaradan çıkar, paralel katmanlar halinde aşağı iner,
// mesafe arttıkça hız ve yoğunluk azalır (entrainment).
// Görsel: Cihaz genişliğinde yatay dilimler, üstten alta gradient opacity,
// dalga animasyonuyla akan hava efekti.
function AirFlow({ isHeated, showMixed }: { isHeated: boolean, showMixed: boolean }) {
    const meshRefs = useRef<(THREE.Mesh | null)[]>([])

    const SLICE_COUNT = 28          // Yatay dilim sayısı
    const CURTAIN_WIDTH = 2.32      // Perde genişliği (cihaz genişliğiyle eşleşir)
    const CURTAIN_HEIGHT = 1.6      // Toplam akış mesafesi
    const SLICE_HEIGHT = CURTAIN_HEIGHT / SLICE_COUNT * 1.05 // Hafif overlap
    const MAX_OPACITY = 0.32        // Üst dilimlerdeki max opacity
    const WAVE_SPEED = 2.5          // Dalga hızı (aşağı doğru)
    const WAVE_INTENSITY = 0.12     // Dalga genliği

    // Dilim verileri: Sabit pozisyonlar, renk tipi
    const slices = useMemo(() => {
        return Array(SLICE_COUNT).fill(0).map((_, i) => {
            // Normalize: 0 (en üst) → 1 (en alt)
            const t = i / (SLICE_COUNT - 1)
            // Karma modda: üst yarısı sıcak, alt yarısı soğuk (veya dönüşümlü)
            let type: number
            if (showMixed) {
                type = i % 3 === 0 ? 1 : 0  // Her 3 dilimde bir sıcak
            } else {
                type = isHeated ? 1 : 0
            }
            return {
                yPos: -t * CURTAIN_HEIGHT,   // Üstten aşağı doğru
                baseOpacity: MAX_OPACITY * (1 - t * 0.85), // Gradient: üstte yoğun, altta sönük
                type,
            }
        })
    }, [isHeated, showMixed])

    const timeRef = useRef(0)
    useFrame((state, delta) => {
        timeRef.current += delta
        const time = timeRef.current

        slices.forEach((s, i) => {
            const mesh = meshRefs.current[i]
            if (!mesh) return
            const mat = mesh.material as THREE.MeshBasicMaterial

            // Normalize konum (0=üst, 1=alt)
            const t = i / (SLICE_COUNT - 1)

            // Dalga: Yukarıdan aşağı doğru hareket eden sinüsoidal pulse
            // Her dilim, konumuna göre fazı kaydırılmış bir dalga alır
            const wave = Math.sin(time * WAVE_SPEED - t * Math.PI * 3) * WAVE_INTENSITY

            // Final opacity = base gradient + dalga (negatife düşmesin)
            mat.opacity = Math.max(0, s.baseOpacity + wave)

            // Hafif yatay titreşim (türbülans hissi)
            mesh.position.x = Math.sin(time * 1.5 + i * 0.7) * 0.01
        })
    })

    const hotColor = new THREE.Color("#fb923c")   // Sıcak
    const coldColor = new THREE.Color("#38bdf8")   // Soğuk

    return (
        // Akış başlangıcı: Üfleme ızgarasının hemen altı (bu group zaten ızgara içinde)
        <group position={[0, -0.04, 0]}>
            {slices.map((s, i) => (
                <mesh
                    key={i}
                    ref={el => { meshRefs.current[i] = el }}
                    position={[0, s.yPos, 0]}
                >
                    <planeGeometry args={[CURTAIN_WIDTH, SLICE_HEIGHT]} />
                    <meshBasicMaterial
                        color={s.type === 1 ? hotColor : coldColor}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    )
}

function showHeatedParts() {
    // Audit amaçlı veya mixed modda ısıtıcı bataryayı göster
    return true
}






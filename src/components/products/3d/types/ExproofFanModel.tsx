import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

/**
 * ExproofFanModel (Vortice C ATEX Revizyonu)
 * Kullanıcının paylaştığı 4 resimdeki teknik detaylara (kare flanş, motor kapağı, 
 * soğutma kanatları, terminal box) birebir sadık kalınarak sıfırdan tasarlanmıştır.
 */
export const ExproofFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.x -= delta * 15
        }
    })

    return (
        <group position={[0, -0.6, 0]} scale={[0.65, 0.65, 0.65]}>
            {/* 1. ANA SALYANGOZ GÖVDE (Scroll Housing) - MAT SİYAH/ANTRASİT */}
            <group>
                {/* Salyangoz Formunu oluşturan ana silindir */}
                <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.55, 0.55, 0.45, 48]} />
                </mesh>

                {/* Tangential Çıkış Ağzı */}
                <mesh position={[0.4, 0.45, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.6, 0.6, 0.45]} />
                </mesh>

                {/* RESİMDEKİ KRİTİK DETAY: KARE MONTAJ FLANŞI (4 Delikli) */}
                <mesh position={[0.7, 0.45, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.65, 0.75, 0.03]} />
                    {/* Vida Deliği Simülasyonu (Köşelerde hafif çöküntüler veya siyah noktalar) */}
                </mesh>
            </group>

            {/* 2. EX-PROOF GİRİŞ DETAYI: BAKIR HALKA VE ÖZEL IZGARA */}
            <group position={[0, 0.2, 0.23]}>
                {/* Belirgin Bakır Halka (Referans resim 1 & 3) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.copper}>
                    <torusGeometry args={[0.38, 0.04, 16, 100]} />
                </mesh>

                {/* Siyah Konsantrik Izgara */}
                <group position={[0, 0, 0.03]}>
                    <mesh material={materials.matteBlack}>
                        <torusGeometry args={[0.1, 0.008, 8, 40]} />
                    </mesh>
                    <mesh material={materials.matteBlack}>
                        <torusGeometry args={[0.2, 0.008, 8, 40]} />
                    </mesh>
                    <mesh material={materials.matteBlack}>
                        <torusGeometry args={[0.3, 0.008, 8, 40]} />
                    </mesh>
                    {/* Radyal Teller */}
                    {[0, 45, 90, 135].map((rot, i) => (
                        <mesh key={i} rotation={[0, 0, rot * Math.PI / 180]} material={materials.matteBlack}>
                            <boxGeometry args={[0.65, 0.015, 0.01]} />
                        </mesh>
                    ))}
                </group>
            </group>

            {/* 3. MOTOR VE TEKNİK AKSAM (Referans resim 2 & 4) */}
            <group position={[0, 0.2, -0.4]}>
                {/* Motor Gövdesi (Gri/Alüminyum) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.28, 0.28, 0.55, 32]} />
                </mesh>

                {/* Soğutma Kanatçıkları (Motor boyu boyunca) */}
                {Array(10).fill(0).map((_, i) => (
                    <mesh key={i} position={[0, 0, i * 0.05 - 0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                        <cylinderGeometry args={[0.31, 0.31, 0.015, 32]} />
                    </mesh>
                ))}

                {/* Arka Fan Kapağı (Tırtıklı/Havalandırmalı Gümüş Kısım) */}
                <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]} material={materials.brushedAluminum}>
                    <cylinderGeometry args={[0.28, 0.22, 0.15, 32]} />
                </mesh>

                {/* TERMINAL BOX (Klemens Kutusu - Üstte) */}
                <group position={[0, 0.28, -0.1]}>
                    <mesh material={materials.ral7035}>
                        <boxGeometry args={[0.25, 0.18, 0.25]} />
                    </mesh>
                    {/* Box Kapağı (Vidalanmış görünüm) */}
                    <mesh position={[0, 0.1, 0]} material={materials.ral7035}>
                        <boxGeometry args={[0.28, 0.03, 0.28]} />
                    </mesh>
                    {/* SARI UYARI ETİKETİ (Yıldırım işareti olan) */}
                    <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.safetyOrange}>
                        <planeGeometry args={[0.12, 0.12]} />
                    </mesh>
                </group>

                {/* Kablo Giriş Rakoru (Yanda) */}
                <mesh position={[0.15, 0.2, 0.05]} rotation={[0, Math.PI / 2, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
                </mesh>

                {/* Motor Etiketi (Plaka) */}
                <mesh position={[-0.2, 0.1, -0.1]} rotation={[0, -Math.PI / 4, 0]} material={materials.galvanizedSteel}>
                    <planeGeometry args={[0.15, 0.25]} />
                </mesh>
            </group>

            {/* 4. İÇ PERVANE (Dönen parça) */}
            <group ref={fanRef} position={[0, 0.2, 0]}>
                {/* Göbek */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.1, 0.1, 0.35, 16]} />
                </mesh>
                {/* Kanatlar (Sık dizilimli exproof kanatlar) */}
                {Array(24).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (360 / 24) * Math.PI / 180]} position={[0.28, 0, 0]}>
                        <boxGeometry args={[0.15, 0.02, 0.38]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                ))}
            </group>

            {/* 5. ALT MONTAJ AYAĞI (Resim 2 & 3'te altta görünen kısım) */}
            <mesh position={[0, -0.35, -0.3]} material={materials.matteBlack}>
                <boxGeometry args={[0.6, 0.05, 0.4]} />
            </mesh>
        </group>
    )
}

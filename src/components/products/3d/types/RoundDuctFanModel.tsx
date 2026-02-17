import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const RoundDuctFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // MIXED FLOW - SADE TASARIM (NO RINGS)
    // Şişkin Gövde (Cylinder) + Giriş Çıkış (Cylinder) + Kelepçeler (Cylinder Band)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 15
        }
    })

    return (
        <group scale={[0.6, 0.6, 0.6]}>

            {/* 1. ANA GÖVDE (Central Body) - SİLİNDİR (Torus Yok) */}
            <group rotation={[0, 0, Math.PI / 2]}>
                <mesh material={materials.ral7035}>
                    <cylinderGeometry args={[0.55, 0.55, 0.7, 32]} />
                </mesh>
            </group>

            {/* 2. GİRİŞ/ÇIKIŞ KONİLERİ VE SPIGOTS */}
            <group rotation={[0, 0, Math.PI / 2]}>
                {/* Sol Taraf (Inlet) */}
                <group position={[0, 0.5, 0]}>
                    {/* Kelepçe (Clamp) - SİYAH SİLİNDİR ŞERİT */}
                    {/* Torus DEĞİL, Cylinder kullanıyoruz */}
                    <mesh position={[0, -0.05, 0]} material={materials.matteBlack}>
                        <cylinderGeometry args={[0.56, 0.56, 0.1, 32]} />
                    </mesh>
                    {/* Koni */}
                    <mesh position={[0, 0.15, 0]} material={materials.ral7035}>
                        <cylinderGeometry args={[0.45, 0.55, 0.3, 32]} />
                    </mesh>
                    {/* Kanal Bağlantı Ağzı (Spigot) */}
                    <mesh position={[0, 0.35, 0]} material={materials.ral7035}>
                        <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
                    </mesh>
                </group>

                {/* Sağ Taraf (Outlet) - Simetrik */}
                <group position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                    {/* Kelepçe */}
                    <mesh position={[0, -0.05, 0]} material={materials.matteBlack}>
                        <cylinderGeometry args={[0.56, 0.56, 0.1, 32]} />
                    </mesh>
                    {/* Koni */}
                    <mesh position={[0, 0.15, 0]} material={materials.ral7035}>
                        <cylinderGeometry args={[0.45, 0.55, 0.3, 32]} />
                    </mesh>
                    {/* Spigot */}
                    <mesh position={[0, 0.35, 0]} material={materials.ral7035}>
                        <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
                    </mesh>
                </group>
            </group>

            {/* 3. MONTAJ KAİDESİ (Base Stand) - KUTU PROFİL */}
            <group position={[0, -0.65, 0]}>
                <mesh material={materials.ral7035}>
                    <boxGeometry args={[1.0, 0.1, 0.6]} />
                </mesh>
                {/* Kollar */}
                <group position={[0, 0.3, 0]}>
                    <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -0.2]} material={materials.ral7035}>
                        <boxGeometry args={[0.1, 0.6, 0.4]} />
                    </mesh>
                    <mesh position={[0.4, 0, 0]} rotation={[0, 0, 0.2]} material={materials.ral7035}>
                        <boxGeometry args={[0.1, 0.6, 0.4]} />
                    </mesh>
                </group>
            </group>

            {/* 4. HARİCİ KLEMENS KUTUSU (Terminal Box) */}
            <group position={[0, 0.65, 0]}>
                <mesh material={materials.ral7035}>
                    <boxGeometry args={[0.3, 0.2, 0.3]} />
                </mesh>
                <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
                </mesh>
            </group>

            {/* 5. İÇ PERVANE (Mixed Flow) - SİLİNDİRİK KANATLAR */}
            <group ref={fanRef} rotation={[0, 0, -Math.PI / 2]}>
                <mesh material={new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.4 })}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                </mesh>
                {/* Kanatlar */}
                {Array(9).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 9) * Math.PI * 2, 0]} position={[0.25, 0, 0]} rotation-y={0.5}>
                        <boxGeometry args={[0.25, 0.05, 0.4]} />
                        <meshStandardMaterial color="#991b1b" />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

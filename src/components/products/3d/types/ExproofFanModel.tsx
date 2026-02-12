import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

/**
 * ExproofFanModel (Ultra High Fidelity Revision)
 * Referans görsellere (Vortice C ATEX) birebir sadık, yüksek detaylı endüstriyel model.
 * - IEC Standart Motor (Soğutma kanalları, Klemens Kutusu, Rakor)
 * - Kare Flanş (Delikli)
 * - Salyangoz Gövde (Spiral form simülasyonu)
 * - Bakır Emiş Halkası (Parlak)
 */
export const ExproofFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.x -= delta * 15
        }
    })

    // Vida/Somun Detayı Oluşturucu (Tekrar kullanım için)
    const Bolt = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => (
        <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : new THREE.Euler()}>
            <mesh material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.015, 0.015, 0.02, 6]} />
            </mesh>
            <mesh position={[0, 0.01, 0]} material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.025, 0.025, 0.01, 6]} />
            </mesh>
        </group>
    )

    return (
        <group position={[0, -0.65, 0]} scale={[0.7, 0.7, 0.7]}>

            {/* --- 1. ANA SALYANGOZ GÖVDE (SCROLL HOUSING) --- */}
            <group>
                {/* Sol Yan Kapak */}
                <mesh position={[0, 0.25, 0.22]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.58, 0.58, 0.02, 64]} />
                </mesh>
                {/* Sağ Yan Kapak */}
                <mesh position={[0, 0.25, -0.22]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.58, 0.58, 0.02, 64]} />
                </mesh>
                {/* Salyangoz Sırtı (Kıvrımlı Levha) - Spiral etkisi için parçalı yapı */}
                <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.58, 0.58, 0.42, 64, 1, true, 0, 4.5]} />
                    {/* Yarım silindir, geri kalanı çıkış ağzına bağlanacak */}
                </mesh>
                {/* İç Siyahlık (Görünürlük için) */}
                <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.57, 0.57, 0.41, 64]} />
                </mesh>

                {/* ÇIKIŞ AĞZI (RECTANGULAR OUTLET) */}
                <group position={[0.45, 0.55, 0]} rotation={[0, 0, 0.2]}>
                    {/* Boğaz */}
                    <mesh position={[-0.1, -0.1, 0]} material={materials.matteBlack}>
                        <boxGeometry args={[0.4, 0.3, 0.44]} />
                    </mesh>

                    {/* KARE FLANŞ (SQUARE FLANGE) - Resmi Detay */}
                    <group position={[0.1, 0, 0]}>
                        <mesh material={materials.matteBlack}>
                            <boxGeometry args={[0.02, 0.65, 0.65]} />
                        </mesh>
                        {/* Flanş Delikleri (Siyah Nokta ile Simüle) */}
                        <mesh position={[0.011, 0.28, 0.28]} rotation={[0, Math.PI / 2, 0]}>
                            <circleGeometry args={[0.015, 8]} />
                            <meshBasicMaterial color="#000" />
                        </mesh>
                        <mesh position={[0.011, -0.28, 0.28]} rotation={[0, Math.PI / 2, 0]}>
                            <circleGeometry args={[0.015, 8]} />
                            <meshBasicMaterial color="#000" />
                        </mesh>
                        <mesh position={[0.011, 0.28, -0.28]} rotation={[0, Math.PI / 2, 0]}>
                            <circleGeometry args={[0.015, 8]} />
                            <meshBasicMaterial color="#000" />
                        </mesh>
                        <mesh position={[0.011, -0.28, -0.28]} rotation={[0, Math.PI / 2, 0]}>
                            <circleGeometry args={[0.015, 8]} />
                            <meshBasicMaterial color="#000" />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* --- 2. EMİŞ AĞZI DETAYLARI --- */}
            <group position={[0, 0.25, 0.23]}>
                {/* BAKIR HALKA (COPPER RING) - Parlak ve Belirgin */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.copper}>
                    <torusGeometry args={[0.35, 0.05, 32, 100]} />
                </mesh>

                {/* SİYAH KORUYUCU IZGARA (WIRE GUARD) */}
                <group position={[0, 0, 0.04]}>
                    {/* Konsantrik Teller */}
                    {[0.1, 0.2, 0.3].map((rad, i) => (
                        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                            <torusGeometry args={[rad, 0.006, 12, 48]} />
                        </mesh>
                    ))}
                    {/* Radyal Teller (Haç şeklinde) */}
                    <mesh material={materials.matteBlack}>
                        <boxGeometry args={[0.6, 0.012, 0.01]} />
                    </mesh>
                    <mesh rotation={[0, 0, Math.PI / 2]} material={materials.matteBlack}>
                        <boxGeometry args={[0.6, 0.012, 0.01]} />
                    </mesh>
                    {/* Izgara Montaj Vidaları (Bakır halka üzerine) */}
                    {[45, 135, 225, 315].map((ang, i) => (
                        <Bolt key={i} position={[Math.cos(ang * Math.PI / 180) * 0.35, Math.sin(ang * Math.PI / 180) * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} />
                    ))}
                </group>
            </group>

            {/* --- 3. IEC MOTOR (Yüksek Detay) --- */}
            <group position={[0, 0.25, -0.45]}>
                {/* Motor Gövdesi (Silindirik Çekirdek) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.26, 0.26, 0.55, 32]} />
                </mesh>

                {/* Soğutma Kanatçıkları (Fins) - Daha sık ve derin */}
                {Array(16).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (360 / 16) * Math.PI / 180]} material={materials.industrialSteel}>
                        <boxGeometry args={[0.04, 0.65, 0.5]} /> {/* Motor çapından taşan kanatlar */}
                    </mesh>
                ))}

                {/* Ön Kapak (Flanş tarafı) */}
                <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
                </mesh>

                {/* Arka Kapak (Pervane muhafazası) */}
                <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]} material={materials.brushedAluminum}>
                    <cylinderGeometry args={[0.27, 0.25, 0.12, 32]} />
                </mesh>
                {/* Arka Izgara Dokusu */}
                <mesh position={[0, 0, -0.36]} rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.2, 0.2, 0.01, 32]} />
                </mesh>

                {/* --- TERMINAL BOX (KLEMENS KUTUSU) --- */}
                <group position={[0, 0.32, -0.05]}>
                    <mesh material={materials.ral7035}>
                        <boxGeometry args={[0.22, 0.12, 0.22]} />
                    </mesh>
                    {/* Kapak */}
                    <mesh position={[0, 0.065, 0]} material={materials.ral7035}>
                        <boxGeometry args={[0.24, 0.02, 0.24]} />
                    </mesh>
                    {/* Kapak Vidaları */}
                    <Bolt position={[0.1, 0.075, 0.1]} />
                    <Bolt position={[-0.1, 0.075, 0.1]} />
                    <Bolt position={[0.1, 0.075, -0.1]} />
                    <Bolt position={[-0.1, 0.075, -0.1]} />

                    {/* ATEX ETIKETI (SARI/SIYAH) */}
                    <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.safetyOrange}>
                        <planeGeometry args={[0.1, 0.1]} />
                    </mesh>
                    <mesh position={[0, 0.077, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.05, 0.05]} />
                        <meshBasicMaterial color="#000" /> {/* Şimşek sembolü niyetine siyah kare */}
                    </mesh>

                    {/* RAKOR (CABLE GLAND) */}
                    <mesh position={[0.11, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.galvanizedSteel}>
                        <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
                    </mesh>
                    <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.matteBlack}>
                        <cylinderGeometry args={[0.015, 0.015, 0.05, 16]} /> {/* Kablo */}
                    </mesh>
                </group>

                {/* Motor Etiketi (Yan Taraf) */}
                <mesh position={[-0.24, 0.05, -0.1]} rotation={[0, -Math.PI / 2, -0.2]} material={materials.galvanizedSteel}>
                    <planeGeometry args={[0.12, 0.2]} />
                </mesh>
            </group>

            {/* --- 4. ALT MONTAJ AYAĞI (MOUNTING FOOT) --- */}
            <group position={[0, -0.32, -0.25]}>
                <mesh material={materials.matteBlack}>
                    <boxGeometry args={[0.5, 0.05, 0.3]} />
                </mesh>
                <mesh position={[0, 0.05, 0]} material={materials.matteBlack}>
                    <boxGeometry args={[0.2, 0.1, 0.2]} /> {/* Motora bağlantı bloğu */}
                </mesh>
                {/* Ayak Delikleri */}
                <mesh position={[0.2, 0.026, 0.1]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.02, 0.02, 0.01, 8]} /></mesh>
                <mesh position={[-0.2, 0.026, 0.1]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.02, 0.02, 0.01, 8]} /></mesh>
                <mesh position={[0.2, 0.026, -0.1]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.02, 0.02, 0.01, 8]} /></mesh>
                <mesh position={[-0.2, 0.026, -0.1]} material={materials.galvanizedSteel}><cylinderGeometry args={[0.02, 0.02, 0.01, 8]} /></mesh>
            </group>

            {/* --- 5. İÇ PERVANE (ROTOS) --- */}
            <group ref={fanRef} position={[0, 0.25, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.15, 0.15, 0.38, 32]} />
                </mesh>
                {/* Sık Kanatlar */}
                {Array(32).fill(0).map((_, i) => (
                    <mesh key={i} rotation={[0, 0, i * (360 / 32) * Math.PI / 180]} position={[0.28, 0, 0]}>
                        <boxGeometry args={[0.18, 0.015, 0.38]} />
                        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
                    </mesh>
                ))}
            </group>

        </group>
    )
}

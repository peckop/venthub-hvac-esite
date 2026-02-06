import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFanMaterials } from '../materials/useFanMaterials'

export const JetFanModel: React.FC = () => {
    const materials = useFanMaterials()
    const fanRef = useRef<THREE.Group>(null)

    // JET FAN (High Fidelity Engineering)
    // Reference: User Image (Grey body, C-brackets, Deflectors, Terminal Box)

    useFrame((state, delta) => {
        if (fanRef.current) {
            fanRef.current.rotation.z -= delta * 25 // High RPM
        }
    })

    // --- GEOMETRY HELPERS ---

    // 1. Suspension Bracket Shape (C-Profile)
    // const bracketShape = useMemo(() => {
    const shape = new THREE.Shape()
    // C-Profile kesiti
    const w = 0.08, h = 0.4, t = 0.02
    // Alt (Taban)
    shape.moveTo(-w / 2, -h / 2)
    shape.lineTo(w / 2, -h / 2)
    // Sağ yan
    shape.lineTo(w / 2, h / 2)
    // Üst kıvrım
    shape.lineTo(0, h / 2)
    shape.lineTo(0, h / 2 - t)
    shape.lineTo(w / 2 - t, h / 2 - t)
    shape.lineTo(w / 2 - t, -h / 2 + t)
    shape.lineTo(-w / 2, -h / 2 + t)
    return shape
}, [])

return (
    <group position={[0, -0.2, 0]} scale={[0.9, 0.9, 0.9]} rotation={[0, -Math.PI / 4, 0]}>

        {/* A. ANA SİLİNDİRİK GÖVDE (Main Housing) */}
        <group rotation={[0, 0, Math.PI / 2]}>

            {/* 1. Giriş Susturucu Kovanı */}
            <mesh position={[0, 0.75, 0]} material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.36, 0.36, 0.8, 64]} />
            </mesh>

            {/* 2. Fan Motor Bölümü (Orta) */}
            <mesh position={[0, 0, 0]} material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.37, 0.37, 0.6, 64]} />
                {/* Hafif daha geniş (Gömlekli yapı hissi için) */}
            </mesh>

            {/* 3. Çıkış Susturucu Kovanı */}
            <mesh position={[0, -0.75, 0]} material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.36, 0.36, 0.8, 64]} />
            </mesh>

            {/* --- FLANŞ BİLEŞİMLERİ (Joints) --- */}
            {[0.35, -0.35].map((y, i) => (
                <group key={i} position={[0, y, 0]}>
                    {/* Flanş Halkası */}
                    <mesh material={materials.galvanizedSteel}>
                        <cylinderGeometry args={[0.385, 0.385, 0.03, 64]} />
                    </mesh>
                    {/* Civata Başları (Detay) */}
                    {Array(12).fill(0).map((_, j) => (
                        <mesh key={j} rotation={[0, (j / 12) * Math.PI * 2, 0]} position={[0.38, 0, 0]}>
                            <boxGeometry args={[0.02, 0.035, 0.02]} />
                            <meshStandardMaterial color="#64748b" roughness={0.5} />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* --- GİRİŞ (INLET) --- */}
            {/* Bellmouth (Aerodinamik Giriş Halkası) */}
            <group position={[0, 1.15, 0]}>
                <mesh material={materials.galvanizedSteel}>
                    <torusGeometry args={[0.36, 0.02, 16, 64]} />
                </mesh>
                {/* Tel Kafes (Wire Mesh) */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <circleGeometry args={[0.35, 32]} />
                    <meshStandardMaterial
                        color="#333"
                        transparent
                        opacity={0.3}
                        side={THREE.DoubleSide}
                        roughness={0.8}
                    />
                    {/* Mesh deseni için texture yerine wireframe trick veya ayrı geometri kullanılabilir. 
                             Performans için şeffaf map daha iyi ama burada procedural grid yapalım */}
                </mesh>
                {/* Izgara Telleri */}
                {Array(4).fill(0).map((_, k) => (
                    <mesh key={k} rotation={[0, k * Math.PI / 4, 0]}>
                        <boxGeometry args={[0.7, 0.01, 0.005]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                ))}
                {Array(3).fill(0).map((_, k) => (
                    <mesh key={`r-${k}`} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[(k + 1) * 0.08, (k + 1) * 0.08 + 0.005, 32]} />
                        <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
                    </mesh>
                ))}
            </group>

            {/* --- DEFLECTOR (Yönlendirici Kanatlar) --- */}
            <group position={[0, -1.25, 0]}>
                {/* Deflector Çerçevesi */}
                <mesh position={[0, 0.05, 0]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.37, 0.36, 0.2, 64, 1, true]} />
                    <meshStandardMaterial side={THREE.DoubleSide} {...materials.galvanizedSteel} />
                </mesh>

                {/* Kanatlar (Blades) - 3 Adet Eğrisel */}
                {[0.1, 0, -0.1].map((offset, idx) => (
                    <group key={idx} position={[0, 0, offset]} rotation={[0, 0, 0]}>
                        <mesh rotation={[0, Math.PI / 2, 0]}>
                            {/* Hafif kavisli plaka */}
                            <cylinderGeometry args={[0.4, 0.4, 0.65, 3, 1, true, 0, 0.5]} />
                            {/* Bu sadece bir segment, kavis şeklinde duracak */}
                            <meshStandardMaterial side={THREE.DoubleSide} {...materials.galvanizedSteel} />
                        </mesh>
                    </group>
                ))}

                {/* Deflector Yan Tutucular */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[0.74, 0.2, 0.02]} /> {/* Yatay mil */}
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
            </group>

        </group>

        {/* B. ASKI APARATLARI (Ceiling Suspension Brackets) */}
        {/* Gövdenin iki ucuna yakın */}
        {[0.6, -0.6].map((x, i) => (
            <group key={i} position={[x, 0.5, 0]}>
                {/* Kelepçe Çemberi (Gövdeyi saran) */}
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.12, 0]}>
                    <torusGeometry args={[0.37, 0.015, 8, 48, Math.PI]} />
                    <meshStandardMaterial {...materials.industrialSteel} />
                </mesh>

                {/* Dikey Askı Ayakları (L-Profile veya C-Profile) */}
                <mesh position={[0, 0.2, 0.25]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.08, 0.6, 0.01]} />
                </mesh>
                <mesh position={[0, 0.2, -0.25]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.08, 0.6, 0.01]} />
                </mesh>

                {/* Tavan Montaj Plakası (Üst) */}
                <mesh position={[0, 0.5, 0]} material={materials.industrialSteel}>
                    <boxGeometry args={[0.1, 0.02, 0.7]} />
                </mesh>

                {/* Takviye Üçgeni (Gusset Plate) */}
                <mesh position={[0, 0.05, 0.25]} rotation={[0, 0, 0]} material={materials.industrialSteel}>
                    <cylinderGeometry args={[0.04, 0.04, 0.02, 6]} /> {/* Somun simülasyonu */}
                </mesh>
            </group>
        ))}


        {/* C. KLEMENS KUTUSU & ELEKTRİK (Terminal Box) */}
        <group position={[0, 0.45, 0.25]}>
            {/* 1. Kutu */}
            <mesh material={materials.matteBlack}>
                <boxGeometry args={[0.2, 0.15, 0.12]} />
            </mesh>
            {/* Kapak Vidaları (4 köşe) */}
            {[0.08, -0.08].map(bx => [0.05, -0.05].map(by => (
                <mesh key={`${bx}-${by}`} position={[bx, by, 0.06]} material={materials.galvanizedSteel}>
                    <cylinderGeometry args={[0.005, 0.005, 0.01, 8]} />
                </mesh>
            )))}

            {/* 2. Etiket (Sarı Uyarı) */}
            <mesh position={[0, 0, 0.061]}>
                <planeGeometry args={[0.12, 0.08]} />
                <meshBasicMaterial color="#fbbf24" /> {/* Amber Warning */}
            </mesh>

            {/* 3. Spiral Kablo Rakoru ve Borusu */}
            <group position={[0.1, -0.05, 0]} rotation={[0, 0, -0.5]}>
                <mesh position={[0, -0.05, 0]} material={materials.matteBlack}>
                    <cylinderGeometry args={[0.025, 0.025, 0.08, 16]} /> {/* Rakor */}
                </mesh>

                {/* Spiral Boru (Flexible Conduit) - Motora giriş */}
                {/* Eğrisel bir tüp yapalım */}
                <CurveTube material={materials.matteBlack} />
            </group>
        </group>

        {/* D. ÖZELLİK ETİKETLERİ (Gövde Üzeri Decal) */}
        <group position={[-0.2, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Marka/Model Plakası */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[0.3, 0.15]} />
                <meshStandardMaterial color="#1e293b" roughnes={0.8} />
            </mesh>
            {/* Akış Yönü Oku (Flow Direction) */}
            <group position={[0.4, 0, 0]}>
                <mesh rotation={[0, 0, -Math.PI / 2]}>
                    <planeGeometry args={[0.2, 0.08]} />
                    <meshBasicMaterial color="#fff" />
                </mesh>
                <mesh position={[0, 0, 0.001]} rotation={[0, 0, -Math.PI / 2]}>
                    {/* Ok Ucu */}
                    <shapeGeometry args={[new THREE.Shape().moveTo(-0.05, -0.02).lineTo(-0.05, 0.02).lineTo(0.02, 0.02).lineTo(0.02, 0.04).lineTo(0.08, 0).lineTo(0.02, -0.04).lineTo(0.02, -0.02).lineTo(-0.05, -0.02)]} />
                    <meshBasicMaterial color="#000" />
                </mesh>
            </group>
        </group>

        {/* E. İÇ PERVANE (Rotor) - Sadece girişten belli belirsiz görünür */}
        <group ref={fanRef} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh material={materials.brushedAluminum}>
                <cylinderGeometry args={[0.14, 0.14, 0.12, 32]} />
            </mesh>
            {Array(8).fill(0).map((_, i) => (
                <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, 0]} position={[0.2, 0, 0]}>
                    <boxGeometry args={[0.25, 0.01, 0.08]} />
                    <meshStandardMaterial color="#ef4444" /> {/* Red Blades */}
                </mesh>
            ))}
        </group>

    </group>
)
}

// Yardımcı: Spiral Kablo Eğrisi
const CurveTube = ({ material }: { material: THREE.Material }) => {
    const path = useMemo(() => {
        // Klemens kutusundan çıkıp gövde motoruna giren 'S' şeklinde eğri
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -0.08, 0),
            new THREE.Vector3(0.05, -0.15, -0.05),
            new THREE.Vector3(0.02, -0.25, -0.1), // Motora giriş noktası
        ])
        return curve
    }, [])

    return (
        <mesh position={[0, 0, 0]} material={material}>
            <tubeGeometry args={[path, 20, 0.015, 8, false]} />
        </mesh>
    )
}

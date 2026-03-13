import { useMemo } from 'react'
import * as THREE from 'three'

export const useFanMaterials = () => {
    return useMemo(() => {
        // 1. Galvaniz Sac (Hafif pürüzlü, metalik gri)
        const galvanizedSteel = new THREE.MeshStandardMaterial({
            color: '#94a3b8', // Slate-400
            roughness: 0.6,
            metalness: 0.6,
            flatShading: false,
        })

        // 2. Endüstriyel Çelik (Daha koyu, daha metalik)
        const industrialSteel = new THREE.MeshStandardMaterial({
            color: '#64748b', // Slate-500
            roughness: 0.5,
            metalness: 0.8,
        })

        // 3. RAL 7035 (Standart Açık Gri Fan Boyası)
        const ral7035 = new THREE.MeshStandardMaterial({
            color: '#d1d5db', // Gray-300
            roughness: 0.3, // Parlak boya
            metalness: 0.2, // Az metalik
        })

        // 4. RAL 5010 (Endüstriyel Mavi - Detaylar için)
        const ral5010 = new THREE.MeshStandardMaterial({
            color: '#1d4ed8', // Blue-700
            roughness: 0.4,
            metalness: 0.3,
        })

        // 5. Fırçalı Alüminyum (Parlak, düşük roughness)
        const brushedAluminum = new THREE.MeshStandardMaterial({
            color: '#e2e8f0', // Slate-200
            roughness: 0.2,
            metalness: 0.9,
        })

        // 6. Mat Siyah Plastik/Boya (Izgaralar, Motor Kapakları)
        const matteBlack = new THREE.MeshStandardMaterial({
            color: '#050505', // Deep Industrial Black
            roughness: 0.9,
            metalness: 0.05,
        })

        // 7. Bakır (High-Shine Industrial Copper)
        const copper = new THREE.MeshStandardMaterial({
            color: '#ca6624', // Rich, vibrant copper
            roughness: 0.08, // Very shiny
            metalness: 1.0,
            side: THREE.DoubleSide,
        })

        // 8. Güvenlik Turuncusu (Uyarı levhaları, dönen parçalar)
        const safetyOrange = new THREE.MeshStandardMaterial({
            color: '#ea580c', // Orange-600
            roughness: 0.4,
            metalness: 0.1,
        })

        // 9. Döküm Demir (Industrial Grey - Lighter as requested)
        const castIron = new THREE.MeshStandardMaterial({
            color: '#4b5563', // Slate-600 (Lighter than before)
            roughness: 0.8,
            metalness: 0.4,
            flatShading: false,
        })

        // 10. Pirinç (Spark-Proof Inlet Ring)
        const brass = new THREE.MeshStandardMaterial({
            color: '#d4af37', // Metallic Brass
            roughness: 0.25,
            metalness: 0.9,
        })

        // 11. Kauçuk (Kablo ve Contalar)
        const rubber = new THREE.MeshStandardMaterial({
            color: '#171717', // Neutral-900
            roughness: 0.9,
            metalness: 0.0,
        })

        // 12. Vortice Green (Karakteristik Marka Rengi)
        const vorticeGreen = new THREE.MeshStandardMaterial({
            color: '#00B140',
            roughness: 0.4,
            metalness: 0.1,
        })

        // 13. Vortice High-Fidelity Materials (Mapped from standard ones)
        const chassisMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xf0f0f0),
            roughness: 0.35,
            metalness: 0.04,
        })

        const chassisInnerMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xd8d8d8),
            roughness: 0.55,
            metalness: 0.02,
            side: THREE.BackSide,
        })

        const bladesMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xb8c0cc),
            roughness: 0.22,
            metalness: 0.78,
        })

        const hubMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x1a1a1a),
            roughness: 0.5,
            metalness: 0.6,
        })

        const clampMat = vorticeGreen;

        const clampRingMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x3dbd3d),
            roughness: 0.3,
            metalness: 0.15,
        })

        const boxMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xe8e8e8),
            roughness: 0.45,
            metalness: 0.02,
        })

        const baseMat = industrialSteel;

        const screwMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x9aa0a8),
            roughness: 0.18,
            metalness: 0.9,
        })

        return {
            galvanizedSteel,
            industrialSteel,
            ral7035,
            ral5010,
            brushedAluminum,
            matteBlack,
            copper,
            safetyOrange,
            castIron,
            brass,
            rubber,
            vorticeGreen,
            chassisMat,
            chassisInnerMat,
            bladesMat,
            hubMat,
            clampMat,
            clampRingMat,
            boxMat,
            baseMat,
            screwMat
        }
    }, [])
}




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
            color: '#1e293b', // Slate-800
            roughness: 0.8,
            metalness: 0.1,
        })

        // 7. Bakır (Motor Sargıları)
        const copper = new THREE.MeshStandardMaterial({
            color: '#b45309', // Amber-700
            roughness: 0.4,
            metalness: 0.8,
        })

        // 8. Güvenlik Turuncusu (Uyarı levhaları, dönen parçalar)
        const safetyOrange = new THREE.MeshStandardMaterial({
            color: '#ea580c', // Orange-600
            roughness: 0.4,
            metalness: 0.1,
        })

        return {
            galvanizedSteel,
            industrialSteel,
            ral7035,
            ral5010,
            brushedAluminum,
            matteBlack,
            copper,
            safetyOrange
        }
    }, [])
}

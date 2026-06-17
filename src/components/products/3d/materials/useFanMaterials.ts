"use client";
import { DoubleSide,MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

/**
 * 3D FAN MATERYAL ÖNBELLEĞİ (Centralized Hardware Cache)
 * GPU bellek sızıntılarını önlemek için materyaller statik olarak tanımlanmalıdır.
 */
const MATERIALS_CACHE = {
    matteBlack: new MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.9,
        metalness: 0.1
    }),
    vorticeGreen: new MeshStandardMaterial({
        color: '#2d5a3a',
        roughness: 0.5,
        metalness: 0.3
    }),
    industrialSteel: new MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.8,
        roughness: 0.2
    }),
    brushedAluminum: new MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.1
    }),
    plasticWhite: new MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.3,
        metalness: 0.05
    }),
    transparentPlastic: new MeshPhysicalMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        transparent: true,
        opacity: 0.3
    }),
    ral7035: new MeshStandardMaterial({
        color: '#d1d5db',
        roughness: 0.7,
        metalness: 0.2
    }),
    boxMat: new MeshStandardMaterial({
        color: '#f3f4f6',
        roughness: 0.3,
        metalness: 0.1
    }),
    metallicBlue: new MeshStandardMaterial({
        color: '#1d4ed8',
        metalness: 0.8,
        roughness: 0.2
    }),
    rubber: new MeshStandardMaterial({
        color: '#0a0a0a',
        roughness: 1,
        metalness: 0
    }),
    castIron: new MeshStandardMaterial({
        color: '#374151',
        metalness: 0.4,
        roughness: 0.9
    }),
    const_chassisInnerMat: new MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.5,
        roughness: 0.5
    }),
    roofAntracite: new MeshStandardMaterial({
        color: '#1f2937',
        roughness: 0.8,
        metalness: 0.3
    }),
    roofBlade: new MeshStandardMaterial({
        color: '#111827',
        metalness: 0.6,
        roughness: 0.4
    }),
    smokeCoating: new MeshStandardMaterial({
        color: '#1a202c',
        roughness: 0.9,
        metalness: 0.2
    }),
    castBladeMat: new MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.7,
        roughness: 0.3
    }),
    zincPlate: new MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.6,
        roughness: 0.4
    }),
    boltMaterial: new MeshStandardMaterial({
        color: '#111',
        roughness: 0.8,
        metalness: 0.5
    }),
    fanRed: new MeshStandardMaterial({
        color: '#991b1b',
        roughness: 0.4,
        metalness: 0.2
    }),
    ductFanBladeRose: new MeshStandardMaterial({
        color: '#be123c',
        metalness: 0.6,
        roughness: 0.4
    }),
    jetOrange: new MeshStandardMaterial({
        color: '#FF6600',
        metalness: 0.6,
        roughness: 0.2,
        side: DoubleSide
    }),
    greyBox: new MeshStandardMaterial({
        color: '#9CA3AF',
        metalness: 0.3,
        roughness: 0.7,
    }),
    cableGrey: new MeshStandardMaterial({
        color: '#111827',
        metalness: 0.4,
        roughness: 0.7
    }),
    copper: new MeshStandardMaterial({
        color: '#f59e0b',
        metalness: 0.9,
        roughness: 0.2,
        side: DoubleSide
    }),
    boltChrome: new MeshStandardMaterial({
        color: '#e5e7eb',
        metalness: 0.9,
        roughness: 0.2
    }),
    motorSilver: new MeshStandardMaterial({
        color: '#c0c0c0',
        metalness: 0.7,
        roughness: 0.3
    }),
    zincGray: new MeshStandardMaterial({
        color: '#a1a1aa',
        metalness: 0.5,
        roughness: 0.5
    }),
    exproofBlack: new MeshStandardMaterial({
        color: '#111827',
        roughness: 0.6,
        metalness: 0.3
    }),
    warningYellow: new MeshBasicMaterial({
        color: '#fbbf24'
    }),
    safetyOrange: new MeshStandardMaterial({
        color: '#f97316',
        roughness: 0.2,
        metalness: 0.5
    }),
    glossyBlack: new MeshStandardMaterial({
        color: '#0a0a0a',
        metalness: 0.8,
        roughness: 0.2
    }),
    bladeBlack: new MeshStandardMaterial({
        color: '#111111',
        metalness: 0.4,
        roughness: 0.6
    }),
    logoRed: new MeshStandardMaterial({
        color: '#991b1b',
        metalness: 0.1,
        roughness: 0.8
    }),
    ral5010: new MeshStandardMaterial({
        color: '#0e4677',
        metalness: 0.6,
        roughness: 0.4
    }),
    industrialBlue: new MeshStandardMaterial({
        color: '#475569',
        metalness: 0.6,
        roughness: 0.4
    }),
    darkGrey: new MeshStandardMaterial({
        color: '#334155',
        metalness: 0.5,
        roughness: 0.5
    })
}

export type FanMaterials = ReturnType<typeof useFanMaterials>;

export const useFanMaterials = () => {
    return {
        ...MATERIALS_CACHE,
        clampMat: MATERIALS_CACHE.vorticeGreen,
        baseMat: MATERIALS_CACHE.industrialSteel,
        chassisInnerMat: MATERIALS_CACHE.const_chassisInnerMat,
        galvanizedSteel: MATERIALS_CACHE.industrialSteel,
    }
}

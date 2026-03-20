/**
 * P01-012: Medya Otoritesi (Media Authority)
 * VentHub projesi genelindeki tüm zengin medya varlıklarının (Video, 3D, Çizim)
 * merkezi tipleme tanımları.
 */

export type MediaProvider = 'cloudflare' | 'youtube' | 'vimeo' | 's3' | 'local'

export interface VideoMetadata {
    id: string
    provider: MediaProvider
    title?: string
    thumbnailUrl?: string
    aspectRatio?: '16:9' | '4:3' | '1:1' | 'vertical'
    options?: {
        autoPlay?: boolean
        loop?: boolean
        muted?: boolean
        controls?: boolean
    }
}

// @react-three/drei Environment Presets'e tam uyum
export type ThreeDEnvironment = 'studio' | 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'sunset' | 'warehouse'

export interface ThreeDMetadata {
    modelId: string
    format: 'glb' | 'gltf' | 'obj'
    modelUrl: string
    config?: {
        initialZoom?: number
        autoRotate?: boolean
        environment?: ThreeDEnvironment
        exposure?: number
        shadows?: boolean
    }
    hotspots?: Array<{
        position: [number, number, number]
        label: string
        description?: string
    }>
}

export interface TechnicalDrawingMetadata {
    id: string
    title: string
    format: 'pdf' | 'dwg' | 'svg' | 'png'
    url: string
    category: 'dimensions' | 'wiring' | 'mounting' | 'airflow'
    version?: string
    lastUpdated?: string
}

export type MediaMetadata = VideoMetadata | ThreeDMetadata | TechnicalDrawingMetadata

export interface MediaObject {
    id: string
    type: 'image' | 'video' | '3d' | 'drawing'
    metadata: MediaMetadata
    sortOrder?: number
    isActive: boolean
}

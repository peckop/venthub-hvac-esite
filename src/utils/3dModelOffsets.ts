
/**
 * 3D Model Offsets Utility
 * Centralizes positioning logic for models in different contexts.
 * 
 * Contexts:
 * - 'grounded': Ürün Detay Sayfası (Model tabanı zemine oturur)
 * - 'centered': Kategori Kartları / Overlay (Geometrik merkez y=0)
 * - 'orbital':  Anasayfa Orbital Vitrin (Bağımsız ayarlanabilir)
 */

type ModelOffset = [number, number, number]

interface ModelConfig {
    grounded: ModelOffset
    centered: ModelOffset
    orbital: ModelOffset
}

// Default values if no specific config is found
const DEFAULT_CONFIG: ModelConfig = {
    grounded: [0, -0.55, 0],
    centered: [0, 0, 0],
    orbital: [0, 0, 0]
}

// Configuration for each Model Type
const MODEL_CONFIGS: Record<string, ModelConfig> = {
    'RoofFanModel': {
        grounded: [0, -1.0, 0],
        centered: [0, 0, 0],
        orbital: [0, -0.6, 0]   // Çok büyük ve yüksekte → aşağı çek
    },
    'JetFanModel': {
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    'DuctFanModel': {
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    'RectangularDuctFanModel': {
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    // NOT: SnailFanModel ve ExproofFanModel FanRenderer'da aynı 3D modeli kullanıyor.
    // Bu nedenle tüm context değerleri birebir aynı olmalı.
    'SnailFanModel': {
        grounded: [0, -0.35, 0],
        centered: [0, 0, 0],
        orbital: [0, -0.3, 0]
    },
    'PlugFanModel': {
        grounded: [0, -0.65, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.2, 0]
    },
    'NicotraFanModel': {
        grounded: [0, -0.65, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    'SquarePlateFanModel': {
        grounded: [0, -0.6, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    'SmokeExhaustFanModel': {
        grounded: [0, -0.4, -0.2],
        centered: [0, 0, 0],
        orbital: [0, 0, 0]
    },
    'ExproofFanModel': {
        grounded: [0, -0.35, 0],
        centered: [0, 0, 0],
        orbital: [0, -0.3, 0]   // Santrifüj ile aynı model → aynı değer
    },
    'DomesticFanModel': {
        grounded: [0, -0.22, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    },
    'RoundDuctFanModel': {
        grounded: [0, 0.1, 0],
        centered: [0, 0, 0],
        orbital: [0, 0, 0]
    },
    'AxialFanModel': {
        grounded: [0, -0.55, 0],
        centered: [0, 0, 0],
        orbital: [0, 0.1, 0]
    }
}

export type ModelContext = 'grounded' | 'centered' | 'orbital'

export function getModelOffset(
    modelType: string | undefined,
    slug: string | undefined,
    context: ModelContext = 'grounded'
): ModelOffset {

    // 1. Explicit Model Type Match
    if (modelType && MODEL_CONFIGS[modelType]) {
        return MODEL_CONFIGS[modelType][context];
    }

    // 2. Slug-based Fallback (matching logic from Product3DViewer)
    const s = slug ? slug.toLowerCase() : ''
    let config = DEFAULT_CONFIG;

    // Precise matching based on Category Registry slugs
    if (s.includes('cati') || s.includes('roof')) config = MODEL_CONFIGS['RoofFanModel']
    else if (s.includes('basinc') || s.includes('yangin') || s.includes('aksiyal')) config = MODEL_CONFIGS['AxialFanModel']
    else if (s.includes('jet') || s.includes('otopark')) config = MODEL_CONFIGS['JetFanModel']
    else if (s.includes('duman') || s.includes('smoke')) config = MODEL_CONFIGS['SmokeExhaustFanModel']
    else if (s.includes('duvar') && (s.includes('kompakt') || s.includes('aksiyal'))) config = MODEL_CONFIGS['SquarePlateFanModel']
    else if (s.includes('kanal') || s.includes('yuvarlak')) config = MODEL_CONFIGS['DuctFanModel']
    else if (s.includes('dikdortgen') || s.includes('prizmatik') || s.includes('siginak') || s.includes('hucreli')) config = MODEL_CONFIGS['RectangularDuctFanModel']
    // Santrifüj ve Exproof → FanRenderer'da ikisi de ExproofFanModel kullanıyor → aynı config
    else if (s.includes('salyangoz') || s.includes('santrifuj') || s.includes('exproof') || s.includes('atex') || s.includes('endustriyel')) config = MODEL_CONFIGS['ExproofFanModel']
    else if (s.includes('plug')) config = MODEL_CONFIGS['PlugFanModel']
    else if (s.includes('nicotra') || s.includes('gebhardt')) config = MODEL_CONFIGS['NicotraFanModel']
    else if (s.includes('konut') || s.includes('banyo') || s.includes('wc')) config = MODEL_CONFIGS['DomesticFanModel']

    // Return requested context offset
    return config[context];
}

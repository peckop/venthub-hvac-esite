
/**
 * 3D Model Offsets Utility
 * Centralizes positioning logic for models in different contexts.
 * 
 * Contexts:
 * - 'grounded': For Product Detail Page (Model feet/base touching the floor at y=0)
 * - 'centered': For Category Cards (Model geometric center at y=0)
 */

type ModelOffset = [number, number, number]

interface ModelConfig {
    grounded: ModelOffset
    centered: ModelOffset
}

// Default values if no specific config is found
const DEFAULT_CONFIG: ModelConfig = {
    grounded: [0, -0.55, 0], // Axial Fan default (Radius ~0.55)
    centered: [0, 0, 0]      // Assumes model is naturally centered
}

// Configuration for each Model Type
const MODEL_CONFIGS: Record<string, ModelConfig> = {
    'RoofFanModel': {
        // Geometric Analysis:
        // MinY: 0 (Base bottom)
        // MaxY: 1.38 (Top cap)
        // Center: 0.69
        grounded: [0, -1.0, 0], // Keeps feet on ground
        centered: [0, -0.69, 0] // Geometric center
    },
    'JetFanModel': {
        // Geometric Analysis:
        // Horizontal cylinder.
        // MinY: -0.34 (Mounting feet)
        // MaxY: +0.34 (Top flange)
        // Center: 0
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0]
    },
    'DuctFanModel': {
        // Geometric Analysis:
        // MinY: -0.6 (Bottom cap)
        // MaxY: +0.6 (Top cap)
        // Center: 0
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0]
    },
    'RectangularDuctFanModel': {
        // Geometric Analysis:
        // MinY: -0.35 (Flange bottom)
        // MaxY: +0.425 (Terminal box top)
        // Center: ~0.04 -> Offset -0.04 (approx 0)
        grounded: [0, -0.7, 0],
        centered: [0, 0, 0]
    },
    'SnailFanModel': {
        // Geometric Analysis:
        // MinY: -0.4 (Cylinder bottom edge relative to center)
        // MaxY: 0.8 (Cylinder top edge)
        // Center: 0.2
        grounded: [0, -0.7, 0],
        centered: [0, -0.2, 0]
    },
    'PlugFanModel': {
        // Geometric Analysis:
        // MaxY: 0.4 (Impeller)
        // MinY: -0.475 (Base frame)
        // Center: -0.0375 -> Offset +0.04
        grounded: [0, -0.65, 0],
        centered: [0, 0.04, 0]
    },
    'NicotraFanModel': {
        grounded: [0, -0.65, 0],
        centered: [0, -0.3, 0]
    },
    'SquarePlateFanModel': {
        grounded: [0, -0.6, 0],
        centered: [0, 0, 0]
    },
    'SmokeExhaustFanModel': {
        grounded: [0, -0.4, -0.2],
        centered: [0, 0, 0]
    },
    'ExproofFanModel': {
        // Geometric Analysis:
        // MaxY: 0.79 (Scroll top)
        // MinY: -0.01 (Scroll bottom)
        // Center: 0.39 -> Offset -0.4
        grounded: [0, -0.35, 0],
        centered: [0, -0.4, 0]
    },
    'DomesticFanModel': {
        grounded: [0, -0.22, 0],
        centered: [0, 0, 0]
    },
    'RoundDuctFanModel': {
        grounded: [0, 0.1, 0],
        centered: [0, 0, 0]
    },
    'AxialFanModel': {
        grounded: [0, -0.55, 0],
        centered: [0, 0, 0]
    }
}

export type ModelContext = 'grounded' | 'centered'

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

    if (s.includes('cati') || s.includes('atı')) config = MODEL_CONFIGS['RoofFanModel']
    else if (s.includes('jet') || s.includes('otopark')) config = MODEL_CONFIGS['JetFanModel']
    else if (s.includes('kanal') || s.includes('yuvarlak')) config = MODEL_CONFIGS['DuctFanModel']
    else if (s.includes('siginak') || s.includes('hücreli') || s.includes('dikdortgen') || s.includes('prizmatik')) config = MODEL_CONFIGS['RectangularDuctFanModel']
    else if (s.includes('salyangoz') || s.includes('santrifuj')) config = MODEL_CONFIGS['SnailFanModel']
    else if (s.includes('plug')) config = MODEL_CONFIGS['PlugFanModel']
    else if (s.includes('nicotra') || s.includes('gebhardt')) config = MODEL_CONFIGS['NicotraFanModel']
    else if (s.includes('duvar') && s.includes('kompakt')) config = MODEL_CONFIGS['SquarePlateFanModel']
    else if ((s.includes('duman') || s.includes('smoke')) && !s.includes('dikdortgen')) config = MODEL_CONFIGS['SmokeExhaustFanModel']
    else if (s.includes('exproof') || s.includes('atex')) config = MODEL_CONFIGS['ExproofFanModel']
    else if (s.includes('konut') || s.includes('banyo') || s.includes('wc')) config = MODEL_CONFIGS['DomesticFanModel']

    // Return requested context offset
    return config[context];
}

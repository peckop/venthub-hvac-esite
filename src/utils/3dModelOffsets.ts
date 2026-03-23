
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
    grounded: { position: ModelOffset; rotation?: ModelOffset; scale?: number }
    centered: { position: ModelOffset; rotation?: ModelOffset; scale?: number }
    orbital: { position: ModelOffset; rotation?: ModelOffset; scale?: number }
}

// Default values if no specific config is found
const DEFAULT_CONFIG: ModelConfig = {
    grounded: { position: [0, -0.55, 0], scale: 1 },
    centered: { position: [0, 0, 0], scale: 1 },
    orbital: { position: [0, 0, 0], scale: 1 }
}

// Configuration for each Model Type
const MODEL_CONFIGS: Record<string, ModelConfig> = {
    // ---------------------------------------------------------
    // 1. ANA KATEGORİLER (Main Categories)
    // ---------------------------------------------------------
    'AirCurtainModel': { // Hava Perdesi Modeli
        grounded: {
            position: [0, -0.35, 0],
            rotation: [0, Math.PI / 2, 0],
            scale: 1
        },
        centered: {
            position: [0, 0, 0],
            rotation: [0, Math.PI / 2, 0],
            scale: 1.2
        },
        orbital: {
            position: [0, 0.3, 0],
            rotation: [0, Math.PI / 2, 0],
            scale: 1
        }
    },
    'AirPurifierModel': { // Hava Temizleyici Modeli
        grounded: { position: [0, 0.05, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.05, 0], scale: 1 }
    },
    'DehumidifierModel': { // Nem Alma Cihazı Modeli
        grounded: { position: [0, 0, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'HRVModel': { // Isı Geri Kazanım Cihazı Modeli
        grounded: { position: [0, 0, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },

    // ---------------------------------------------------------
    // 2. FAN ALT KATEGORİLERİ (Fan Subcategories)
    // ---------------------------------------------------------
    'AxialFanModel': { // Aksiyal Fan Modeli
        grounded: { position: [0, -0.55, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'DomesticFanModel': { // Ev Tipi Fan (Banyo/WC) Modeli
        grounded: { position: [0, -0.22, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'DuctFanModel': { // Kanal Tipi Fan (Yuvarlak) Modeli
        grounded: { position: [0, -0.7, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'ExproofFanModel': { // Exproof Fan Modeli
        grounded: { position: [0, -0.35, 0], scale: 1 },
        centered: { position: [0, -0.2, 0], scale: 1 },
        orbital: { position: [0, -0.35, 0], scale: 1 }
    },
    'JetFanModel': { // Jet Fan (Otopark) Modeli
        grounded: { position: [0, -0.7, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'NicotraFanModel': { // Nicotra/Gebhardt (Geriye Eğimli) Fan Modeli
        grounded: { position: [0, -0.65, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'PlugFanModel': { // Plug Fan Modeli
        grounded: { position: [0, -0.65, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.2, 0], scale: 1 }
    },
    'RectangularDuctFanModel': { // Dikdörtgen Kanal Tipi Fan Modeli
        grounded: { position: [0, -0.7, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },
    'RoofFanModel': { // Çatı Tipi Fan Modeli
        grounded: { position: [0, -1.0, 0], scale: 1 },
        centered: { position: [0, -0.1, 0], scale: 1 },
        orbital: { position: [0, -0.6, 0], scale: 1 }
    },
    'RoundDuctFanModel': { // Yuvarlak Kanal Tipi Fan Modeli
        grounded: { position: [0, 0.1, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'SilentChannelFanModel': { // Sessiz Kanal Tipi Fan Modeli
        grounded: { position: [0, 0.1, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'SmokeExhaustFanModel': { // Duman Egzoz Fan Modeli
        grounded: { position: [0, -0.4, -0.2], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'SnailFanModel': { // Salyangoz / Santrifüj Fan Modeli
        grounded: { position: [0, -0.35, 0], scale: 1 },
        centered: { position: [0, -0.2, 0], scale: 1 },
        orbital: { position: [0, -0.3, 0], scale: 1 }
    },
    'WallMountedCompactFanModel': { // Duvar Tipi Kompakt Aksiyel Fan Modeli
        grounded: { position: [0, -0.6, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0.1, 0], scale: 1 }
    },

    // ---------------------------------------------------------
    // 3. DİĞER ALT KATEGORİLER (Other Subcategories)
    // ---------------------------------------------------------
    'AccessoryModel': { // Aksesuar Modeli
        grounded: { position: [0, 0, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'FlexibleDuctModel': { // Esnek Hava Kanalı Modeli
        grounded: { position: [0, 0, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    },
    'SpeedControlModel': { // Hız Kontrol Cihazı / Otomasyon Modeli
        grounded: { position: [0, 0, 0], scale: 1 },
        centered: { position: [0, 0, 0], scale: 1 },
        orbital: { position: [0, 0, 0], scale: 1 }
    }
}

export type ModelContext = 'grounded' | 'centered' | 'orbital'

export interface ModelPlacement {
    position: ModelOffset
    rotation: ModelOffset
    scale?: number
}

export function getModelPlacement(
    modelType: string | undefined,
    slug: string | undefined,
    context: ModelContext = 'grounded'
): ModelPlacement {

    // 1. Explicit Model Type Match
    if (modelType && MODEL_CONFIGS[modelType]) {
        const p = MODEL_CONFIGS[modelType][context];
        return {
            position: p.position,
            rotation: p.rotation || [0, 0, 0],
            scale: p.scale || 1
        };
    }

    // 2. Slug-based Fallback (matching logic from Product3DViewer)
    const s = slug ? slug.toLowerCase() : ''
    let config: ModelConfig = DEFAULT_CONFIG;

    // Precise matching based on Category Registry slugs
    // Hiyerarşi: FanRenderer.tsx ile BİREBİR SENKRONİZE
    // ---------------------------------------------------------

    // DEBUG: Hangi modelin seçildiğini görmek için
    // console.warn(`[3D-Offset] Slug: ${s}, ModelType: ${modelType || 'N/A'}`);

    // 1. SPESİFİK ÜRÜN GRUPLARI
    if (s.includes('perde') || s.includes('isitici') || s.includes('ortam-havali')) {
        config = MODEL_CONFIGS['AirCurtainModel'];
    }
    else if (s.includes('sessiz') || s.includes('silent') || s.includes('lineo') || s.includes('td')) {
        config = MODEL_CONFIGS['DuctFanModel']; // Silent modeller Kanal Tipi/Yuvarlak offsetlerini kullanır
    }
    else if (s.includes('jet') || s.includes('otopark')) {
        config = MODEL_CONFIGS['JetFanModel'];
    }

    // 2. SPESİFİK FAN TİPLERİ (Form Faktörü Öncelikli)

    // Exproof & ATEX (ÖNCELİKLİ - Salyangozdan ve Çatıdan Önce)
    else if (s.includes('exproof') || s.includes('ex-proof') || s.includes('atex') || s.includes('endustriyel')) {
        config = MODEL_CONFIGS['ExproofFanModel'];
    }
    else if (s.includes('cati') || s.includes('roof')) {
        config = MODEL_CONFIGS['RoofFanModel'];
    }
    // Dikdörtgen / Prizmatik / Hücreli
    else if (s.includes('dikdortgen') || s.includes('prizmatik') || s.includes('siginak') || s.includes('taze-hava') || s.includes('hücreli') || s.includes('hucreli') || s.includes('kabinli')) {
        config = MODEL_CONFIGS['RectangularDuctFanModel'];
    }
    // Kanal Tipi (Yuvarlak)
    else if (s.includes('kanal') || s.includes('yuvarlak')) {
        config = MODEL_CONFIGS['DuctFanModel'];
    }
    // Kare Plakalı (Duvar Tipi Kompakt)
    else if (s.includes('duvar') && s.includes('kompakt')) {
        config = MODEL_CONFIGS['WallMountedCompactFanModel']; // [FIX] Key Updated
    }
    // Ev Tipi / Duvar Tipi Standart
    else if (s.includes('konut') || s.includes('banyo') || s.includes('wc') || s.includes('quattro') || s.includes('duvar')) {
        config = MODEL_CONFIGS['DomesticFanModel'];
    }
    // Hava Temizleyiciler
    else if (s.includes('temizleyici') || s.includes('purifier') || s.includes('filtre') || s.includes('anti-viral')) {
        config = MODEL_CONFIGS['AirPurifierModel'];
    }

    // Santrifüj / Salyangoz / Radyal
    else if (s.includes('salyangoz') || s.includes('santrifuj') || s.includes('radyal')) {
        config = MODEL_CONFIGS['SnailFanModel'];
    }
    // Duman Egzoz
    else if (s.includes('smoke') || s.includes('duman')) {
        config = MODEL_CONFIGS['SmokeExhaustFanModel'];
    }
    // Basınçlandırma / Yangın
    else if (s.includes('basinc') || s.includes('yangin') || s.includes('merdiven')) {
        config = MODEL_CONFIGS['AxialFanModel'];
    }
    // Aksiyal (Genel)
    else if (s.includes('aksiyal') || s.includes('axial')) {
        config = MODEL_CONFIGS['AxialFanModel'];
    }
    // Plug Fan
    else if (s.includes('plug')) {
        config = MODEL_CONFIGS['PlugFanModel'];
    }
    // Marka Bazlı (Nicotra)
    else if (s.includes('nicotra') || s.includes('gebhardt') || s.includes('ddi') || s.includes('at')) {
        config = MODEL_CONFIGS['NicotraFanModel'];
    }
    // Diğerleri
    else if (s.includes('nem-alma')) {
        config = MODEL_CONFIGS['DehumidifierModel'];
    }
    else if (s.includes('isi-geri')) {
        config = MODEL_CONFIGS['HRVModel'];
    }
    else if (s.includes('flexible')) {
        config = MODEL_CONFIGS['FlexibleDuctModel'];
    }
    else if (s.includes('aksesuar') || s.includes('yedek')) {
        config = MODEL_CONFIGS['AccessoryModel'];
    }
    else if (s.includes('hiz') || s.includes('kontrol')) {
        config = MODEL_CONFIGS['SpeedControlModel'];
    }
    // Return requested context placement
    const placement = config[context];
    return {
        position: placement.position,
        rotation: placement.rotation || [0, 0, 0],
        scale: placement.scale || 1
    };
}




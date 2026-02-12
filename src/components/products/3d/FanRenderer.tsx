import React, { Suspense } from 'react'
import { JetFanModel } from './types/JetFanModel'
import { RoofFanModel } from './types/RoofFanModel'
import { DuctFanModel, RectangularDuctFanModel } from './types/DuctFanModel'
import { AxialFanModel } from './types/AxialFanModel'
import { DomesticFanModel } from './types/DomesticFanModel'
import { SilentChannelFanModel } from './types/SilentChannelFanModel'
import { SmokeExhaustFanModel } from './types/SmokeExhaustFanModel'
import { NicotraFanModel } from './types/NicotraFanModel'
import { SnailFanModel } from './types/SnailFanModel'
import { ExproofFanModel } from './types/ExproofFanModel'
import { PlugFanModel } from './types/PlugFanModel'
import { SquarePlateFanModel } from './types/SquarePlateFanModel'

interface FanRendererProps {
    slug: string
    modelType?: string  // YENİ: Veritabanından gelen model tipi (categories.metadata.model_type)
    scale?: number
}

// Model tipi -> Bileşen eşleştirmesi (Merkezi Kayıt)
const MODEL_COMPONENTS = {
    'AxialFanModel': AxialFanModel,
    'RoofFanModel': RoofFanModel,
    'SquarePlateFanModel': SquarePlateFanModel,
    'DomesticFanModel': DomesticFanModel,
    'DuctFanModel': DuctFanModel,
    'RectangularDuctFanModel': RectangularDuctFanModel,
    'SilentChannelFanModel': SilentChannelFanModel,
    'SmokeExhaustFanModel': SmokeExhaustFanModel,
    'NicotraFanModel': NicotraFanModel,
    'SnailFanModel': SnailFanModel,
    'ExproofFanModel': ExproofFanModel,
    'PlugFanModel': PlugFanModel,
    'JetFanModel': JetFanModel,
} as const

export const FanRenderer: React.FC<FanRendererProps> = ({ slug, modelType, scale = 1 }) => {

    const renderFan = () => {
        // ============================================================
        // 1. ÖNCELİK: Veritabanından gelen model_type kullan
        // ============================================================
        if (modelType && modelType in MODEL_COMPONENTS) {
            const ModelComponent = MODEL_COMPONENTS[modelType as keyof typeof MODEL_COMPONENTS]
            return <ModelComponent />
        }

        // ============================================================
        // 2. FALLBACK: Eski slug bazlı mantık (geriye dönük uyumluluk)
        // ============================================================
        const s = slug ? slug.toLowerCase() : '';

        // === JET FANLAR ===
        if (s.includes('jet') || s.includes('otopark')) return <JetFanModel />

        // === ÇATI FANLARI ===
        // "Basınçlandırma" buraya girmemeli, aşağıda özel kuralı var.
        if (s.includes('cati') || s.includes('atı')) return <RoofFanModel />

        // === NICOTRA / GEBHARDT (Endüstriyel/Ağır Hizmet - Double Inlet) ===
        if (s.includes('nicotra') || s.includes('gebhardt') || s.includes('ddi') || s.includes('at')) return <NicotraFanModel />

        // === PLUG FANLAR (Kasa Yok, Sadece Çark ve Motor) ===
        if (s.includes('plug')) return <PlugFanModel />

        // === EX-PROOF / SALYANGOZ (Özel Bakır Halkalı Model) ===
        if (s.includes('exproof') || s.includes('ex-proof') || s.includes('atex')) return <ExproofFanModel />

        // === ENDÜSTRİYEL / SANTRIFUJ / SALYANGOZ ===
        if (s.includes('endustriyel') || s.includes('santrifuj') || s.includes('salyangoz')) return <ExproofFanModel />

        // === BASINÇLANDIRMA FANLARI ===
        // Çatı fanı ile karışmamalı. Genellikle dik silindirik aksiyal fanlardır.
        if (s.includes('basinc') || s.includes('yangin') || s.includes('merdiven')) return <AxialFanModel />

        // === DUVAR TİPİ KOMPAKT AKSIYAL FANLAR (TURUNCU PERVANELİ KARE PLAKA) ===
        // "Duvar Tipi Kompakt Aksiyal Fanlar" slug'ı: duvar-tipi-kompakt-aksiyal-fanlar
        // Bu, turuncu pervaneli kare plaka fan modelidir (SquarePlateFanModel)
        if (s.includes('duvar') && s.includes('kompakt')) return <SquarePlateFanModel />

        // === AKSİYAL (SİLİNDİRİK) ===
        if (s.includes('aksiyal') || s.includes('axial')) return <AxialFanModel />

        // === DUVAR TİPİ (KARE PLAKALI - KONUT TİPİ) ===
        // Sadece "duvar" içeren ama "aksiyal" veya "kompakt" içermeyen fanlar
        if (s.includes('duvar')) return <DomesticFanModel />

        // === SESSİZ (SILENT) KANAL TİPİ ===
        if (s.includes('sessiz') || s.includes('silent') || s.includes('lineo') || s.includes('td')) return <SilentChannelFanModel />

        // === SIĞINAK FANLARI (Taze Hava Ünitesi / Aspiratör) ===
        // Kanal tipi ile aynı olmamalı. Genellikle kutu profillidir (Prizmatik).
        if (s.includes('siginak') || s.includes('taze-hava') || s.includes('hücreli') || s.includes('hucreli')) return <RectangularDuctFanModel />

        // === DUMAN EGZOZ FANLARI ===
        // Nicotra ile karışmamalı (Nicotra yukarıda yakalandı).
        if ((s.includes('duman') || s.includes('smoke')) && !s.includes('dikdortgen') && !s.includes('kanal')) return <SmokeExhaustFanModel />

        // === KONUT / BANYO TİPİ ===
        if (s.includes('konut') || s.includes('banyo') || s.includes('wc') || s.includes('quattro')) return <DomesticFanModel />

        // === KANAL TİPİ (DİKDÖRTGEN) ===
        if (s.includes('dikdortgen') || s.includes('prizmatik') || s.includes('isi-geri')) return <RectangularDuctFanModel />

        // === KANAL TİPİ (YUVARLAK / KLASİK) ===
        if (s.includes('kanal') || s.includes('yuvarlak')) return <DuctFanModel />

        // === YEDEK PARÇA ===
        if (s.includes('yedek') || s.includes('aksesuar')) return null;

        // === DEFAULT ===
        // console.warn(`[FanRenderer] Unknown fan type: "${s}". Defaulting to DuctFanModel.`);
        return <DuctFanModel />
    }

    return (
        <group scale={scale}>
            <Suspense fallback={null}>
                {renderFan()}
            </Suspense>
        </group>
    )
}

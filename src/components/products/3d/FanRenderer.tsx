import React, { Suspense, useEffect } from 'react'
import { JetFanModel } from './types/JetFanModel'
import { RoofFanModel } from './types/RoofFanModel'
import { DuctFanModel } from './types/DuctFanModel' // RoundDuctFanModel renamed to DuctFanModel
import { AxialFanModel } from './types/AxialFanModel'
import { DomesticFanModel } from './types/DomesticFanModel'
import { SilentChannelFanModel } from './types/SilentChannelFanModel'
import { SmokeExhaustFanModel } from './types/SmokeExhaustFanModel'
// import { PlugFanModel } from './types/PlugFanModel' // Not implemented yet



interface FanRendererProps {
    slug: string
    scale?: number
}

export const FanRenderer: React.FC<FanRendererProps> = ({ slug, scale = 1 }) => {

    useEffect(() => {
        // Debug için slug kontrolü
        // console.log('Current rotation:', currentRotation.y)
    }, [slug]);

    // Slug'a göre model seçimi
    const renderFan = () => {
        const s = slug ? slug.toLowerCase() : '';

        // === JET FANLAR ===
        if (s.includes('jet') || s.includes('otopark')) return <JetFanModel />

        // === ÇATI FANLARI ===
        if (s.includes('cati') || s.includes('atı') || s.includes('basinc')) return <RoofFanModel />

        // === NICOTRA / GEBHARDT ===
        // if (s.includes('nicotra') || s.includes('gebhardt') || s.includes('ddi') || s.includes('at')) return <NicotraFanModel />

        // === SNAPLGANYOZ / SANTRİFÜJ / EXPROOF ===
        // if (s.includes('endustriyel') || s.includes('santrifuj') || s.includes('salyangoz') || s.includes('exproof') || s.includes('ex-proof')) return <SnailFanModel />

        // === PLUG FANLAR ===
        // if (s.includes('plug')) return <PlugFanModel />

        // === SESSİZ (SILENT) KANAL TİPİ (ESKİ YEŞİL MODEL) ===
        if (s.includes('sessiz') || s.includes('silent') || s.includes('lineo') || s.includes('td')) return <SilentChannelFanModel />

        // === DUMAN EGZOZ FANLARI (YUVARLAK/AXIAL TİP) ===
        // "duman" VE "egzoz" veya sadece "duman" geçiyorsa ve dikdörtgen değilse
        if ((s.includes('duman') || s.includes('smoke')) && !s.includes('dikdortgen') && !s.includes('kanal')) return <SmokeExhaustFanModel />

        // === KONUT / BANYO TİPİ ===
        if (s.includes('konut') || s.includes('banyo') || s.includes('wc') || s.includes('quattro')) return <DomesticFanModel />

        // === DUVAR TİPİ (KARE PLAKALI) ===
        // if (s.includes('duvar')) return <SquarePlateFanModel />

        // === AKSİYAL (SİLİNDİRİK) ===
        if (s.includes('aksiyal') || s.includes('axial')) return <AxialFanModel />

        // === KANAL TİPİ (DİKDÖRTGEN) ===
        if (s.includes('dikdortgen') || s.includes('duman') || s.includes('siginak') || s.includes('sessiz') || s.includes('kabinli') || s.includes('prizmatik') || s.includes('isi-geri')) return <DuctFanModel /> // Was Rectangular...

        // === KANAL TİPİ (YUVARLAK) ===
        // Default kanal tipi
        if (s.includes('kanal') || s.includes('yuvarlak')) return <DuctFanModel />

        // === YEDEK PARÇA ===
        // Eğer FanRenderer yanlışlıkla yedek parça için çağrılırsa diye
        if (s.includes('yedek') || s.includes('aksesuar')) return null; // Category3DIcon halletmeli

        // === DEFAULT ===
        // Bilinmeyen fan türü için RoundDuctFanModel
        console.warn(`[FanRenderer] Unknown fan type: "${s}". Defaulting to RoundDuctFanModel.`);

        if (s.includes('kanal-tipi-fanlar')) return <DuctFanModel />
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

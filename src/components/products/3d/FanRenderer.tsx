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
    modelType?: string  // Veritabanından gelen model tipi
    scale?: number
    explode?: number
    onPartClick?: (partName: string) => void
    selectedPart?: string | null
    isolatedPart?: string | null
    hiddenParts?: string[]
    displayStyle?: 'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines'
    enableTooltip?: boolean
}

// Model tipi -> Bileşen eşleştirmesi
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

export const FanRenderer: React.FC<FanRendererProps> = ({
    slug,
    modelType,
    scale = 1,
    explode = 0,
    onPartClick,
    selectedPart,
    isolatedPart,
    hiddenParts = [],
    displayStyle = 'shaded',
    enableTooltip = false
}) => {

    const renderFan = () => {
        // 1. ÖNCELİK: Veritabanı model_type
        if (modelType && modelType in MODEL_COMPONENTS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ModelComponent = MODEL_COMPONENTS[modelType as keyof typeof MODEL_COMPONENTS] as any
            return <ModelComponent
                slug={slug}
                scale={scale}
                explode={explode}
                onPartClick={onPartClick}
                selectedPart={selectedPart}
                isolatedPart={isolatedPart}
                hiddenParts={hiddenParts}
                displayStyle={displayStyle}
                enableTooltip={enableTooltip}
            />
        }

        // 2. FALLBACK: Slug bazlı mantık
        const s = slug ? slug.toLowerCase() : '';

        // TODO: Diğer modeller için de displayStyle prop'unu geçirmek gerekebilir.
        // Şimdilik sadece SilentChannelFanModel ve generic yapı için ekliyoruz.

        if (s.includes('jet') || s.includes('otopark')) return <JetFanModel />
        if (s.includes('cati') || s.includes('atı')) return <RoofFanModel />
        if (s.includes('nicotra') || s.includes('gebhardt') || s.includes('ddi') || s.includes('at')) return <NicotraFanModel />
        if (s.includes('plug')) return <PlugFanModel />
        if (s.includes('exproof') || s.includes('ex-proof') || s.includes('atex')) return <ExproofFanModel />
        if (s.includes('endustriyel') || s.includes('santrifuj') || s.includes('salyangoz')) return <ExproofFanModel />
        if (s.includes('basinc') || s.includes('yangin') || s.includes('merdiven')) return <AxialFanModel />
        if (s.includes('duvar') && s.includes('kompakt')) return <SquarePlateFanModel />
        if (s.includes('aksiyal') || s.includes('axial')) return <AxialFanModel />
        if (s.includes('duvar')) return <DomesticFanModel />

        // SESSİZ KANAL TİPİ (Interaction Destekli)
        if (s.includes('sessiz') || s.includes('silent') || s.includes('lineo') || s.includes('td')) {
            return <SilentChannelFanModel
                explode={explode}
                onPartClick={onPartClick}
                selectedPart={selectedPart}
                isolatedPart={isolatedPart}
                hiddenParts={hiddenParts}
                displayStyle={displayStyle}
                enableTooltip={enableTooltip}
            />
        }

        if (s.includes('siginak') || s.includes('taze-hava') || s.includes('hücreli') || s.includes('hucreli')) return <RectangularDuctFanModel />
        if ((s.includes('duman') || s.includes('smoke')) && !s.includes('dikdortgen') && !s.includes('kanal')) return <SmokeExhaustFanModel />
        if (s.includes('konut') || s.includes('banyo') || s.includes('wc') || s.includes('quattro')) return <DomesticFanModel />
        if (s.includes('dikdortgen') || s.includes('prizmatik') || s.includes('isi-geri')) return <RectangularDuctFanModel />
        if (s.includes('kanal') || s.includes('yuvarlak')) return <DuctFanModel />
        if (s.includes('yedek') || s.includes('aksesuar')) return null;

        return <DuctFanModel />
    }

    return (
        <group scale={scale}>
            {renderFan()}
        </group>
    )
}

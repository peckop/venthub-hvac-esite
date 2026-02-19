import React from 'react'
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
import { AirCurtainModel } from './types/AirCurtainModel'
import { AirPurifierModel } from './types/AirPurifierModel'
import { PlugFanModel } from './types/PlugFanModel'
import { WallMountedCompactFanModel } from './types/WallMountedCompactFanModel'

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
    position?: [number, number, number]
}

// Model tipi -> Bileşen eşleştirmesi
const MODEL_COMPONENTS = {
    'AxialFanModel': AxialFanModel,
    'RoofFanModel': RoofFanModel,
    'WallMountedCompactFanModel': WallMountedCompactFanModel, // [FIX] Updated Name
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
    'AirCurtainModel': AirCurtainModel,
    'AirPurifierModel': AirPurifierModel,
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
    enableTooltip = true,
    position = [0, 0, 0]
}) => {

    const renderFan = () => {
        const s = slug ? slug.toLowerCase() : '';

        // 1. ÖNCELİK: Veritabanı model_type
        if (modelType && modelType in MODEL_COMPONENTS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ModelComponent = MODEL_COMPONENTS[modelType as keyof typeof MODEL_COMPONENTS] as any

            // Hava perdesi için dinamik proplar
            const extraProps: { isHeated?: boolean; showMixed?: boolean } = {}
            if (modelType === 'AirCurtainModel') {
                const isHeated = s.includes('isitici') || s.includes('elektrikli')
                const isAmbient = s.includes('ortam-havali') || s.includes('naturel')
                extraProps.isHeated = isHeated
                extraProps.showMixed = (!isHeated && !isAmbient) || s === 'hava-perdeleri'
            }

            return <ModelComponent
                slug={slug}
                {...extraProps}
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

        // 2. FALLBACK: Slug bazlı mantık (Hiyerarşik: Spesifik -> Genel)

        // -- SPESİFİK ÜRÜN GRUPLARI --

        // Hava Perdeleri (Öncelikli çünkü bazıları 'santrifüj' veya 'kanal' içerir)
        if (s.includes('perde') || s.includes('isitici') || s.includes('ortam-havali')) {
            const isHeated = s.includes('isitici') || s.includes('elektrikli')
            const isAmbient = s.includes('ortam-havali') || s.includes('naturel')
            // Tip belirtilmemişse veya ana kategori ise ana kategorideki gibi iki tipi de simüle et
            const showMixed = (!isHeated && !isAmbient) || s === 'hava-perdeleri'

            return <AirCurtainModel isHeated={isHeated} showMixed={showMixed} />
        }

        // Sessiz Kanal Tipi (Interaction Destekli)
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

        // Jet Fanlar
        if (s.includes('jet') || s.includes('otopark')) return <JetFanModel />

        // -- 2. SPESİFİK FAN TİPLERİ (Form Faktörü Öncelikli) --

        // Çatı Tipi
        if (s.includes('cati') || s.includes('atı')) return <RoofFanModel />

        // Kanal Tipi (Dikdörtgen/Prizmatik/HRV)
        if (s.includes('dikdortgen') || s.includes('prizmatik') || s.includes('isi-geri') || s.includes('siginak') || s.includes('taze-hava') || s.includes('hücreli') || s.includes('hucreli') || s.includes('kabinli')) {
            // Hücreli/Kabinli fanlar dikdörtgen kanal tipidir
            return <RectangularDuctFanModel />
        }

        // Kanal Tipi (Yuvarlak)
        if (s.includes('kanal') || s.includes('yuvarlak')) return <DuctFanModel />

        // Konut / Banyo / Duvar (Kompakt / Kare Plakalı)
        if (s.includes('duvar') && s.includes('kompakt')) return <WallMountedCompactFanModel />

        // Konut / Banyo / Duvar (Standart Yuvarlak)
        if (s.includes('konut') || s.includes('banyo') || s.includes('wc') || s.includes('quattro') || s.includes('duvar')) {
            // Duvar tipi fanlar genellikle Domestic modeldir (öncelikli)
            return <DomesticFanModel />
        }

        // Hava Temizleyiciler
        if (s.includes('temizleyici') || s.includes('purifier') || s.includes('filtre') || s.includes('anti-viral')) {
            return <AirPurifierModel />
        }

        // Exproof & ATEX (ÖNCELİKLİ)
        // NOT: Exproof bir "özellik"tir, ancak "Exproof Fanlar" kategorisi "exproof-fanlar" slug'ını
        // kullandığı için bu kontrolün Salyangoz kontrolünden ÖNCE yapılması gerekir.
        // DB'deki slug 'endustriyel-fanlar' olarak kalmış olabilir, bu yüzden 'endustriyel' desteğini koru.
        if (s.includes('exproof') || s.includes('ex-proof') || s.includes('atex') || s.includes('endustriyel')) {
            return <ExproofFanModel />
        }

        // Santrifüj / Salyangoz / Radyal
        if (s.includes('santrifuj') || s.includes('salyangoz') || s.includes('radyal')) return <SnailFanModel />

        // Duman Egzoz
        if ((s.includes('duman') || s.includes('smoke'))) return <SmokeExhaustFanModel />

        // Basınçlandırma / Yangın
        if (s.includes('basinc') || s.includes('yangin') || s.includes('merdiven')) return <AxialFanModel />

        // Aksiyal (Genel - En Son Kontrol)
        // Eğer yukarıdaki spesifik formların hiçbiri değilse ve "aksiyal" ise silindirik model göster
        if (s.includes('aksiyal') || s.includes('axial')) return <AxialFanModel />

        // Plug Fan
        if (s.includes('plug')) return <PlugFanModel />

        // -- 3. MARKA / SERİ BAZLI FALLBACKS (En Son Kontrol Edilir) --

        // Nicotra / Gebhardt (Örn: AT, DDI serileri)
        if (s.includes('nicotra') || s.includes('gebhardt') || s.includes('ddi') || s.includes('at')) return <NicotraFanModel />

        // -- FALLBACKS --
        if (s.includes('yedek') || s.includes('aksesuar')) return null;

        return <DuctFanModel />
    }

    return (
        <group scale={scale} position={position}>
            {renderFan()}
        </group>
    )
}

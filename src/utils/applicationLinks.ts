import { ADRES_SEMASI_K3B } from '../config/features'
import { adresUret } from './adresUret'
import { adresDili } from './yuzeyAdresleri'

/**
 * Topic to Category URL mapping
 * Maps topics directly to the definitive Category Registry paths
 *
 * ⚠BUGÜNKÜ (bayrak kapalı) değerler DİLSİZDİR ve ikisi ölü slug'a gider (canlı DB 2026-09-27:
 * `jet-fans` pasif, `heat-recovery-units` DB'de yok) — bayrak kapalıyken DOKUNULMADI (birebir kuralı,
 * REC-300 Faz 3d); yeni şemada aşağıdaki tablo kullanılır.
 */
const TOPIC_TO_CATEGORY_URL: Record<string, string> = {
    'hava-perdesi': '/category/air-curtains',
    'jet-fan': '/category/jet-fans',
    'hrv': '/category/heat-recovery-units'
}

/**
 * K3-b (REC-300 Faz 3d): konu → CANLI kök kategorinin iki dildeki görünen slug'ı (canlı DB
 * `categories.metadata.slug`, 2026-09-27). Pasif `jet-fans` dalının aktif üstü `fans`; `hrv` → canlı
 * ısı geri kazanım kökü (plan §4.1 tohum kararıyla aynı hedef).
 */
const TOPIC_TO_CATEGORY_K3B: Record<string, { tr: string; en: string }> = {
    'hava-perdesi': { tr: 'hava-perdeleri', en: 'air-curtains' },
    'jet-fan': { tr: 'fanlar', en: 'fans' },
    'hrv': { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' },
}

/**
 * Get category URL from topic slug (RECOMMENDED for better UX)
 * Directly navigates to product category page using the Registry
 *
 * @param topicSlug - Knowledge center topic slug (e.g., 'hava-perdesi')
 * @param lang - Sayfa dili. Yalnız K3-b açıkken kullanılır (adres `adresUret`'ten, dil önekli).
 * @returns Full Category page URL
 */
export function getCategoryUrlFromTopic(
    topicSlug: string,
    lang: string = 'tr',
    bayrak: boolean = ADRES_SEMASI_K3B,
): string {
    if (!bayrak) return TOPIC_TO_CATEGORY_URL[topicSlug] || '/products'
    const dil = adresDili(lang)
    const hedef = TOPIC_TO_CATEGORY_K3B[topicSlug]
    return hedef
        ? adresUret({ tur: 'kategori', kok: hedef[dil] }, dil, true)
        : adresUret({ tur: 'urunler' }, dil, true)
}

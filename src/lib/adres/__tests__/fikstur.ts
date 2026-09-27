/** Test yardımcısı: commit'li fikstür harita + Faz 2 sonrası (model adres metinli) türevi. */
import type { EskiAdresHaritaDosyasi, KiraciHaritasi } from '../haritaTipi'
import fiksturHam from './fikstur/eski-adres-haritasi.fikstur.json'
import { VARSAYILAN_KIRACI } from './sahteDb'

export const FIKSTUR_DOSYASI = fiksturHam as EskiAdresHaritaDosyasi

export function fiksturHaritasi(): KiraciHaritasi {
  return structuredClone(FIKSTUR_DOSYASI.kiracilar[VARSAYILAN_KIRACI])
}

/** Faz 2 (`slug_i18n`) verisi gelmiş gibi: iki modelin adres metni dolu. */
export function modelSlugluHarita(): KiraciHaritasi {
  const h = fiksturHaritasi()
  h.modeller['SEA-61143003'].slug = { tr: 'storm-14-atex-cati-fani', en: 'storm-14-atex-roof-fan' }
  h.modeller['VRT-CA-IL-4020-ES-RECT'].slug = { tr: 'vortice-ca-il-4020-kanal-fani', en: 'vortice-ca-il-4020-duct-fan' }
  return h
}

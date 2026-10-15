import React from 'react'

import { egriNotuTuru } from '../../lib/hvac/ductFanSelection'

/**
 * Ürün sayfası teknik tablosunda `pq_curve` satırının yanındaki EĞRİ NOTU (URN-127, karar 348).
 *
 * Karar `egriNotuTuru`'dadır (tek yer): nokta sayısı + `pq_curve_kaynak` etiketi birlikte okunur.
 *  · `yaklasik`          → "Yaklaşık eğri…" (≤3 nokta ya da kaynak `turetilmis`); `data-testid="yaklasik-egri-notu"`
 *  · `grafikten-okundu`  → "Eğri, üretici kataloğundaki grafikten okunmuştur."; `data-testid="grafik-egri-notu"`
 *  · yoksa hiçbir şey çizilmez (BOŞ KUTU yok).
 *
 * Kaynak değeri ham makine metnidir (`kitapcik_grafik`) ve BU bileşen onu EKRANA BASMAZ: yalnız sözlükten
 * gelen cümle çizilir. Anahtarlar iki ayrı `t('...')` çağrısıdır ki INV-5 ve ölü-anahtar kapısı tüketiciyi görsün.
 */
export interface PqEgriNotuProps {
  /** Ham `technical_specs.pq_curve` (JSON string ya da dizi). */
  egri: unknown
  /** Ham `technical_specs.pq_curve_kaynak` (seçili varyantın); yoksa null/undefined. */
  kaynak: unknown
  t: (key: string) => string
}

const NOT_SINIFI = 'block text-xs font-normal normal-case tracking-normal text-steel-gray'

export const PqEgriNotu: React.FC<PqEgriNotuProps> = ({ egri, kaynak, t }) => {
  const tur = egriNotuTuru(egri, kaynak)
  if (tur === 'yaklasik') {
    return (
      <span className={NOT_SINIFI} data-testid="yaklasik-egri-notu">
        {t('pdp.labels.approxCurve')}
      </span>
    )
  }
  if (tur === 'grafikten-okundu') {
    return (
      <span className={NOT_SINIFI} data-testid="grafik-egri-notu">
        {t('pdp.labels.curveFromChart')}
      </span>
    )
  }
  return null
}

export default PqEgriNotu

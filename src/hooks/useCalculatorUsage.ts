'use client'

import { useEffect, useRef } from 'react'

import { trackEvent } from '../utils/analytics'

/**
 * `calculator_used` olayını ateşler (T021-VH · analytics-standard.md olay taksonomisi).
 *
 * NİÇİN BİR HOOK, NİÇİN SAYFANIN İÇİNDE BİR `trackEvent` SATIRI DEĞİL
 *
 * Dört hesaplayıcının dördü de **gerçek zamanlı** hesaplar: girdi `useState`, sonuç `useMemo`.
 * Ortada "Hesapla" düğmesi yok, yani ateşlenecek doğal bir an da yok. İki bariz seçenek de
 * yanlış ölçerdi:
 *
 *   · her değişimde ateşle  → tek kullanıcıdan onlarca olay; tuş vuruşu sayılır, kullanım değil,
 *   · ilk geçerli sonuçta ateşle → **sayfa görüntülemesini ölçer**. Girdilerin hepsinin
 *     VARSAYILAN DEĞERİ var (jet fan: 100/30/3/100/50), yani sonuç sayfa açılır açılmaz
 *     hesaplanmış olur. Kullanıcı hiçbir şeye dokunmadan "hesaplayıcı kullanıldı" derdik.
 *
 * Bu yüzden kural şu: **taban çizgisi mount anındaki girdilerdir.** Olay ancak kullanıcı bir
 * girdiyi o tabandan farklı hâle getirirse ve değişim durulunca (gecikme) ateşlenir, mount
 * başına **en fazla bir kez**.
 *
 * Taban çizgisinin mount anı olması, `?area=120` gibi paylaşılmış bağlantıları da doğru
 * yönetir: bağlantıyı açıp hiçbir şeye dokunmayan ziyaretçi olay üretmez.
 *
 * DÜRÜST SINIR: bu ölçüm "kaç kişi hesaplayıcıyı gerçekten kullandı" sorusunu yanıtlar,
 * "kaç kez denedi" sorusunu YANITLAMAZ — mount başına tek olay gider ve `inputs_summary`
 * durulmuş İLK anlamlı girdiyi taşır, son hâlini değil. Yineleme sayısı gerekirse bu ayrı
 * bir karardır ve cetvele ayrı bir olay olarak girer.
 *
 * Rıza kapısı burada DEĞİL: `trackEvent` gönderimden önce `hasConsent('analytics')` sorar
 * (T020-VH). Kapıyı çağrı yerine kopyalamak, dördüncü çağrı yerini ekleyenin hatırlamasına
 * bağlı bir adım yaratırdı.
 */

const VARSAYILAN_GECIKME_MS = 1500

export type HesaplayiciGirdileri = Record<string, string | number | boolean | null | undefined>

/** Girdileri sabit sıralı, kısa ve PII taşımayan tek satıra indirger. */
export function girdiOzeti(girdiler: HesaplayiciGirdileri): string {
  return Object.keys(girdiler)
    .sort()
    .map((k) => `${k}=${girdiler[k] ?? ''}`)
    .join(';')
}

export function useCalculatorUsage(
  calculator: string,
  girdiler: HesaplayiciGirdileri,
  gecikmeMs: number = VARSAYILAN_GECIKME_MS,
): void {
  const ozet = girdiOzeti(girdiler)
  const tabanRef = useRef<string | null>(null)
  const atesRef = useRef(false)

  if (tabanRef.current === null) tabanRef.current = ozet

  useEffect(() => {
    if (atesRef.current) return
    if (ozet === tabanRef.current) return

    const zamanlayici = setTimeout(() => {
      atesRef.current = true
      trackEvent('calculator_used', { calculator, inputs_summary: ozet })
    }, gecikmeMs)

    return () => clearTimeout(zamanlayici)
  }, [ozet, calculator, gecikmeMs])
}

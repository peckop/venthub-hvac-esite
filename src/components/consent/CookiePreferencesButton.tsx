'use client'

import React, { useEffect, useState } from 'react'

import { onConsentChange, readConsent, withdrawConsent } from '@/lib/consent'

import { useI18n } from '../../i18n/I18nProvider'

/**
 * Rızayı geri alma düğmesi (T020-VH) — Çerez Politikası sayfasına gömülür.
 *
 * NEDEN GEREKLİ: KVKK'da rıza, verildiği kadar kolay geri alınabilmelidir. Önceki durumda
 * tercihi değiştirmenin tek yolu tarayıcının site verilerini temizlemekti; bu "kolay" sayılmaz.
 *
 * NEDEN SAYFA YENİLENİYOR: halihazırda yüklenmiş bir izleme script'i bellekten sökülemez
 * (tarayıcı sınırı). Rıza geri alındığında yalnızca "bir daha yükleme" garantisi verilebilir;
 * mevcut sayfadaki etiketin susması için yeniden yükleme şart. Sessizce "geri alındı" deyip
 * script'i çalışır bırakmak yanlış güven verirdi.
 */
export default function CookiePreferencesButton() {
  const { t } = useI18n()
  const [hasDecision, setHasDecision] = useState(false)

  useEffect(() => {
    const sync = () => setHasDecision(readConsent() !== null)
    sync()
    return onConsentChange(sync)
  }, [])

  // Karar verilmemişse zaten bant görünür — burada ikinci bir giriş noktası gösterme.
  if (!hasDecision) return null

  return (
    <button
      type="button"
      onClick={() => {
        withdrawConsent()
        window.location.reload()
      }}
      className="inline-flex items-center rounded-lg border border-light-gray px-4 py-2 text-sm font-medium text-primary-navy transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-navy"
    >
      {t('cookieConsent.changePreferences')}
    </button>
  )
}

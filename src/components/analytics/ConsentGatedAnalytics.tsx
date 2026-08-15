'use client'

import Script from 'next/script'
import React, { useEffect, useState } from 'react'

import { hasConsent, onConsentChange } from '@/lib/consent'

/**
 * GA4/GTM etiketini YALNIZCA analitik rızası varsa yükler (T020-VH).
 *
 * NEDEN BİLEŞEN, NEDEN SADECE `trackEvent` KAPISI DEĞİL: olayı bastırmak yetmez. GA/GTM
 * etiketi sayfaya yüklendiği anda kendi çerezlerini (`_ga`, `_gid`…) yazar ve sayfa görüntüleme
 * gönderir — kullanıcı tek bir olay tetiklemese bile. Yani rıza kapısı **script yükleme**
 * seviyesinde olmak zorunda; `trackEvent` kapısı ikinci savunma katmanıdır.
 *
 * BUGÜN İNERT: `NEXT_PUBLIC_GA_ID` tanımlı değil → hiçbir şey render etmez. Kimlik
 * tanımlandığı an (yol haritası madde G / `T021-VH`) kendiliğinden ve rızaya bağlı çalışır.
 * Yani GA'yı açan kişinin rıza kapısını "hatırlaması" gerekmez — yapı zorlar.
 *
 * RIZA GERİ ALINIRSA: bileşen sökülür ve yeni sayfa yüklemesinde script hiç enjekte edilmez.
 * Halihazırda yüklenmiş script bellekten silinemez (tarayıcı sınırı) — bu yüzden geri alma
 * akışı `withdrawConsent()` sonrası sayfayı yeniler; `CookieConsent` bunu yapar.
 */
export default function ConsentGatedAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(hasConsent('analytics'))
    return onConsentChange(() => setAllowed(hasConsent('analytics')))
  }, [])

  // Kimlik yoksa (bugünkü durum) veya rıza yoksa: hiçbir şey yükleme.
  if (!gaId || !allowed) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  )
}

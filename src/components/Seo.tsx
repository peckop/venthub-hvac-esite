'use client'
import { usePathname } from 'next/navigation'
import React from 'react'

import { canonicalOrigin } from '@/lib/seo/canonicalOrigin'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'product' | 'article'
  noIndex?: boolean
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false
}) => {
  const pathname = usePathname()
  const siteName = 'VentHub'
  /**
   * ⭐SİTE ADINI EKLEYEN TEK YER BURASI — çağıran ASLA yazmaz (REC-148, 2026-09-05).
   *
   * ÖLÇÜLDÜ, canlıda: beş yüzey site adını bir kez daha ELLE yazıyordu ve sekmede iki kez
   * çıkıyordu — "Hakkımızda | VentHub | VentHub", "Markalar | VentHub | VentHub",
   * "İletişim | VentHub | VentHub", "Bilgi, Mühendisliğin Ham Maddesidir | VentHub | VentHub",
   * ve "Hava Perdesi | VentHub Teknik Bilgi | VentHub" (sonuncusu ayrıca fazladan bir AD
   * varyantı taşıyordu — K17: tek ad).
   *
   * NİÇİN HİÇBİR KAPI GÖRMEDİ: her çağrı tek başına geçerli bir dizedir; `tsc`, `lint`,
   * i18n paritesi ve ölü-anahtar kapılarının hepsi tek dosyaya bakar. Kusur ÇAĞIRAN ile
   * BURASI arasındaki sözleşmede yaşıyordu — yani dosyalar arası bir tutarlılık iddiası.
   * Bekçisi INV-SECICI-1'in "site adı elle yazılamaz" kolu.
   *
   * Kural: `title` yalnız SAYFANIN kendi adını taşır. Bölüm adı gerekiyorsa sözlükten
   * gelir (`CalculatorLayout` → `urunSecici.ustBaslik` gibi), site adı ise DAİMA buradan.
   */
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultDesc = 'Premium HVAC ve Havalandırma Çözümleri'
  const finalDesc = description || defaultDesc
  
  // Construct absolute URLs for social sharing.
  // REC-100: burası eskiden doğrudan `SITE_URL` okuyordu. Bu bir `'use client'` bileşeni
  // olduğu için tarayıcı paketinde o değer `http://localhost:3000`'e düşüyordu ve canlıda
  // ikinci (yanlış) bir canonical/og üretiyordu. Bkz. `lib/seo/canonicalOrigin.ts`.
  const siteUrl = canonicalOrigin()
  const url = canonical || `${siteUrl}${pathname}`
  const image = ogImage || `${siteUrl}/og-image.png`

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={image} />
    </>
  )
}

export default Seo

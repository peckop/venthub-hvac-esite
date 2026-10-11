import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { adresUret } from '@/utils/adresUret'

import BrandsPage from '../../../views/BrandsPage'

/**
 * K3-b TR marka LİSTESİ adresi — `/tr/markalar` (URN-85; Design CSV satır 4, REC-300 Faz 3-C).
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`) HER İSTEK 404 — `markalar/[slug]` ile aynı kural. EN bu rotayı kullanmaz
 * (`/en/brands` bugünkü `brands/page.tsx`'te kalır) → `lang≠tr` 404. Gövde `brands/page.tsx` ile AYNI görünüm
 * (`BrandsPage`): iki rota tek içeriği gösterir, hangisinin 200 vereceğini bayrak ve dil belirler. Eski `/tr/brands`
 * bayrak açıkken `brands/page.tsx`'te tek 308 ile buraya gelir (iki adresten 200 verilmez, REC-205).
 *
 * Sınıf ilanı `brands/page.tsx` ile aynı (`force-static`): `BrandsPage` marka listesini `data/brands` sabitinden okur,
 * `useSearchParams` kullanmaz; dinamik okuma yok.
 */
export const dynamic = 'force-static'

export async function generateStaticParams() {
  if (!ADRES_SEMASI_K3B) return []
  return [{ lang: 'tr' }]
}

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') return {}
  return sayfaUstVerisi({
    lang,
    yol: adresUret({ tur: 'markalar' }, 'tr'),
    dilYollari: { tr: adresUret({ tur: 'markalar' }, 'tr'), en: adresUret({ tur: 'markalar' }, 'en') },
    baslik: `${tr.brands.pageTitle} | VentHub`,
    aciklama: tr.brands.seoDesc,
  })
}

export default async function Page({ params }: Params) {
  const { lang } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <BrandsPage />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import React, { Suspense } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import BrandsPage from '../../../views/BrandsPage'

/** Üst veri tek yazıcıda (REC-150 Adım 5, bot karnesi 2026-09-24): görünümdeki istemci `Seo` kaldırıldı. */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.brands(),
    baslik: `${dict.brands.pageTitle} | VentHub`,
    aciklama: dict.brands.seoDesc,
  })
}

/**
 * ROTA SINIFI İLANI (REC-348 / Recep kararı 21, 2026-09-16).
 *
 * Bu rota dört vitrin rotası içinde **hiç ilan taşımayan** tek üyeydi — ne `dynamic`,
 * ne `revalidate`, ne `generateStaticParams`. Yani sınıfı tamamen çıkarıma bırakılmıştı.
 *
 * ⭐Güvenli olduğu ÖLÇÜLDÜ (2026-09-16): `BrandsPage` bir istemci bileşeni ama
 * `useSearchParams`/`useRouter`/`usePathname` **kullanmıyor**; marka listesi `data/brands`
 * içindeki sabit `HVAC_BRANDS` dizisinden geliyor. `force-static` bu sayfada hiçbir
 * dinamik okumayı boşaltmıyor.
 *
 * ⚠Aşağıdaki `<Suspense>` sarmalı bu ölçümden sonra gereksiz görünüyor (sardığı bileşen
 * `useSearchParams` çağırmıyor). Kaldırmak bu işin kapsamı DEĞİL — ayrı kalem, çünkü
 * kaldırmanın ilk yükleme davranışına etkisi ayrıca ölçülmeli.
 */
export const dynamic = 'force-static'

export default function Page() {
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

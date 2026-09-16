import React, { Suspense } from 'react'

import BrandsPage from '../../../views/BrandsPage'

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

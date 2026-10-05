import type { Metadata } from 'next'
import React, { Suspense } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import CartPage from '../../../views/CartPage'

/**
 * İşlem yüzeyi: dizin dışı (X-Robots-Tag next.config'te de var). Üst veri yine yazılır — bot
 * karnesi 2026-09-24'te bu sayfa varsayılan site başlığını basıyordu; sekme adı doğru olsun.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.cart(),
    baslik: `${dict.cart.title} | VentHub`,
    aciklama: dict.meta.siteDesc,
    dizinDisi: true,
  })
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <CartPage />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import React, { Suspense } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import RegisterPage from '../../../../views/RegisterPage'

/** İşlem yüzeyi: dizin dışı; üst veri yine yazılır — gerekçe `cart/page.tsx`'te. */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.auth.register(),
    baslik: `${dict.auth.registerTitle} | VentHub`,
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
      <RegisterPage />
    </Suspense>
  )
}

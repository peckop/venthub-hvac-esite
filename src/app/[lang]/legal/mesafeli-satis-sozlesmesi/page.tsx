import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../views/legal/DistanceSalesAgreementPage'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }]
}

/** Üst veri tek yazıcıda (bot karnesi 2026-09-24) — gerekçe `legal/kvkk/page.tsx`'te. */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.legal.mesafeliSatis(),
    baslik: `${dict.legal.distanceSalesTitle} | VentHub`,
    aciklama: dict.legal.seo.distanceSales,
  })
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}

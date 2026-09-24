import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../views/legal/KVKKPage'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }]
}

/**
 * Üst veri tek yazıcıda (bot karnesi 2026-09-24): yasal sayfalar varsayılan site başlığını
 * basıyor, canonical taşımıyor ve hreflang'ı ana sayfaya düşüyordu. Başlık H1 ile AYNI
 * (sözlükteki "(Taslak)" eki dahil — metnin durumu üst veride gizlenmez).
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.legal.kvkk(),
    baslik: `${dict.legal.kvkkTitle} | VentHub`,
    aciklama: dict.legal.seo.kvkk,
  })
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}

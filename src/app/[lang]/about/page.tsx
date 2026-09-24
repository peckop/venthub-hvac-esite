import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../views/AboutPage'

/** Üst veri tek yazıcıda (REC-150 Adım 5, bot karnesi 2026-09-24): görünümdeki istemci `Seo` kaldırıldı. */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.about(),
    baslik: `${dict.aboutPage.title} | VentHub`,
    aciklama: dict.aboutPage.seoDescription,
  })
}

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
}

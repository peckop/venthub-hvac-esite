import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../views/support/FAQPage'

/**
 * Üst veri tek yazıcıda (bot karnesi 2026-09-24): bu rota varsayılan site başlığını basıyor,
 * canonical taşımıyor ve hreflang'ı ana sayfaya düşüyordu. Rota artık Server Component
 * (kural 4); istemci sınırını görünüm kendisi ilan eder.
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.destek.sss(),
    baslik: `${dict.support.seo.faqTitle} | VentHub`,
    aciklama: dict.support.seo.faq,
  })
}

export default function Page() {
  return <PageComponent />
}

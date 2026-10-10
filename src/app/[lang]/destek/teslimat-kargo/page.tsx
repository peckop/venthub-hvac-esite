import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../views/support/ShippingPage'

/** Üst veri tek yazıcıda (bot karnesi 2026-09-24) — gerekçe `destek/sss/page.tsx`'te. */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.destek.teslimatKargo(),
    // SEO-32: <title> ayrı anahtardan; `support.links.shipping` footer etiketi ve sayfa H1'idir.
    baslik: `${dict.support.seo.shippingTitle} | VentHub`,
    aciklama: dict.support.seo.shipping,
  })
}

export default function Page() {
  return <PageComponent />
}

import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../../views/calculators/JetFanCalcPage'

/**
 * METADATA TEK YAZICIDA (REC-150 Adım 5, 2026-09-24) — kanal pilotunun kalıbı, ortak
 * yardımcıyla. Rota artık Server Component: istemci sınırını görünüm (`JetFanCalcPage`)
 * kendisi ilan eder. Başlık biçimi canlıdakiyle AYNI.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr
  return sayfaUstVerisi({
    lang,
    yol: Routes.destek.hesaplayicilar('jet-fan'),
    baslik: `${dict.calculators.jetFan.pageTitle} | ${dict.urunSecici.ustBaslik} | VentHub`,
    aciklama: dict.calculators.jetFan.pageDescription,
  })
}

export default function Page() {
  return <PageComponent />
}

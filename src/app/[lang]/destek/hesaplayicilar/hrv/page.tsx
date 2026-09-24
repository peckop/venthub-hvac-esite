import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../../views/calculators/HRVCalcPage'

/**
 * METADATA TEK YAZICIDA (REC-150 Adım 5, 2026-09-24) — kanal pilotunun kalıbı, ortak
 * yardımcıyla. Rota artık Server Component: istemci sınırını görünüm (`HRVCalcPage`) kendisi
 * ilan eder. Başlık biçimi canlıdakiyle AYNI ("… | Ürün Seçici | VentHub") — göç SEO
 * değişikliği değil, mükerrerlik temizliğidir.
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
    yol: Routes.destek.hesaplayicilar('hrv'),
    baslik: `${dict.calculators.hrv.title} | ${dict.urunSecici.ustBaslik} | VentHub`,
    aciklama: dict.calculators.hrv.description,
  })
}

export default function Page() {
  return <PageComponent />
}

import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'

import PageComponent from '../../../../../views/calculators/AirCurtainCalcPage'

/**
 * SAYFA-BOYU SUSPENSE KALDIRILDI (REC-150 PR-0, 2026-09-05).
 *
 * Gerekçe kardeş rotada yazılıydı; özet: sınır sayfanın tamamını sarınca `useSearchParams`
 * bailout'u tüm sayfayı kapsıyor ve sayfa sunucuda hiç render edilmiyordu. Sınır görünümün
 * içinde, yalnız parametreyi okuyan uç bileşende.
 *
 * METADATA TEK YAZICIDA (REC-150 Adım 5, 2026-09-24) — kanal pilotunun kalıbı, ortak
 * yardımcıyla. Rota artık Server Component: istemci sınırını görünüm (`AirCurtainCalcPage`)
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
    yol: Routes.destek.hesaplayicilar('hava-perdesi'),
    baslik: `${dict.calculators.airCurtain.title} | ${dict.urunSecici.ustBaslik} | VentHub`,
    aciklama: dict.calculators.airCurtain.description,
  })
}

export default function Page() {
  return <PageComponent />
}

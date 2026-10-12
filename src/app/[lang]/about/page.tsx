import type { Metadata } from 'next'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { Routes } from '@/utils/routes'
import { DEFAULT_TENANT_ID } from '@/utils/tenantConstants'

import PageComponent from '../../../views/AboutPage'
import { siteSayaclariOku } from '../../_components/siteSayaclari'

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
/**
 * URN-75: sayfa artık canlı marka / ürün / aile sayısı gösteriyor (`siteSayaclariOku`), yani "tam statik, deploy
 * dışında değişmez" sınıfından çıktı: statik + talep-üzerine ISR (render cetveli §1). Birincil tazeleme webhook'un
 * keşif etiketidir; 3600 yalnız emniyet kemeri.
 */
export const revalidate = 3600

interface PageProps {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params
  const sayaclar = await siteSayaclariOku(lang, DEFAULT_TENANT_ID)
  return <PageComponent lang={lang} sayaclar={sayaclar} />
}

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
}

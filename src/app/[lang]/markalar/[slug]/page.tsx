import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { HVAC_BRANDS } from '@/data/brands'
import { adresUret } from '@/utils/adresUret'

import { markaBul, MarkaSayfasi, markaUstVerisiK3b } from '../../../_components/markaSayfasi'

/**
 * K3-b TR marka adresi — `/tr/markalar/<marka>` (REC-300 Faz 3b-2, plan §2).
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) HER İSTEK 404. EN bu rotayı kullanmaz
 * (`/en/brands/...` bugünkü rotada kalır) → `lang≠tr` 404. Bilinmeyen marka → 404; büyük harfli
 * slug → kanonik küçük harfe 308. Gövde `markaSayfasi.tsx`'ten — bugünkü marka rotasıyla AYNI çekirdek.
 *
 * Önceden üretim (plan madde 13): bayrak açıkken her marka (statik liste) TR adresiyle üretilir.
 */
export const dynamic = 'force-static'
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  if (!ADRES_SEMASI_K3B) return []
  return HVAC_BRANDS.map((b) => ({ lang: 'tr', slug: b.slug }))
}

type Params = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') return {}
  return markaUstVerisiK3b(lang, slug)
}

export default async function Page({ params }: Params) {
  const { lang, slug } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  const marka = markaBul(slug)
  if (!marka) notFound()
  if (marka.slug !== slug) permanentRedirect(adresUret({ tur: 'marka', slug: marka.slug }, 'tr'))
  return <MarkaSayfasi lang={lang} slug={marka.slug} />
}

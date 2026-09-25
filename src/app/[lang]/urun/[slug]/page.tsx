import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { urunSegmentiniCoz } from '@/lib/data/urunSegmenti'

import { AileSayfasi, aileSayfasiUstVerisi } from '../../../_components/aileSayfasi'

/**
 * K3-b TR ürün adresi — `/tr/urun/<aile>` ve `/tr/urun/<slug>-p-<sku>` (REC-300 Faz 3b, plan §2).
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) HER İSTEK 404: rota var ama canlıda hiçbir
 * adres açmaz. EN bu rotayı kullanmaz (`/en/products/...` bugünkü rotada kalır) → `lang≠tr` 404.
 *
 * Gövde ve üst veri `aileSayfasi.tsx`'ten — bugünkü `/[lang]/products/[slug]` ile AYNI çekirdek;
 * tek fark model adresinde seçili SKU'nun sunucuda verilmesi (INV-MODEL-SSR-1).
 *
 * Önceden üretim (plan §5 Faz 3 madde 13): model sayfaları talep üzerine (`dynamicParams`),
 * derleme 94 → ~1000 sayfaya çıkmasın. Aile adreslerinin önceden üretimi site haritasıyla
 * birlikte (Faz 3e) bağlanır; o güne kadar aileler de talep üzerine üretilir.
 */
export const dynamic = 'force-static'
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') return {}
  const { aileSlug } = await urunSegmentiniCoz(slug, 'tr')
  return aileSayfasiUstVerisi(lang, aileSlug)
}

export default async function Page({ params }: Params) {
  const { lang, slug } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  const { aileSlug, sunucuSku } = await urunSegmentiniCoz(slug, 'tr')
  return <AileSayfasi lang={lang} slug={aileSlug} sunucuSku={sunucuSku} />
}

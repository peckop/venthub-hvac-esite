import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'

import { UrunlerSayfasi, urunlerUstVerisiK3b } from '../../_components/urunlerSayfasi'

/**
 * K3-b TR tüm ürünler adresi — `/tr/urunler` (REC-300 Faz 3b-2, plan §2).
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) 404: rota var ama canlıda adres açmaz.
 * EN bu rotayı kullanmaz (`/en/products` bugünkü rotada kalır) → `lang≠tr` 404.
 * Gövde `urunlerSayfasi.tsx`'ten — bugünkü `/[lang]/products` ile AYNI çekirdek.
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  // Önceden üretim (plan madde 13): bayrak açıkken TR tek sayfa; kapalıyken hiç (sayfa 404).
  return ADRES_SEMASI_K3B ? [{ lang: 'tr' }] : []
}

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') return {}
  return urunlerUstVerisiK3b(lang)
}

export default async function Page({ params }: Params) {
  const { lang } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  return <UrunlerSayfasi lang={lang} />
}

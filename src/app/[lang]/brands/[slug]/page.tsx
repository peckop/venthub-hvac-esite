import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '../../../../config/features'
import { HVAC_BRANDS } from '../../../../data/brands'
import { adresUret } from '../../../../utils/adresUret'
import { markaBul, MarkaSayfasi, markaUstVerisi, markaUstVerisiK3b } from '../../../_components/markaSayfasi'

/**
 * `/[lang]/brands/<marka>` — marka sayfası.
 *
 * REC-300 Faz 3b-2: üst veri ve gövde `app/_components/markaSayfasi.tsx`'e taşındı (BİREBİR) —
 * K3-b'nin `/tr/markalar/<marka>` rotası aynı çekirdeği çağırır.
 *
 * BAYRAK KAPALIYKEN davranış BİREBİR bugünkü. BAYRAK AÇIKKEN (plan §6 satır 10, madde 5):
 *  - TR: bilinen marka → `/tr/markalar/<marka>` TEK 308 (Faz 3-C'de `next.config` deseni önüne
 *    geçer; bu dal ikinci ağdır); bilinmeyen → 404.
 *  - EN: yerinde kalır; büyük harfli slug kanonik küçük harfe 308, bilinmeyen → 404.
 */

/**
 * ROTA SINIFI İLANI (REC-348 / Recep kararı 21, 2026-09-16) — gerekçe `products/[slug]` ile aynı:
 * rotanın istemciye zorlanıp zorlanmadığını ayırt eden şey ilanın kendisidir (REC-59 ölçümü).
 * `revalidate`'i iptal etmez. Güvenli olduğu ölçüldü: bu dosya `searchParams`/`cookies()`/
 * `headers()` kullanmıyor.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const uniqueBrands = HVAC_BRANDS.map(b => b.slug)
    // K3-b açıkken TR adresi yalnız 308 verir → önceden üretilmez (içerik `/tr/markalar`'da).
    const diller = ADRES_SEMASI_K3B ? ['en'] : ['tr', 'en']
    const paths = uniqueBrands.flatMap((b) => diller.map((lang) => ({ lang, slug: b })))

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.warn('generateStaticParams error for brands:', e)
    return []
  }
}

type Params = { params: Promise<{ lang: string, slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  if (ADRES_SEMASI_K3B) return lang === 'en' ? markaUstVerisiK3b(lang, slug) : {}
  return markaUstVerisi(lang, slug)
}

export default async function Page({ params }: Params) {
  const { lang, slug } = await params
  if (ADRES_SEMASI_K3B) {
    const marka = markaBul(slug)
    if (!marka) notFound()
    const dil = lang === 'en' ? 'en' : 'tr'
    const kanonik = adresUret({ tur: 'marka', slug: marka.slug }, dil)
    if (dil === 'tr' || marka.slug !== slug) permanentRedirect(kanonik)
    return <MarkaSayfasi lang={lang} slug={marka.slug} />
  }
  return <MarkaSayfasi lang={lang} slug={slug} />
}

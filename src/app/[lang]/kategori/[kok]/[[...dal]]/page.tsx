import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { kategoriBagimliliklari, kategoriRotasiniUygula, kategoriSegmentleriniCoz } from '@/lib/data/kategoriSegmenti'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { adresUret } from '@/utils/adresUret'
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { KategoriSayfasi, kategoriSayfasiUstVerisiK3b } from '../../../../_components/kategoriSayfasi'

/**
 * K3-b TR kategori adresi — `/tr/kategori/<kök>` ve `/tr/kategori/<kök>/<dal>` (REC-300 Faz 3b-2, plan §2).
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) HER İSTEK 404: rota var ama canlıda hiçbir
 * adres açmaz. EN bu rotayı kullanmaz (`/en/category/...` bugünkü rotada kalır) → `lang≠tr` 404.
 *
 * Karar `kategoriRotasiniUygula`'da: dal slug'la bulunur (adresteki kök karar vermez, O6), adres
 * kanonik değilse (tek seviyeli dal, yanlış kök, EN biçimli slug, büyük harf) TEK 308; pasif
 * kategori → aktif üst ya da `/tr/urunler` (O4); bilinmeyen → takma ad → 404; DB hatası fırlar.
 * Gövde ve üst veri `kategoriSayfasi.tsx`'ten — bugünkü `/[lang]/category/[categorySlug]` ile AYNI çekirdek.
 *
 * Önceden üretim (plan madde 13): bayrak açıkken her aktif kök ve dal TR adresiyle üretilir;
 * eski slug / takma ad gibi adresler talep üzerine (`dynamicParams`).
 */
export const dynamic = 'force-static'
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  if (!ADRES_SEMASI_K3B) return []
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, metadata, parent_id')
      .eq('is_active', true)
    if (error) throw error
    const satirlar = data ?? []
    const idIle = new Map(satirlar.map((c) => [c.id, c]))
    return satirlar.flatMap((c) => {
      const yaprak = getLocalizedCategorySlug(c, 'tr')
      if (!c.parent_id) return [{ lang: 'tr', kok: yaprak, dal: [] as string[] }]
      const ust = idIle.get(c.parent_id)
      // Üstü pasif dal kanonik adres üretemez (üst satır listede yok) → talep üzerine çözülür.
      return ust ? [{ lang: 'tr', kok: getLocalizedCategorySlug(ust, 'tr'), dal: [yaprak] }] : []
    })
  } catch (e) {
    // Önceden üretim bir hızlandırmadır, doğruluk şartı değil: liste boşalırsa sayfalar talep
    // üzerine üretilir (dynamicParams). Sessiz geçilmez, loglanır.
    console.warn('generateStaticParams error for /tr/kategori:', e)
    return []
  }
}

type Params = { params: Promise<{ lang: string; kok: string; dal?: string[] }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, kok, dal = [] } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') return {}
  const cozum = await kategoriSegmentleriniCoz([kok, ...dal], 'tr', kategoriBagimliliklari)
  return cozum.tur === 'kategori' ? kategoriSayfasiUstVerisiK3b(lang, cozum.kategori, cozum.ust) : {}
}

export default async function Page({ params }: Params) {
  const { lang, kok, dal = [] } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  // İkiden fazla segment çözücüde "yok" olur (404) — istenen adres o hâlde hiç karşılaştırılmaz.
  const istenen = adresUret({ tur: 'kategori', kok, dal: dal[0] ?? null }, 'tr')
  const { kategori } = await kategoriRotasiniUygula([kok, ...dal], 'tr', istenen, kategoriBagimliliklari)
  return (
    <KategoriSayfasi lang={lang} category={kategori} categorySlug={getLocalizedCategorySlug(kategori, 'tr')} />
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { kategoriBagimliliklari, kategoriRotasiniUygula, kategoriSegmentleriniCoz } from '@/lib/data/kategoriSegmenti'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { adresUret } from '@/utils/adresUret'
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { KategoriSayfasi, kategoriSayfasiUstVerisiK3b } from '../../../../_components/kategoriSayfasi'

/**
 * K3-b TR kategori adresi — `/tr/kategori/<slug>` (REC-300 Faz 3b-2, plan §2; SEO-35 B-1).
 *
 * KANONİK ADRES TEK SEGMENTTİR: kök de alt kategori de kendi slug'ıyla `/tr/kategori/<slug>`; üst slug'ı ve kimlik
 * soneki adrese girmez. `[[...dal]]` KATMAN KORUNUR: eski iç içe adresler (`/tr/kategori/<üst>/<alt>`, 3-C'nin
 * iki seviyeli biçimi) bu rotaya düşer ve TEK 308 ile `/tr/kategori/<alt>`'a gider — içerik üretmez.
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) HER İSTEK 404: rota var ama canlıda hiçbir
 * adres açmaz. EN bu rotayı kullanmaz (`/en/category/...` bugünkü rotada kalır) → `lang≠tr` 404.
 *
 * Karar `kategoriRotasiniUygula`'da: kategori YAPRAK slug'la bulunur (adresteki üst karar vermez, O6), adres
 * kanonik değilse (iç içe adres, EN biçimli slug, büyük harf) TEK 308; pasif kategori → aktif üst ya da
 * `/tr/urunler` (O4); bilinmeyen → takma ad → 404; DB hatası fırlar. Gövde ve üst veri `kategoriSayfasi.tsx`'ten —
 * bugünkü `/[lang]/category/[categorySlug]` ile AYNI çekirdek.
 *
 * Önceden üretim (plan madde 13): bayrak açıkken her aktif kategori (kök ve alt) kendi TR slug'ıyla üretilir;
 * eski slug / takma ad / iç içe adres gibi adresler talep üzerine (`dynamicParams`) ve yalnız yönlendirir.
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
    // Tek segment: üst kategorinin aktifliği adresi etkilemez (kanonik adres üstten bağımsız).
    return (data ?? []).map((c) => ({ lang: 'tr', kok: getLocalizedCategorySlug(c, 'tr'), dal: [] as string[] }))
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
  // İç içe adres (`dal` dolu) yalnız yönlendirir: üst veri üretilmez.
  if (!ADRES_SEMASI_K3B || lang !== 'tr' || dal.length > 0) return {}
  const cozum = await kategoriSegmentleriniCoz([kok], 'tr', kategoriBagimliliklari)
  return cozum.tur === 'kategori' ? kategoriSayfasiUstVerisiK3b(lang, cozum.kategori) : {}
}

export default async function Page({ params }: Params) {
  const { lang, kok, dal = [] } = await params
  if (!ADRES_SEMASI_K3B || lang !== 'tr') notFound()
  // İstenen adres YALNIZ ilk segmentten kurulur; `dal` doluysa (iç içe adres) çözücü istenene bakmadan 308 verir.
  // İkiden fazla segment çözücüde "yok" olur (404).
  const istenen = adresUret({ tur: 'kategori', kok }, 'tr')
  const { kategori } = await kategoriRotasiniUygula([kok, ...dal], 'tr', istenen, kategoriBagimliliklari)
  return <KategoriSayfasi lang={lang} category={kategori} categorySlug={getLocalizedCategorySlug(kategori, 'tr')} />
}

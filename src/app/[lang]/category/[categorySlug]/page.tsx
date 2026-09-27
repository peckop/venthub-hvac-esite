import { notFound,permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { kategoriBagimliliklari, kategoriRotasiniUygula, kategoriSegmentleriniCoz } from '@/lib/data/kategoriSegmenti'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { adresUret } from '@/utils/adresUret'
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { eskiKategoriHedefi, getCachedCategoryData, preloadCategory } from '../../../../lib/data/preload'
import {
  kategoriBulunamadiUstVerisi,
  KategoriSayfasi,
  kategoriSayfasiUstVerisi,
  kategoriSayfasiUstVerisiK3b,
} from '../../../_components/kategoriSayfasi'

/**
 * `/[lang]/category/<slug>` — tek seviyeli kategori adresi.
 *
 * REC-300 Faz 3b-2: üst veri ve gövde `app/_components/kategoriSayfasi.tsx`'e taşındı (BİREBİR) —
 * K3-b'nin `/tr/kategori/...` rotası aynı çekirdeği çağırır. Bu dosyada rota sınıfı + rota kararı kaldı.
 *
 * BAYRAK KAPALIYKEN (`ADRES_SEMASI_K3B=false`, bugün) davranış BİREBİR bugünkü (aşağıdaki `bugun*` dalları).
 * BAYRAK AÇIKKEN (plan §5 Faz 3 madde 1 + 5):
 *  - TR: bu adres hiçbir durumda 200 dönmez; çözülebilen her slug (TR ya da EN biçimli, pasif dahil)
 *    `adresUret(…, 'tr')`'nin verdiği `/tr/kategori/...` adresine TEK 308; çözülemeyen → 404.
 *  - EN: kök adresi çizilir; tek seviyeli DAL adresi iki seviyeliye 308 (Y4); pasif → üst ya da ürünler.
 */

/**
 * ⭐DENEY (REC-59, geri alınabilir): rota sınıfını AÇIKÇA ilan et.
 * `about` rotası bunu yazıyor ve üretilen HTML'inde CSR bailout işareti YOK (ölçüldü: 0);
 * kategori yazmıyordu ve 2 işaret taşıyordu. `force-static` altında `useSearchParams()`
 * boş döner ve bailout üretmez — yani işaretin kaynağını bileşen bileşen aramak yerine
 * rotayı ait olduğu sınıfa koymak.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug, metadata, parent_id')
    .eq('is_active', true)

  const categoriesList = (data || []) as { slug: string | null, metadata: unknown, parent_id: string | null }[]
  // K3-b açıkken bu rotada içerik üreten tek adres EN KÖK adresidir (TR → /tr/kategori 308,
  // EN dal → iki seviyeli 308); yönlendiren adresler önceden üretilmez (plan madde 13).
  if (ADRES_SEMASI_K3B) {
    return categoriesList
      .filter((c) => !c.parent_id)
      .map((c) => ({ lang: 'en', categorySlug: getLocalizedCategorySlug(c, 'en') }))
  }
  // Her dil için O DİLİN görünen slug'ı üretilir (tr → metadata.slug.tr, en → kanonik).
  return categoriesList.flatMap((c) => [
    { lang: 'tr', categorySlug: getLocalizedCategorySlug(c, 'tr') },
    { lang: 'en', categorySlug: getLocalizedCategorySlug(c, 'en') }
  ])
}

type Params = { params: Promise<{ categorySlug: string, lang: string }> }

export async function generateMetadata({ params }: Params) {
  const { categorySlug, lang } = await params
  if (ADRES_SEMASI_K3B) {
    // TR bu adreste hiç çizilmez (308) → üst veri yazılmaz. EN: çözüm kategori ise üst veri.
    if (lang !== 'en') return {}
    const cozum = await kategoriSegmentleriniCoz([categorySlug], 'en', kategoriBagimliliklari)
    return cozum.tur === 'kategori' ? kategoriSayfasiUstVerisiK3b(lang, cozum.kategori, cozum.ust) : {}
  }

  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)

  if (!category) return kategoriBulunamadiUstVerisi(lang)
  return kategoriSayfasiUstVerisi(lang, category)
}

export default async function Page({ params }: Params) {
  const { categorySlug, lang } = await params

  if (ADRES_SEMASI_K3B) {
    // Eski TR adresi → yeni TR adresine (istenen = null: her çözümde 308). EN yerinde kalır.
    const dil = lang === 'en' ? 'en' : 'tr'
    const istenen = dil === 'en' ? adresUret({ tur: 'kategori', kok: categorySlug }, 'en') : null
    const { kategori } = await kategoriRotasiniUygula([categorySlug], dil, istenen, kategoriBagimliliklari)
    return <KategoriSayfasi lang={lang} category={kategori} categorySlug={categorySlug} />
  }

  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)

  // ⭐OLMAYAN KATEGORİ GERÇEK 404 DÖNER (2026-09-08, REC-205 kardeşi — canlı ölçüm).
  //
  // Eskiden `category` null iken sayfa kendi "Kategori Bulunamadı" görünümünü çiziyor ve
  // HTTP **200** dönüyordu. Canlıda ölçüldü: uydurma bir slug (`boyle-bir-kategori-yok-12345`)
  // 200 + `noindex` YOK ile yanıtlanıyordu — klasik soft-404. Google böyle sayfaları tarar ve
  // "Kopya / standart sayfa yok" kutusuna yazar; REC-205'te şikâyet edilen kutu tam budur.
  //
  // Rota statiğe geçince kusurun ÖMRÜ uzadı: üretilen "bulunamadı" sayfası artık CDN'de
  // saklanıyor (ölçümde `X-Vercel-Cache: HIT`). Kusur yeni değil, kalıcı hâle geldi.
  //
  // `notFound()` güvenli, çünkü yokluk ile ölçüm hatası ARTIK AYRI: `getCachedCategoryData`
  // sorgu düştüğünde `throw` eder (5xx, önbelleğe girmez), yalnız gerçekten satır yoksa null
  // döner. Bu ayrım olmadan geçici bir DB arızası kalıcı 404 üretirdi.
  if (!category) {
    // REC-300 Faz 1-A: yeniden adlandırılmış kategorinin eski slug'ı → bugünkü slug'a 308
    // (tabloyu DB tetiği doldurur). Sorgu hatası fırlar (5xx), 404'e dönüşmez.
    const eskiHedef = await eskiKategoriHedefi(categorySlug, lang)
    if (eskiHedef) permanentRedirect(`/${lang}/category/${eskiHedef}`)
    notFound()
  }

  // Gelen slug aktif dilin görünen slug'ı değilse (ör. kanonik EN slug /tr/ altında,
  // ya da eski TR kanonik slug) doğru dil URL'ine 308 ile kalıcı yönlendir.
  {
    const expectedSlug = getLocalizedCategorySlug(category, lang)
    if (expectedSlug && expectedSlug !== categorySlug) {
      permanentRedirect(`/${lang}/category/${expectedSlug}`)
    }
  }

  return <KategoriSayfasi lang={lang} category={category} categorySlug={categorySlug} />
}

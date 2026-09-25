import { ADRES_SEMASI_K3B } from '@/config/features'
import { eskiTrUrunAdresiniYonlendir, urunSegmentiniCoz } from '@/lib/data/urunSegmenti'
import { getAllFamilySlugs } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { modelAdresiCoz } from '@/utils/adresUret'

import { AileSayfasi, aileSayfasiUstVerisi } from '../../../_components/aileSayfasi'

/**
 * F5-B W2.2 — PDP artık AİLE (product_families) kanoniktir.
 * `/[lang]/products/[slug]` slug'ı bir AİLE slug'ıdır; belirli varyant `?sku=` ile
 * ön-seçilir (canonical/metadata URL'lerine GİRMEZ). Eski varyant slug'ları
 * 308 (permanentRedirect) ile aile URL'ine taşınır.
 *
 * REC-300 Faz 3b: üst veri ve gövde `app/_components/aileSayfasi.tsx`'e taşındı (BİREBİR) —
 * K3-b'nin `/tr/urun/...` rotası aynı çekirdeği çağırır. Bu dosyada yalnız rota sınıfı kaldı.
 */

/**
 * ROTA SINIFI İLANI (REC-348 / Recep kararı 21, 2026-09-16).
 *
 * NİÇİN: bu rota bugün zaten statik üretiliyor (`generateStaticParams` + ISR), ama sınıfını
 * **ilan etmiyordu**. REC-59'un ölçülmüş hükmü şu: bir rotanın istemciye zorlanıp
 * zorlanmadığını belirleyen şey ayırt edici bir bileşen değil, **rota sınıfı ilanının kendisi**.
 * İlan yoksa kök düzeyindeki `useSearchParams` adaları sayfayı istemciye çekebiliyor ve bu
 * sessizce olur — hiçbir kapı görmez.
 *
 * ⚠`revalidate` ile birlikte kullanılır ve onu iptal ETMEZ: sayfa statik üretilir, saatte bir
 * yeniden doğrulanır. Birincil tazeleme yolu yine webhook (`rendering-cache-standard.md` §3-4);
 * ISR yalnız yedektir.
 *
 * ⭐Güvenli olduğu ÖLÇÜLDÜ (2026-09-16): bu dosya `searchParams`, `cookies()` ve `headers()`
 * çağrılarının hiçbirini kullanmıyor. `force-static` bu üçünü boşaltır; kullanılsalardı ilan
 * davranışı sessizce bozardı.
 */
export const dynamic = 'force-static'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    // Yalnız AİLE slug'ları prerender edilir — varyant slug'ı statik yol üretmez.
    const families = await getAllFamilySlugs(supabase)
    // K3-b açıkken TR adresi yalnız 308 verir → önceden üretilmez (içerik `/tr/urun/...`'da).
    const diller = ADRES_SEMASI_K3B ? ['en'] : ['tr', 'en']

    return families
      .filter((f) => !!f.slug)
      .flatMap((f) => diller.map((lang) => ({ lang, slug: f.slug })))
  } catch (e) {
    console.warn('generateStaticParams error for product families:', e)
    return []
  }
}

/**
 * K3-b EN model adresi (`/en/products/<slug>-p-<sku>`) — EN'de önek değişmediği için bu rotadan
 * geçer (plan §2). YALNIZ bayrak açıkken ve yalnız EN'de çözülür; bayrak kapalıyken bu dosyanın
 * davranışı BİREBİR bugünkü (segment aile/varyant slug'ı olarak `AileSayfasi`'na gider).
 * TR'de bayrak açıkken eski `/tr/products/*` → `/tr/urun/*` TEK 308 (Faz 3b-2, plan madde 5, v4 Y4):
 * `/tr/products/<x>` hiçbir durumda 200 dönmez — karar `eskiTrUrunAdresiniYonlendir`'de.
 */
const enModelRotasi = (lang: string) => ADRES_SEMASI_K3B && lang === 'en'
const eskiTrUrunRotasi = (lang: string) => ADRES_SEMASI_K3B && lang === 'tr'

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  // Eski TR adresi çizilmez (308) → üst veri yazılmaz.
  if (eskiTrUrunRotasi(lang)) return {}
  if (enModelRotasi(lang) && modelAdresiCoz(slug)) {
    const { aileSlug } = await urunSegmentiniCoz(slug, 'en')
    return aileSayfasiUstVerisi(lang, aileSlug)
  }
  return aileSayfasiUstVerisi(lang, slug)
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  if (eskiTrUrunRotasi(lang)) return eskiTrUrunAdresiniYonlendir(slug)
  if (enModelRotasi(lang) && modelAdresiCoz(slug)) {
    const { aileSlug, sunucuSku } = await urunSegmentiniCoz(slug, 'en')
    return <AileSayfasi lang={lang} slug={aileSlug} sunucuSku={sunucuSku} />
  }
  return <AileSayfasi lang={lang} slug={slug} />
}

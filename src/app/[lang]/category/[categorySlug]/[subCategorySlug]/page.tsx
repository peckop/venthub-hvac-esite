import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '../../../../../config/features'
import { kategoriBagimliliklari, kategoriIcIceAdresiYonlendir } from '../../../../../lib/data/kategoriSegmenti'
import { eskiKategoriHedefi, getCachedCategoryData } from '../../../../../lib/data/preload'
import { getLocalizedCategorySlug } from '../../../../../utils/categoryHelpers'

/**
 * İÇ İÇE KATEGORİ ADRESİ (`/<dil>/category/<üst>/<alt>`) — HİÇBİR DURUMDA İÇERİK ÜRETMEZ, kanonik adrese 308 verir.
 *
 * NİÇİN (REC-205, 2026-09-07 · Google Search Console + canlı ölçüm):
 * Her alt kategori İKİ adresten yayınlanıyordu — `/category/<alt>` ve `/category/<üst>/<alt>`.
 * İkisi de 200 dönüyor, **ikisi de kendini kanonik ilan ediyor**, ikisi de site haritasında:
 * TR tarafında 23 tek seviyeli + 17 iki seviyeli adres → **17 × 2 dil = 34 çift adres**.
 *
 * Google bunu gördü ve **bizim iki seviyeli adresimizi ELEDİ**:
 * GSC "Kopya, Google kullanıcıdan farklı bir standart sayfa seçti" →
 * `/tr/category/fanlar/endustriyel-tavan-vantilatorleri`.
 *
 * Google haklıydı: iki seviyeli varyant `og:url` ve `CollectionPage` yapısal verisi
 * TAŞIMIYORDU, kırıntı yolu 2 satırdı (tek seviyelide 5). Zayıf olanı elemiş.
 *
 * KARAR (bugün): kanonik = TEK SEVİYELİ (`/[lang]/category/<altSlug>`). Bu rota yalnız eski/dış
 * bağlantıları taşır. `Routes.category(üst, alt)` de artık tek seviyeli üretir, yani
 * sitenin KENDİ bağlantıları buraya hiç düşmez — kalıcı yönlendirme dış dünya içindir.
 *
 * ⚠TEK HOP KURALI (REC-191 §5): hedef, **doğru dildeki** slug ile kurulur. Gelen slug
 * yanlış dilde olsa bile (ör. `/tr/category/fans/duct-fans`) tek sıçramada
 * `/tr/category/kanal-tipi-fanlar` adresine gidilir — zincire ikinci hop eklenmez.
 *
 * ⭐K3-b (REC-300 Faz 3b-2, plan §2 + madde 1; SEO-35 B-1) — bayrak AÇIKKEN kanonik adres İKİ DİLDE DE TEK
 * SEGMENTTİR: TR `/tr/kategori/<alt>`, EN `/en/category/<alt>`. Bu rota iki dilde de yalnız yönlendirir:
 * `/tr/category/<üst>/<alt>` → `/tr/kategori/<alt>`, `/en/category/<üst>/<alt>` → `/en/category/<alt>` (TEK 308,
 * pasif kategori → aktif üst ya da ürünler, bilinmeyen → takma ad → 404). Üst slug'ı karar vermez: yanlış üst de
 * aynı kanonik adrese gider. Hiçbir an bir kategori iki adresten 200 dönmez.
 * ⚠Bu dosya bugün sayfa sınıfı ilan etmiyor (`dynamic`/`revalidate` yok) ve bu KASITLI: ilan
 * eklemek bayrak kapalıyken 308 yanıtının önbellek başlığını değiştirirdi. İçerik üretmediği için B-1 sonrası
 * da ilana gerek yoktur.
 */

type Params = Promise<{ lang: string; categorySlug: string; subCategorySlug: string }>

/** Rota hiçbir kipte içerik çizmez → üst veri üretilmez (boş nesne). */
export async function generateMetadata(): Promise<Metadata> {
  return {}
}

export default async function AltKategoriYonlendirme({ params }: { params: Params }) {
  const { lang, categorySlug, subCategorySlug } = await params

  if (ADRES_SEMASI_K3B) {
    // İç içe adres her çözümde 308 (kanonik tek segment) ya da 404 verir; çizim yolu YOKTUR (`Promise<never>`).
    return kategoriIcIceAdresiYonlendir(
      [categorySlug, subCategorySlug],
      lang === 'en' ? 'en' : 'tr',
      kategoriBagimliliklari,
    )
  }

  const kategori = await getCachedCategoryData(subCategorySlug)

  // Kategori çözülebiliyorsa görünen (dile uygun) slug'a; çözülemiyorsa gelen slug'a
  // gönderilir — ikinci hâlde hedef rota 404'ü kendi verir, burada karar verilmez.
  // Eski adres tablosu (REC-300 Faz 1-A) burada da okunur: yeniden adlandırılmış dal iki seviyeli
  // eski adresten de TEK sıçramada bugünkü slug'a gider (tek hop kuralı).
  const hedefSlug = kategori
    ? getLocalizedCategorySlug(kategori, lang) || subCategorySlug
    : (await eskiKategoriHedefi(subCategorySlug, lang)) ?? subCategorySlug

  permanentRedirect(`/${lang}/category/${hedefSlug}`)
}

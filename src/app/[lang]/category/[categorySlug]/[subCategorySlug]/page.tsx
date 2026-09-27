import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { ADRES_SEMASI_K3B } from '../../../../../config/features'
import {
  kategoriBagimliliklari,
  kategoriRotasiniUygula,
  kategoriSegmentleriniCoz,
} from '../../../../../lib/data/kategoriSegmenti'
import { eskiKategoriHedefi, getCachedCategoryData } from '../../../../../lib/data/preload'
import { adresUret } from '../../../../../utils/adresUret'
import { getLocalizedCategorySlug } from '../../../../../utils/categoryHelpers'
import { KategoriSayfasi, kategoriSayfasiUstVerisiK3b } from '../../../../_components/kategoriSayfasi'

/**
 * İKİ SEVİYELİ KATEGORİ ADRESİ — bayrak KAPALIYKEN içerik ÜRETMEZ, kanonik adrese 301 verir.
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
 * ⭐K3-b (REC-300 Faz 3b-2, plan §2 + madde 1, Y4) — bayrak AÇIKKEN yön TERSİNE döner: iki seviye
 * kanonik olur, İKİ DİLDE. EN'de bu rota dalı ÇİZER (tek seviyeli EN dal adresi buraya 308 alır);
 * TR'de `/tr/category/<kök>/<dal>` → `/tr/kategori/<kök>/<dal>` TEK 308. Hiçbir an bir dal iki
 * adresten 200 dönmez: iki rota da aynı çözücünün (`kategoriRotasiniUygula`) kanonik adresine bakar.
 * ⚠Bu dosya bugün sayfa sınıfı ilan etmiyor (`dynamic`/`revalidate` yok) ve bu KASITLI: ilan
 * eklemek bayrak kapalıyken 308 yanıtının önbellek başlığını değiştirirdi. Açılış PR'ı (Faz 3-C)
 * EN iki seviyeli sayfanın sınıfını (`force-static` + `revalidate`) burada ilan eder.
 */

type Params = Promise<{ lang: string; categorySlug: string; subCategorySlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  // Bayrak kapalıyken bu rota yalnız yönlendirir — üst veri üretilmez (boş nesne = bugünkü hâl).
  if (!ADRES_SEMASI_K3B) return {}
  const { lang, categorySlug, subCategorySlug } = await params
  if (lang !== 'en') return {}
  const cozum = await kategoriSegmentleriniCoz([categorySlug, subCategorySlug], 'en', kategoriBagimliliklari)
  return cozum.tur === 'kategori' ? kategoriSayfasiUstVerisiK3b(lang, cozum.kategori, cozum.ust) : {}
}

export default async function AltKategoriYonlendirme({ params }: { params: Params }) {
  const { lang, categorySlug, subCategorySlug } = await params

  if (ADRES_SEMASI_K3B) {
    const dil = lang === 'en' ? 'en' : 'tr'
    const istenen =
      dil === 'en' ? adresUret({ tur: 'kategori', kok: categorySlug, dal: subCategorySlug }, 'en') : null
    const { kategori } = await kategoriRotasiniUygula([categorySlug, subCategorySlug], dil, istenen, kategoriBagimliliklari)
    return <KategoriSayfasi lang={lang} category={kategori} categorySlug={subCategorySlug} />
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

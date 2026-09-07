import { permanentRedirect } from 'next/navigation'

import { getCachedCategoryData } from '../../../../../lib/data/preload'
import { getLocalizedCategorySlug } from '../../../../../utils/categoryHelpers'

/**
 * İKİ SEVİYELİ KATEGORİ ADRESİ — artık içerik ÜRETMEZ, kanonik adrese 301 verir.
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
 * KARAR: kanonik = TEK SEVİYELİ (`/[lang]/category/<altSlug>`). Bu rota yalnız eski/dış
 * bağlantıları taşır. `Routes.category(üst, alt)` de artık tek seviyeli üretir, yani
 * sitenin KENDİ bağlantıları buraya hiç düşmez — kalıcı yönlendirme dış dünya içindir.
 *
 * ⚠TEK HOP KURALI (REC-191 §5): hedef, **doğru dildeki** slug ile kurulur. Gelen slug
 * yanlış dilde olsa bile (ör. `/tr/category/fans/duct-fans`) tek sıçramada
 * `/tr/category/kanal-tipi-fanlar` adresine gidilir — zincire ikinci hop eklenmez.
 *
 * KAPSAM: sayfa üretimi, `generateStaticParams`, `generateMetadata` ve önbellek mantığı
 * bilerek KALDIRILDI — yönlendiren bir rotanın metadata'sı ve prerender'ı okunmaz.
 * İçeriğin kendisi tek seviyeli rotada zaten var (canlı ölçüm: her iki adres de 200
 * dönüyordu ve aynı listeyi gösteriyordu).
 */

type Params = Promise<{ lang: string; categorySlug: string; subCategorySlug: string }>

export default async function AltKategoriYonlendirme({ params }: { params: Params }) {
  const { lang, subCategorySlug } = await params

  const kategori = await getCachedCategoryData(subCategorySlug)

  // Kategori çözülebiliyorsa görünen (dile uygun) slug'a; çözülemiyorsa gelen slug'a
  // gönderilir — ikinci hâlde hedef rota 404'ü kendi verir, burada karar verilmez.
  const hedefSlug = kategori ? getLocalizedCategorySlug(kategori, lang) || subCategorySlug : subCategorySlug

  permanentRedirect(`/${lang}/category/${hedefSlug}`)
}

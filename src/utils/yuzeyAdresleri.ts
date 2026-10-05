/**
 * YÜZEY ADRESLERİ — vitrin yüzeylerinin `adresUret`'e bağlandığı TEK ara katman (REC-300 Faz 3d,
 * plan §5 Faz 3 madde 2 + 7).
 *
 * NİÇİN AYRI MODÜL: `adresUret` nesne → adres üretir; yüzeylerin çoğu ise bugün `Routes.category(…)`,
 * `Routes.product(…)` gibi DİLSİZ yol üreticilerini çağırıyor (35+ dosya, çoğu `useLocalizedRoutes`
 * vekili üzerinden). Her çağrı yerini tek tek elle değiştirmek hem kaçak bırakır hem 35 ayrı
 * "bayrak kapalıyken aynı mı" sorusu doğurur. Bu modül aynı imzayı `adresUret` üzerinden verir:
 * vekil (`useLocalizedRoutes`) ve sunucu yüzeyleri buradan geçer, soru TEK yerde (tablo testiyle) cevaplanır.
 *
 * ⭐BAYRAK KAPALIYKEN (bugün) her fonksiyon BUGÜNKÜ ifadeyi AYNEN döndürür — yeni kod yolu yoktur,
 * yalnız `bayrak ? yeni : bugünkü` dalı. Kanıt: `src/utils/__tests__/yuzeyAdresleri.test.ts`
 * (beklenen değerler bu değişiklikten ÖNCEKİ kodun çıktısı) + `yuzeyAdresleriK3b.test.ts` (açık kip).
 *
 * `bayrak` parametresi yalnız test içindir; üretim kodu varsayılanı (`ADRES_SEMASI_K3B`) kullanır.
 */
import type { Route } from 'next'

import { BILGI_MERKEZI_BOLUMU, EN_KAPALI_LISTE_HEDEFI } from '../config/bilgiMerkeziYonlendirmeleri.mjs'
import { ADRES_SEMASI_K3B, EN_YAYIN } from '../config/features'
import { rotaDiliCevirOku } from '../lib/adres/rotaDiliTablo'
import { type AdresDili, adresUret } from './adresUret'
import { localizedHref, Routes } from './routes'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const adresDili = (lang: string): AdresDili => (lang === 'en' ? 'en' : 'tr')

/** `Routes`'un vitrin nesnesi üreten dört fonksiyonunun dil önekli, şemaya duyarlı karşılığı. */
export interface AdresRotalari {
  category: (slug: string, subSlug?: string) => Route
  product: (slug: string, sku?: string) => Route
  products: (params?: { brand?: string; limit?: number }) => Route
  brand: (slug: string) => Route
}

/**
 * `Routes.category/product/products/brand` + `localizedHref` bileşiminin `adresUret` karşılığı.
 *
 * AÇIK kipte:
 *  - `category(kök, dal)` → iki seviyeli kanonik (`/tr/kategori/<kök>/<dal>`). Yalnız TEK slug verilen
 *    çağrı (çağıran üst kategoriyi bilmiyor) tek seviyeli adres üretir; sayfa katmanı dal ise iki
 *    seviyeliye tek 308 verir (Faz 3b-2, `kategoriSegmenti`). Üstü bilen çağıran İKİSİNİ verir.
 *  - `product(aile, sku)` → modelin kendi adresi (`/tr/urun/<aile>-p-<sku>`, `?sku=` YOK). Faz 2 öncesi
 *    modelin slug metni yok → metin olarak aile slug'ı (Faz 3b'deki `handleSelectVariant` ile aynı
 *    sözleşme; rota modeli SKU'dan çözer).
 *  - boş aile slug'ı (eski sipariş/favori satırı) → kırık adres üretmek yerine tüm ürünler.
 *  - UUID (veri kaçağı) → bugünkü eski yol; sayfa katmanı UUID'yi çözer (madde 6, REC-289).
 */
export function adresRotalari(dil: AdresDili, bayrak: boolean = ADRES_SEMASI_K3B): AdresRotalari {
  if (!bayrak) {
    return {
      category: (slug, subSlug) => localizedHref(Routes.category(slug, subSlug), dil),
      product: (slug, sku) => localizedHref(Routes.product(slug, sku), dil),
      products: (params) => localizedHref(Routes.products(params), dil),
      brand: (slug) => localizedHref(Routes.brand(slug), dil),
    }
  }
  return {
    category: (slug, subSlug) => {
      const dal = subSlug && subSlug !== 'undefined' && subSlug !== slug ? subSlug : null
      return adresUret({ tur: 'kategori', kok: slug, dal }, dil, true)
    },
    product: (slug, sku) => {
      if (!slug) return adresUret({ tur: 'urunler' }, dil, true)
      if (UUID.test(slug)) return localizedHref(Routes.product(slug, sku), dil)
      return sku
        ? adresUret({ tur: 'model', aileSlug: slug, sku, slug }, dil, true)
        : adresUret({ tur: 'aile', slug }, dil, true)
    },
    products: (params) => {
      const temel = adresUret({ tur: 'urunler' }, dil, true)
      // Sorgu parametreleri `Routes.products` ile AYNI kurulur (tek kaynak): yalnız yol değişir.
      const bugunku = Routes.products(params)
      const i = bugunku.indexOf('?')
      return (i < 0 ? temel : `${temel}${bugunku.slice(i)}`) as Route
    },
    brand: (slug) => adresUret({ tur: 'marka', slug }, dil, true),
  }
}

/**
 * Modeller satırının `<a href>` adresi (URN-21) — aile sayfasındaki seçici ve testler AYNI işlevi çağırır.
 * KAPALIYKEN `?sku=` biçimi (`/tr/products/<aile>?sku=<sku>`), AÇIKKEN modelin kendi kısa adresi
 * (`/tr/urun/<aile>-p-<sku>`); ikisi de `adresRotalari().product`'tan, elle birleştirme yok.
 */
export function modelBaglantiAdresi(
  dil: AdresDili,
  aileSlug: string,
  sku: string,
  bayrak: boolean = ADRES_SEMASI_K3B,
): string {
  return adresRotalari(dil, bayrak).product(aileSlug, sku)
}

/**
 * `Routes.category` için ÜST KATEGORİYİ ve DİLE GÖRE slug'ı bilen yüzeyin argümanları (REC-403).
 *
 * NİÇİN VAR: `adresRotalari().category(slug)` AÇIK kipte tek slug'ı kök sayar (`/tr/kategori/<slug>`).
 * Yüzey aslında bir DAL taşıyorsa (üstünü bilmeden) ya da kök slug'ı EN kanonik biçimde veriyorsa
 * (TR sayfada `fans`), ziyaretçi hedefe doğrudan değil, sayfa katmanının 308'i üzerinden bir fazla
 * sıçramayla varır (ölçüm 2026-09-29: TR'de çip `fans` → `/tr/kategori/fans` → 308 → `fanlar`).
 *
 * Kullanım: `const k = kategoriArgumanlari(…); Routes.category(k.slug, k.subSlug)`.
 *
 * ⭐KAPALIYKEN (bugün) `{ slug: bugunkuSlug }` döner: yüzeyin bugünkü tek slug çağrısı BİREBİR (yeni kod
 * yolu yok; `subSlug` tanımsız = `Routes.category(slug)`). AÇIKKEN üst biliniyorsa `{ slug: üst,
 * subSlug: dal }`, değilse `{ slug }`: kanonik adres, sıçramasız.
 */
export function kategoriArgumanlari(
  bugunkuSlug: string,
  tam: { slug: string; ustSlug?: string | null },
  bayrak: boolean = ADRES_SEMASI_K3B,
): { slug: string; subSlug?: string } {
  if (!bayrak) return { slug: bugunkuSlug }
  return tam.ustSlug && tam.ustSlug !== tam.slug ? { slug: tam.ustSlug, subSlug: tam.slug } : { slug: tam.slug }
}

/** Dile göre bölüm adları — yalnız yol DÖNÜŞTÜRMEK için (üretim `adresUret`'te). */
const YENI_BOLUM: Record<AdresDili, { urunler: string; kategori: string; urun: string; marka: string }> = {
  tr: { urunler: 'urunler', kategori: 'kategori', urun: 'urun', marka: 'markalar' },
  en: { urunler: 'products', kategori: 'category', urun: 'products', marka: 'brands' },
}

/** Bilgi Merkezi liste sayfasının `dil`'deki yolu (`/tr/bilgi-merkezi`, `/en/knowledge-hub`); bölüm adı `.mjs`'ten. */
const bilgiMerkeziListe = (dil: AdresDili): string => `/${dil}/${BILGI_MERKEZI_BOLUMU[dil]}`

/**
 * DİL DEĞİŞTİRİCİ yolu (LanguageSwitcher). Bugün yalnız dil segmenti değişir. AÇIK kipte bölüm adı da
 * çevrilir: `/tr/urun/x` ↔ `/en/products/x`, `/tr/urunler` ↔ `/en/products`, `/tr/kategori/…` ↔
 * `/en/category/…`, `/tr/markalar/x` ↔ `/en/brands/x` — yoksa dil değişince 404'e düşülürdü
 * (`/en/urun/x` rotası yok). Slug'lar AYNEN taşınır: kategori slug'ı dile göre farklıysa hedef sayfa
 * kanoniğine tek 308 verir (Faz 3b-2); aile/model slug'ı bugün iki dilde aynı.
 */
export function dilDegistirYolu(
  pathname: string,
  yeniDil: AdresDili,
  bayrak: boolean = ADRES_SEMASI_K3B,
  enYayin: boolean = EN_YAYIN,
): string {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment !== 'tr' && firstSegment !== 'en') {
    return '/' + yeniDil + (pathname === '/' ? '' : pathname)
  }
  if (firstSegment !== yeniDil) {
    // BİLGİ MERKEZİ (ALT-14): bölüm adı dile göre değişir (`/tr/bilgi-merkezi` ↔ `/en/knowledge-hub`). Yalnız dil
    // segmentini değiştirmek `/en/bilgi-merkezi` üretirdi: canlıda 404 (2026-10-04 matrisi). EN yayını KAPALIYKEN
    // EN'de Bilgi Merkezi yoktur → TR'deki gibi `bilgiMerkeziYonlendirmeleri` hedefine DOĞRUDAN gidilir (ek sıçrama
    // yok). AÇIKKEN liste ↔ liste; yazı slug'ı dile göre farklı olduğu için yazıdan liste sayfasına inilir
    // (yazı eşi bu dosyaya yüklenmez: yazı metinleri istemci paketine girmesin).
    if (firstSegment === 'tr' && segments[1] === BILGI_MERKEZI_BOLUMU.tr && yeniDil === 'en') {
      return enYayin ? bilgiMerkeziListe(yeniDil) : EN_KAPALI_LISTE_HEDEFI
    }
    if (firstSegment === 'en' && segments[1] === BILGI_MERKEZI_BOLUMU.en && yeniDil === 'tr') {
      return bilgiMerkeziListe(yeniDil)
    }
    // ROTA DİLİ (OPS-52): statik sayfanın görünen yolu dile göre değişir (`/tr/iletisim` ↔ `/en/contact`).
    // Eşleşme eski dilin GÖRÜNEN yolu üzerindendir; K3B bölümleri (kategori/ürün/marka) tabloda olmadığından
    // iki çeviri ayrışıktır ve sıra sonucu değiştirmez. Anahtar kapalıyken `rotaDiliCevirOku` yolu AYNEN verir.
    const eskiKalan = `/${segments.slice(1).join('/')}`
    const cevrilen = rotaDiliCevirOku(eskiKalan, firstSegment, yeniDil)
    if (cevrilen !== eskiKalan) return `/${yeniDil}${cevrilen}`
  }
  segments[0] = yeniDil
  if (bayrak && firstSegment !== yeniDil && segments.length > 1) {
    const eski = YENI_BOLUM[firstSegment]
    const yeni = YENI_BOLUM[yeniDil]
    const bolum = segments[1]
    if (bolum === eski.kategori) segments[1] = yeni.kategori
    else if (bolum === eski.marka) segments[1] = yeni.marka
    else if (firstSegment === 'tr' && bolum === eski.urunler) segments[1] = yeni.urunler
    else if (firstSegment === 'tr' && bolum === eski.urun) segments[1] = yeni.urun
    // EN `products` iki TR bölüme ayrılır: alt yol varsa ürün (`urun`), yoksa liste (`urunler`).
    else if (firstSegment === 'en' && bolum === eski.urun) segments[1] = segments.length > 2 ? yeni.urun : yeni.urunler
  }
  return '/' + segments.join('/')
}

/**
 * DİL DEĞİŞTİRİCİ hedefi: `dilDegistirYolu` + sorgu dizesi ve parça (ALT-14: `?dept=x#form` dil değişince
 * kayboluyordu). Bilgi Merkezi'nde sorgu/parça taşınmaz: hedef çoğu zaman BAŞKA sayfadır (EN kapalıyken Ürün
 * Seçici, yazıdan liste), eski sayfanın `#bölüm`ü orada anlamsızdır. `arama` `window.location.search`,
 * `parca` `window.location.hash` (tıklama işleyicisinde okunur; hook yok, kural 5).
 */
export function dilDegistirHedefi(
  pathname: string,
  yeniDil: AdresDili,
  arama: string = '',
  parca: string = '',
  bayrak: boolean = ADRES_SEMASI_K3B,
  enYayin: boolean = EN_YAYIN,
): string {
  const yol = dilDegistirYolu(pathname, yeniDil, bayrak, enYayin)
  const bolum = pathname.split('/').filter(Boolean)[1]
  const bilgiMerkezinde = bolum === BILGI_MERKEZI_BOLUMU.tr || bolum === BILGI_MERKEZI_BOLUMU.en
  return bilgiMerkezinde ? yol : `${yol}${arama}${parca}`
}

/**
 * Yol bir ÜRÜN DETAY sayfası mı (ClientLayout gezinme yığını bu sayfaları atlar). Bugün yalnız
 * `/products/` içeren yollar; AÇIK kipte `/tr/urun/<x>` da.
 */
export function urunDetayYoluMu(pathname: string, bayrak: boolean = ADRES_SEMASI_K3B): boolean {
  if (pathname.includes('/products/')) return true
  return bayrak && /^\/tr\/urun\/[^/]/.test(pathname)
}

/**
 * Alt sekme "Ürünler" hangi yol öneklerinde seçili görünür. Bugün `/<dil>/products` (ürün detayı
 * dahil, alt yol olarak). AÇIK kipte TR'de liste `/tr/urunler`, detay `/tr/urun/…` ayrı bölümlerdir.
 */
export function urunlerBolumuOnekleri(dil: AdresDili, bayrak: boolean = ADRES_SEMASI_K3B): string[] {
  if (!bayrak) return [localizedHref(Routes.products(), dil)]
  const liste = adresUret({ tur: 'urunler' }, dil, true)
  const aileOrnek = adresUret({ tur: 'aile', slug: 'x' }, dil, true)
  const detayBolumu = aileOrnek.slice(0, aileOrnek.lastIndexOf('/'))
  return detayBolumu === liste ? [liste] : [liste, detayBolumu]
}

/**
 * JSON-LD / kırıntı için DİL ÖNEKLİ yol. Bugün kırıntı adımları dilsiz yol taşır ve önek JSON-LD
 * üreticisinde eklenir; AÇIK kipte adım zaten `adresUret` çıktısıdır (önekli).
 */
export function kategoriKirintiYolu(
  kok: string,
  dal: string | null,
  dil: AdresDili,
  bayrak: boolean = ADRES_SEMASI_K3B,
): string {
  return bayrak ? adresUret({ tur: 'kategori', kok, dal }, dil, true) : Routes.category(kok, dal ?? undefined)
}

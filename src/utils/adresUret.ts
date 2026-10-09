/**
 * ADRES ÜRETİCİ — vitrin adreslerinin TEK kaynağı (REC-300 Faz 3, plan §5 Faz 3 madde 2).
 *
 * NİÇİN TEK FONKSİYON: bugün adres bilgisi en az 13 yüzeye dağılmış (canonical, hreflang, og:url,
 * JSON-LD, site haritası, kırıntı, kart, arama, IndexNow, dil seçici…). Şema değiştiği gün bunların
 * birini unutmak = aynı nesne iki adresten yayınlanır (REC-205'te Google iki seviyeli adresimizi
 * böyle eledi). Tek üretici olunca şema değişikliği tek bayrakla olur.
 *
 * İKİ KİP (bayrak `ADRES_SEMASI_K3B`, src/config/features.ts):
 *  - KAPALI (bugün): bugünkü `Routes` + `localizedHref` çağrılır — çıktı BİREBİR aynı (test ölçer).
 *    Yüzeyler bu fonksiyona bağlandıkça canlıda hiçbir adres değişmez.
 *  - AÇIK (Faz 3-C): plan §2 hedef şeması.
 *
 * Dil öneki elle yazılmaz (kural 7): önek `localizedHref`'ten gelir; yalnız dile göre değişen
 * BÖLÜM ADI (`urun` / `products`) burada, tek tabloda durur.
 */
import type { Route } from 'next'

import { ADRES_SEMASI_K3B } from '../config/features'
import { modelSlugu } from '../config/yayindaModeller'
import { modelSegmentiUret } from './modelAdresBicimi'
import { localizedHref, Routes } from './routes'

export type AdresDili = 'tr' | 'en'

/**
 * Adresi üretilecek nesne. Slug'lar ÇAĞIRANIN diline göre verilir (kategori için
 * `getLocalizedCategorySlug`, model için Faz 2'den sonra `slug_i18n[dil]`).
 */
export type AdresNesnesi =
  | { tur: 'urunler' }
  | { tur: 'kategori'; kok: string; dal?: string | null }
  | { tur: 'aile'; slug: string }
  /**
   * Model: adres metni (slug_tr/slug_en) YAYINDAKİ MODELLER listesinden gelir (`config/yayindaModeller`); `slug`
   * alanı eski çağrı yerleri için kabul edilir ve YOK SAYILIR. Liste dışı SKU'nun model sayfası yoktur → aile
   * adresi + `?sku=` seçimi (URN-31). `aileSlug` yalnız bu yedek yol içindir.
   */
  | { tur: 'model'; aileSlug: string; sku: string; slug?: string | null }
  | { tur: 'marka'; slug: string }

/** Yeni şemada dile göre bölüm adları (plan §2). EN'de önekler bugünküyle aynı. */
const BOLUM: Record<AdresDili, { urunler: string; kategori: string; urun: string; marka: string }> = {
  tr: { urunler: 'urunler', kategori: 'kategori', urun: 'urun', marka: 'markalar' },
  en: { urunler: 'products', kategori: 'category', urun: 'products', marka: 'brands' },
}

// Model adresi BİÇİMİ (ayırıcı, üretim, ayrıştırma) tek modülde: `modelAdresBicimi.ts`. Eski içe aktarma yolları korunur.
export type { CozulmusModelAdresi } from './modelAdresBicimi'
export { MODEL_AYIRICI, modelAdresiCoz } from './modelAdresBicimi'

const seg = (s: string) => encodeURIComponent(s)

/** Bugünkü (bayrak kapalı) adres — `Routes` + `localizedHref`; yeni kod YAZILMAZ, eşitlik garanti. */
function bugunkuAdres(n: AdresNesnesi, dil: AdresDili): Route {
  switch (n.tur) {
    case 'urunler':
      return localizedHref(Routes.products(), dil)
    case 'kategori':
      return localizedHref(Routes.category(n.kok, n.dal ?? undefined), dil)
    case 'aile':
      return localizedHref(Routes.product(n.slug), dil)
    case 'model':
      return localizedHref(Routes.product(n.aileSlug, n.sku), dil)
    case 'marka':
      return localizedHref(Routes.brand(n.slug), dil)
  }
}

/** Yeni şema (plan §2). */
function yeniAdres(n: AdresNesnesi, dil: AdresDili): Route {
  const b = BOLUM[dil]
  switch (n.tur) {
    case 'urunler':
      return localizedHref(`/${b.urunler}`, dil)
    case 'kategori':
      // İki seviye kanonik, iki dilde (REC-205 dersi): dal varsa adres HER ZAMAN kök/dal.
      return localizedHref(n.dal ? `/${b.kategori}/${seg(n.kok)}/${seg(n.dal)}` : `/${b.kategori}/${seg(n.kok)}`, dil)
    case 'aile':
      return localizedHref(`/${b.urun}/${seg(n.slug)}`, dil)
    case 'model': {
      // TEK NOKTA (URN-31, INV-YAYINDA-MODEL-4/6): model adresi YALNIZ yayındaki listedeki SKU için üretilir; adres
      // metni listedeki `slug_<dil>`'dir (çağıranın metni yok sayılır). Liste dışı SKU'nun model sayfası YOKTUR
      // (404): aile sayfası + `?sku=` seçimi — bugünkü (kapalı kip) davranışın yeni şemadaki karşılığı. Boş liste =
      // hiçbir model adresi (fail-closed). Redirect hedefinde sorgu istenmezse `yonlendirmeNesnesi` kullanılır.
      const slug = modelSlugu(n.sku, dil)
      if (slug === null) {
        const aile = localizedHref(`/${b.urun}/${seg(n.aileSlug)}`, dil)
        const sku = n.sku.trim()
        return (sku ? `${aile}?sku=${encodeURIComponent(sku)}` : aile) as Route
      }
      return localizedHref(`/${b.urun}/${modelSegmentiUret(slug, n.sku)}`, dil)
    }
    case 'marka':
      return localizedHref(`/${b.marka}/${seg(n.slug)}`, dil)
  }
}

/**
 * Nesnenin kanonik adresi. `bayrak` yalnız test içindir; üretim kodu varsayılanı kullanır.
 */
export function adresUret(n: AdresNesnesi, dil: AdresDili, bayrak: boolean = ADRES_SEMASI_K3B): Route {
  return bayrak ? yeniAdres(n, dil) : bugunkuAdres(n, dil)
}

/**
 * YÖNLENDİRME HEDEFİ nesnesi (URN-31): bir SKU'ya 308 verilirken hedef. Liste İÇİ → modelin kendi adresi; liste DIŞI
 * → AİLE adresi, SORGUSUZ (model sayfası yok; `?sku=` taşımak hedefte yeniden eşleşir, middleware'de `%3F` olur).
 * Adres metni yine `adresUret`'ten çıkar; bu fonksiyon yalnız hangi nesnenin kurulacağını söyler.
 */
export function yonlendirmeNesnesi(aileSlug: string, sku: string): AdresNesnesi {
  return modelSlugu(sku, 'tr') === null ? { tur: 'aile', slug: aileSlug } : { tur: 'model', aileSlug, sku }
}

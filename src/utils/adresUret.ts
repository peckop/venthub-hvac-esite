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
  /** `slug` = modelin kendi adres metni (Faz 2, `slug_i18n`). Yeni şemada yoksa aile adresine düşülür. */
  | { tur: 'model'; aileSlug: string; sku: string; slug?: string | null }
  | { tur: 'marka'; slug: string }

/** Yeni şemada dile göre bölüm adları (plan §2). EN'de önekler bugünküyle aynı. */
const BOLUM: Record<AdresDili, { urunler: string; kategori: string; urun: string; marka: string }> = {
  tr: { urunler: 'urunler', kategori: 'kategori', urun: 'urun', marka: 'markalar' },
  en: { urunler: 'products', kategori: 'category', urun: 'products', marka: 'brands' },
}

/** Model adresinde slug metni ile SKU'yu ayıran işaret. Slug metninde ve SKU başında geçemez (plan §2, D1). */
export const MODEL_AYIRICI = '-p-'

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
      // SKU adreste küçük harf (plan §2). Slug yoksa (Faz 2 öncesi veri) aile adresi: kırık adres
      // üretmek yerine doğru sayfaya, eksik ayrıntıyla gidilir — hata yutulmaz, geliştirmede bağırır.
      if (!n.slug) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[adresUret] model ${n.sku} için slug yok — aile adresine düşüldü (Faz 2 verisi eksik)`)
        }
        return localizedHref(`/${b.urun}/${seg(n.aileSlug)}`, dil)
      }
      return localizedHref(`/${b.urun}/${seg(n.slug)}${MODEL_AYIRICI}${seg(n.sku.toLowerCase())}`, dil)
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

export interface CozulmusModelAdresi {
  /** Adresteki slug metni (yanlış olabilir — doğrusu SKU'dan bulunur, farklıysa 308). */
  slugMetni: string
  /** DB biçiminde SKU (büyük harf; DB kısıtı `^[A-Z0-9-]+$`). */
  sku: string
  /** Adresteki SKU zaten kanonik (küçük harf) biçimde mi? Değilse çağıran 308 verir. */
  skuKanonik: boolean
}

/**
 * `/urun/<segment>` segmentinin model adresi olup olmadığını çözer (plan §5 Faz 3 madde 3).
 * SON `-p-`'den bölünür: slug metni `-p-` içeremez, SKU `P-` ile başlayamaz (D1) — ikisi birlikte
 * bölmeyi tek anlamlı yapar. `-p-` yoksa → null (aile adresi). Boş parça → null (geçersiz).
 * SAF: DB'ye bakmaz; SKU'nun var olup olmadığını çağıran ölçer.
 */
export function modelAdresiCoz(segment: string): CozulmusModelAdresi | null {
  let cozulmus: string
  try {
    cozulmus = decodeURIComponent(segment)
  } catch {
    return null
  }
  const i = cozulmus.lastIndexOf(MODEL_AYIRICI)
  if (i < 0) return null
  const slugMetni = cozulmus.slice(0, i)
  const skuParca = cozulmus.slice(i + MODEL_AYIRICI.length)
  if (!slugMetni || !skuParca) return null
  return { slugMetni, sku: skuParca.toUpperCase(), skuKanonik: skuParca === skuParca.toLowerCase() }
}

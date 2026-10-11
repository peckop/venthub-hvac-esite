/**
 * AİLE / MODEL SAYFASI KIRINTISI — görünür kırıntı ile JSON-LD BreadcrumbList'in TEK kaynağı (URN-21).
 *
 * NİÇİN: kırıntı eskiden iki ayrı yerde, iki ayrı veriden üretiliyordu. JSON-LD sunucuda (kategori
 * çözülmüş), görünür kırıntı istemcide (`useCategories()` bağlamı, ilk render'da BOŞ). Sonuç canlıda
 * ölçüldü (2026-10-03, ham HTML, JS yok): 47 aile sayfasında gövdede kategoriye/markaya giden 0
 * bağlantı, yalnız "Ana Sayfa". Kırıntı yalnız JSON-LD'de vardı, tıklanabilir `<a>` değildi; arama
 * motoru siteyi `<a href>` ile gezer, yani kategori ve markalar gövdeden gelen bağlantı almıyordu.
 *
 * Artık zincir BİR kez, sunucuda kurulur ve iki yüzeye aynı nesne verilir: JSON-LD
 * (`buildBreadcrumbJsonLd`) ve görünür `<nav>` (`AileKirintisi`). İkisi ayrışamaz.
 *
 * Adresler adres üreticisinden gelir (`kategoriKirintiYolu`, `adresRotalari`); elle `/tr/` eklenmez.
 * Görünen adlar çağırandan gelir (sözlük / `getCategoryDisplayName` / `familyName`); bu modül ad çözmez.
 */
import { ADRES_SEMASI_K3B } from '../../config/features'
import type { AdresDili } from '../../utils/adresUret'
import { localizedHref } from '../../utils/routes'
import { adresRotalari, kategoriKirintiYolu } from '../../utils/yuzeyAdresleri'

/** Zincirin tek basamağı. `path`: dil önekli ya da öneksiz site yolu; son basamakta (bulunulan sayfa) `null`. */
export interface KirintiAdimi {
  name: string
  path: string | null
}

/** Adım yolu zaten `/tr` ya da `/en` ile mi başlıyor (`adresUret` çıktısı) — önek ikinci kez eklenmez. */
export const dilOnekliMi = (yol: string): boolean => /^\/(tr|en)(\/|$)/.test(yol)

/**
 * Adım yolunun dil önekli ve TARAYICIDA tıklanabilir hâli (`localizedHref`: önekli yola dokunmaz).
 * Ana sayfa `/tr` olur (`/tr/` değil): sondaki eğik çizgi site içi bir yönlendirme doğurur.
 * (JSON-LD tarafı kendi `item` birleşimini korur.)
 */
export const kirintiHref = (path: string, lang: string): string => localizedHref(path, lang)

interface KirintiAd {
  ad: string
  slug: string
}

export interface AileKirintisiGirdisi {
  dil: AdresDili
  /** Sözlükten: `category.breadcrumbHome`. */
  anasayfaAdi: string
  /** Ana kategori (görünen ad + dile göre slug). Çözülemediyse `null` → basamak yok, zincir kısalır. */
  ana: KirintiAd | null
  /** Alt kategori; ana ile aynı slug'sa ya da ana yoksa eklenmez. */
  alt: KirintiAd | null
  /** Marka kaydı (vitrindeki marka sayfası olan). Çözülemediyse `null` → basamak yok. */
  marka: KirintiAd | null
  /** Aile: görünen ad (`familyName`) + slug. */
  aile: KirintiAd
  /** Model sayfasında seçili modelin görünen etiketi; aile sayfasında `null`. */
  model: { etiket: string } | null
  /** Yalnız test içindir (varsayılan `ADRES_SEMASI_K3B`). */
  bayrak?: boolean
}

/**
 * Ana Sayfa › Kategori › [Alt kategori] › Marka › Aile › [Model].
 *
 * Çözülemeyen basamak (kategori/marka yok, ad boş) HİÇ eklenmez: zincir kısalır, kırılmaz. Son basamak
 * bulunulan sayfadır ve `path` taşımaz: aile sayfasında aile, model sayfasında model. Model sayfasında
 * aile basamağı bağlantıdır.
 */
export function aileKirintiAdimlari(girdi: AileKirintisiGirdisi): KirintiAdimi[] {
  const { dil, anasayfaAdi, ana, alt, marka, aile, model, bayrak = ADRES_SEMASI_K3B } = girdi
  const gecerli = (k: KirintiAd | null): k is KirintiAd => !!k && !!k.ad.trim() && !!k.slug
  const rotalar = adresRotalari(dil, bayrak)

  const adimlar: KirintiAdimi[] = [{ name: anasayfaAdi, path: '/' }]
  if (gecerli(ana)) {
    adimlar.push({ name: ana.ad, path: kategoriKirintiYolu(ana.slug, null, dil, bayrak) })
    if (gecerli(alt) && alt.slug !== ana.slug) {
      adimlar.push({ name: alt.ad, path: kategoriKirintiYolu(ana.slug, alt.slug, dil, bayrak) })
    }
  }
  if (gecerli(marka)) adimlar.push({ name: marka.ad, path: rotalar.brand(marka.slug) })

  if (model && model.etiket.trim()) {
    adimlar.push({ name: aile.ad, path: rotalar.product(aile.slug) })
    adimlar.push({ name: model.etiket, path: null })
  } else {
    adimlar.push({ name: aile.ad, path: null })
  }
  return adimlar
}

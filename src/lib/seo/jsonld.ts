/**
 * F5-B W3.1 — Yapılandırılmış veri (JSON-LD) SSOT'u.
 *
 * Saf fonksiyonlar (React'sız). Sunucu bileşenleri (page.tsx) bu modülü çağırıp
 * dönen düz objeyi `<script type="application/ld+json">` içine serialize eder.
 *
 * PDP artık AİLE-canonic (getFamilyDetail → {family, variants}); bu yüzden ürün
 * JSON-LD'si tek-Product değil schema.org ProductGroup + hasVariant[] üretir.
 * Fiyatı NULL olan varyanta (Teklif Alın modeli) `offers` alanı HİÇ yazılmaz —
 * eski koddaki fiyatsız "0.00" beyanı (Merchant uyumsuzluğu) burada biter.
 *
 * W4b (T001-VH): `variant.price` ham `products.price` DEĞİL — `get_family_detail`
 * RPC'si onu `display_price(products)` ile motor cache'inden türetir (INV-PRICE-1).
 * Bu modülde ikinci bir fiyat hesabı yoktur; yalnız beyan edilip edilmeyeceğine karar verilir.
 */

import type { FamilyListItem } from '../../types/ui-models'
import { storagePathToUrl } from '../images/productImage'
import type { FamilyDetail, FamilyVariant } from '../services/family.service'

type LocalizedText = { tr?: string | null; en?: string | null } | null

/** Aile description/meta alanları için dil çözümü (tercih edilen dil → tr → en). */
function pickLocalized(value: LocalizedText, lang: string): string | null {
  if (!value) return null
  const preferred = lang === 'en' ? value.en : value.tr
  return preferred || value.tr || value.en || null
}

/** Site adı — root layout'taki WebSite JSON-LD ("isPartOf" hedefi) ile aynı. */
const SITE_NAME = 'VentHub'

function buildWebSiteRef(baseUrl: string) {
  return {
    '@type': 'WebSite' as const,
    name: SITE_NAME,
    url: baseUrl,
  }
}

export interface BuildProductGroupJsonLdParams {
  family: FamilyDetail['family']
  variants: FamilyVariant[]
  lang: string
  baseUrl: string
}

/**
 * Aile → schema.org ProductGroup.
 *   - productGroupID = family.slug
 *   - url = `${baseUrl}/${lang}/products/${family.slug}` (varyant URL'i YAZILMAZ)
 *   - hasVariant: her varyant için Product {name, sku, mpn, image?, offers?}
 *   - fiyatı olmayan (NULL veya ≤ 0) varyanta offers alanı HİÇ yazılmaz.
 *
 * Fiyat eşiği vitrinin "Teklif Alın" eşiğiyle AYNIDIR: 0/negatif fiyat, fiyatı olmayan
 * ürünün başka bir yazılışıdır — beyan edilirse arama sonucunda "0,00 ₺" görünür.
 */
export function buildProductGroupJsonLd(params: BuildProductGroupJsonLdParams): Record<string, unknown> {
  const { family, variants, lang, baseUrl } = params
  const url = `${baseUrl}/${lang}/products/${family.slug}`
  const description =
    pickLocalized(family.description, lang) ||
    (lang === 'en' ? 'VentHub Product Details' : 'VentHub Ürün Detayı')

  const hasVariant = variants.map((variant) => {
    const imagePath = variant.images[0]?.path
    const productNode: Record<string, unknown> = {
      '@type': 'Product',
      name: variant.name,
      sku: variant.sku,
      mpn: variant.model_code ?? variant.sku,
    }

    if (imagePath) {
      productNode.image = storagePathToUrl(imagePath)
    }

    // Teklif Alın modeli: motor fiyatı yoksa (NULL/≤0) offers alanı hiç yazılmaz
    // (Merchant uyumsuzluğu ve "0,00 ₺" beyanı önlenir).
    const offerPrice = variant.price == null ? null : Number(variant.price)
    if (offerPrice != null && Number.isFinite(offerPrice) && offerPrice > 0) {
      productNode.offers = {
        '@type': 'Offer',
        price: offerPrice.toFixed(2),
        priceCurrency: 'TRY',
        availability:
          (variant.stock_qty ?? 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      }
    }

    return productNode
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    productGroupID: family.slug,
    name: family.name,
    description,
    url,
    ...(family.brand_name && {
      brand: {
        '@type': 'Brand',
        name: family.brand_name,
      },
    }),
    isPartOf: buildWebSiteRef(baseUrl),
    hasVariant,
  }
}

export interface BuildCategoryJsonLdParams {
  lang: string
  baseUrl: string
  categorySlug: string
  name: string
  description: string
  total: number
  page: number
  pageSize: number
  families: FamilyListItem[]
}

/**
 * Kategori → schema.org CollectionPage + ItemList.
 * B9 düzeltmesi: itemListElement URL'lerine `/${lang}` prefix'i garanti edilir
 * (eski kod `${baseUrl}/products/${slug}` yazıyordu, dilsiz kalıyordu).
 */
export function buildCategoryJsonLd(params: BuildCategoryJsonLdParams): Record<string, unknown> {
  const { lang, baseUrl, categorySlug, name, description, total, page, pageSize, families } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${baseUrl}/${lang}/category/${categorySlug}`,
    isPartOf: buildWebSiteRef(baseUrl),
    numberOfItems: total,
    itemListElement: families.map((family, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * pageSize + index + 1,
      url: `${baseUrl}/${lang}/products/${family.slug}`,
    })),
  }
}

export interface BuildSeriesLandingJsonLdParams {
  lang: string
  baseUrl: string
  seriesSlug: string
  name: string
  description: string
  /** Seri altındaki modeller — kart listesiyle AYNI kaynak (`FamilyListItem[]`). */
  models: FamilyListItem[]
}

/**
 * T138-VH K7 — Seri landing → schema.org CollectionPage + ItemList.
 *
 * `ProductGroup` KASITLI KULLANILMAZ: seri satılabilir bir ürün değil, altındaki MODELLERİN
 * listesidir (K1 kararı — "KART = MODEL, SERİ = LANDING"). Şekil `buildCategoryJsonLd` ile
 * BİREBİR aynı (CollectionPage + numberOfItems + itemListElement) — kategori sayfası da aynı
 * sınıf içerik sunar (bir grup ürünün landing'i). Sayfalama YOK: seri sayfası tüm modellerini
 * tek seferde basar (`?page=` bu yüzeyde hiç yok), bu yüzden `buildCategoryJsonLd`'nin
 * page/pageSize parametreleri burada bulunmaz.
 *
 * BreadcrumbList BU DALDA eklenmez: seri landing'i `SeriesLandingView` üzerinden paylaşılan
 * `Breadcrumb.tsx` bileşenini kullanır ve o bileşen kendi `items` prop'undan zaten TAM bir
 * BreadcrumbList JSON-LD'si basar. Burada ikincisini üretmek aynı sayfada İKİ BreadcrumbList
 * düğümü demek olurdu (mükerrer yapılandırılmış veri).
 *
 * ⚠️ BU GEREKÇE YALNIZ SERİ DALI İÇİN GEÇERLİDİR — 2026-08-23'te ölçüldü. Aynı rotanın MODEL
 * dalı (`ProductDetailPageView`) o bileşeni HİÇ kullanmıyor, breadcrumb'ı elle `<nav>` olarak
 * yazıyor; dolayısıyla en çok trafik alan sayfa tipinde BreadcrumbList HİÇ basılmıyordu.
 * Yani gerekçe doğru bir ölçüme dayanıyordu ama YANLIŞ KAPSAMA uygulanmıştı. Model dalı için
 * `buildBreadcrumbJsonLd` (aşağıda) kullanılır.
 *
 * Fiyat/offers HİÇ yazılmaz — `itemListElement` yalnız `url` taşır (kategori sayfasıyla aynı
 * disiplin); "Teklif Alın" modelinde model listesinden fiyat sızdırmanın bir yolu yok.
 */
export function buildSeriesLandingJsonLd(params: BuildSeriesLandingJsonLdParams): Record<string, unknown> {
  const { lang, baseUrl, seriesSlug, name, description, models } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${baseUrl}/${lang}/products/${seriesSlug}`,
    isPartOf: buildWebSiteRef(baseUrl),
    numberOfItems: models.length,
    itemListElement: models.map((model, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/${lang}/products/${model.slug}`,
    })),
  }
}

/** Breadcrumb zincirinin tek basamağı. `path` = dil öneksiz site yolu (`/category/fans`). */
export interface BreadcrumbStep {
  name: string
  /**
   * Bu basamağın hedefi. **Son basamak (bulunulan sayfa) `null` olmak ZORUNDA** — site
   * genelindeki `Breadcrumb.tsx` de son öğeye `item` yazmaz; iki yüzeyin aynı şekli üretmesi
   * için burada da kural aynıdır.
   */
  path: string | null
}

export interface BuildBreadcrumbJsonLdParams {
  lang: string
  baseUrl: string
  steps: BreadcrumbStep[]
}

/**
 * Breadcrumb zinciri → schema.org BreadcrumbList.
 *
 * NİÇİN AYRI BİR FONKSİYON: BreadcrumbList'i bugüne kadar YALNIZ `Breadcrumb.tsx` bileşeni
 * basıyordu. Ürün detay sayfası (model dalı) o bileşeni kullanmıyor, breadcrumb'ını elle
 * `<nav>` olarak yazıyor — sonuç: en çok trafik alan sayfa tipinde yapılandırılmış breadcrumb
 * verisi HİÇ yoktu, diğer tüm sayfalarda vardı. Görsel breadcrumb'ın varlığı, makinenin onu
 * okuyabildiği anlamına gelmiyordu.
 *
 * Şekil bilerek `Breadcrumb.tsx` ile BİREBİR aynı: `name` her basamakta var, `item` yalnız
 * hedefi olan basamaklarda. Aynı sitede iki farklı BreadcrumbList şekli üretmek, ileride
 * "hangisi doğru" sorusunu doğurur.
 *
 * SÖZLEŞME İHLALİ SESSİZ GEÇMEZ: iki basamaktan az zincir ya da son basamağa yol verilmesi
 * ATAR. Bunlar kullanıcı verisinden değil ÇAĞIRAN KODDAN gelir; sessizce düzeltmek, bozuk
 * yapılandırılmış veriyi fark edilmeden yayına almak olurdu.
 */
export function buildBreadcrumbJsonLd(params: BuildBreadcrumbJsonLdParams): Record<string, unknown> {
  const { lang, baseUrl, steps } = params

  if (steps.length < 2) {
    throw new Error(`buildBreadcrumbJsonLd: zincir en az iki basamak olmali (gelen: ${steps.length})`)
  }
  const son = steps[steps.length - 1]
  if (son.path !== null) {
    throw new Error(`buildBreadcrumbJsonLd: son basamak bulunulan sayfadir, path null olmali (gelen: "${son.path}")`)
  }
  const bosAd = steps.find((s) => !s.name.trim())
  if (bosAd) throw new Error('buildBreadcrumbJsonLd: basamak adi bos olamaz')

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: steps.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      ...(step.path ? { item: `${baseUrl}/${lang}${step.path}` } : {}),
    })),
  }
}

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/**
 * Serialize edilmiş JSON-LD çıktısında UUID deseni ararsa throw eder.
 * Yalnız production DIŞINDA aktiftir (dev/test) — prod build'i UUID taraması
 * yüzünden hiç çökertmez, ama geliştirme sırasında sızıntıyı erken yakalar.
 */
export function assertNoUuid(jsonLd: unknown): void {
  if (process.env.NODE_ENV === 'production') return

  const serialized = JSON.stringify(jsonLd)
  if (UUID_PATTERN.test(serialized)) {
    throw new Error(`JSON-LD çıktısında UUID sızıntısı tespit edildi: ${serialized}`)
  }
}

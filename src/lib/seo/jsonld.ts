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

import { ADRES_SEMASI_K3B } from '../../config/features'
import { sitemapModelMi } from '../../config/yayindaModeller'
import type { FamilyListItem } from '../../types/ui-models'
import { adresUret } from '../../utils/adresUret'
import { dildekiMetin } from '../../utils/dilMetni'
import { getProductDisplayName, getProductModelLabel } from '../../utils/productHelpers'
import { adresRotalari } from '../../utils/yuzeyAdresleri'
import { familyName } from '../i18n/familyName'
import { storagePathToUrl } from '../images/productImage'
import { quoteModeHesapla } from '../pricing/quoteMode'
import type { FamilyDetail, FamilyVariant } from '../services/family.service'
import { dilOnekliMi } from './kirinti'

/**
 * Aile description/meta alanları için dil çözümü — YALNIZ sayfanın dili (INV-DIL-DUSUSU-1).
 * Metin yoksa yapısal veride `description` alanı hiç yazılmaz; yanlış dilde metin yayınlanmaz.
 */
const pickLocalized = dildekiMetin

/** Site adı — root layout'taki WebSite JSON-LD ("isPartOf" hedefi) ile aynı. */
const SITE_NAME = 'VentHub'

/**
 * REC-300 Faz 3d — JSON-LD adresleri `adresUret`'ten. `bayrak` yalnız test içindir (varsayılan
 * `ADRES_SEMASI_K3B`). KAPALIYKEN her üretici bugünkü şablon dizgesini AYNEN yazar (aşağıdaki
 * `bayrak ? … : \`${baseUrl}/${lang}/products/…\`` dalları) — yeni kod yolu yoktur.
 */
const dilOf = (lang: string) => (lang === 'en' ? 'en' : 'tr') as 'tr' | 'en'
const aileUrl = (baseUrl: string, lang: string, slug: string, bayrak: boolean) =>
  bayrak ? `${baseUrl}${adresUret({ tur: 'aile', slug }, dilOf(lang), true)}` : `${baseUrl}/${lang}/products/${slug}`

function buildWebSiteRef(baseUrl: string) {
  return {
    '@type': 'WebSite' as const,
    name: SITE_NAME,
    url: baseUrl,
  }
}

/** `ItemList` içindeki tek satır: konum + dil önekli mutlak adres (fiyat/offers YAZILMAZ). */
interface ListeSatiri {
  position: number
  url: string
}

/**
 * REC-494 — liste düğümü. `numberOfItems` ve `itemListElement` schema.org'da `ItemList`'in
 * özellikleridir, `CollectionPage`'in DEĞİL; sayfa düğümü listeyi `mainEntity` ile taşır
 * (canlı kapı `JSONLD-COLLECTIONPAGE`: üst düzeyde bu iki alan KIRMIZI, 28 kategori sayfasında
 * ölçüldü). İki CollectionPage üreticisi (kategori + seri) AYNI yardımcıyı kullanır; konum ve
 * adres hesabı çağıranda kalır, burada yalnız şekil kurulur.
 */
function buildItemList(numberOfItems: number, satirlar: ListeSatiri[]) {
  return {
    '@type': 'ItemList' as const,
    numberOfItems,
    itemListElement: satirlar.map(({ position, url }) => ({
      '@type': 'ListItem' as const,
      position,
      url,
    })),
  }
}

export interface BuildProductGroupJsonLdParams {
  family: FamilyDetail['family']
  variants: FamilyVariant[]
  lang: string
  baseUrl: string
  /**
   * Ana kategori — TEKLİF MODU kararı için ZORUNLU.
   *
   * ⭐REC-111: bu alan eskiden YOKTU ve eksikliği sessiz bir sızıntıydı. Kategori
   * parametre olmadığı için `hide_price` sorulamıyordu; builder yalnız "fiyat geçerli
   * mi" dalını uyguluyor, vitrin "Teklif Alın" derken schema.org gerçek fiyatı
   * yayınlıyordu. `null` geçmek GÜVENLİ tarafa düşer (mod bilinmiyor → teklif modu).
   */
  mainCategory: { metadata?: unknown } | null
  /** K3-b şeması (yalnız test verir; varsayılan `ADRES_SEMASI_K3B`). */
  bayrak?: boolean
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
  const { family, variants, lang, baseUrl, mainCategory, bayrak = ADRES_SEMASI_K3B } = params
  const url = aileUrl(baseUrl, lang, family.slug, bayrak)
  const description =
    pickLocalized(family.description, lang) ||
    (lang === 'en' ? 'VentHub Product Details' : 'VentHub Ürün Detayı')

  const hasVariant = variants.map((variant) => {
    const imagePath = variant.images[0]?.path
    // REC-110: ham `variant.name` YAZILMAZ — bu düğüm arama motoruna gider ve /en
    // sayfasının JSON-LD'si Türkçe ad taşıyordu (SEO'ya dil sızıntısı, #936'daki fiyat
    // sızıntısının kardeşi). Vitrinle AYNI çözücü, ayrı bir kopya değil.
    const productNode: Record<string, unknown> = {
      '@type': 'Product',
      name: getProductDisplayName(variant, family, lang),
    }

    // K3-b (REC-300 Faz 3d, plan §2): her model KENDİ kanonik adresine sahip → varyant düğümü o
    // adresi taşır. Bugün (bayrak kapalı) varyant URL'i YAZILMAZ — tek adres aile adresiydi (`?sku=`
    // kanoniğe girmez). Faz 2 öncesi slug metni aile slug'ıdır (rota modeli SKU'dan çözer).
    // ⚠Adres SKU'yu (küçük harf) taşır — plan §2 şemasının kendisi (`…-p-<sku>`); `sku` ALANI yine
    // yazılmaz (INV-SKU-GORUNMEZ-1 K2). Adres `adresRotalari` üzerinden (`adresUret` model nesnesi).
    // URN-31: yalnız DİZİNE AÇIK model adresi yazılır (`sitemapModelMi`: yayındaki listedeki temel model). Liste dışı
    // varyantın model sayfası yok (404); sürüm sayfasının kanoniği temele gider — ikisinde de url YOK.
    if (bayrak && sitemapModelMi(variant.sku)) {
      productNode.url = `${baseUrl}${adresRotalari(dilOf(lang), true).product(family.slug, variant.sku)}`
    }

    // ⭐`sku` ARTIK YAYINLANMIYOR (REC-146, 2026-09-09).
    //
    // Eskiden `sku: variant.sku` koşulsuz yazılıyordu ve gerekçesi "satıcının kendi kodu,
    // bizim olduğu için yayınlanması doğrudur" idi. Hüküm değişti: müşteriye — ve arama
    // motoru müşterinin gördüğü yüzeydir — görünen kod YALNIZ `model_code` olacak.
    // İki sebep: (a) `sku` bizim İÇ kimliğimizdir, dışarıya taahhüt etmediğimiz bir şey;
    // (b) uydurma kod taşıyan üründe o uydurmayı arama motoruna BEYAN ederdik.
    //
    // Ürün kimliği yayınlama yolu artık tek: aşağıdaki `mpn`, yani `model_code`. O da
    // yoksa hiçbir kod alanı yazılmaz — kardeş kuralın (REC-272) cümlesiyle: eksik alan,
    // yanlış alandan iyidir. `sku` gerekirse ayrı ve bilinçli bir kararla geri gelir.

    // REC-272: `mpn` ÜRETİCİ kodudur. `model_code` yoksa iç SKU'ya düşmek, arama
    // motoruna "üreticinin kodu budur" diye YANLIŞ BEYAN etmektir. productHelpers'ın
    // kendi hükmü zaten bunu yasaklıyor: "sku'ya düşmek YASAK." Alan hiç yazılmaz —
    // eksik alan, yanlış alandan iyidir (schema.org'da `mpn` zorunlu değil).
    const modelKodu = getProductModelLabel(variant)
    if (modelKodu) {
      productNode.mpn = modelKodu
    }

    if (imagePath) {
      productNode.image = storagePathToUrl(imagePath)
    }

    // ⭐TEKLİF MODU — vitrinle AYNI FONKSİYON, ayrı bir kopya DEĞİL (REC-111).
    //
    // Burada eskiden yalnız "fiyat geçerli mi" sorusu vardı ve yorumu "eşik vitrinle
    // AYNIDIR" diyordu. Değildi: vitrinin hükmü üç dallı (kategori çözülemedi ·
    // kategori hide_price · fiyat geçersiz), burada yalnız üçüncüsü uygulanıyordu.
    // Canlı sonuç: 80 ürün adresinin 72'sinde JSON-LD gerçek fiyat yayınlıyordu.
    // Artık karar `quoteModeHesapla`ya sorulur; iki yüzey aynı kaynaktan besleniyor.
    const teklifModu = quoteModeHesapla(mainCategory, variant)
    const offerPrice = variant.price == null ? null : Number(variant.price)
    if (!teklifModu && offerPrice != null && Number.isFinite(offerPrice) && offerPrice > 0) {
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

  // ⭐GRUP GÖRSELİ (REC-269 bulgu 3). Google'ın ürün zengin sonuçlarında görsel fiilen
  // zorunludur; görselsiz kayıt çoğu yüzeyde HİÇ gösterilmez. Ölçüldü (2026-09-07,
  // canlı): üç aile sayfasının ÜÇÜNDE de `ProductGroup.image` yoktu.
  //
  // KURAL ÜÇÜNCÜ KEZ YAZILMADI — VAR OLAN KAPAK KURALI KULLANILDI: "varyant sırasına
  // göre ilk varyantın ilk görseli" (`family.service.ts` `getSeriesLanding`, ve aynı
  // kuralı RPC de uyguluyor). Burada `hasVariant` zaten o sırayı koruyor ve her düğüme
  // görselini yazmış durumda; ilk görselli düğümü seçmek, kuralı KOPYALAMADAN aynı
  // sonucu verir. Ayrı bir "grup kapağı" kuralı icat etmek üçüncü bir doğruluk kaynağı
  // olurdu ve gün gelir üçü ayrışırdı.
  //
  // GÖRSEL YOKSA ALAN HİÇ YAZILMAZ — `mpn` ile aynı ilke: eksik alan, uydurulmuş
  // alandan iyidir. Yedek/temsili bir görsel koymak, arama motoruna o ailenin ürünü
  // buymuş gibi YANLIŞ BEYAN olurdu.
  // ÖLÇÜLDÜ (canlı, 2026-09-08): 47 ailenin 34'ü bu kuralla görsel türetir, 13'ünde
  // hiç ürün görseli YOK — o 13'ü kod değil KATALOG VERİSİ kapatır (ilgili: REC-269).
  const grupGorseli = hasVariant.find((v) => typeof v.image === 'string')?.image

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    productGroupID: family.slug,
    ...(grupGorseli ? { image: grupGorseli } : {}),
    // REC-108: yapısal veri de dili bilir — bot EN sayfada TR ad görmemeli.
    name: familyName(family, lang),
    description,
    url,
    ...(family.brand_name && {
      brand: {
        '@type': 'Brand',
        name: family.brand_name,
      },
    }),
    // REC-494: `isPartOf` YAZILMAZ. schema.org'da `isPartOf` bir CreativeWork özelliğidir;
    // `ProductGroup` (Product soyundan) onu tanımaz ve doğrulayıcı "şema uyarısı" verir
    // (canlı kapı `JSONLD-ISPARTOF`, 47 aile sayfasında ölçüldü). Site ilişkisi CollectionPage
    // düğümlerinde (kategori + seri) kalır; onlar bir WebPage'dir.
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
  /**
   * K3-b: sayfanın DİL ÖNEKLİ kanonik yolu (`kategoriKanonikAdresi` — iki seviyeli dal adresi
   * slug'dan kurulamaz, üst kategori gerekir). Yalnız bayrak açıkken okunur.
   */
  sayfaYolu?: string
  /** K3-b şeması (yalnız test verir; varsayılan `ADRES_SEMASI_K3B`). */
  bayrak?: boolean
}

/**
 * Kategori → schema.org CollectionPage + ItemList.
 * B9 düzeltmesi: itemListElement URL'lerine `/${lang}` prefix'i garanti edilir
 * (eski kod `${baseUrl}/products/${slug}` yazıyordu, dilsiz kalıyordu).
 */
export function buildCategoryJsonLd(params: BuildCategoryJsonLdParams): Record<string, unknown> {
  const { lang, baseUrl, categorySlug, name, description, total, page, pageSize, families } = params
  const { sayfaYolu, bayrak = ADRES_SEMASI_K3B } = params
  const url =
    bayrak
      ? `${baseUrl}${sayfaYolu ?? adresUret({ tur: 'kategori', kok: categorySlug }, dilOf(lang), true)}`
      : `${baseUrl}/${lang}/category/${categorySlug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: buildWebSiteRef(baseUrl),
    // REC-494: liste `mainEntity` ItemList içinde (CollectionPage üst düzeyinde değil).
    mainEntity: buildItemList(
      total,
      families.map((family, index) => ({
        position: (page - 1) * pageSize + index + 1,
        url: aileUrl(baseUrl, lang, family.slug, bayrak),
      })),
    ),
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
  /** K3-b şeması (yalnız test verir; varsayılan `ADRES_SEMASI_K3B`). */
  bayrak?: boolean
}

/**
 * T138-VH K7 — Seri landing → schema.org CollectionPage + ItemList.
 *
 * `ProductGroup` KASITLI KULLANILMAZ: seri satılabilir bir ürün değil, altındaki MODELLERİN
 * listesidir (K1 kararı — "KART = MODEL, SERİ = LANDING"). Şekil `buildCategoryJsonLd` ile
 * BİREBİR aynı (CollectionPage + mainEntity ItemList{numberOfItems, itemListElement}) — kategori sayfası da aynı
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
  const { lang, baseUrl, seriesSlug, name, description, models, bayrak = ADRES_SEMASI_K3B } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: aileUrl(baseUrl, lang, seriesSlug, bayrak),
    isPartOf: buildWebSiteRef(baseUrl),
    // REC-494: liste `mainEntity` ItemList içinde (CollectionPage üst düzeyinde değil).
    mainEntity: buildItemList(
      models.length,
      models.map((model, index) => ({
        position: index + 1,
        url: aileUrl(baseUrl, lang, model.slug, bayrak),
      })),
    ),
  }
}

/** Breadcrumb zincirinin tek basamağı. `path` = dil öneksiz site yolu (`/category/fans`). */
export interface BreadcrumbStep {
  /**
   * Kullanıcıya GÖRÜNEN ad — **çağıran taraf çözer**, bu modül ad çözmez.
   *
   * Ham `category.name` ya da slug YAZILMAZ (Mutlak Kural 7: DB'deki ham ad İngilizce'dir ve
   * TR sayfaya sızar). Çağıran, aktif dilin sözlüğünden bir `t` kurup görünen adı üretir:
   *
   * ```ts
   * const dict = lang === 'en' ? en : tr          // src/i18n/dictionaries/{en,tr}
   * const t = (key: string) => getDictValue(dict, key)
   * const name = getCategoryDisplayName(category, t)   // imza: (category, t)
   * ```
   *
   * Bu fonksiyon `name`i olduğu gibi basar; yanlış dilde ya da ham gelen bir ad burada
   * yakalanmaz — sorumluluk çağırandadır. (Tek kontrol: boş ad ATAR.)
   */
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
 * Kırıntı basamağının mutlak adresi. REC-494: ana sayfa basamağı (`path: '/'`) `https://…/tr/`
 * (sonda eğik çizgi) üretiyordu; sitenin kanonik ana sayfası `/tr` ve `/tr/` 308 verir — yani
 * yapılandırılmış veri her sayfada yönlendirilen adresi gösteriyordu. Sondaki eğik çizgi atılır
 * (adres her zaman en az `/<dil>` taşır, boşalmaz).
 */
function kirintiAdresi(baseUrl: string, lang: string, path: string): string {
  const adres = `${baseUrl}${dilOnekliMi(path) ? path : `/${lang}${path}`}`
  return adres.endsWith('/') ? adres.slice(0, -1) : adres
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
      // K3-b (REC-300 Faz 3d): adım `adresUret` çıktısı (zaten dil önekli) olabilir — önek ikinci
      // kez eklenmez. Dilsiz yol (bugünkü çağıranlar) bugünkü gibi `/${lang}` ile birleşir.
      ...(step.path ? { item: kirintiAdresi(baseUrl, lang, step.path) } : {}),
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

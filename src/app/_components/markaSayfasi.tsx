import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import { SITE_URL } from '@/config/siteUrl'
import { brandText, HVAC_BRANDS } from '@/data/brands'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '@/lib/cache/tags'
import { familyName } from '@/lib/i18n/familyName'
import { ACIKLAMA_ASGARI, aciklamaKirp } from '@/lib/seo/aciklamaKirp'
import { hreflangAlani, NOINDEX_FOLLOW } from '@/lib/seo/enYayinKurali'
import { type MarkaUrunSayaci, markaUrunsuzMu as markaAdiUrunsuzMu } from '@/lib/seo/markaUrunDurumu'
import { ovguCumleleriniAt, ovguVarMi } from '@/lib/seo/ovguAyikla'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { type BrandCatalogSummary, getBrandCatalogSummary, getBrandFamilyCount } from '@/lib/services/family.service'
import { supabaseStaticClient } from '@/lib/supabase/static'
import { adresUret } from '@/utils/adresUret'
import { getCategoryDisplayName } from '@/utils/categoryHelpers'
import { Routes } from '@/utils/routes'
import { DEFAULT_TENANT_ID } from '@/utils/tenantConstants'
import PageComponent from '@/views/BrandDetailPage'

/**
 * MARKA SAYFASI — üst veri + gövde, İKİ rotanın ortak çekirdeği (REC-300 Faz 3b-2).
 *
 * NİÇİN AYRI MODÜL (aileSayfasi.tsx ile aynı gerekçe): gövde 2026-09-25'e kadar yalnız
 * `app/[lang]/brands/[slug]/page.tsx`'in içindeydi; K3-b aynı sayfayı `/tr/markalar/<marka>`
 * adresinde çizecek. Taşıma BİREBİR; sayfa sınıfı ilanları rota dosyalarında kalır.
 */

type Marka = (typeof HVAC_BRANDS)[number]

/** Adresteki slug → marka (harf duyarsız). Kanonik slug `marka.slug`; farklıysa çağıran 308 verir. */
export function markaBul(slug: string): Marka | null {
  const kucuk = slug.toLowerCase()
  return HVAC_BRANDS.find((b) => b.slug === kucuk) ?? null
}

/**
 * Marka başına aktif ürün sayısı önbelleği (OPS-51). Anahtar `lang` VE `tenantId` içerir (kural 12); etiketler KEŞİF
 * alanıdır (`PRODUCTS_DISCOVERY_TAG` + kiracı etiketi): webhook ürün/aile değişiminde bu etiketi zaten tazeler, böylece
 * Flexiva'ya ürün girince sayı ve bu sayıya bağlı marka sayfası (+ site haritası) kendiliğinden yenilenir.
 * `revalidate: 3600` = webhook kaçarsa emniyet kemeri (sayfanın ISR süresiyle aynı). Hata FIRLATILIR (önbelleğe hata
 * yazılmaz); karar `markaUrunDurumu.ts` HATA YOLU'na göre ele alınır.
 */
const getCachedMarkaUrunSayisi = (lang: string, tenantId: string, markaAdi: string) => unstable_cache(
  async () => getBrandFamilyCount(supabaseStaticClient, markaAdi),
  ['brand-active-product-count', lang, tenantId, markaAdi],
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/** Aynı render'da (üst veri + gövde) tekrarlanan sayımı tekilleştirir (kural 6). */
const markaUrunSayisiOku = cache((lang: string, markaAdi: string) =>
  getCachedMarkaUrunSayisi(lang, DEFAULT_TENANT_ID, markaAdi)
)

/**
 * Slug'daki marka ürünsüz mü? — marka sayfası üst verisinin VE gövdesinin ortak kararı (karar `markaUrunDurumu.ts`).
 * Bilinmeyen slug → `false` (sayfa zaten 404; DB'ye gidilmez). `sayac` testte enjekte edilir.
 */
export async function markaUrunsuzMu(
  lang: string,
  slug: string,
  sayac: MarkaUrunSayaci = (ad) => markaUrunSayisiOku(lang, ad),
): Promise<boolean> {
  const brand = markaBul(slug)
  if (!brand) return false
  return markaAdiUrunsuzMu(brand.name, sayac)
}

/**
 * Markanın açıklama metni (KIRPILMAMIŞ) — arama sonucu açıklamasının (`markaMetinleri`) VE Brand JSON-LD `description`
 * alanının TEK kaynağı (URN-79). JSON-LD eskiden ham `brandText(brand.description)` basıyordu: meta süzgeçten geçerken
 * yapısal veri üreticinin ham övgüsünü ("dünya lideri") taşıyabiliyordu — iki yüzey aynı metni farklı söyleyemez.
 *
 * REC-497: şablon ("en kaliteli… avantajlı fiyatları") KALKTI — canlı kapı 2026-10-02: 5 marka sayfası aynı kalıpla
 * bitiyordu; "avantajlı fiyat" ise satış modu teklif usulü olan ve fiyat göstermeyen sitede doğrulanamayan vaatti.
 * Açıklama markanın KENDİ kaydından (iki dilli `description`) türer; marka adı başa eklenir ki arama sonucu kimin sayfası
 * olduğunu söylesin. Kayıt metni marka adıyla başlıyorsa tekrar eklenmez.
 * Kanıtsız üstünlük cümleleri ("dünya lideri", "en geniş ürün gamı") atılır (çürütücü bulgusu 10); kalan metin kısa
 * kalırsa ya da hiç kalmazsa kayıttaki doğrulanabilir alan (uzmanlık) cümlesi eklenir. Ham `**` (markdown kalın) işareti
 * düz metin alanlarında anlamsızdır, atılır.
 *
 * OPS-51: ürünsüz marka (DB'de aktif ürünü 0; şu an Flexiva) sayfası ürün vaat edemez — kayıt/uzmanlık/seoYedek yolları
 * ("ürün ailelerini, modellerini inceleyin") yanlış olurdu. Açıklama sayfanın GÖSTERDİĞİYLE aynı olguyu söyler (ürün yok,
 * teklif iste); sözlük cümlesi ≥ ACIKLAMA_ASGARI olduğu için yedek devreye girmez (testle kilitli). `urunsuz` DB'deki
 * aktif ürün sayısından türer (`markaUrunDurumu.ts`); ürün girince bu dal kendiliğinden kapanır.
 */
export function markaAciklamasi(lang: string, brand: Marka, urunsuz: boolean): string {
  const isEn = lang === 'en'
  const dict = isEn ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  if (urunsuz) return t('brands.seoUrunsuz').replace('{{ad}}', brand.name)
  const kayit = ovguCumleleriniAt(brandText(brand.description, lang).replace(/\*\*/g, ''))
  const yerel = isEn ? 'en' : 'tr'
  // Uzmanlık etiketi de kayıttan gelir: iddia taşıyorsa kullanılmaz; küçük harfe çevrilir (cümle içinde Başlık Biçimi durmaz).
  const uzmanlikHam = brandText(brand.specialty, lang)
  const uzmanlik = uzmanlikHam && !ovguVarMi(uzmanlikHam) ? uzmanlikHam.toLocaleLowerCase(yerel) : ''
  const yedek = uzmanlik
    ? t('brands.seoYedekUzmanlik').replace('{{uzmanlik}}', uzmanlik)
    : t('brands.seoYedek').replace('{{ad}}', brand.name)
  const govde = kayit.length >= ACIKLAMA_ASGARI ? kayit : [kayit, yedek].filter(Boolean).join(' ')
  return govde.toLocaleLowerCase(yerel).startsWith(brand.name.toLocaleLowerCase(yerel))
    ? govde
    : `${brand.name}: ${govde}`
}

function markaMetinleri(lang: string, brand: Marka, urunsuz: boolean) {
  // REC-98: başlık/açıklama/locale eskiden SABİT TÜRKÇE idi — `lang` yalnız URL için
  // okunuyordu. Ölçüm (2026-08-31, canlı): `/en/brands/avens` başlığı "Avens Ürünleri ve
  // Çözümleri", `og:locale` ise `tr_TR` idi. Sayfa GÖVDESİ İngilizce, kabuğu Türkçe:
  // metadata dili sayfanın diliyle aynı olmak ZORUNDA, yoksa arama motoru sayfayı
  // yanlış dilde sınıflar ve iki dil birbirinin kopyası görünür.
  const metaTitle = lang === 'en'
    ? `${brand.name} Products and Solutions | VentHub`
    : `${brand.name} Ürünleri ve Çözümleri | VentHub`
  return { metaTitle, metaDescription: aciklamaKirp(markaAciklamasi(lang, brand, urunsuz)) }
}

/**
 * Markanın DB'den türeyen katalog özeti (aile sayısı + kategoriler + ilk aileler) önbelleği (URN-79). `getCachedMarkaUrunSayisi`
 * ile AYNI etiketler ve AYNI emniyet kemeri (yeni önbellek biçimi yok): `PRODUCTS_DISCOVERY_TAG` + kiracı etiketi —
 * webhook `product_families` / `products` / `brands` / `categories` değişiminde bu etiketi zaten tazeler
 * (rendering-cache-standard.md §3), böylece aile ya da kategori eklenince/adı değişince özet cümle kendiliğinden yenilenir.
 * Anahtar `lang` VE `tenantId` içerir (kural 12). Hata FIRLATILIR (önbelleğe hata yazılmaz); karar `markaUrunOzeti`de.
 */
export const getCachedMarkaKatalogOzeti = (lang: string, tenantId: string, markaAdi: string) => unstable_cache(
  async () => getBrandCatalogSummary(supabaseStaticClient, markaAdi),
  ['brand-catalog-summary', lang, tenantId, markaAdi],
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/** Markanın katalog özetini okur; okuyamazsa FIRLATIR. Testte enjekte edilir (`MarkaSayfasi` → `katalogOzeti`). */
export type MarkaKatalogOzetiOkuyucu = (markaAdi: string) => Promise<BrandCatalogSummary | null>

/** Özet cümlede en çok kaç kategori / aile adı yazılır (cümle uzayıp gövdeyi boğmasın; kalan sayı "ve N aile daha" olur). */
export const OZET_KATEGORI_AZAMI = 6
export const OZET_AILE_AZAMI = 6

const sablonDoldur = (sablon: string, degerler: Record<string, string | number>): string =>
  Object.entries(degerler).reduce((metin, [anahtar, deger]) => metin.split(`{{${anahtar}}}`).join(String(deger)), sablon)

const tekil = (adlar: string[]): string[] => [...new Set(adlar.map((a) => a.trim()).filter(Boolean))]

/**
 * DB'den gelen katalog özetini marka sayfasının özet cümlelerine çevirir (URN-79). Metin sözlük şablonundan kurulur
 * (`brands.detail.catalog*`, TR+EN); ad çözümü render anında yapılır (`familyName`, `getCategoryDisplayName`). Yeni iddia
 * yok: yalnız katalogdaki olgu (aile sayısı, kategori adları, aile adları). Özet yoksa ya da aile sayısı 0 ise '' döner —
 * çağıran paragrafı hiç çizmez (uydurma metin ÜRETİLMEZ).
 */
export function markaKatalogOzetMetni(lang: string, markaAdi: string, ozet: BrandCatalogSummary | null): string {
  if (!ozet || !Number.isInteger(ozet.total) || ozet.total < 1) return ''
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  const cumleler = [sablonDoldur(t('brands.detail.catalogSummary'), { ad: markaAdi, sayi: ozet.total })]
  const kategoriler = tekil(ozet.categories.map((c) => getCategoryDisplayName(c, t))).slice(0, OZET_KATEGORI_AZAMI)
  if (kategoriler.length > 0) {
    cumleler.push(sablonDoldur(t('brands.detail.catalogCategories'), { kategoriler: kategoriler.join(', ') }))
  }
  const aileler = tekil(ozet.families.map((f) => familyName(f, lang)))
  if (aileler.length > 0) {
    const gosterilen = aileler.slice(0, OZET_AILE_AZAMI)
    const diger = ozet.total - gosterilen.length
    cumleler.push(
      diger > 0
        ? sablonDoldur(t('brands.detail.catalogFamiliesMore'), { aileler: gosterilen.join(', '), diger })
        : sablonDoldur(t('brands.detail.catalogFamilies'), { aileler: gosterilen.join(', ') }),
    )
  }
  return cumleler.join(' ')
}

/** Marka sayfasındaki "Katalogda" kutusunun sayıları (aile ve model). İkisi de bilinmiyorsa kutu hiç çizilmez. */
export interface MarkaKatalogSayilari {
  aile: number
  model: number
}

/**
 * Özetten kutu sayıları (URN-82): aile VE model sayısı geçerli, pozitif tam sayı değilse `null`. Eksik ya da kesik
 * sayı ("12 ürün ailesi ve 0 model") basılmaz; yer tutucu ham bırakılmaz — kutu çizilmez (`BrandDetailPage`).
 */
export function markaKatalogSayilari(ozet: BrandCatalogSummary | null): MarkaKatalogSayilari | null {
  if (!ozet) return null
  const { total, models } = ozet
  if (!Number.isInteger(total) || total < 1) return null
  if (typeof models !== 'number' || !Number.isInteger(models) || models < 1) return null
  return { aile: total, model: models }
}

/**
 * Sayfa gövdesinin DB'den türeyen özet paragrafı + kutu sayıları. ÖZET İSTEĞE BAĞLI METİNDİR: okunamazsa sayfa onsuz
 * çizilir (uyarı basılır) — "ürünsüz marka" kararının tersine yanlış sonuç noindex/harita gibi bir sessiz hasar
 * yazmaz; ISR yenilemesini kırmak yerine bir sonraki yenilemede (en geç 1 saat) kendiliğinden döner. Hata önbelleğe
 * YAZILMAZ (okuyucu fırlatır).
 */
async function markaKatalogVerisi(
  lang: string,
  brand: Marka,
  oku: MarkaKatalogOzetiOkuyucu,
): Promise<{ urunOzeti: string; katalogSayilari: MarkaKatalogSayilari | null }> {
  try {
    const ozet = await oku(brand.name)
    return { urunOzeti: markaKatalogOzetMetni(lang, brand.name, ozet), katalogSayilari: markaKatalogSayilari(ozet) }
  } catch (hata) {
    console.warn(`[markaSayfasi] ${brand.name} katalog özeti okunamadı; sayfa özet paragrafsız çiziliyor`, hata)
    return { urunOzeti: '', katalogSayilari: null }
  }
}

const OG_GORSELI = [{ url: '/images/og-default.jpg', width: 1200, height: 630 }]

/**
 * BUGÜNKÜ üst veri (bayrak KAPALI) — `brands/[slug]/page.tsx`'ten BİREBİR taşındı.
 * `urunsuz`: DB'deki aktif ürün sayısından türeyen karar (`markaUrunsuzMu`); varsayılan `false` = bugünkü (ürünlü) çıktı.
 * Rotalar kararı `markaUrunsuzMu(lang, slug)` ile ALIR ve buraya geçirir — doğrudan çağırıp atlamak kapıda kırmızıdır.
 */
export function markaUstVerisi(lang: string, slug: string, urunsuz = false): Metadata {
  const brand = HVAC_BRANDS.find(b => b.slug === slug)

  if (!brand) {
    return {
      title: 'Marka Bulunamadı | VentHub',
    }
  }

  // DİL ÖNEKİ ŞART (T083-VH). Eskiden kanonik `${SITE_URL}/brands/${slug}` idi — dil öneksiz.
  // `middleware.ts:86` dil öneksiz her rotayı 307 ile yönlendirdiği için kanonik bir
  // YÖNLENDİRMEYİ gösteriyordu; üstelik hedef dil `Accept-Language`'a göre seçildiğinden
  // kanonik ziyaretçiye göre değişiyordu. En pahalısı: `/tr/brands/x` ile `/en/brands/x`
  // İKİSİ DE aynı kanoniği bildiriyordu → arama motoru kopya sayıp bir dili indeksten
  // düşürebilirdi. `sitemap.ts` doğruyu bildiriyordu, bu sayfa onu çürütüyordu.
  // Cetvel: docs/standards/canonical-url-standard.md §4 · bekçi: INV-CANONICAL-2.
  //
  // `Routes.brand` + `/${lang}` bileşimi KASITLI: `sitemap.ts` de birebir aynı ifadeyi
  // kullanır, böylece iki yüzey ayrışamaz.
  const trUrl = `${SITE_URL}/tr${Routes.brand(slug)}`
  const enUrl = `${SITE_URL}/en${Routes.brand(slug)}`
  const canonicalUrl = lang === 'en' ? enUrl : trUrl
  const { metaTitle, metaDescription } = markaMetinleri(lang, brand, urunsuz)

  return {
    title: metaTitle,
    description: metaDescription,
    // OPS-51: ürünsüz marka sayfası 200 KALIR (marka listesinde logoyla durur) ama dizine girmez; ürünlü markada
    // `robots` alanı YAZILMAZ (bugünkü). Site haritası da bu markayı ilan etmez (sitemap.ts, AYNI karar). Emsal: pasifKategoriRobots.
    ...(urunsuz ? { robots: NOINDEX_FOLLOW } : {}),
    alternates: {
      canonical: canonicalUrl,
      // `EN_YAYIN` kapalıyken hreflang YOK, yalnız canonical (REC-300 3e-3); açılınca geri gelir.
      ...hreflangAlani({
        languages: {
          tr: trUrl,
          en: enUrl,
          'x-default': trUrl,
        },
      }),
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'VentHub',
      images: OG_GORSELI,
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
  }
}

/**
 * K3-b üst verisi (bayrak AÇIK): canonical, hreflang, og:url `adresUret`'ten
 * (`/tr/markalar/<m>` ↔ `/en/brands/<m>`), kalıp `sayfaUstVerisi`. Bilinmeyen marka → boş (sayfa 404).
 */
export function markaUstVerisiK3b(lang: string, slug: string, urunsuz = false): Metadata {
  const brand = markaBul(slug)
  if (!brand) return {}
  const { metaTitle, metaDescription } = markaMetinleri(lang, brand, urunsuz)
  const trYol = adresUret({ tur: 'marka', slug: brand.slug }, 'tr')
  const enYol = adresUret({ tur: 'marka', slug: brand.slug }, 'en')
  const m = sayfaUstVerisi({
    lang,
    yol: lang === 'en' ? enYol : trYol,
    dilYollari: { tr: trYol, en: enYol },
    baslik: metaTitle,
    aciklama: metaDescription,
  })
  return {
    ...m,
    // OPS-51: ürünsüz marka → noindex, follow (K3-b yolunda da; ürünlü markada `m.robots` olduğu gibi kalır).
    ...(urunsuz ? { robots: NOINDEX_FOLLOW } : {}),
    openGraph: { ...m.openGraph, images: OG_GORSELI },
  }
}

/**
 * Marka sayfası gövdesi — JSON-LD + görünüm. `urunsuz` kararı BURADA, üst veriyle AYNI kaynaktan (`markaUrunsuzMu`)
 * alınır ve istemci görünümüne prop olarak geçer: sunucu kararı ile "teklif isteyin" cümlesi çelişemez.
 * URN-79: ürünlü markada DB'den türeyen özet paragrafı (`urunOzeti`) da burada kurulur ve prop olarak geçer — metin
 * sunucuda üretildiği için HTML'de görünür (istemci tarafı aile listesi yalnız hidrasyondan sonra dolar).
 * `sayac` ve `katalogOzeti` yalnız testte enjekte edilir.
 */
export async function MarkaSayfasi({
  lang,
  slug,
  sayac,
  katalogOzeti,
}: {
  lang: string
  slug: string
  sayac?: MarkaUrunSayaci
  katalogOzeti?: MarkaKatalogOzetiOkuyucu
}) {
  const brand = HVAC_BRANDS.find(b => b.slug === slug)
  const urunsuz = await markaUrunsuzMu(lang, slug, sayac)
  // Ürünsüz markada (DB'de aktif ürün 0) listelenecek aile yok → özet sorgusu hiç atılmaz.
  const { urunOzeti, katalogSayilari } = brand && !urunsuz
    ? await markaKatalogVerisi(lang, brand, katalogOzeti ?? ((ad) => getCachedMarkaKatalogOzeti(lang, DEFAULT_TENANT_ID, ad)))
    : { urunOzeti: '', katalogSayilari: null }

  // REC-98: `brand.description` artık iki dilli bir NESNE. Doğrudan yazılsaydı JSON-LD'ye
  // `{"tr":"...","en":"..."}` gömülürdü — tip hatası vermeden, sessizce bozuk yapısal veri.
  // URL de dil öneksizdi: `generateMetadata`'daki kanonik yorumu (T083-VH) tam bu hatayı
  // anlatıyor ama JSON-LD ayağı düzeltilmemişti; sitemap dil önekli adresi bildiriyor.
  // K3-b: adres `adresUret`'ten — bayrak kapalıyken çıktı bugünküyle BİREBİR (`/tr|en/brands/<m>`).
  // URN-79: açıklama ham `brand.description` DEĞİL, arama sonucu açıklamasıyla AYNI süzgeçten geçen `markaAciklamasi`.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand?.name || slug,
    "description": brand ? markaAciklamasi(lang, brand, urunsuz) : `${slug} marka ürünler`,
    "url": `${SITE_URL}${adresUret({ tur: 'marka', slug }, lang === 'en' ? 'en' : 'tr')}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageComponent initialBrandSlug={slug} urunsuz={urunsuz} urunOzeti={urunOzeti} katalogSayilari={katalogSayilari} />
    </>
  )
}

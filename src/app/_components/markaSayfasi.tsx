import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

import { SITE_URL } from '@/config/siteUrl'
import { brandText, HVAC_BRANDS } from '@/data/brands'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '@/lib/cache/tags'
import { ACIKLAMA_ASGARI, aciklamaKirp } from '@/lib/seo/aciklamaKirp'
import { hreflangAlani, NOINDEX_FOLLOW } from '@/lib/seo/enYayinKurali'
import { type MarkaUrunSayaci, markaUrunsuzMu as markaAdiUrunsuzMu } from '@/lib/seo/markaUrunDurumu'
import { ovguCumleleriniAt, ovguVarMi } from '@/lib/seo/ovguAyikla'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { getBrandFamilyCount } from '@/lib/services/family.service'
import { supabaseStaticClient } from '@/lib/supabase/static'
import { adresUret } from '@/utils/adresUret'
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

function markaMetinleri(lang: string, brand: Marka, urunsuz: boolean) {
  // REC-98: başlık/açıklama/locale eskiden SABİT TÜRKÇE idi — `lang` yalnız URL için
  // okunuyordu. Ölçüm (2026-08-31, canlı): `/en/brands/avens` başlığı "Avens Ürünleri ve
  // Çözümleri", `og:locale` ise `tr_TR` idi. Sayfa GÖVDESİ İngilizce, kabuğu Türkçe:
  // metadata dili sayfanın diliyle aynı olmak ZORUNDA, yoksa arama motoru sayfayı
  // yanlış dilde sınıflar ve iki dil birbirinin kopyası görünür.
  const isEn = lang === 'en'
  const metaTitle = isEn
    ? `${brand.name} Products and Solutions | VentHub`
    : `${brand.name} Ürünleri ve Çözümleri | VentHub`
  // REC-497: şablon ("en kaliteli… avantajlı fiyatları") KALKTI — canlı kapı 2026-10-02: 5 marka
  // sayfası aynı kalıpla bitiyordu; "avantajlı fiyat" ise satış modu teklif usulü olan ve fiyat
  // göstermeyen sitede doğrulanamayan vaatti. Açıklama markanın KENDİ kaydından (üretici sitesinden
  // alınmış `description`, iki dilli) türer; marka adı başa eklenir ki arama sonucu kimin sayfası
  // olduğunu söylesin. Kayıt metni marka adıyla başlıyorsa tekrar eklenmez.
  // Üreticinin kanıtsız üstünlük cümleleri ("dünya lideri", "en geniş ürün gamı") atılır (çürütücü bulgusu 10);
  // kalan metin kısa kalırsa ya da hiç kalmazsa kayıttaki doğrulanabilir alan (uzmanlık) cümlesi eklenir.
  const dict = isEn ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  // OPS-51: ürünsüz marka (DB'de aktif ürünü 0; şu an Flexiva) sayfası ürün vaat edemez — kayıt/uzmanlık/seoYedek yolları
  // ("ürün ailelerini, modellerini inceleyin") yanlış olurdu. Açıklama sayfanın GÖSTERDİĞİYLE aynı olguyu söyler (ürün yok,
  // teklif iste); sözlük cümlesi ≥ ACIKLAMA_ASGARI olduğu için yedek devreye girmez (testle kilitli). `urunsuz` DB'deki
  // aktif ürün sayısından türer (`markaUrunDurumu.ts`); ürün girince bu dal kendiliğinden kapanır.
  if (urunsuz) {
    return {
      metaTitle,
      metaDescription: aciklamaKirp(t('brands.seoUrunsuz').replace('{{ad}}', brand.name)),
    }
  }
  const kayit = ovguCumleleriniAt(brandText(brand.description, lang))
  const yerel = isEn ? 'en' : 'tr'
  // Uzmanlık etiketi de kayıttan gelir: iddia taşıyorsa kullanılmaz; küçük harfe çevrilir (cümle içinde Başlık Biçimi durmaz).
  const uzmanlikHam = brandText(brand.specialty, lang)
  const uzmanlik = uzmanlikHam && !ovguVarMi(uzmanlikHam) ? uzmanlikHam.toLocaleLowerCase(yerel) : ''
  const yedek = uzmanlik
    ? t('brands.seoYedekUzmanlik').replace('{{uzmanlik}}', uzmanlik)
    : t('brands.seoYedek').replace('{{ad}}', brand.name)
  const govde = kayit.length >= ACIKLAMA_ASGARI ? kayit : [kayit, yedek].filter(Boolean).join(' ')
  const adli = govde.toLocaleLowerCase(yerel).startsWith(brand.name.toLocaleLowerCase(yerel))
    ? govde
    : `${brand.name}: ${govde}`
  const metaDescription = aciklamaKirp(adli)
  return { metaTitle, metaDescription }
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
 * `sayac` yalnız testte enjekte edilir.
 */
export async function MarkaSayfasi({ lang, slug, sayac }: { lang: string; slug: string; sayac?: MarkaUrunSayaci }) {
  const brand = HVAC_BRANDS.find(b => b.slug === slug)
  const urunsuz = await markaUrunsuzMu(lang, slug, sayac)

  // REC-98: `brand.description` artık iki dilli bir NESNE. Doğrudan yazılsaydı JSON-LD'ye
  // `{"tr":"...","en":"..."}` gömülürdü — tip hatası vermeden, sessizce bozuk yapısal veri.
  // URL de dil öneksizdi: `generateMetadata`'daki kanonik yorumu (T083-VH) tam bu hatayı
  // anlatıyor ama JSON-LD ayağı düzeltilmemişti; sitemap dil önekli adresi bildiriyor.
  // K3-b: adres `adresUret`'ten — bayrak kapalıyken çıktı bugünküyle BİREBİR (`/tr|en/brands/<m>`).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand?.name || slug,
    "description": brand ? brandText(brand.description, lang) : `${slug} marka ürünler`,
    "url": `${SITE_URL}${adresUret({ tur: 'marka', slug }, lang === 'en' ? 'en' : 'tr')}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageComponent initialBrandSlug={slug} urunsuz={urunsuz} />
    </>
  )
}

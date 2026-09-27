import type { Metadata } from 'next'

import { SITE_URL } from '@/config/siteUrl'
import { brandText, HVAC_BRANDS } from '@/data/brands'
import { sayfaUstVerisi } from '@/lib/seo/sayfaUstVerisi'
import { adresUret } from '@/utils/adresUret'
import { Routes } from '@/utils/routes'
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

function markaMetinleri(lang: string, brand: Marka) {
  // REC-98: başlık/açıklama/locale eskiden SABİT TÜRKÇE idi — `lang` yalnız URL için
  // okunuyordu. Ölçüm (2026-08-31, canlı): `/en/brands/avens` başlığı "Avens Ürünleri ve
  // Çözümleri", `og:locale` ise `tr_TR` idi. Sayfa GÖVDESİ İngilizce, kabuğu Türkçe:
  // metadata dili sayfanın diliyle aynı olmak ZORUNDA, yoksa arama motoru sayfayı
  // yanlış dilde sınıflar ve iki dil birbirinin kopyası görünür.
  const isEn = lang === 'en'
  const metaTitle = isEn
    ? `${brand.name} Products and Solutions | VentHub`
    : `${brand.name} Ürünleri ve Çözümleri | VentHub`
  const metaDescription = isEn
    ? `${brand.name} ventilation products, technical specifications and competitive pricing at VentHub.`
    : `${brand.name} markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da.`
  return { metaTitle, metaDescription }
}

const OG_GORSELI = [{ url: '/images/og-default.jpg', width: 1200, height: 630 }]

/** BUGÜNKÜ üst veri (bayrak KAPALI) — `brands/[slug]/page.tsx`'ten BİREBİR taşındı. */
export function markaUstVerisi(lang: string, slug: string): Metadata {
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
  const { metaTitle, metaDescription } = markaMetinleri(lang, brand)

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
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
export function markaUstVerisiK3b(lang: string, slug: string): Metadata {
  const brand = markaBul(slug)
  if (!brand) return {}
  const { metaTitle, metaDescription } = markaMetinleri(lang, brand)
  const trYol = adresUret({ tur: 'marka', slug: brand.slug }, 'tr')
  const enYol = adresUret({ tur: 'marka', slug: brand.slug }, 'en')
  const m = sayfaUstVerisi({
    lang,
    yol: lang === 'en' ? enYol : trYol,
    dilYollari: { tr: trYol, en: enYol },
    baslik: metaTitle,
    aciklama: metaDescription,
  })
  return { ...m, openGraph: { ...m.openGraph, images: OG_GORSELI } }
}

/** Marka sayfası gövdesi — JSON-LD + görünüm. */
export function MarkaSayfasi({ lang, slug }: { lang: string; slug: string }) {
  const brand = HVAC_BRANDS.find(b => b.slug === slug)

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
      <PageComponent initialBrandSlug={slug} />
    </>
  )
}

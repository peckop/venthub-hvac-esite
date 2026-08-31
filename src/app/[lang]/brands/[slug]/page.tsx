import type { Metadata } from 'next'

import { SITE_URL } from '../../../../config/siteUrl'
import { brandText, HVAC_BRANDS } from '../../../../data/brands'
import { Routes } from '../../../../utils/routes'
import PageComponent from '../../../../views/BrandDetailPage'

/** ISR yedeği (1 saat) — birincil yol webhook; bkz. `rendering-cache-standard.md` §3-4. */
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const uniqueBrands = HVAC_BRANDS.map(b => b.slug)
    const paths = uniqueBrands.flatMap((b) => [
      { lang: 'tr', slug: b },
      { lang: 'en', slug: b }
    ])

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.warn('generateStaticParams error for brands:', e)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
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
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: isEn ? 'en_US' : 'tr_TR',
      type: 'website',
    },
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  const brand = HVAC_BRANDS.find(b => b.slug === slug)

  // REC-98: `brand.description` artık iki dilli bir NESNE. Doğrudan yazılsaydı JSON-LD'ye
  // `{"tr":"...","en":"..."}` gömülürdü — tip hatası vermeden, sessizce bozuk yapısal veri.
  // URL de dil öneksizdi: `generateMetadata`'daki kanonik yorumu (T083-VH) tam bu hatayı
  // anlatıyor ama JSON-LD ayağı düzeltilmemişti; sitemap dil önekli adresi bildiriyor.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand?.name || slug,
    "description": brand ? brandText(brand.description, lang) : `${slug} marka ürünler`,
    "url": `${SITE_URL}/${lang === 'en' ? 'en' : 'tr'}${Routes.brand(slug)}`
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

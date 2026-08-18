import { SITE_URL } from '../../../../config/siteUrl'
import { HVAC_BRANDS } from '../../../../data/brands'
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

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }) {
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

  return {
    title: `${brand.name} Ürünleri ve Çözümleri | VentHub`,
    description: `${brand.name} markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
    },
    openGraph: {
      title: `${brand.name} Ürünleri ve Çözümleri | VentHub`,
      description: `${brand.name} markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da.`,
      url: canonicalUrl,
      siteName: 'VentHub',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { slug } = await params
  const brand = HVAC_BRANDS.find(b => b.slug === slug)
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand?.name || slug,
    "description": brand?.description || `${brand?.name || slug} marka ürünler`,
    "url": `${SITE_URL}/brands/${slug}`
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

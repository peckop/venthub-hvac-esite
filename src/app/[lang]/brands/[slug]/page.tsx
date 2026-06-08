import { SITE_URL } from '../../../../config/siteUrl'
import { HVAC_BRANDS } from '../../../../data/brands'
import PageComponent from '../../../../views/BrandDetailPage'

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
  const { slug } = await params
  const brand = HVAC_BRANDS.find(b => b.slug === slug)
  
  if (!brand) {
    return {
      title: 'Marka Bulunamadı | VentHub',
    }
  }

  return {
    title: `${brand.name} Ürünleri ve Çözümleri | VentHub`,
    description: `${brand.name} markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da.`,
    alternates: {
      canonical: `${SITE_URL}/brands/${slug}`,
    },
    openGraph: {
      title: `${brand.name} Ürünleri ve Çözümleri | VentHub`,
      description: `${brand.name} markasının en kaliteli havalandırma ürünleri, teknik özellikleri ve avantajlı fiyatları VentHub'da.`,
      url: `${SITE_URL}/brands/${slug}`,
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

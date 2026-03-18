import PageComponent from '../../../views/BrandDetailPage'
import { HVAC_BRANDS } from '../../../lib/brands'

export async function generateStaticParams() {
  try {
    const uniqueBrands = HVAC_BRANDS.map(b => b.slug)
    const paths = uniqueBrands.map((b) => ({
      slug: b,
    }))

    if (paths.length === 0) {
      return [{ slug: 'generic' }]
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for brands:', e)
    return [{ slug: 'generic' }]
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
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
      canonical: `https://venthub-hvac.com/brands/${slug}`,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = HVAC_BRANDS.find(b => b.slug === slug)
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand?.name || slug,
    "description": brand?.description || `${brand?.name || slug} marka ürünler`,
    "url": `https://venthub-hvac.com/brands/${slug}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageComponent initialBrandSlug={slug} />
    </>
  )
}

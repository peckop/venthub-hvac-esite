import PageComponent from '../../../views/ProductDetailPage'
import { getProductBySlug, supabase, type Product } from '../../../lib/supabase'
import { SITE_URL } from '../../../config/siteUrl'


export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('status', 'active')
      .not('slug', 'is', null)

    const paths = (products || [])
      .filter((p) => !!p.slug)
      .map((p) => {
        return { slug: p.slug! }
      })

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for products:', e)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)

    if (product && product.slug) {
      const canonicalPath = product.slug
      return {
        title: `${product.name} | VentHub`,
        description: product.description?.substring(0, 160) || 'VentHub Ürün Detayı',
        alternates: {
          canonical: `${SITE_URL}/products/${canonicalPath}`,
        },
        openGraph: {
          title: `${product.name} | VentHub`,
          description: product.description?.substring(0, 160) || 'VentHub Ürün Detayı',
          url: `${SITE_URL}/products/${canonicalPath}`,
          siteName: 'VentHub',
          images: [
            {
              url: product.image_url || '/images/og-default.jpg',
              width: 1200,
              height: 630,
            },
          ],
          locale: 'tr_TR',
          type: 'website',
        },
      }
    }
  } catch (e) {
    console.error('generateMetadata error for product:', e)
  }

  return {
    title: 'Ürün Detayı | VentHub',
    description: 'VentHub Endüstriyel Havalandırma Sistemleri Ürün Detayı',
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let productData: Product | null = null
  
  try {
    // If we are prerendering 'generic' or the database is down, handle it gracefully
    if (slug !== 'generic') {
      productData = await getProductBySlug(slug)
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('fetch failed')) {
      console.warn(`Network fetch failed for product ${slug} (expected if Supabase env is missing)`)
    } else {
      console.error(`Error fetching product data for ${slug}:`, err)
    }
  }


  // SEO Kanonik Kilidi: Eğer cleanId (UUID) geçerse kanonik her zaman asıl route'u göstersin
  const canonicalPath = productData?.slug || 'generic'
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "productID": canonicalPath,
    "name": productData?.name || "Product Details",
    "description": productData?.description || "VentHub Product Details",
    "url": `${SITE_URL}/products/${canonicalPath}`,
    ...(productData?.image_url && { "image": productData.image_url }),
    ...(productData?.brand && {
      "brand": {
        "@type": "Brand",
        "name": productData.brand
      }
    }),
    "offers": {
      "@type": "Offer",
      "availability": (productData?.stock_qty ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "price": productData?.price || "0.00",
      "priceCurrency": "TRY",
      "url": `${SITE_URL}/products/${canonicalPath}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageComponent initialProduct={productData} />
    </>
  )
}

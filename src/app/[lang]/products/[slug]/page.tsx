import PageComponent from '../../../_components/ProductDetailPageView'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import type { Product } from '@/types/ui-models'
import { SITE_URL } from '../../../../config/siteUrl'
import { getCachedProductBySlug, preloadProduct } from '../../../../lib/data/preload'


export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('status', 'active')
      .not('slug', 'is', null)

    const paths = (products || [])
      .filter((p: { slug: string | null }) => !!p.slug)
      .flatMap((p: { slug: string | null }) => [
        { lang: 'tr', slug: p.slug! },
        { lang: 'en', slug: p.slug! }
      ])

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.warn('generateStaticParams error for products:', e)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { slug } = await params
  // Preload the product data as soon as params are resolved
  preloadProduct(slug)
  try {
    const product = await getCachedProductBySlug(slug)

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
    console.warn('generateMetadata error for product:', e)
  }

  return {
    title: 'Ürün Detayı | VentHub',
    description: 'VentHub Endüstriyel Havalandırma Sistemleri Ürün Detayı',
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { slug } = await params
  // Preload the product data as soon as params are resolved
  preloadProduct(slug)
  let productData: Product | null = null
  
  try {
    // If we are prerendering 'generic' or the database is down, handle it gracefully
    if (slug !== 'generic') {
      productData = await getCachedProductBySlug(slug)
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('fetch failed')) {
      console.warn(`Network fetch failed for product ${slug} (expected if Supabase env is missing)`)
    } else {
      console.warn(`Error fetching product data for ${slug}:`, err)
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageComponent initialProduct={productData} />
    </>
  )
}

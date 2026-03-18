import PageComponent from '../../../views/ProductDetailPage'
import { getProductBySlugOrId, supabase } from '../../../lib/supabase'
import type { Product } from '../../../lib/supabase'

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, slug')
      .eq('status', 'active')

    const paths = (products || []).flatMap((p) => {
      const results = [{ id: p.id }]
      if (p.slug) results.push({ id: p.slug })
      return results
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cleanId = id?.replace(/cc$/, '')
  try {
    const product = await getProductBySlugOrId(cleanId)

    if (product) {
      return {
        title: `${product.name} | VentHub`,
        description: product.description?.substring(0, 160) || 'VentHub Ürün Detayı',
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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cleanId = id?.replace(/cc$/, '')
  let productData: Product | null = null
  
  try {
    // If we are prerendering 'generic' or the database is down, handle it gracefully
    if (cleanId !== 'generic') {
      productData = await getProductBySlugOrId(cleanId)
    }
  } catch (e: any) {
    if (e?.message?.includes('fetch failed')) {
      console.warn(`Network fetch failed for product ${cleanId} (expected if Supabase env is missing)`)
    } else {
      console.error(`Error fetching product data for ${cleanId}:`, e)
    }
  }


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "productID": cleanId,
    "name": productData?.name || "Product Details",
    "description": productData?.description || "VentHub Product Details",
    "url": `https://venthub.com/products/${cleanId}`,
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
      "url": `https://venthub.com/products/${cleanId}`
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

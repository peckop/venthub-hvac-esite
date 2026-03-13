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
      return [{ id: 'generic' }]
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for products:', e)
    return [{ id: 'generic' }]
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const product = await getProductBySlugOrId(params.id)

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

export default async function Page({ params }: { params: { id: string } }) {
  let productData: Product | null = null
  
  try {
    // If we are prerendering 'generic' or the database is down, handle it gracefully
    if (params.id !== 'generic') {
      productData = await getProductBySlugOrId(params.id)
    }
  } catch (e: any) {
    if (e?.message?.includes('fetch failed')) {
      console.warn(`Network fetch failed for product ${params.id} (expected if Supabase env is missing)`)
    } else {
      console.error(`Error fetching product data for ${params.id}:`, e)
    }
  }


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "productID": params.id,
    "name": productData?.name || "Product Details",
    "description": productData?.description || "VentHub Product Details",
    "url": `https://venthub.com/products/${params.id}`,
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
      "url": `https://venthub.com/products/${params.id}`
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

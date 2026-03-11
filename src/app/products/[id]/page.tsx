import PageComponent from '../../../views/ProductDetailPage'
import { getProductById, supabase } from '../../../lib/supabase'
import type { Product } from '../../../lib/supabase'

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active')

    const paths = (products || []).map((p) => ({
      id: p.id,
    }))

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
    const { data: product } = await supabase
      .from('products')
      .select('name, description')
      .eq('id', params.id)
      .single()

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
  // Fetch product data for detailed JSON-LD
  const productData: Product | null = await getProductById(params.id).catch((e) => {
    console.error('fetch error for JSON-LD:', e)
    return null
  })

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
      <PageComponent />
    </>
  )
}

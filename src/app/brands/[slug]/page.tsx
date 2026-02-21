import PageComponent from '../../../views/BrandDetailPage'
import { supabase } from '../../../lib/supabase'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)

    const uniqueBrands = Array.from(new Set((products || []).map(b => b.brand)))

    const paths = uniqueBrands.map((b) => ({
      slug: (b as string).toLowerCase().replace(/\s+/g, '-'),
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

export default function Page() {
  return <PageComponent />
}

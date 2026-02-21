import PageComponent from '../../../views/BrandDetailPage'
import { supabase } from '../../../lib/supabase'

export const dynamicParams = false

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('brand')
    .not('brand', 'is', null)

  const uniqueBrands = Array.from(new Set((products || []).map(b => b.brand)))

  return uniqueBrands.map((b) => ({
    slug: (b as string).toLowerCase().replace(/\s+/g, '-'),
  }))
}

export default function Page() {
  return <PageComponent />
}

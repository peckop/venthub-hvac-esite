import PageComponent from '../../../views/ProductDetailPage'
import { supabase } from '../../../lib/supabase'

export const dynamicParams = false

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('status', 'active')

  return (products || []).map((p) => ({
    id: p.id,
  }))
}

export default function Page() {
  return <PageComponent />
}

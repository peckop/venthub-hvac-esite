import PageComponent from '../../../views/ProductDetailPage'
import { supabase } from '../../../lib/supabase'


// eslint-disable-next-line react-refresh/only-export-components
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

export default function Page() {
  return <PageComponent />
}

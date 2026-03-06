import PageComponent from '../../../../views/knowledge/TopicPage'
import { supabase } from '../../../../lib/supabase'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const { data: topics } = await supabase
      .from('venthub_support_topics')
      .select('slug')

    const slugs = (topics || []).map((t) => ({
      slug: t.slug,
    }))

    // Build anında boş dönmesi durumunda en azından bir rota sağla (Next.js kısıtlaması için)
    if (slugs.length === 0) {
      return [{ slug: 'genel-bakis' }]
    }
    return slugs
  } catch (e) {
    console.error('generateStaticParams error:', e)
    return [{ slug: 'genel-bakis' }]
  }
}

export default function Page() {
  return <PageComponent />
}

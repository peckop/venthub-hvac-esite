import { tr } from '../../../../../i18n/dictionaries/tr'
import PageComponent from '../../../../../views/knowledge/TopicPage'

export const dynamicParams = false

export async function generateStaticParams() {
  const topics = Object.keys(tr.knowledge.topics)

  return topics.flatMap((slug) => [
    { lang: 'tr', slug },
    { lang: 'en', slug }
  ])
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { slug } = await params
  return <PageComponent slug={slug} />
}

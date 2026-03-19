import PageComponent from '../../../../views/knowledge/TopicPage'
import { tr } from '../../../../i18n/dictionaries/tr'

export const dynamicParams = false

export async function generateStaticParams() {
  const topics = Object.keys(tr.knowledge.topics)

  return topics.map((slug) => ({
    slug,
  }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PageComponent slug={slug} />
}

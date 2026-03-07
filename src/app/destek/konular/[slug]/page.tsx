import PageComponent from '../../../../views/knowledge/TopicPage'
import { tr } from '../../../../i18n/dictionaries/tr'

export const dynamicParams = false

// eslint-disable-next-line react-refresh/only-export-components
export async function generateStaticParams() {
  const topics = Object.keys(tr.knowledge.topics)

  return topics.map((slug) => ({
    slug,
  }))
}

export default function Page() {
  return <PageComponent />
}

import PageComponent from '../../../views/AboutPage'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
}

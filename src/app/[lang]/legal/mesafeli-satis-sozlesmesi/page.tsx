export const dynamic = 'force-static'

import PageComponent from '../../../../views/legal/DistanceSalesAgreementPage'

export async function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }]
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}






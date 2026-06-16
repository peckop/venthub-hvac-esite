export const dynamic = 'force-static'


import PageComponent from '../../../../views/legal/PrivacyPolicyPage'

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <PageComponent lang={lang} />
}





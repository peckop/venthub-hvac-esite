import type { Metadata } from 'next'

import { yaziParametreleri, YaziRotasi, yaziUstVerisi } from '../../../../views/knowledge/bilgiMerkeziRotasi'

/**
 * `/en/knowledge-hub/<article>` — rehber yazısının EN sayfası (karar 92).
 *
 * ⚠`EN_YAYIN` KAPALIYKEN ÜRETİLMEZ; EN metni yazılmamış yazının EN sayfası da YOKTUR (başka
 * dile düşme yasak). Rota sınıfı ve kurallar TR karşılığıyla aynı (`bilgi-merkezi/[yazi]`).
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export function generateStaticParams({ params }: { params: { lang: string } }) {
  return yaziParametreleri(params.lang, 'en')
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; yazi: string }> }): Promise<Metadata> {
  return yaziUstVerisi(params, 'en')
}

export default function Page({ params }: { params: Promise<{ lang: string; yazi: string }> }) {
  return <YaziRotasi params={params} bolumDili="en" />
}

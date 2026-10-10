import type { Metadata } from 'next'

import { ListeRotasi, listeUstVerisi } from '../../../views/knowledge/bilgiMerkeziRotasi'

/**
 * `/en/knowledge-hub` — Bilgi Merkezi'nin EN liste sayfası (karar 92).
 *
 * ⚠`EN_YAYIN` KAPALIYKEN ÜRETİLMEZ (rehber-yazisi-standard.md R3/R6): sayfa 404 verir, eski EN
 * adresleri o süre `next.config` 308'iyle EN karşılığına gider
 * (src/config/bilgiMerkeziYonlendirmeleri.mjs). Bayrak açılınca rota ve yönlendirme birlikte değişir.
 * `/tr/knowledge-hub` YOKTUR.
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return listeUstVerisi(params, 'en')
}

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <ListeRotasi params={params} bolumDili="en" />
}

import type { Metadata } from 'next'

import { ListeRotasi, listeUstVerisi } from '../../../views/knowledge/bilgiMerkeziRotasi'

/**
 * `/tr/bilgi-merkezi` — Bilgi Merkezi liste sayfası (karar 92). Gövde ve kurallar
 * `views/knowledge/bilgiMerkeziRotasi.tsx`'te; EN karşılığı `knowledge-hub/page.tsx`.
 * `/en/bilgi-merkezi` YOKTUR: sayfa bölüm dilini denetler, eşleşmezse 404.
 *
 * ROTA SINIFI: statik (`force-static`) + ISR yedeği. `searchParams`/`cookies()`/`headers()`
 * okunmaz (rendering-cache-standard §1.1). Arama istemcide süzer, adrese yazılmaz.
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return listeUstVerisi(params, 'tr')
}

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <ListeRotasi params={params} bolumDili="tr" />
}

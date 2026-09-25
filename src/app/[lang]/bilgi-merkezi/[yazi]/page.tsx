import type { Metadata } from 'next'

import { yaziParametreleri, YaziRotasi, yaziUstVerisi } from '../../../../views/knowledge/bilgiMerkeziRotasi'

/**
 * `/tr/bilgi-merkezi/<yazi>` — rehber yazısı (karar 92; rehber-yazisi-standard.md R3/R6).
 *
 * ROTA SINIFI (R6): `force-static` + `generateStaticParams` + `revalidate` yedeği.
 * `dynamicParams = false` KULLANILMAZ — yeni yazı derlemeye kadar 404 vermesin; bilinmeyen adres
 * istek anında `notFound()` ile 404 olur. Gövdenin tamamı sunucu HTML'inde (istemci sınırı yalnız
 * arama kutusunda, o da liste sayfasında).
 *
 * İç bağlantılar (`vh:<tür>/<anahtar>`) sayfa üretilirken çözülür; çözülemeyen bağlantı üretimi
 * DURDURUR (src/lib/bilgiMerkezi/icBaglanti.ts).
 */
export const dynamic = 'force-static'
export const revalidate = 3600

export function generateStaticParams({ params }: { params: { lang: string } }) {
  return yaziParametreleri(params.lang, 'tr')
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; yazi: string }> }): Promise<Metadata> {
  return yaziUstVerisi(params, 'tr')
}

export default function Page({ params }: { params: Promise<{ lang: string; yazi: string }> }) {
  return <YaziRotasi params={params} bolumDili="tr" />
}

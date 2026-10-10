/**
 * Rehber yazısı yapısal verisi — `Article` (rehber-yazisi-standard.md R6, karar 92 düzeltmesi).
 *
 * NİÇİN `Article`: Google Article türünü yalnız Article / NewsArticle / BlogPosting üzerinden kabul
 * ediyor; `TechArticle` o listede yok. `FAQPage` KONMAZ: SSS zengin sonucu 2026-05-07'de kalktı.
 * BreadcrumbList bu dosyada DEĞİL — tek kaynak `buildBreadcrumbJsonLd` (src/lib/seo/jsonld.ts).
 *
 * Yazar ve yayıncı Kurum'dur (VentHub); yapay zekâ notu yok (karar 106).
 */
export interface MakaleJsonLdGirdisi {
  baseUrl: string
  /** Dil önekli tam yol (ör. `/tr/bilgi-merkezi/hava-perdesi`). */
  yol: string
  baslik: string
  aciklama: string
  dil: 'tr' | 'en'
  yayinTarihi: string
  guncellemeTarihi: string
}

export function makaleJsonLd(g: MakaleJsonLdGirdisi): Record<string, unknown> {
  const kurum = { '@type': 'Organization', name: 'VentHub', url: g.baseUrl }
  const url = `${g.baseUrl}${g.yol}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.baslik,
    description: g.aciklama,
    inLanguage: g.dil === 'en' ? 'en' : 'tr',
    datePublished: g.yayinTarihi,
    dateModified: g.guncellemeTarihi,
    author: kurum,
    publisher: kurum,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }
}

/** `<script type="application/ld+json">` gövdesi: `<`/`>` kaçışlanır (depodaki emsal). */
export function jsonLdMetni(veri: unknown): string {
  return JSON.stringify(veri).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}

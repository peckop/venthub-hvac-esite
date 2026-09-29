import type { Metadata } from 'next'

import { EN_YAYIN } from '@/config/features'

/**
 * EN_YAYIN'İN ÜST VERİ KURALI — TEK BAYRAK, İKİ DAVRANIŞ (REC-300 Faz 3e-3, OPS hükmü 2026-09-29).
 *
 * `EN_YAYIN` KAPALIYKEN:
 *  1. `/en/...` sayfaları `noindex, follow` basar (dil layout'u ağacın köküne basar; **kendi
 *     `robots`unu yazan sayfa layout'unkini EZER** — ana sayfa ve ürünler listesi öyleydi, canlıda
 *     `index, follow` döndüler: 2026-09-29 ölçümü). Kendi `robots`unu yazan her sayfa bu yardımcıyı
 *     kullanır, kuralı tekrar yazmaz.
 *  2. hreflang beyanı YOK: karşılığı dizine kapalı bir sayfaya "bu sayfanın İngilizcesi şurada"
 *     demek, Google'a kapalı bir kapıyı göstermektir. Yalnız `canonical` (kendi dilindeki adres) kalır.
 *
 * `EN_YAYIN` AÇILINCA ikisi birden geri gelir — ayrı ayrı açılacak iki bayrak YOK, ayrışamazlar.
 * Kapı: `src/lib/seo/__tests__/enYayinHreflangNoindex.test.ts`.
 *
 * ⚠`languages:` yazımı çağıran dosyada LİTERAL kalır (`...hreflangAlani({ languages: {...} })`):
 * INV-CANONICAL-2 ve storefront-metadata-tek-yazici kapıları "canonical bildiren blok `languages:`
 * da yazar" diye kaynağı tarar; yayılmanın buradan olması o sözleşmeyi bozmaz.
 */

/** EN sayfası + yayın kapalı: dizine girmesin. */
export function enKapaliMi(lang: string): boolean {
  return lang === 'en' && !EN_YAYIN
}

export type KapaliRobots = { index: false; follow: true }

/** `noindex, follow` — `follow` bilerek açık: sayfadaki bağlantılar TR eşlerine gidiyor. */
export const NOINDEX_FOLLOW: KapaliRobots = { index: false, follow: true }

/**
 * Sayfa kendi `robots`unu yazıyorsa: EN kapalıyken `noindex, follow`, aksi hâlde `verilen`.
 * (`verilen` boş bırakılırsa TR/açık EN'de `undefined` — Next hiçbir etiket basmaz.)
 */
export function enKuraliRobots(lang: string, verilen?: Metadata['robots']): Metadata['robots'] | undefined {
  return enKapaliMi(lang) ? NOINDEX_FOLLOW : verilen
}

/**
 * `alternates` içine YAYILAN hreflang alanı: `EN_YAYIN` açıkken `{ languages }` AYNEN, kapalıyken
 * `{}` — `languages` anahtarı hiç çıkmaz, yalnız `canonical` kalır. Kullanım:
 * `alternates: { canonical, ...hreflangAlani({ languages: { tr, en, 'x-default': tr } }) }`.
 */
export function hreflangAlani<T extends { languages: Record<string, string> }>(alan: T): T | Record<string, never> {
  return EN_YAYIN ? alan : {}
}

/**
 * Site haritası satırına eklenecek `alternates` alanı: `EN_YAYIN` kapalıyken `{}` (satırda
 * `alternates` alanı hiç çıkmaz), açıkken bugünkü `{ alternates: { languages } }` BİREBİR.
 */
export function siteHaritasiAlternates<T extends Record<string, string>>(
  languages: T,
): { alternates: { languages: T } } | Record<string, never> {
  return EN_YAYIN ? { alternates: { languages } } : {}
}

/** Pasif (`is_active === false`) kategori: sayfa 200 KALIR ama dizine girmez (O4). */
export function pasifKategoriRobots(category: { is_active?: boolean | null }): KapaliRobots | undefined {
  return category.is_active === false ? NOINDEX_FOLLOW : undefined
}

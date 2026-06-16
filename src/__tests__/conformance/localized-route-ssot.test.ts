import { describe, expect, it } from 'vitest'

/**
 * INV-2 · Localized-route SSOT conformance (kalıcı bekçi).
 *
 * Kullanıcıya görünen TÜM navigasyon URL'leri dil önekini SSOT üzerinden almalı:
 *   • client bileşeni  → useLocalizedRoutes() proxy'si (Routes.x() çağrısı /tr|/en önekli döner)
 *   • RSC / paylaşılan render (Breadcrumb gibi) → localizedHref(url, lang)  — src/utils/routes.ts
 *
 * Bu testin hedefi iki kaçak deseni (yalnız components/ + views/ render katmanı taranır):
 *   1. ELLE DİL ÖNEKİ: `/${lang}/...` veya `/${locale}/...` birleştirme. localizedHref dururken
 *      elle önek = SSOT kaçağı; biri tr/en dalını unutursa link sessizce kırılır
 *      (2026-06 anasayfa kategori + CookieConsent bug sınıfı tam buydu).
 *   2. SABİT APP-YOLU LITERAL'İ: href:/to: '/category|/products|/account|...' — hem Routes
 *      builder'ını hem dil önekini atlar; dilsiz URL render eder ve /[lang] segmentine uymaz.
 *
 * Meşru altyapı (middleware locale-routing, sitemap + canonical SEO URL'leri, Routes/localizedHref
 * tanımının kendisi) components/ + views/ DIŞINDA yaşadığından kapsam dışıdır — kapı yalnız render
 * katmanını tarar, böylece SEO/altyapı URL'lerinde yanlış-pozitif üretmez.
 *
 * NOT: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz (INV-1 ile aynı sebep — node 'fs'
 * tipleri bu projede tsc'de çözülmüyor). Yorumlar taranmadan silinir → açıklayıcı örnek desenler
 * bekçiyi tetiklemez.
 */

// import.meta.glob'u Vite birebir yazıldığında derler; vite/client tipleri yüklü
// olmadığından imzayı yerel olarak bildiriyoruz.
declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Yalnız UI render katmanı: navigasyon href'leri burada yaşar.
const SCOPE = ['components/', 'views/']

// 1) Elle `/${lang}` / `/${locale}` dil-öneki birleştirme.
const MANUAL_LANG_PREFIX = /\/\$\{\s*(?:lang|locale)\s*\}/

// 2) href:/to:/href= ile sabit app-yolu literal'i (Routes + localize atlanmış).
const HARDCODED_APP_PATH =
  /\b(?:href|to)\s*[:=]\s*\{?\s*['"`]\/(?:category|products|account|legal|brands|checkout|cart|destek|contact|about|auth)\b/

// 3) Ham Routes importu (utils/routes'tan { Routes }) AMA localize sarmalayıcı YOK.
//    Client'ta Routes.x() dilsiz URL döndürür; useLocalizedRoutes proxy'si ya da localizedHref
//    olmadan render edilirse dil öneki kaybolur (middleware redirect'e bel bağlar = fazladan hop + drift).
const RAW_ROUTES_IMPORT = /import\s*\{[^}]*\bRoutes\b[^}]*\}\s*from\s*['"][^'"]*utils\/routes['"]/
const HAS_LOCALIZER = /\b(?:localizedHref|useLocalizedRoutes)\b/
// İstisna: /admin rotaları dil-öneki ALMAZ (localizeUrl admin'i atlar); R3F bileşeni React
// context'i Canvas sınırını geçmediğinden hook kullanamaz (programatik push redirect'le çalışır).
const RAW_ROUTES_ALLOWLIST = [
  'components/admin/',
  'views/admin/',
  'components/products/BentPlaneGeometry.tsx',
]

/** Yorumları siler ki açıklayıcı yorumlardaki örnek desenler bekçiyi tetiklemesin. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // blok yorum
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // satır yorum ("http://" gibi şemaları koru)
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

describe('INV-2 · localized-route SSOT conformance', () => {
  it('navigasyon URL leri SSOT ile localize edilmeli (elle önek / sabit app-yolu yasak)', () => {
    const manualPrefix: string[] = []
    const hardcodedPath: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (!SCOPE.some((s) => rel.startsWith(s))) continue

      const clean = stripComments(source)
      if (MANUAL_LANG_PREFIX.test(clean)) manualPrefix.push(rel)
      if (HARDCODED_APP_PATH.test(clean)) hardcodedPath.push(rel)
    }

    expect(
      { manualPrefix, hardcodedPath },
      `SSOT-dışı navigasyon URL'i bulundu — localizedHref / useLocalizedRoutes kullan:\n` +
        `  elle dil öneki : ${manualPrefix.join('\n                   ') || '—'}\n` +
        `  sabit app-yolu : ${hardcodedPath.join('\n                   ') || '—'}`,
    ).toEqual({ manualPrefix: [], hardcodedPath: [] })
  })

  it('client/RSC nav bileşeni ham Routes değil localize SSOT kullanmalı', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (!SCOPE.some((s) => rel.startsWith(s))) continue
      if (RAW_ROUTES_ALLOWLIST.some((a) => rel.startsWith(a))) continue

      const clean = stripComments(source)
      if (RAW_ROUTES_IMPORT.test(clean) && !HAS_LOCALIZER.test(clean)) offenders.push(rel)
    }

    expect(
      offenders,
      `Ham Routes (dilsiz) kullanan nav bileşeni — useLocalizedRoutes() ya da localizedHref kullan:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'

/**
 * INV-3 · Numeric/temporal-format SSOT conformance (kalıcı bekçi).
 *
 * Kullanıcıya görünen TÜM para / sayı / tarih biçimi tek SSOT'tan gelmeli:
 *   • para   → formatCurrency(value, lang[, opts])   — src/i18n/format.ts
 *   • sayı   → formatNumber(value, lang[, opts])      — src/i18n/format.ts
 *   • tarih  → formatDate / formatDateTime / formatTime(input, lang) — src/i18n/datetime.ts
 *
 * Yasak kaçak desenleri (drift sınıfı):
 *   1. Ham `Intl.NumberFormat(` / `Intl.DateTimeFormat(` — locale'i elle kurar; biri 'tr-TR' sabitlerse
 *      EN'de Türkçe biçim sızar (admin bildirimi ₺ + sipariş PDF'i tam bu sınıftı).
 *   2. `.toLocaleString(` / `.toLocaleDateString(` / `.toLocaleTimeString(` — runtime/sabit locale'e
 *      bağlanır, dil değişince güncellenmez (hesap makinesi sonuçları tam bu sınıftı).
 *
 * Tek meşru sahip: SSOT helper'larının kendisi (i18n/format.ts, i18n/datetime.ts). Bunlar Intl'i
 * dile bağlı tek yerde sarar; başka her dosya helper'ı çağırır. Bu yüzden tüm src taranır
 * (drift lib/hooks/app/components/views fark etmez) ve yalnız iki SSOT dosyası muaftır.
 *
 * NOT: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz (INV-1/INV-2 ile aynı sebep — node
 * 'fs' tipleri bu projede tsc'de çözülmüyor). Yorumlar taranmadan silinir → açıklayıcı örnek
 * desenler bekçiyi tetiklemez.
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

// Tek meşru sahip: dile-bağlı biçim helper'larının tanımlandığı SSOT dosyaları.
const SSOT_ALLOWLIST = ['i18n/format.ts', 'i18n/datetime.ts']

// 1) Ham Intl.NumberFormat / Intl.DateTimeFormat (locale elle kuruluyor).
const RAW_INTL_FORMAT = /\bIntl\.(?:NumberFormat|DateTimeFormat)\s*\(/
// 2) toLocaleString / toLocaleDateString / toLocaleTimeString (runtime/sabit locale).
const TO_LOCALE_FORMAT = /\.toLocale(?:String|DateString|TimeString)\s*\(/

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

describe('INV-3 · numeric/temporal-format SSOT conformance', () => {
  it('para/sayı/tarih biçimi SSOT helper ile yapılmalı (ham Intl / toLocale* yasak)', () => {
    const rawIntl: string[] = []
    const toLocale: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (SSOT_ALLOWLIST.some((a) => rel === a)) continue

      const clean = stripComments(source)
      if (RAW_INTL_FORMAT.test(clean)) rawIntl.push(rel)
      if (TO_LOCALE_FORMAT.test(clean)) toLocale.push(rel)
    }

    expect(
      { rawIntl, toLocale },
      `SSOT-dışı biçimleme bulundu — formatCurrency / formatNumber / formatDate kullan:\n` +
        `  ham Intl.*Format : ${rawIntl.join('\n                     ') || '—'}\n` +
        `  toLocale*String  : ${toLocale.join('\n                     ') || '—'}`,
    ).toEqual({ rawIntl: [], toLocale: [] })
  })
})

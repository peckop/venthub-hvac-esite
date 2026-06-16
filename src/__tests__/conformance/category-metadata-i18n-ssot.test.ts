import { describe, expect, it } from 'vitest'

/**
 * INV-4 · Kategori metadata JSONB-çeviri SSOT conformance (kalıcı bekçi).
 *
 * Kategori `metadata` JSONB'sinin DİLE-BAĞLI metin alanları (`tr`/`en` varyantlı) yalnız
 * locale-mapper SSOT'undan okunmalı:
 *   • mapCategoryWithLocale(dbCat, lang)  — metadata[lang]'ı çözer  (src/lib/type-converters.ts)
 *   • getCategoryDescription(category)     — hero_description→description fallback (src/utils/categoryHelpers.ts)
 *
 * Yasak kaçak: render katmanında ham `metadata?.hero_description` / `hero_title` / `technical_summary`
 * okuması. Ham okuma EN'de Türkçe metin sızdırır — `mapCategoryWithLocale` çağrılmadan metadata
 * tabanı (varsayılan/tr) gelir. (CategoryShowcase hero'yu tam böyle ham okuyordu = latent drift.)
 *
 * Kapsam-dışı bilinçli: `showcase_images` / `model_type` / `metric1/2` yapısal (dile-bağlı değil),
 * `authority_content` AuthorityRenderer'ın ayrı yapısal akışı — bunlar locale-mapper'a tabi değil.
 * Tek meşru sahip: iki SSOT helper dosyası.
 *
 * NOT: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz (INV-1..3 ile aynı sebep). Yorumlar
 * taranmadan silinir → açıklayıcı örnek desenler bekçiyi tetiklemez.
 */

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

// Locale-mapper SSOT'unun tanımlandığı dosyalar (dile-bağlı alanları meşru okuyan tek yer).
const SSOT_ALLOWLIST = ['lib/type-converters.ts', 'utils/categoryHelpers.ts']

// Kategori metadata'sının dile-bağlı (tr/en) metin alanlarına ham property erişimi.
const RAW_LOCALIZED_META = /\.\s*(?:hero_title|hero_description|technical_summary)\b/

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

describe('INV-4 · kategori metadata JSONB-çeviri SSOT conformance', () => {
  it('dile-bağlı metadata metni locale-mapper ile okunmalı (ham hero_* erişimi yasak)', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (rel.endsWith('db-rows.ts')) continue // tip tanımı (alan adlarını bildirir, okumaz)
      if (SSOT_ALLOWLIST.some((a) => rel === a)) continue

      const clean = stripComments(source)
      if (RAW_LOCALIZED_META.test(clean)) offenders.push(rel)
    }

    expect(
      offenders,
      `Ham (locale-map'siz) kategori metadata metni okunuyor — mapCategoryWithLocale /\n` +
        `getCategoryDescription kullan:\n  ${offenders.join('\n  ') || '—'}`,
    ).toEqual([])
  })
})

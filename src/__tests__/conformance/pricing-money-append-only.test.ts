import { describe, expect, it } from 'vitest'

/**
 * INV-PRICE-4 · Para saklama + kur defteri append-only conformance (kalıcı bekçi).
 *
 * Cetvel: docs/standards/pricing-standard.md §14 —
 *  (a) para kolonları float SAKLANMAZ (numeric/int; float = yuvarlama hatası birikir),
 *  (b) `currency_rates` append-only: UPDATE/DELETE policy'si ve migration içi
 *      UPDATE/DELETE veri-düzeltmesi YASAK (elle ezme = yeni `manual` satır).
 *
 * Neden test: migration SQL'i tsc/lint/build için opaktır; append-only sözleşmesini
 * bozan bir policy ya da veri-düzeltme migration'ı hiçbir mevcut gate'e takılmaz.
 * Migration içi DO-guard yalnız kendi dosyasını korur; bu test TÜM migration
 * geçmişini ve geleceğini tarar.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATION_SOURCES: Record<string, string> = import.meta.glob(
  '/supabase/migrations/**/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

/** Fiyat hattının para taşıyan tabloları — float yasağı bu tabloların DDL'inde aranır. */
const MONEY_TABLES = ['pricing_rule', 'currency_rates', 'product_prices', 'price_lists']

/** Bir migration kaynağından, verilen tabloya ait CREATE TABLE gövdelerini ve ADD COLUMN satırlarını toplar. */
function ddlSlices(source: string, table: string): string[] {
  const slices: string[] = []
  const createRe = new RegExp(
    `create\\s+table[^(]*\\b${table}\\b[^(]*\\(([\\s\\S]*?)\\);`,
    'gi',
  )
  for (const m of source.matchAll(createRe)) slices.push(m[1])
  const alterRe = new RegExp(
    `alter\\s+table[^;]*\\b${table}\\b[^;]*add\\s+column[^;]*;`,
    'gi',
  )
  for (const m of source.matchAll(alterRe)) slices.push(m[0])
  return slices
}

describe('INV-PRICE-4: para float saklanmaz + currency_rates append-only', () => {
  const entries = Object.entries(MIGRATION_SOURCES)

  it('migration kaynakları bulunur', () => {
    expect(entries.length, 'migration glob boş — yol değiştiyse testi güncelle').toBeGreaterThan(0)
  })

  it('para tablolarının DDL\'inde float tipi yok', () => {
    const violations: string[] = []
    for (const [file, source] of entries) {
      for (const table of MONEY_TABLES) {
        for (const slice of ddlSlices(source, table)) {
          if (/\b(real|double\s+precision|float4|float8|float(\s*\(\d+\))?)\b/i.test(slice)) {
            violations.push(`${file} → ${table}`)
          }
        }
      }
    }
    expect(violations, `Float para kolonu tespit edildi (numeric/int kullan): ${violations.join(', ')}`).toEqual([])
  })

  it('currency_rates üzerinde UPDATE/DELETE policy tanımlanmaz', () => {
    const violations: string[] = []
    for (const [file, source] of entries) {
      const policyRe = /create\s+policy[\s\S]*?on\s+(?:public\.)?currency_rates[\s\S]*?for\s+(update|delete)/gi
      if (policyRe.test(source)) violations.push(file)
    }
    expect(violations, `currency_rates append-only: UPDATE/DELETE policy yasak → ${violations.join(', ')}`).toEqual([])
  })

  it('migration içinde currency_rates satırı UPDATE/DELETE edilmez (düzeltme = yeni manual satır)', () => {
    const violations: string[] = []
    for (const [file, source] of entries) {
      if (/(^|\s)update\s+(?:public\.)?currency_rates\b/i.test(source)) violations.push(`${file} (UPDATE)`)
      if (/delete\s+from\s+(?:public\.)?currency_rates\b/i.test(source)) violations.push(`${file} (DELETE)`)
    }
    expect(violations, `currency_rates append-only ihlali: ${violations.join(', ')}`).toEqual([])
  })
})

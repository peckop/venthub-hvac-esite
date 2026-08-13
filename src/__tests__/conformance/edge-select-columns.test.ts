import { describe, expect, it } from 'vitest'

/**
 * INV-8 · Edge function şema-sınırı conformance (kalıcı bekçi).
 *
 * Edge function'lar (Deno) DB'ye STRING-tipli select listeleriyle erişir:
 *   • PostgREST REST: `/rest/v1/products?select=id,name,sku`
 *   • supabase-js:    `.from('products').select('id, name, stock_qty')`
 * Bu string'ler tsc için OPAK'tır — `database.types.ts` ile hiçbir bağı yok.
 * PostgREST, select listesinde OLMAYAN tek bir kolonda TÜM sorguyu 400 ile
 * reddeder → çağıran taraf çoğu zaman `if (res.ok)` guard'ıyla sessizce boş
 * veriye düşer (log yok, Sentry yok).
 *
 * Sınıf örneği (ultrareview #480 bug_004): D4 legacy kolon DROP'u sonrası
 * iyzico-payment'ın `select=id,name,sku,image_url` sorgusu 400'lenecek,
 * sipariş kalemi snapshot'ı sessizce client-verisine düşecekti.
 *
 * Bu sınıfı mevcut hiçbir gate yakalamaz:
 *   • tsc — edge dosyaları proje tsconfig'inde değil; string zaten opak,
 *   • lint/test/build — string içeriğini yorumlamaz,
 *   • migration guard'ları — DB tarafını korur, edge string'lerini görmez.
 * Yalnız bu test yakalar: select listelerindeki her kolon adı, üretilmiş
 * `database.types.ts`'in Row tanımına karşı doğrulanır.
 *
 * Kapsam: STATİK select listeleri (okuma yolu). `select=*`, `${...}`
 * interpolasyonlu dinamik listeler ve types'ta olmayan tablolar (rpc/storage)
 * bilinçle atlanır (sessiz cap değil, sınıf dışı).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const EDGE_SOURCES: Record<string, string> = import.meta.glob(
  '/supabase/functions/**/*.ts',
  { query: '?raw', import: 'default', eager: true },
)

const TYPES_FILES: Record<string, string> = import.meta.glob(
  '/src/types/database.types.ts',
  { query: '?raw', import: 'default', eager: true },
)

/** database.types.ts'ten bir tablonun Row kolon adlarını çıkarır (Tables bloğundaki İLK eşleşme). */
function parseRowColumns(typesSource: string, table: string): Set<string> | null {
  const m = typesSource.match(
    new RegExp(`\\b${table}:\\s*\\{\\s*Row:\\s*\\{([^}]*)\\}`, 's'),
  )
  if (!m) return null
  const cols = new Set<string>()
  for (const line of m[1].split('\n')) {
    const key = line.match(/^\s*["']?(\w+)["']?\s*:/)
    if (key) cols.add(key[1])
  }
  return cols.size > 0 ? cols : null
}

/** Select listesini kolon token'larına indirger; doğrulanamayan token'lar elenir (konservatif). */
function selectTokens(rawList: string): string[] {
  let list = rawList
  // Gömülü kaynaklar `rel(...)` virgül içerebilir — iç-parantez gruplarını tamamen düş.
  for (let i = 0; i < 5 && /\([^()]*\)/.test(list); i++) {
    list = list.replace(/\([^()]*\)[^,]*/g, '')
  }
  return list
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '' && t !== '*')
    .map((t) => {
      // `alias:column` → kolon iki noktadan SONRAKİ segmenttir; `col::cast` → önceki.
      const noCast = t.split('::')[0]
      const parts = noCast.split(':')
      return parts[parts.length - 1].trim()
    })
    .filter((t) => /^\w+$/.test(t))
}

type Usage = { file: string; table: string; cols: string[] }

/** Edge kaynağından statik select kullanımlarını toplar. */
function extractUsages(file: string, source: string): Usage[] {
  const usages: Usage[] = []

  // 1) PostgREST REST: /rest/v1/<tablo>?...select=<liste>  (& veya string sonu ile biter)
  const rest = /\/rest\/v1\/(\w+)\?([^`"'\s]*)/g
  for (const m of source.matchAll(rest)) {
    const [, table, query] = m
    const sel = query.match(/(?:^|&)select=([^&]*)/)
    if (!sel) continue
    if (sel[1].includes('${')) continue // dinamik liste — statik doğrulanamaz
    usages.push({ file, table, cols: selectTokens(decodeURIComponent(sel[1])) })
  }

  // 2) supabase-js: .from('<tablo>') ... .select('<liste>') (dar pencere: başka sorguya taşmasın)
  const js = /\.from\(\s*['"](\w+)['"]\s*\)[\s\S]{0,120}?\.select\(\s*['"]([^'"]+)['"]/g
  for (const m of source.matchAll(js)) {
    const [, table, list] = m
    if (list.includes('${')) continue
    usages.push({ file, table, cols: selectTokens(list) })
  }

  return usages
}

describe('INV-8 · edge function select listeleri database.types ile eşleşmeli', () => {
  const typesSource = Object.values(TYPES_FILES)[0]

  it('parser sağlık kontrolü (bayat-bekçi): products Row çözülüyor', () => {
    expect(typesSource).toBeTruthy()
    const products = parseRowColumns(typesSource, 'products')
    expect(products).not.toBeNull()
    expect(products!.has('id')).toBe(true)
    expect(products!.has('name')).toBe(true)
    // D4'te DROP edilen kolon üretilmiş tiplerde OLMAMALI — parser bayatlarsa burası kırılır.
    expect(products!.has('image_url')).toBe(false)
  })

  it('tarama sağlık kontrolü (bayat-bekçi): en az bir statik select bulunuyor', () => {
    const all = Object.entries(EDGE_SOURCES).flatMap(([f, s]) => extractUsages(f, s))
    // iyzico-payment/refund/callback + stock-alert bilinen kullanıcılar; regex bayatlarsa 0'a düşer.
    expect(all.length).toBeGreaterThanOrEqual(3)
  })

  it('bilinen tablolarda bilinmeyen kolon YOK', () => {
    const violations: string[] = []
    for (const [file, source] of Object.entries(EDGE_SOURCES)) {
      for (const usage of extractUsages(file, source)) {
        const rowCols = parseRowColumns(typesSource, usage.table)
        if (!rowCols) continue // types'ta olmayan tablo (rpc/storage vb.) — sınıf dışı
        for (const col of usage.cols) {
          if (!rowCols.has(col)) {
            violations.push(`${file}: ${usage.table}.${col}`)
          }
        }
      }
    }
    expect(
      violations,
      `Edge function select listesinde şemada olmayan kolon(lar) var — PostgREST bu sorguların TAMAMINI 400'ler:\n` +
        violations.join('\n') +
        `\nÇözüm: kolonu listeden çıkar veya şemaya ekle; kolon DROP ediyorsan docs/standards/migration-safety-standard.md preflight'ını uygula.`,
    ).toEqual([])
  })
})

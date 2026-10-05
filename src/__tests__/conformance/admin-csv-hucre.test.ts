import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-CSV-1 · Yönetici CSV dışa aktarımı TEK KAPIDAN çıkar (VULN-006, REC-355).
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1.
 *
 * NİÇİN VAR
 * Ölçüm (2026-09-29): 16 yönetici CSV yüzeyinin HİÇBİRİ `= + - @ TAB CR` ile başlayan hücreyi
 * nötrlemiyordu; her biri kendi içinde yalnız `"` → `""` yapıyordu (6'sı yerel `escape()`, 9'u satır
 * içi, 1'i içe aktarma hata raporu). Hesap açan bir müşterinin ad alanına yazdığı formül, yönetici
 * CSV'yi Excel'de açınca çalışırdı. Ortak yardımcı `src/utils/csvHucre.ts`.
 *
 * İKİ KURAL
 *   A) Kapsanan dizinlerde satır içi `.replace(/"/g, '""')` YASAK (kaçış yalnız csvHucre.ts'te).
 *   B) `new Blob(` + `text/csv` içeren dosya `csvHucre` kullanmak ZORUNDA (yeni yüzey kapıdan geçer).
 *
 * GEÇİŞ (RATCHET): 16 mevcut yüzey `BEKLEYEN_GOC` listesinde ADLA yazılı; Faz 2 göç PR'ı listeyi
 * BOŞALTIR. Liste ancak KÜÇÜLEBİLİR: (1) listede olmayan ihlalci → kırmızı (yeni yüzey), (2) listede
 * olup artık ihlal etmeyen dosya → kırmızı ("listeden çıkar", taban bayatlayamaz).
 * SINIR: dosya içi metin taraması; yardımcıyı çağırıp çıktısını yine de elle bozan kodu görmez.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const KAPSAM = ['/src/views/admin/', '/src/components/admin/']
const YARDIMCI = '/src/utils/csvHucre.ts'

/** Faz 2 göç PR'ında BOŞALIR. Her satır bir yüzey: hangi dosya, hangi kural. */
const BEKLEYEN_GOC: readonly string[] = [
  '/src/components/admin/InventoryCsvImport.tsx',
  '/src/views/admin/AdminInventoryReportPage.tsx',
  '/src/views/admin/AdminLogisticsTableBody.tsx',
  '/src/views/admin/AdminUsersTableBody.tsx',
  '/src/views/admin/AuditLogTableBody.tsx',
  '/src/views/admin/CategoriesTableBody.tsx',
  '/src/views/admin/CouponsTableBody.tsx',
  '/src/views/admin/ErrorGroupsTableBody.tsx',
  '/src/views/admin/ErrorsTableBody.tsx',
  '/src/views/admin/InventoryTableBody.tsx',
  '/src/views/admin/MovementsTableBody.tsx',
  '/src/views/admin/OrdersTableBody.tsx',
  '/src/views/admin/PricingRulesTableBody.tsx',
  '/src/views/admin/ProductsTableBody.tsx',
  '/src/views/admin/ReturnsTableBody.tsx',
  '/src/views/admin/WebhookEventsTableBody.tsx',
]

/** Kapı, kendi gerekçe metnini ihlal sanmasın. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

const INLINE_KACIS = /\.replace\(\s*\/"\/g\s*,\s*'""'\s*\)/
const CSV_BLOB = /new Blob\(/
const CSV_TIPI = /text\/csv/

function csvIhlaliVarMi(kaynak: string): boolean {
  const kod = stripComments(kaynak)
  if (INLINE_KACIS.test(kod)) return true
  return CSV_BLOB.test(kod) && CSV_TIPI.test(kod) && !/csvHucre|csvSatir/.test(kod)
}

const KAPSAMLI = Object.entries(ALL).filter(
  ([yol]) => KAPSAM.some((k) => yol.startsWith(k)) && !yol.includes('/__tests__/'),
)
const IHLALCILER = KAPSAMLI.filter(([, kaynak]) => csvIhlaliVarMi(kaynak)).map(([yol]) => yol)

describe('INV-ADMIN-CSV-1 · yönetici CSV dışa aktarımı csvHucre kapısından çıkar', () => {
  it('kapsam ölçümü: tarama kör değil (yardımcı var, kapsanan dosya sayısı makul)', () => {
    expect(Object.keys(ALL)).toContain(YARDIMCI)
    expect(KAPSAMLI.length).toBeGreaterThan(50)
  })

  it('YENİ ihlal yok: listede olmayan hiçbir yüzey satır içi kaçış ya da yardımcısız CSV Blob kullanmaz', () => {
    const yeni = IHLALCILER.filter((yol) => !BEKLEYEN_GOC.includes(yol))
    expect(
      yeni,
      `Bu dosyalar CSV'yi csvHucre/csvSatir olmadan üretiyor (formül enjeksiyonu, VULN-006): ${yeni.join(', ')}`,
    ).toEqual([])
  })

  it('TABAN BAYATLAYAMAZ: listedeki her dosya hâlâ ihlal ediyor (göç edilen listeden çıkarılır)', () => {
    const bayat = BEKLEYEN_GOC.filter((yol) => !IHLALCILER.includes(yol))
    expect(
      bayat,
      `Bu dosyalar artık ihlal etmiyor ama BEKLEYEN_GOC'ta duruyor — listeden çıkar: ${bayat.join(', ')}`,
    ).toEqual([])
  })

  it('kural A ve B kendi örneklerinde ayırt eder (kapı kör değil)', () => {
    expect(csvIhlaliVarMi(`const s = v.replace(/"/g, '""')`)).toBe(true)
    expect(csvIhlaliVarMi(`const b = new Blob([x], { type: 'text/csv' })`)).toBe(true)
    expect(csvIhlaliVarMi(`import { csvSatir } from '@/utils/csvHucre'\nconst b = new Blob([csvSatir(a)], { type: 'text/csv' })`)).toBe(false)
    expect(csvIhlaliVarMi(`// v.replace(/"/g, '""') yorumda\nconst x = 1`)).toBe(false)
  })
})

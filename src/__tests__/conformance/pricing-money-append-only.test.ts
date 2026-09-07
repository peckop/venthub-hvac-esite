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

  /**
   * ⭐EVREN MUHAFIZI (REC-189, kaynak REC-179 evren muhafızı sınavı).
   *
   * Eski hâli `entries.length > 0` idi ve OPS'un sabotaj sınavında bu kapı **fail-open**
   * çıktı: glob kökü daraltıldığında (tek dosyaya inecek şekilde) eşik hâlâ sağlanıyor ve
   * aşağıdaki üç kol bir avuç dosya üzerinde dönüp "ihlal yok" diyor. `> 0`, "bakabiliyorum"
   * demek DEĞİLDİR; "en az bir dosya gördüm" demektir ve o ikisi aynı şey değil.
   *
   * ÖLÇÜLEN (2026-09-07): 234 migration dosyası. Eşik bir kademe altına konuldu —
   * meşru budama (eski migration'ların arşive taşınması) kapıyı kızartmasın, ama kökün
   * kayması yakalanıyor.
   */
  it('EVREN MUHAFIZI: migration havuzu GERÇEKTEN tarandı (dar evren KIRMIZI)', () => {
    expect(
      entries.length,
      'Migration havuzu şüpheli derecede küçük (ölçülen: 2026-09-07 → 234 dosya). ' +
        'Glob kökü kaymış olabilir; `> 0` eşiği bu kapıyı sabotaj sınavında fail-open ' +
        'bırakmıştı. Kapı KÖR koşmaktansa KIRMIZI döner.',
    ).toBeGreaterThan(150)
  })

  /**
   * ⭐İKİNCİ MUHAFIZ — VE ASIL DELİK: yukarıdaki dosya sayımı, DDL AYIKLAYICISININ çalıştığını
   * söylemez. `ddlSlices` hiçbir dilim bulamazsa (tablo yeniden adlandırıldı, DDL biçimi
   * değişti, `create table` ifadesi bir `DO $$` bloğuna taşındı) float kolu HİÇBİR ŞEY
   * üzerinde dönmez ve yeşil yanar. Dosya havuzu doluyken bile kapı vakumda olabilir.
   *
   * ÖLÇÜLEN (2026-09-07): dört para tablosunun dördünde de en az bir DDL dilimi var
   * (`pricing_rule` 1 · `currency_rates` 1 · `product_prices` 3 · `price_lists` 2).
   * Bir tablo için dilim sıfıra düşerse o tablo için float yasağı ölçülmüyor demektir.
   */
  it('EVREN MUHAFIZI: her para tablosu için DDL dilimi BULUNUYOR (ayıklayıcı kör değil)', () => {
    const dilimsiz: string[] = []
    for (const table of MONEY_TABLES) {
      let adet = 0
      for (const [, source] of entries) adet += ddlSlices(source, table).length
      if (adet === 0) dilimsiz.push(table)
    }
    expect(
      dilimsiz,
      'Bu para tablolarının DDL dilimi BULUNAMADI: ' + dilimsiz.join(', ') + '. ' +
        'Float yasağı o tablolar için ÖLÇÜLMÜYOR — kol vakumda yeşil yanar. Tablo yeniden ' +
        'adlandırıldıysa MONEY_TABLES listesini güncelle; DDL biçimi değiştiyse ayıklayıcıyı. ' +
        'Kolu gevşetmek, kuralı sessizce kaldırmaktır.',
    ).toEqual([])
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

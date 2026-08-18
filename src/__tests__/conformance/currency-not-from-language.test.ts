import { describe, expect, it } from 'vitest'

import { SYSTEM_CURRENCY } from '../../i18n/currency'
import { formatCurrency } from '../../i18n/format'

/**
 * INV-CURRENCY-1 · Para birimi DİLDEN türetilemez.
 *
 * PLAN: T094-VH · SABİT: `src/i18n/currency.ts` · BİÇİMLENDİRİCİ: `src/i18n/format.ts`
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * YAŞANMIŞ KUSUR (Recep'in ekranında, 2026-08-18)
 * ─────────────────────────────────────────────────────────────────────────────
 * **6.240 TRY**'lik bir sipariş, EN arayüzde **$6,240** göründü. `formatCurrency`
 * dil `en` ise para birimini `USD` varsayıyordu. Dil kullanıcının OKUMA TERCİHİDİR;
 * paranın birimi ise VERİNİN OLGUSUDUR. İkisini bağlamak, müşteriye yanlış fiyat
 * göstermenin en kısa yoludur — ve tam da müşteri yüzeylerinde yaşandı
 * (sepet başlığı, hesap özeti, sipariş detayı, gönderiler).
 *
 * ÜÇ DAL BİRDEN dilden türetiyordu; biri düzeltilip ötekiler bırakılsaydı kusur
 * yaşamaya devam ederdi:
 *   1. `isNaN` dalı  → `lang === 'tr' ? '0 ₺' : '$0'`
 *   2. fallback      → `options.currency || (lang === 'en' ? 'USD' : 'TRY')`
 *   3. `catch` dalı  → `symbol = lang === 'en' ? '$' : '₺'`
 *
 * ÖLÇÜM (prod, 2026-08-18): sistem bugün TEK PARA BİRİMLİ — `product_prices` 1044
 * satır TRY, `venthub_order_items.display_currency` 3 satır TRY,
 * `payment_transactions` boş. Yani `USD` tamamen arayüzün UYDURMASIYDI.
 *
 * ⚠️ `venthub_orders`'ta `currency` kolonu YOK; sipariş yüzeyleri satır-başına birim
 * taşıyamıyor ve `SYSTEM_CURRENCY` yazıyor. Kolon eklemek migration = Recep kararı;
 * T094 kapsamına BİLEREK alınmadı, ayrı karar olarak kayıtlı.
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

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
}

function toRel(globKey: string): string {
  const i = globKey.indexOf('/src/')
  return (i >= 0 ? globKey.slice(i + 1) : globKey).replace(/\\/g, '/')
}

/** `formatCurrency(` çağrısının argüman metnini dengeli parantezle çıkarır. */
function callArgs(code: string): Array<{ index: number; args: string }> {
  const out: Array<{ index: number; args: string }> = []
  const re = /\bformatCurrency\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    let depth = 1
    let j = m.index + m[0].length
    const start = j
    while (j < code.length && depth > 0) {
      if (code[j] === '(') depth += 1
      else if (code[j] === ')') depth -= 1
      j += 1
    }
    out.push({ index: m.index, args: code.slice(start, j - 1) })
  }
  return out
}

describe('INV-CURRENCY-1 · para birimi dilden türetilemez', () => {
  it('ölçüm aracı gerçekten çalışıyor (vacuous-pass koruması)', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(300)
    const total = Object.values(SOURCES).reduce((n, s) => n + callArgs(stripComments(s)).length, 0)
    // Çağrılar bulunamıyorsa R2 boş kümede doğrulanır ve kapı sessizce yeşil kalır.
    expect(total, 'hiç formatCurrency çağrısı bulunamadı — tarayıcı bozuk').toBeGreaterThan(30)
  })

  /**
   * R1 · EN GÜÇLÜ ASSERT: DAVRANIŞ. Statik tarama deseni kaçırabilir; bu çalıştırır.
   * Aynı tutar + aynı birim, iki dilde: BİÇİM değişebilir, BİRİM değişemez.
   */
  it('R1 · aynı birim iki dilde de aynı parayı gösterir (yalnız biçim değişir)', () => {
    const tr = formatCurrency(6240, 'tr', { currency: 'TRY' })
    const en = formatCurrency(6240, 'en', { currency: 'TRY' })

    // Yaşanan kusurun birebir testi: EN'de dolar işareti ÇIKMAMALI.
    expect(en, `EN arayüzde TRY tutarı dolar gösterdi: ${en}`).not.toContain('$')
    expect(en).toContain('6,240')
    expect(tr).toContain('6.240')
    // İkisi de aynı birimi taşımalı (₺ simgesi ya da TRY kodu).
    expect(/[₺]|TRY/.test(tr) && /[₺]|TRY/.test(en), `tr=${tr} en=${en}`).toBe(true)
  })

  it('R1b · USD verilirse iki dilde de USD gösterir (birim veriden gelir)', () => {
    const tr = formatCurrency(100, 'tr', { currency: 'USD' })
    const en = formatCurrency(100, 'en', { currency: 'USD' })
    expect(/\$|USD/.test(tr), `tr=${tr}`).toBe(true)
    expect(/\$|USD/.test(en), `en=${en}`).toBe(true)
  })

  it('R1c · geçersiz sayı da doğru BİRİMDE gösterilir (eski kod $0 basıyordu)', () => {
    const en = formatCurrency('abc', 'en', { currency: 'TRY' })
    expect(en, `geçersiz sayı EN'de dolar bastı: ${en}`).not.toContain('$')
  })

  /** R2 · her çağrı `currency` vermeli — tip zorluyor, kapı da kayda geçiriyor. */
  it('R2 · currency vermeyen formatCurrency çağrısı yok', () => {
    const offenders: string[] = []
    for (const [key, raw] of Object.entries(SOURCES)) {
      const rel = toRel(key)
      if (rel.includes('__tests__') || rel.includes('.test.')) continue
      if (rel.endsWith('src/i18n/format.ts')) continue // tanımın kendisi
      for (const { args } of callArgs(stripComments(raw))) {
        if (!/\bcurrency\b/.test(args)) offenders.push(`${rel}  →  formatCurrency(${args.trim().slice(0, 60)})`)
      }
    }
    expect(
      offenders,
      '\n  `currency` verilmeyen çağrı(lar):\n' +
        offenders.map((o) => `    ${o}`).join('\n') +
        '\n  Satırın kendi para birimini geçir; yoksa SYSTEM_CURRENCY yaz (adı konmuş varsayım).\n',
    ).toEqual([])
  })

  /** R3 · biçimlendiricinin gövdesinde dil→birim eşlemesi kalmasın. */
  it('R3 · format.ts dilden para birimi/simge türetmiyor', () => {
    const entry = Object.entries(SOURCES).find(([k]) => k.endsWith('/i18n/format.ts'))
    expect(entry, 'src/i18n/format.ts bulunamadı').toBeDefined()
    const code = stripComments(entry![1])

    // `lang` ile aynı ifadede para birimi kodu ya da simgesi geçmemeli.
    const derivations = [
      /lang[^\n]*['"]USD['"]/,
      /lang[^\n]*['"]TRY['"]/,
      /lang[^\n]*['"]\$['"]/,
      /lang[^\n]*['"]₺['"]/,
    ]
    const hits = derivations.filter((re) => re.test(code)).map((re) => re.source)
    expect(
      hits,
      '\n  format.ts para birimini/simgesini DİLDEN türetiyor:\n' +
        hits.map((h) => `    ${h}`).join('\n') +
        '\n  Dil yalnız BİÇİM içindir (ayraç/ondalık/simge yerleşimi). Birim veriden gelir.\n',
    ).toEqual([])
  })

  /** R4 · varsayım tek yerde yaşasın; başka dosyada ikinci bir "varsayılan" doğmasın. */
  it('R4 · SYSTEM_CURRENCY tek kaynakta tanımlı ve TRY', () => {
    expect(SYSTEM_CURRENCY).toBe('TRY')

    const definers = Object.entries(SOURCES)
      .filter(([, raw]) => /export\s+const\s+SYSTEM_CURRENCY\b/.test(stripComments(raw)))
      .map(([k]) => toRel(k))

    expect(
      definers,
      `SYSTEM_CURRENCY birden fazla yerde tanımlı: ${definers.join(', ')}`,
    ).toHaveLength(1)
    expect(definers[0]).toMatch(/i18n\/currency\.ts$/)
  })
})

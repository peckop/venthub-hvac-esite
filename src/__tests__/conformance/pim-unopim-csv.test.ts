/**
 * INV-PIM-UNOPIM-1 (REC-357 §3.2): gölge → UnoPim CSV üreticisinin ölçülmüş tuzakları geri gelmesin.
 * Her kol 2026-09-22'de gerçek UnoPim 3.1.1'de ölçülen bir reddi kilitler.
 */
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { csvUret, urunFarklari, OZNITELIKLER } = require('../../../scripts/pim/unopim.cjs') as {
  csvUret: (u: unknown[]) => { csv: string; eksik: string[]; sutun: number }
  urunFarklari: (u: unknown, api: unknown) => string[]
  OZNITELIKLER: [string, string, string, string?, string?, string?][]
}

const ornek = {
  sku: 'VRT-1',
  name: 'Vortice "Test"',
  slug: 'vortice-test',
  specs: Object.fromEntries(
    OZNITELIKLER.map(([k, tip]) => [k, tip === 'boolean' ? true : tip === 'measurement' ? 12.5 : k === 'pq_curve' ? '[[0, 1], [2, 0]]' : 'x']),
  ),
}

describe('INV-PIM-UNOPIM-1 CSV biçimi', () => {
  const { csv, eksik, sutun } = csvUret([ornek])
  const [bas, satir] = csv.trim().split('\n')
  const sutunlar = bas.split(',')

  it('ölçülü öznitelik <kod> + <kod>(unit) — _value/_unit YOK (UnoPim 12/12 reddetti)', () => {
    expect(sutunlar).toContain('weight_kg')
    expect(sutunlar).toContain('weight_kg(unit)')
    expect(sutunlar.some((s) => s.endsWith('_value') || s.endsWith('_unit'))).toBe(false)
  })

  it('parent ve variant_structure sütunları boş da olsa VAR (yoksa "Required columns not found")', () => {
    expect(sutunlar).toContain('parent')
    expect(sutunlar).toContain('variant_structure')
  })

  it('23 öznitelik, 13 ölçülü → 10 sabit + 36 sütun', () => {
    expect(OZNITELIKLER).toHaveLength(23)
    expect(OZNITELIKLER.filter(([, t]) => t === 'measurement')).toHaveLength(13)
    expect(sutun).toBe(46)
    expect(eksik).toEqual([])
  })

  it('virgül ve tırnak içeren hücre kaçırılır (pq_curve, ad)', () => {
    expect(satir).toContain('"[[0, 1], [2, 0]]"')
    expect(satir).toContain('"Vortice ""Test"""')
  })

  it('eksik anahtar sessiz geçmez — listelenir, birim hücresi boş kalır', () => {
    const { eksik: e, csv: c } = csvUret([{ ...ornek, specs: { ...ornek.specs, weight_kg: undefined } }])
    expect(e).toEqual(['VRT-1:weight_kg'])
    const s = c.trim().split('\n')
    const i = s[0].split(',').indexOf('weight_kg(unit)')
    expect(i).toBeGreaterThan(0)
  })
})

describe('INV-PIM-UNOPIM-1 geri okuma karşılaştırması', () => {
  const api = {
    values: {
      common: { url_key: 'vortice-test', weight_kg: { amount: '12.5000', unit: 'KILOGRAM' }, erp_compliant: 'true', motor_type: 'AC' },
      channel_locale_specific: { default: { en_US: { name: 'V' } } },
    },
  }
  it('eşit değerler fark vermez; 4 ondalık saklanan sayı sayısal karşılaştırılır', () => {
    expect(urunFarklari({ sku: 'A', name: 'V', slug: 'vortice-test', specs: { weight_kg: 12.5, erp_compliant: true, motor_type: 'AC' } }, api)).toEqual([])
  })
  it('farklı sayı, eksik öznitelik ve farklı ad yakalanır', () => {
    const f = urunFarklari({ sku: 'A', name: 'W', slug: 'vortice-test', specs: { weight_kg: 12.6, has_timer: false } }, api)
    expect(f).toHaveLength(3)
  })
})

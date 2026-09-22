/**
 * INV-PIM-UNOPIM-1 (REC-357 §3.2): gölge → UnoPim CSV üreticisinin ölçülmüş tuzakları geri gelmesin.
 * Her kol 2026-09-22'de gerçek UnoPim 3.1.1'de ölçülen bir reddi kilitler.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { csvUret, urunFarklari, OZNITELIKLER, TURETILMIS, specsCevir } = require('../../../scripts/pim/unopim.cjs') as {
  TURETILMIS: Record<string, (s: Record<string, unknown>) => number | undefined>
  specsCevir: (u: unknown) => { specs: Record<string, unknown>; bilinmeyen: string[] }
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

  it('22 öznitelik, 12 ölçülü → 10 sabit + 34 sütun (debi TEK alan: max_delivery_ls PIM\'de YOK)', () => {
    expect(OZNITELIKLER).toHaveLength(22)
    expect(OZNITELIKLER.filter(([, t]) => t === 'measurement')).toHaveLength(12)
    expect(OZNITELIKLER.some(([k]) => k === 'max_delivery_ls')).toBe(false)
    expect(sutunlar).not.toContain('max_delivery_ls')
    expect(sutun).toBe(44)
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
  it('türetilen l/s = round(m3h/3.6, 2) — kaynakla eşitse fark yok, değilse yakalanır (tam sayı 0/12 ölçüldü)', () => {
    expect(TURETILMIS.max_delivery_ls({ max_delivery_m3h: 380 })).toBe(105.56)
    expect(TURETILMIS.max_delivery_ls({ max_delivery_m3h: 2890 })).toBe(802.78)
    expect(TURETILMIS.max_delivery_ls({})).toBeUndefined()
    const a = { values: { common: { url_key: 's', max_delivery_m3h: { amount: '380.0000' } }, channel_locale_specific: { default: { en_US: { name: 'V' } } } } }
    expect(urunFarklari({ sku: 'A', name: 'V', slug: 's', specs: { max_delivery_m3h: 380, max_delivery_ls: 105.56 } }, a)).toEqual([])
    expect(urunFarklari({ sku: 'A', name: 'V', slug: 's', specs: { max_delivery_m3h: 380, max_delivery_ls: 106 } }, a)).toHaveLength(1)
  })
  it('farklı sayı, eksik öznitelik ve farklı ad yakalanır', () => {
    const f = urunFarklari({ sku: 'A', name: 'W', slug: 'vortice-test', specs: { weight_kg: 12.6, has_timer: false } }, api)
    expect(f).toHaveLength(3)
  })
})

describe('INV-PIM-UNOPIM-1 §3.3 köprü: UnoPim → technical_specs geri çevirisi ve yazma sınırı', () => {
  // Gerçek UnoPim 3.1.1 cevabının biçimi (2026-09-22, GET products/VRT-17160).
  const apiUrun = {
    values: {
      common: {
        sku: 'VRT-17160', url_key: 'x',
        weight_kg: { unit: 'KILOGRAM', amount: '3.8000' },
        max_delivery_m3h: { unit: 'CUBIC_METER_PER_HOUR', amount: '260.0000' },
        erp_compliant: 'true', has_timer: 'false',
        motor_poles: '2', ip_rating: 'IP44', pq_curve: '[[0, 147.1], [260, 0]]',
        max_delivery_ls: { unit: 'LITER_PER_SECOND', amount: '72.2200' }, // silinmiş öznitelik — UnoPim değeri TUTUYOR (ölçüldü)
      },
    },
  }
  const { specs, bilinmeyen } = specsCevir(apiUrun)

  it('ölçülü → sayı, evet/hayır → boolean, sayı doğrulamalı metin → sayı, düz metin → metin', () => {
    expect(specs.weight_kg).toBe(3.8)
    expect(specs.erp_compliant).toBe(true)
    expect(specs.has_timer).toBe(false)
    expect(specs.motor_poles).toBe(2)
    expect(specs.ip_rating).toBe('IP44')
    expect(specs.pq_curve).toBe('[[0, 147.1], [260, 0]]')
    expect(specs.sku).toBeUndefined()
  })

  it('türetilen l/s PIM\'deki eski değerden DEĞİL m³/h\'ten gelir; tanımsız öznitelik raporlanır', () => {
    expect(specs.max_delivery_ls).toBe(72.22)
    expect(bilinmeyen).toEqual(['max_delivery_ls'])
  })

  it('anahtarlar sıralı (jsonb eşitliği için kararlı çıktı)', () => {
    expect(Object.keys(specs)).toEqual([...Object.keys(specs)].sort())
  })

  it('⛔köprü YALNIZ pim_golge\'ye yazar — hedef sabit, ortamdan değiştirilemez', () => {
    const kaynak = fs.readFileSync(path.resolve(__dirname, '../../../scripts/pim/unopim-kopru.cjs'), 'utf8')
    expect(kaynak).toMatch(/const HEDEF_DB = 'pim_golge'/)
    expect(kaynak).not.toMatch(/HEDEF_DB\s*=\s*process\.env/)
    expect(kaynak).not.toMatch(/arama_golge'\s*[,)]/) // arama_golge'ye bağlantı argümanı yok (yalnız yorumlarda anılır)
    expect(kaynak).not.toMatch(/SUPABASE_DB_URL|supabase\.co/)
    expect(kaynak).toMatch(/current_database\(\)/) // koşumda hedef adı doğrulanır
  })
})

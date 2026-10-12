/**
 * INV-PIM-TAM-1 (REC-357 §1): tam yüklemenin öznitelik türetme kuralı. Öznitelik listesi elle değil
 * VERİDEN türetilir (anahtar soneki → birim, JSON tipi → öznitelik tipi); bu kapı o kuralı kilitler.
 * Canlı ölçüm 2026-09-23: 77 anahtar → 76 öznitelik (max_delivery_ls türetilir, PIM'e girmez), 47 aile.
 */
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
type Satir = [string, string, string, (string | null)?, (string | null)?, string?]
const { oznitelikTuret, semaCikar, aileKodu } = require('../../../scripts/pim/unopim-tam.cjs') as {
  oznitelikTuret: (kod: string, tip: string, uzunluk?: number) => Satir
  semaCikar: (u: unknown[]) => { oznitelikler: Satir[]; aileler: Map<string, { kodlar: Set<string>; urunler: unknown[] }> }
  aileKodu: (s: string) => string
}

describe('INV-PIM-TAM-1 öznitelik türetme', () => {
  it('sonek birimi taahhüt eder — en uzun sonek önce (_db_a, _m3h)', () => {
    expect(oznitelikTuret('noise_lpa_3m_db', 'number').slice(1, 5)).toEqual(['measurement', 'Noise lpa 3m db', 'Decibel', 'DECIBEL'])
    expect(oznitelikTuret('nominal_delivery_m3h', 'number')[4]).toBe('CUBIC_METER_PER_HOUR')
    expect(oznitelikTuret('heating_capacity_kw', 'number')[4]).toBe('KILOWATT')
    expect(oznitelikTuret('rated_power_w', 'number')[4]).toBe('WATT')
    expect(oznitelikTuret('max_ambient_temp_c', 'number')[4]).toBe('CELSIUS')
    expect(oznitelikTuret('airflow_speed_max_ms', 'number')[4]).toBe('METER_PER_SECOND')
    expect(oznitelikTuret('tank_capacity_l', 'number')[4]).toBe('LITER')
  })

  it('birimi olmayan sayı ölçü DEĞİL, sayı doğrulamalı metin (humidity_removed_l_24h, phase)', () => {
    expect(oznitelikTuret('humidity_removed_l_24h', 'number')).toEqual(['humidity_removed_l_24h', 'text', 'Humidity removed l 24h', null, null, 'number'])
    expect(oznitelikTuret('number_of_blades', 'number')[5]).toBe('number')
  })

  it('pilotun elle yazdığı satır önceliklidir; eğri metni textarea', () => {
    expect(oznitelikTuret('max_delivery_m3h', 'number')[2]).toBe('Max delivery (m³/h)')
    expect(oznitelikTuret('thermal_efficiency_curve', 'string')[1]).toBe('textarea')
    expect(oznitelikTuret('ip_rating', 'string')[1]).toBe('text')
    expect(oznitelikTuret('has_bypass', 'boolean')[1]).toBe('boolean')
  })

  it('aile kodunda tire kalmaz (UnoPim 422), türetilen alan PIM evrenine girmez, karışık tip DURDURUR', () => {
    expect(aileKodu('avens-enkelfan-ec-plug')).toBe('avens_enkelfan_ec_plug')
    const { oznitelikler, aileler } = semaCikar([
      { sku: 'A-1', aile: 'x-y', specs: { max_delivery_m3h: 100, max_delivery_ls: 27.78, ip_rating: 'IP44' } },
      { sku: 'A-2', aile: 'x-y', specs: {} },
    ])
    expect(oznitelikler.map(([k]) => k)).toEqual(['ip_rating', 'max_delivery_m3h'])
    expect([...aileler.keys()]).toEqual(['x_y'])
    expect(() => semaCikar([
      { sku: 'B-1', aile: 'z', specs: { phase: 1 } },
      { sku: 'B-2', aile: 'z', specs: { phase: '1' } },
    ])).toThrow(/karışık tip/)
  })

  it('desteklenmeyen tip sessizce geçmez', () => {
    expect(() => oznitelikTuret('garip', 'object')).toThrow(/desteklenmeyen/)
  })
})

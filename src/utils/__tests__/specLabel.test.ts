import { describe, expect, it } from 'vitest'

import { humanizeSpecKey, specFieldLabel, specGroupLabel } from '../specLabel'

/**
 * F5-B W2.2 — Ham anahtar yolu ("PDP.SPECS.MAX_DELIVERY_M3H") prod'da ekrana
 * basılmıştı. Bu test o regresyonu kilitler: etiket zinciri hiçbir koşulda
 * nokta içeren sözlük yolunu döndürmez.
 */

/** Sözlükte OLMAYAN anahtarda anahtarın kendisini döndüren gerçek t() davranışı. */
const tMissing = (key: string) => key

/** Sözlükte olan birkaç anahtarı çözen sahte t(). */
const dict: Record<string, string> = {
  'pdp.specs.voltage_v': 'Voltaj',
  'pdp.specGroups.performance': 'Performans',
}
const tDict = (key: string) => dict[key] ?? key

describe('humanizeSpecKey', () => {
  it('bilinen birim son-ekini parantezli birime çevirir', () => {
    expect(humanizeSpecKey('max_delivery_m3h')).toBe('Max Delivery (m³/h)')
    expect(humanizeSpecKey('sound_level_db')).toBe('Sound Level (dB)')
    expect(humanizeSpecKey('motor_power_kw')).toBe('Motor Power (kW)')
    expect(humanizeSpecKey('input_voltage_v')).toBe('Input Voltage (V)')
    expect(humanizeSpecKey('net_weight_kg')).toBe('Net Weight (kg)')
    expect(humanizeSpecKey('duct_size_mm')).toBe('Duct Size (mm)')
    expect(humanizeSpecKey('fan_speed_rpm')).toBe('Fan Speed (rpm)')
  })

  it('birim eşleşmeyen son-eki normal kelime olarak bırakır', () => {
    expect(humanizeSpecKey('number_of_speeds')).toBe('Number Of Speeds')
    expect(humanizeSpecKey('filter_class')).toBe('Filter Class')
  })

  it('tek kelimelik anahtarı birim sanmaz', () => {
    expect(humanizeSpecKey('w')).toBe('W')
  })
})

describe('specFieldLabel', () => {
  it('sözlükte varsa sözlük değerini kullanır', () => {
    expect(specFieldLabel('voltage_v', tDict)).toBe('Voltaj')
  })

  it('sözlükte yoksa küratörlü TR etikete düşer', () => {
    expect(specFieldLabel('voltage_v', tMissing)).toBe('Voltaj')
    expect(specFieldLabel('number_of_speeds', tMissing)).toBe('Hız Kademesi Sayısı')
  })

  it('hiçbir eşleşme yoksa insancıl etikete düşer — ham yol dönmez', () => {
    const label = specFieldLabel('max_delivery_m3h', tMissing)
    expect(label).toBe('Max Delivery (m³/h)')
    expect(label).not.toContain('pdp.specs')
    expect(label).not.toContain('.')
  })

  it('bilinmeyen hiçbir anahtarda nokta-yolu döndürmez', () => {
    for (const key of ['foo_bar_baz', 'unknown_custom_spec', 'x', 'a_b_kw']) {
      expect(specFieldLabel(key, tMissing)).not.toMatch(/pdp\.specs\./)
    }
  })
})

describe('specGroupLabel', () => {
  it('sözlükte varsa sözlük değerini kullanır', () => {
    expect(specGroupLabel('performance', tDict, 'Performans Ölçüleri')).toBe('Performans')
  })

  it('sözlükte yoksa gruplayıcı etiketine düşer', () => {
    expect(specGroupLabel('performance', tMissing, 'Performans Ölçüleri')).toBe('Performans Ölçüleri')
  })

  it('gruplayıcı etiketi de yoksa insancıl etikete düşer — ham yol dönmez', () => {
    const label = specGroupLabel('heat_recovery', tMissing)
    expect(label).toBe('Heat Recovery')
    expect(label).not.toMatch(/pdp\.specGroups\./)
  })
})

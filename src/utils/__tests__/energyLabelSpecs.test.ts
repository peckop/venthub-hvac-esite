import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { buildSpecRows } from '../../lib/pdfGenerator'
import { formatSpecValue, groupTechnicalSpecs, isEnergyLabelSpecKey } from '../productHelpers'
import { humanizeSpecKey, specFieldLabel, specGroupLabel, specValueLabel } from '../specLabel'

/**
 * REC-392 — konut tipi havalandırma ünitelerinin enerji etiketi / ürün bilgi formu alanları
 * (AB 1254/2014 Ek IV, TR SGM-2021/19 Ek-IV). KATALOG bu 20 anahtarı `technical_specs`'e
 * canlıda YAZMADAN ÖNCE vitrin hazır olmalı: aksi hâlde TR sayfada humanize yedeği
 * "Erp Sec Class Average" basar — bozuk görünmez, ama yasal beyan İngilizce/anlamsız olur.
 *
 * Anahtar listesi SSOT: docs/standards/product-schema-standard.md "Enerji etiketi ve ürün
 * bilgi föyü" (KATALOG). Liste burada ADIYLA durur: cetvele anahtar eklenirse bu test onu
 * görmez, `FOY_ANAHTARLARI.length` iddiası diff'te sayıyı değiştirmeyi zorlar.
 */
const FOY_ANAHTARLARI = [
  'erp_sec_class_average',
  'erp_sec_average_kwh_m2a',
  'erp_sec_cold_kwh_m2a',
  'erp_sec_warm_kwh_m2a',
  'erp_ventilation_unit_type',
  'erp_drive_type',
  'erp_heat_recovery_type',
  'erp_thermal_efficiency_pct',
  'erp_max_delivery_m3h',
  'erp_power_at_max_delivery_w',
  'erp_noise_lwa_db',
  'erp_reference_delivery_m3s',
  'erp_reference_pressure_pa',
  'erp_spi_w_m3h',
  'erp_control_factor',
  'erp_leakage_internal_pct',
  'erp_leakage_external_pct',
  'erp_aec_kwh',
  'erp_ahs_average_kwh',
  'erp_eprel_registration',
] as const

/** Uygulamanın `t()`'si gibi nokta-yol çözer; bulamazsa yolu döndürür (gerçek davranış). */
function tFor(dict: unknown) {
  return (path: string): string => {
    let cur: unknown = dict
    for (const p of path.split('.')) {
      if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[p]
      } else {
        return path
      }
    }
    return typeof cur === 'string' ? cur : path
  }
}

const tTr = tFor(tr)
const tEn = tFor(en)

describe('REC-392 · föy alanı etiketleri iki dilde sözlükten çözülür', () => {
  it('20 anahtar, hepsi erp_ önekli (kapsam kanaryası)', () => {
    expect(FOY_ANAHTARLARI.length).toBe(20)
    expect(new Set(FOY_ANAHTARLARI).size).toBe(20)
    for (const k of FOY_ANAHTARLARI) expect(k.startsWith('erp_')).toBe(true)
  })

  it('TR ve EN etiketi sözlük değeridir; ham yol, humanize yedeği ya da anahtarın kendisi DEĞİL', () => {
    const hatalar: string[] = []
    for (const [dil, t] of [['tr', tTr], ['en', tEn]] as const) {
      for (const key of FOY_ANAHTARLARI) {
        const sozluk = t(`pdp.specs.${key}`)
        const etiket = specFieldLabel(key, t)
        if (sozluk === `pdp.specs.${key}`) hatalar.push(`${dil}/${key}: sözlükte yok`)
        else if (etiket !== sozluk) hatalar.push(`${dil}/${key}: '${etiket}' != sözlük '${sozluk}'`)
        if (etiket === humanizeSpecKey(key)) hatalar.push(`${dil}/${key}: humanize yedeğine düştü ('${etiket}')`)
        if (/^erp\b/i.test(etiket)) hatalar.push(`${dil}/${key}: insancıl-İngilizce ('${etiket}')`)
        if (etiket.includes('pdp.') || etiket === key) hatalar.push(`${dil}/${key}: ham ('${etiket}')`)
      }
    }
    expect(hatalar).toEqual([])
  })

  it('TR etiketi EN kopyası değil (her anahtarda iki dil ayrı)', () => {
    const ayni = FOY_ANAHTARLARI.filter((k) => specFieldLabel(k, tTr) === specFieldLabel(k, tEn))
    expect(ayni).toEqual([])
  })

  it('yönetmelik terimleri: TR SGM-2021/19 Ek-IV, EN 1254/2014 Annex IV', () => {
    expect(specFieldLabel('erp_sec_average_kwh_m2a', tTr)).toBe('Özgül Enerji Tüketimi (SEC), Ortalama İklim')
    expect(specFieldLabel('erp_sec_class_average', tTr)).toBe('SEC Sınıfı (Ortalama İklim)')
    expect(specFieldLabel('erp_noise_lwa_db', tTr)).toBe('Ses Gücü Seviyesi (LWA)')
    expect(specFieldLabel('erp_eprel_registration', tTr)).toBe('EPREL Kayıt Numarası')
    expect(specFieldLabel('erp_sec_average_kwh_m2a', tEn)).toBe('Specific Energy Consumption (SEC), Average Climate')
    expect(specFieldLabel('erp_noise_lwa_db', tEn)).toBe('Sound Power Level (LWA)')
    expect(specFieldLabel('erp_ahs_average_kwh', tEn)).toBe('Annual Heating Saved (AHS), Average Climate')
  })

  it('föy değeri, aynı üründeki katalog değerinden etiketiyle AYIRT edilir (föy PDF grup başlığı basmaz)', () => {
    for (const t of [tTr, tEn]) {
      expect(specFieldLabel('erp_max_delivery_m3h', t)).not.toBe(specFieldLabel('max_delivery_m3h', t))
      expect(specFieldLabel('erp_thermal_efficiency_pct', t)).not.toBe(specFieldLabel('thermal_efficiency_pct', t))
    }
    expect(specFieldLabel('erp_max_delivery_m3h', tTr)).toContain('Ürün Bilgi Formu')
    expect(specFieldLabel('erp_thermal_efficiency_pct', tTr)).toContain('Ürün Bilgi Formu')
    expect(specFieldLabel('erp_max_delivery_m3h', tEn)).toContain('Product Fiche')
    expect(specFieldLabel('erp_thermal_efficiency_pct', tEn)).toContain('Product Fiche')
  })
})

describe('REC-392 · föy alanları AYRI grupta, erp_compliant yerinde kalır', () => {
  // VORT HRW 30 MONO EVO örneği (cetvel): katalog 38 m³/h · %90, föy 35 m³/h · %89.
  const urun: Record<string, unknown> = {
    max_delivery_m3h: 38,
    thermal_efficiency_pct: 90,
    max_absorbed_power_w: 12,
    weight_kg: 4,
    erp_compliant: true,
    erp_sec_class_average: 'A+',
    erp_sec_average_kwh_m2a: -44.5,
    erp_max_delivery_m3h: 35,
    erp_thermal_efficiency_pct: 89,
    erp_power_at_max_delivery_w: 11,
    erp_reference_pressure_pa: 50,
    erp_noise_lwa_db: 34,
  }

  it('erp_ föy anahtarları energyLabel grubunda; alt dize kuralı onları performans/elektriğe DAĞITMAZ', () => {
    const g = groupTechnicalSpecs(urun)!
    expect(Object.keys(g.energyLabel.specs).sort()).toEqual([
      'erp_max_delivery_m3h',
      'erp_noise_lwa_db',
      'erp_power_at_max_delivery_w',
      'erp_reference_pressure_pa',
      'erp_sec_average_kwh_m2a',
      'erp_sec_class_average',
      'erp_thermal_efficiency_pct',
    ])
    expect(Object.keys(g.performance.specs)).toEqual(['max_delivery_m3h'])
    expect(Object.keys(g.electrical.specs)).toEqual(['max_absorbed_power_w'])
  })

  it('20 föy anahtarının HEPSİ föy olarak tanınır', () => {
    expect(FOY_ANAHTARLARI.filter((k) => !isEnergyLabelSpecKey(k))).toEqual([])
    const tumu = Object.fromEntries(FOY_ANAHTARLARI.map((k) => [k, 1]))
    expect(Object.keys(groupTechnicalSpecs(tumu)!.energyLabel.specs)).toHaveLength(20)
  })

  it('erp_compliant föy alanı DEĞİL: bugünkü grubunda (other) kalır', () => {
    expect(isEnergyLabelSpecKey('erp_compliant')).toBe(false)
    const g = groupTechnicalSpecs(urun)!
    expect(g.other.specs).toEqual({ erp_compliant: true, thermal_efficiency_pct: 90 })
    expect(g.energyLabel.specs).not.toHaveProperty('erp_compliant')
  })

  it('föy verisi olmayan üründe grup HİÇ üretilmez; grup kümesi ve sırası REC-392 öncesiyle aynı', () => {
    const g = groupTechnicalSpecs({ erp_compliant: true, max_delivery_m3h: 300 })!
    expect(Object.keys(g)).toEqual(['performance', 'physical', 'electrical', 'other'])
    expect(g.other.specs).toEqual({ erp_compliant: true })
  })

  it('föy verisi varsa grup İLK sırada (yasal beyan bloğu)', () => {
    expect(Object.keys(groupTechnicalSpecs(urun)!)).toEqual(['energyLabel', 'performance', 'physical', 'electrical', 'other'])
  })

  it('grup başlığı iki dilde sözlükten gelir (gruplayıcının hardcoded Türkçesi değil)', () => {
    expect(specGroupLabel('energyLabel', tTr, 'HARDCODED')).toBe('Enerji Etiketi / Ürün Bilgi Formu')
    expect(specGroupLabel('energyLabel', tEn, 'HARDCODED')).toBe('Energy Label / Product Fiche')
  })
})

describe('REC-392 · föy birimleri', () => {
  /** [anahtar, değer, beklenen] */
  const ALTIN: ReadonlyArray<readonly [string, unknown, string]> = [
    ['erp_sec_average_kwh_m2a', -44.5, '-44.5 kWh/(m²·a)'],
    ['erp_sec_cold_kwh_m2a', -86.2, '-86.2 kWh/(m²·a)'],
    ['erp_sec_warm_kwh_m2a', -18.1, '-18.1 kWh/(m²·a)'],
    ['erp_aec_kwh', 1.2, '1.2 kWh'],
    ['erp_ahs_average_kwh', 47.4, '47.4 kWh'],
    ['erp_reference_delivery_m3s', 0.007, '0.007 m³/s'],
    ['erp_spi_w_m3h', 0.28, '0.28 W/(m³/h)'],
    ['erp_max_delivery_m3h', 35, '35 m³/h'],
    ['erp_noise_lwa_db', 34, '34 dB(A)'],
    ['erp_thermal_efficiency_pct', 89, '89 %'],
    ['erp_leakage_internal_pct', 1.5, '1.5 %'],
    ['erp_leakage_external_pct', 2, '2 %'],
    ['erp_power_at_max_delivery_w', 11, '11 W'],
    ['erp_reference_pressure_pa', 50, '50 Pa'],
    // Birimsizler: sayıya birim UYDURULMAZ.
    ['erp_control_factor', 0.65, '0.65'],
    ['erp_eprel_registration', 123456, '123456'],
    // Metin değer olduğu gibi kalır.
    ['erp_sec_class_average', 'A+', 'A+'],
    ['erp_ventilation_unit_type', 'BVU', 'BVU'],
    ['erp_drive_type', 'VSD', 'VSD'],
  ]

  it('her föy anahtarı beklenen birimle basılır', () => {
    const hatalar = ALTIN.filter(([k, v, b]) => formatSpecValue(k, v) !== b).map(
      ([k, v, b]) => `${k}: '${formatSpecValue(k, v)}' != '${b}'`,
    )
    expect(hatalar).toEqual([])
  })

  it('negatif SEC eksi işaretiyle basılır (A+ sınıfında SEC negatiftir, "olağan")', () => {
    expect(formatSpecValue('erp_sec_average_kwh_m2a', -44.5)).toBe('-44.5 kWh/(m²·a)')
    expect(formatSpecValue('erp_sec_average_kwh_m2a', '-44.5')).toBe('-44.5 kWh/(m²·a)')
  })

  it('SPI W/(m³/h) — genel _m3h kuralına DÜŞMEZ', () => {
    expect(formatSpecValue('erp_spi_w_m3h', 0.28)).not.toBe('0.28 m³/h')
    expect(formatSpecValue('erp_spi_w_m3h', 0.28)).toBe('0.28 W/(m³/h)')
  })

  it('LWA adıyla dB(A); genel _db kuralı değişmedi', () => {
    expect(formatSpecValue('erp_noise_lwa_db', 34)).toBe('34 dB(A)')
    expect(formatSpecValue('noise_lpa_3m_db', 66)).toBe('66 dB')
  })

  it('humanize yedeği de föy birimlerini tanır (sözlük eksik kalırsa en azından birim doğru)', () => {
    expect(humanizeSpecKey('erp_sec_cold_kwh_m2a')).toBe('Erp Sec Cold (kWh/(m²·a))')
    expect(humanizeSpecKey('erp_spi_w_m3h')).toBe('Erp Spi (W/(m³/h))')
    expect(humanizeSpecKey('erp_aec_kwh')).toBe('Erp Aec (kWh)')
    expect(humanizeSpecKey('erp_leakage_internal_pct')).toBe('Erp Leakage Internal (%)')
    // İki parçalı arama mevcut anahtarları etkilemez.
    expect(humanizeSpecKey('max_delivery_m3h')).toBe('Max Delivery (m³/h)')
  })
})

describe('REC-392 · föy KOD değerleri sözlükten çevrilir (TR müşteri "BVU" görmez)', () => {
  /**
   * Evren: KATALOG yazım planı (venthub-pdf-ingestor/venthub/icerik-hatti/rec392-erp/
   * yazim-plani.json, 2026-09-25): UVU 8 · BVU 3 · VM 8 · VSD 3 · recovery 10. `absent`
   * kaynak dizininde (VORT PENTA HCS föyü, s.13) görülen ek değer. Anlamlar Vortice föy
   * dipnotundan: "VM: Multiple speeds. VSD: Variable Speed Drive."
   * [anahtar, kod, TR, EN]
   */
  const KODLAR: ReadonlyArray<readonly [string, string, string, string]> = [
    ['erp_ventilation_unit_type', 'UVU', 'Tek Yönlü (UVU)', 'Unidirectional (UVU)'],
    ['erp_ventilation_unit_type', 'BVU', 'Çift Yönlü (BVU)', 'Bidirectional (BVU)'],
    ['erp_drive_type', 'VM', 'Çok Kademeli (VM)', 'Multi-speed (VM)'],
    ['erp_drive_type', 'VSD', 'Değişken Devirli (VSD)', 'Variable Speed Drive (VSD)'],
    ['erp_heat_recovery_type', 'recovery', 'Isı Geri Kazanımlı', 'Heat Recovery'],
    ['erp_heat_recovery_type', 'absent', 'Yok', 'None'],
  ]

  it('her kod iki dilde sözlük karşılığıyla basılır', () => {
    const hatalar: string[] = []
    for (const [k, kod, trB, enB] of KODLAR) {
      if (specValueLabel(k, kod, tTr) !== trB) hatalar.push(`tr/${k}.${kod}: '${specValueLabel(k, kod, tTr)}'`)
      if (specValueLabel(k, kod, tEn) !== enB) hatalar.push(`en/${k}.${kod}: '${specValueLabel(k, kod, tEn)}'`)
    }
    expect(hatalar).toEqual([])
  })

  it('TANINMAYAN değer olduğu gibi kalır — sessiz boş ya da ham sözlük yolu DEĞİL', () => {
    for (const t of [tTr, tEn]) {
      expect(specValueLabel('erp_drive_type', 'MSD', t)).toBe('MSD')
      expect(specValueLabel('erp_heat_recovery_type', 'recuperative', t)).toBe('recuperative')
      expect(specValueLabel('erp_heat_recovery_type', 'plate heat exchanger', t)).toBe('plate heat exchanger')
      expect(specValueLabel('erp_drive_type', 'vsd', t)).toBe('vsd') // büyük/küçük harf duyarlı
      expect(specValueLabel('erp_drive_type', 'a.b', t)).toBe('a.b') // nokta yola girmez
    }
  })

  it('kod dışı değerler formatSpecValue ile AYNI kalır (birim, sayı, başka anahtarlar)', () => {
    for (const t of [tTr, tEn]) {
      expect(specValueLabel('erp_sec_average_kwh_m2a', -44.5, t)).toBe('-44.5 kWh/(m²·a)')
      expect(specValueLabel('ip_rating', 'IP44', t)).toBe(formatSpecValue('ip_rating', 'IP44'))
      expect(specValueLabel('erp_sec_class_average', 'A+', t)).toBe('A+')
      expect(specValueLabel('weight_kg', null, t)).toBe('-')
    }
  })

  it('föy PDF\'i (buildSpecRows) vitrinle AYNI çeviriyi basar', () => {
    const specs = { erp_ventilation_unit_type: 'BVU', erp_drive_type: 'VSD', erp_heat_recovery_type: 'recovery' }
    const tr = Object.fromEntries(buildSpecRows(specs, { t: tTr }).map(([l, v]) => [l, v]))
    expect(tr['Beyan Edilen Tipoloji (Tek Yönlü / Çift Yönlü)']).toBe('Çift Yönlü (BVU)')
    expect(tr['Sürücü Tipi']).toBe('Değişken Devirli (VSD)')
    expect(tr['Isı Geri Kazanım Sistemi Tipi']).toBe('Isı Geri Kazanımlı')
    const en = buildSpecRows(specs, { t: tEn }).map(([, v]) => v)
    expect(en).toEqual(['Bidirectional (BVU)', 'Variable Speed Drive (VSD)', 'Heat Recovery'])
    // `t` yoksa değer ham kalır (etiket de zaten ayrışır; kabul edilen sınır).
    expect(buildSpecRows(specs, {}).map(([, v]) => v)).toEqual(['BVU', 'VSD', 'recovery'])
  })
})

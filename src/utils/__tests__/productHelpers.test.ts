import { describe, expect,it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import {
  formatSpecValue,
  groupTechnicalSpecs,
  translateSpecKey} from '../productHelpers'

/** GERÇEK sözlüklerle çalışan çözücüler: `t` sahte olursa "Var/Yok" metninin sözlükte olduğu hiç ölçülmez. */
const tTr = (anahtar: string): string => getDictValue(tr, anahtar)
const tEn = (anahtar: string): string => getDictValue(en, anahtar)

describe('translateSpecKey', () => {
  it('should translate known keys correctly regardless of case', () => {
    expect(translateSpecKey('rpm_max')).toBe('2. Kademe Devir Hızı')
    expect(translateSpecKey('RPM_MAX')).toBe('2. Kademe Devir Hızı')
    expect(translateSpecKey('size_a_mm')).toBe('Genişlik (A)')
    expect(translateSpecKey('frequency_hz')).toBe('Frekans')
  })

  it('should format unknown keys as capitalized words', () => {
    expect(translateSpecKey('custom_spec_key')).toBe('Custom Spec Key')
    expect(translateSpecKey('UNKNOWN')).toBe('Unknown')
  })
})

describe('formatSpecValue', () => {
  it('should return "-" for null or undefined', () => {
    expect(formatSpecValue('weight_kg', null, tTr)).toBe('-')
    expect(formatSpecValue('weight_kg', undefined, tTr)).toBe('-')
  })

  it('should return the string itself if it contains letters', () => {
    expect(formatSpecValue('weight_kg', '10kg', tTr)).toBe('10kg')
    expect(formatSpecValue('custom_spec', 'Some Text', tTr)).toBe('Some Text')
  })

  it('should append correct units based on key suffix/substring', () => {
    expect(formatSpecValue('size_a_mm', 100, tTr)).toBe('100 mm')
    expect(formatSpecValue('weight_kg', 10, tTr)).toBe('10 kg')
    expect(formatSpecValue('voltage_v', 220, tTr)).toBe('220 V')
    expect(formatSpecValue('frequency_hz', 50, tTr)).toBe('50 Hz')
    expect(formatSpecValue('max_ambient_temp_c', 40, tTr)).toBe('40 °C')
    expect(formatSpecValue('airflow_speed_max_ms', 5, tTr)).toBe('5 m / s')
    expect(formatSpecValue('absorbed_current_max_a', 2.5, tTr)).toBe('2.5 A')
    expect(formatSpecValue('delivery_1st_speed_m3h', 500, tTr)).toBe('500 m³/h')
    expect(formatSpecValue('absorbed_power_1st_speed_w', 100, tTr)).toBe('100 W')
    expect(formatSpecValue('sound_pressure_level_lp_db_a_2m_max', 50, tTr)).toBe('50 dB(A)')
    expect(formatSpecValue('rpm_max', 2800, tTr)).toBe('2800 RPM')
  })

  it('should return the string value for an unknown key with no unit mapping', () => {
    expect(formatSpecValue('custom_spec', 42, tTr)).toBe('42')
  })

  // URN-58 (karar 298): canlıda Lineo Quiet ailesinde "Zamanlayıcı false / ErP Uyumlu true / Higrostat false" basılıyordu.
  it('URN-58: mantıksal değer TR "Var"/"Yok", EN "Yes"/"No" basar; ham true/false ASLA', () => {
    for (const anahtar of ['has_timer', 'erp_compliant', 'has_humidistat', 'has_bypass', 'reversible', 'co2_sensor']) {
      expect(formatSpecValue(anahtar, true, tTr), `${anahtar}/tr/true`).toBe('Var')
      expect(formatSpecValue(anahtar, false, tTr), `${anahtar}/tr/false`).toBe('Yok')
      expect(formatSpecValue(anahtar, true, tEn), `${anahtar}/en/true`).toBe('Yes')
      expect(formatSpecValue(anahtar, false, tEn), `${anahtar}/en/false`).toBe('No')
    }
  })

  it('URN-58: mantıksal değer birim kurallarına GİRMEZ (anahtar _a/_w/_v ile bitse de "Var A" olmaz)', () => {
    expect(formatSpecValue('bayrak_a', true, tTr)).toBe('Var')
    expect(formatSpecValue('bayrak_w', false, tTr)).toBe('Yok')
    expect(formatSpecValue('rpm_flag', true, tEn)).toBe('Yes')
  })

  it('URN-58: metin "false" boolean DEĞİLDİR, dokunulmaz — yalnız gerçek boolean çevrilir', () => {
    // Canlı sorgu (2026-10-09): mantıksal alanların tamamı JSON boolean, metin "true" 0. Metin olarak gelen değer
    // veri kusurudur ve canlı kapı SPEC-HAM-DEGER onu yakalar; biçimlendirici sessizce "düzeltmez".
    expect(formatSpecValue('has_timer', 'false', tTr)).toBe('false')
  })

  it('URN-58: nesne/dizi içindeki mantıksal değer de sözlükten basılır ("a: true" olmaz)', () => {
    expect(formatSpecValue('ozellikler', { zamanlayici: false, erp: true }, tTr)).toBe('zamanlayici: Yok, erp: Var')
    expect(formatSpecValue('ozellikler', [true, false], tEn)).toBe('Yes, No')
  })

  it('URN-58: 0 ve boş metin boolean sayılmaz (0 → "0", boş → "")', () => {
    expect(formatSpecValue('custom_spec', 0, tTr)).toBe('0')
    expect(formatSpecValue('custom_spec', '', tTr)).toBe('')
  })
})

describe('groupTechnicalSpecs', () => {
  it('should return null for null or undefined input', () => {
    expect(groupTechnicalSpecs(null)).toBeNull()
    expect(groupTechnicalSpecs(undefined)).toBeNull()
  })

  it('should group specs into correct categories and ignore empty values', () => {
    const specs = {
      // Performance
      airflow_speed_max_ms: 5,
      rpm_max: 2800,

      // Physical
      size_a_mm: 100,
      weight_kg: 10,

      // Electrical
      voltage_v: 220,
      absorbed_power_1st_speed_w: 100,

      // Other
      custom_spec: 'Value',

      // Ignored
      empty_string: '',
      null_value: null,
      undefined_value: undefined
    }

    const grouped = groupTechnicalSpecs(specs)

    // Check performance group
    expect(grouped?.performance.specs).toEqual({
      airflow_speed_max_ms: 5,
      rpm_max: 2800,
      absorbed_power_1st_speed_w: 100 // Contains "speed"
    })

    // Check physical group
    expect(grouped?.physical.specs).toEqual({
      size_a_mm: 100,
      weight_kg: 10
    })

    // Check electrical group
    expect(grouped?.electrical.specs).toEqual({
      voltage_v: 220
    })

    // Check other group
    expect(grouped?.other.specs).toEqual({
      custom_spec: 'Value'
    })
  })

  it('REC-172 tur 2: IE verim sınıfı ve elektrik koruma sınıfı ELEKTRİK grubunda; benzer adlı alan kaymaz', () => {
    const grouped = groupTechnicalSpecs({
      motor_efficiency_class: 'IE3',
      electrical_protection_class: 'Class II',
      insulation_class: 'F',
      heat_recovery_efficiency_pct: 90,
    })
    expect(grouped?.electrical.specs).toEqual({
      motor_efficiency_class: 'IE3',
      electrical_protection_class: 'Class II',
    })
    expect(grouped?.other.specs).toEqual({ insulation_class: 'F', heat_recovery_efficiency_pct: 90 })
  })
})

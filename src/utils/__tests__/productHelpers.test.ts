import { describe, it, expect } from 'vitest'
import {
  translateSpecKey,
  formatSpecValue,
  groupTechnicalSpecs
} from '../productHelpers'

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
    expect(formatSpecValue('weight_kg', null)).toBe('-')
    expect(formatSpecValue('weight_kg', undefined)).toBe('-')
  })

  it('should return the string itself if it contains letters', () => {
    expect(formatSpecValue('weight_kg', '10kg')).toBe('10kg')
    expect(formatSpecValue('custom_spec', 'Some Text')).toBe('Some Text')
  })

  it('should append correct units based on key suffix/substring', () => {
    expect(formatSpecValue('size_a_mm', 100)).toBe('100 mm')
    expect(formatSpecValue('weight_kg', 10)).toBe('10 kg')
    expect(formatSpecValue('voltage_v', 220)).toBe('220 V')
    expect(formatSpecValue('frequency_hz', 50)).toBe('50 Hz')
    expect(formatSpecValue('max_ambient_temp_c', 40)).toBe('40 °C')
    expect(formatSpecValue('airflow_speed_max_ms', 5)).toBe('5 m / s')
    expect(formatSpecValue('absorbed_current_max_a', 2.5)).toBe('2.5 A')
    expect(formatSpecValue('delivery_1st_speed_m3h', 500)).toBe('500 m³/h')
    expect(formatSpecValue('absorbed_power_1st_speed_w', 100)).toBe('100 W')
    expect(formatSpecValue('sound_pressure_level_lp_db_a_2m_max', 50)).toBe('50 dB(A)')
    expect(formatSpecValue('rpm_max', 2800)).toBe('2800 RPM')
  })

  it('should return the string value for an unknown key with no unit mapping', () => {
    expect(formatSpecValue('custom_spec', 42)).toBe('42')
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
})

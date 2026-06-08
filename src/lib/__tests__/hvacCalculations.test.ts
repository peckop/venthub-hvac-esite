import { describe, expect,it } from 'vitest'

import { calculateAirCurtain, calculateDuct, calculateHRV, type HRVInput } from '../hvacCalculations'

describe('calculateHRV', () => {
  const defaultInput: HRVInput = {
    recoveryType: 'hrv',
    buildingType: 'office',
    climateZone: 'temperate',
    area: 100,
    occupancy: 10,
    operatingHoursPerDay: 10,
    sensibleEfficiency: 75,
    latentEfficiency: 65,
    electricityCostPerKWh: 3.5
  }

  it('calculates required airflow based on the larger of occupancy or area', () => {
    // 10 people * 36 m3/h/person = 360 m3/h
    // 100 m2 * 1.44 m3/h/m2 = 144 m3/h
    // Result should be 360
    const result = calculateHRV(defaultInput)
    expect(result.requiredAirflow).toBe(360)

    // Increase area so it becomes the limiting factor
    const result2 = calculateHRV({ ...defaultInput, area: 1000, occupancy: 10 })
    // 10 people * 36 = 360
    // 1000 m2 * 1.44 = 1440
    // Result should be 1440
    expect(result2.requiredAirflow).toBe(1440)
  })

  it('calculates heating recovery correctly (baseline check)', () => {
    const result = calculateHRV(defaultInput)
    // New Formula (Temperate): Q = 360 * 0.34 * 22 * 0.75 = 2019.6 -> 2020
    expect(result.heatingRecovery).toBe(2020)
  })

  it('calculates cooling recovery differently for HRV and ERV', () => {
    const hrvResult = calculateHRV({ ...defaultInput, recoveryType: 'hrv' })
    // Formula (HRV): Q = 360 * 0.34 * 10 * 0.75 = 918
    expect(hrvResult.coolingRecovery).toBe(918)

    const ervResult = calculateHRV({ ...defaultInput, recoveryType: 'erv' })
    // In ERV, cooling recovery involves latent heat as well.
    // Formula (ERV): Q = 360 * 0.34 * 10 * (0.75 + 0.65 * 0.4) = 360 * 0.34 * 10 * 1.01 = 1236.24 -> 1236
    expect(ervResult.coolingRecovery).toBe(1236)
    expect(ervResult.coolingRecovery).toBeGreaterThan(hrvResult.coolingRecovery)
  })

  it('adjusts delta-T based on climate zone', () => {
    const temperateResult = calculateHRV({ ...defaultInput, climateZone: 'temperate' })
    const coldResult = calculateHRV({ ...defaultInput, climateZone: 'cold' })
    const hotResult = calculateHRV({ ...defaultInput, climateZone: 'hot' })

    // Cold zones should have higher heating recovery
    expect(coldResult.heatingRecovery).toBeGreaterThan(temperateResult.heatingRecovery)
    // Hot zones should have higher cooling recovery
    expect(hotResult.coolingRecovery).toBeGreaterThan(temperateResult.coolingRecovery)
  })

  it('calculates more realistic payback period based on device capacity', () => {
    const smallResult = calculateHRV({ ...defaultInput, occupancy: 5 }) // 180 m3/h
    const largeResult = calculateHRV({ ...defaultInput, occupancy: 100 }) // 3600 m3/h

    // Larger systems usually have better ROI/shorter payback (economy of scale)
    // although this depends on how we model device cost.
    // Let's just ensure it's not a fixed flat rate if we decide to change the formula.
    expect(smallResult.paybackPeriod).not.toBe(largeResult.paybackPeriod)
  })

  it('handles zero or negative inputs gracefully', () => {
    const zeroInput: HRVInput = {
      ...defaultInput,
      area: 0,
      occupancy: 0
    }
    const result = calculateHRV(zeroInput)
    expect(result.requiredAirflow).toBe(0)
    expect(result.annualEnergySaving).toBe(0)
    expect(result.paybackPeriod).toBe(99)
  })
})

describe('calculateDuct', () => {
  it('calculates velocity correctly for circular ducts', () => {
    const result = calculateDuct({
      airflow: 1000,
      ductType: 'circular',
      diameter: 250,
      length: 10,
      material: 'galvanized'
    })
    // Area = PI * 0.125^2 = 0.049087 m2
    // Q = 1000 / 3600 = 0.2777... m3/s
    // V = 0.2777 / 0.049087 = 5.658... m/s
    expect(result.velocity).toBeCloseTo(5.66, 1)
    expect(result.velocityStatus).toBe('optimal')
  })

  it('calculates velocity correctly for rectangular ducts', () => {
    const result = calculateDuct({
      airflow: 1000,
      ductType: 'rectangular',
      width: 400,
      height: 200,
      length: 10,
      material: 'galvanized'
    })
    // Area = 0.4 * 0.2 = 0.08 m2
    // Q = 1000 / 3600 = 0.2777... m3/s
    // V = 0.2777 / 0.08 = 3.472... m/s
    expect(result.velocity).toBeCloseTo(3.47, 1)
  })

  it('handles high velocity warning', () => {
    const result = calculateDuct({
      airflow: 5000,
      ductType: 'circular',
      diameter: 200,
      length: 5,
      material: 'galvanized'
    })
    expect(result.velocity).toBeGreaterThan(12)
    expect(result.velocityStatus).toBe('critical')
    expect(result.recommendations).toContain('Kanal ebadını artırarak hızı düşürün')
  })
})

describe('calculateAirCurtain', () => {
  it('calculates required airflow for comfort application', () => {
    const result = calculateAirCurtain({
      doorWidth: 1.0,
      doorHeight: 2.5,
      application: 'comfort',
      windCondition: 'none',
      trafficIntensity: 'low'
    })
    // Nozzle Area = 1.0 * 0.042 = 0.042 m2
    // Target Velocity (comfort, 2.5m) = 8.5 m/s
    // Airflow = 8.5 * 0.042 * 3600 = 1285.2 -> 1285
    expect(result.requiredAirflow).toBeGreaterThan(1200)
    expect(result.requiredAirflow).toBeLessThan(1400)
    expect(result.nozzleVelocity).toBe(8.5)
  })

  it('increases airflow for insect application', () => {
    const comfort = calculateAirCurtain({
      doorWidth: 1.0,
      doorHeight: 2.5,
      application: 'comfort',
      windCondition: 'none',
      trafficIntensity: 'low'
    })
    const insect = calculateAirCurtain({
      doorWidth: 1.0,
      doorHeight: 2.5,
      application: 'insect',
      windCondition: 'none',
      trafficIntensity: 'low'
    })
    expect(insect.requiredAirflow).toBeGreaterThan(comfort.requiredAirflow)
    expect(insect.nozzleVelocity).toBe(12)
  })

  it('increases airflow for strong wind', () => {
    const none = calculateAirCurtain({
      doorWidth: 1.0,
      doorHeight: 2.5,
      application: 'comfort',
      windCondition: 'none',
      trafficIntensity: 'low'
    })
    const strong = calculateAirCurtain({
      doorWidth: 1.0,
      doorHeight: 2.5,
      application: 'comfort',
      windCondition: 'strong',
      trafficIntensity: 'low'
    })
    expect(strong.requiredAirflow).toBeGreaterThan(none.requiredAirflow)
    expect(strong.recommendations).toContain('Şiddetli rüzgar için açılı montaj veya çift hüzmeli koruma önerilir')
  })
})

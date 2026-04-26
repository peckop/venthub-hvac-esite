import { describe, it, expect } from 'vitest'
import { HVAC_BRANDS } from '../brands'

describe('HVAC_BRANDS', () => {
  it('should export an array of brand objects', () => {
    expect(Array.isArray(HVAC_BRANDS)).toBe(true)
    expect(HVAC_BRANDS.length).toBeGreaterThan(0)
  })

  it('should contain expected brand properties for each item', () => {
    HVAC_BRANDS.forEach((brand) => {
      expect(brand).toHaveProperty('name')
      expect(brand).toHaveProperty('slug')
      expect(brand).toHaveProperty('description')
      expect(brand).toHaveProperty('country')
      expect(brand).toHaveProperty('specialty')

      expect(typeof brand.name).toBe('string')
      expect(typeof brand.slug).toBe('string')
      expect(typeof brand.description).toBe('string')
      expect(typeof brand.country).toBe('string')
      expect(typeof brand.specialty).toBe('string')

      if (brand.founded) {
        expect(typeof brand.founded).toBe('number')
      }
      if (brand.headquarters) {
        expect(typeof brand.headquarters).toBe('string')
      }
      if (brand.website) {
        expect(typeof brand.website).toBe('string')
      }
    })
  })

  it('should contain specific known brands', () => {
    const brandNames = HVAC_BRANDS.map(b => b.name)
    expect(brandNames).toContain('Vortice')
    expect(brandNames).toContain('Avens')
    expect(brandNames).toContain('Casals')
    expect(brandNames).toContain('Nicotra Gebhardt')
    expect(brandNames).toContain('Flexiva')
  })
})

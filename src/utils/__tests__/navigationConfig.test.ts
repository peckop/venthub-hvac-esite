import { describe, it, expect } from 'vitest'
import { NAVIGATION_PRIMARY_ITEMS, NAVIGATION_SECONDARY_ITEMS } from '../navigationConfig'

describe('navigationConfig constants', () => {
  it('should export arrays of navigation items', () => {
    expect(Array.isArray(NAVIGATION_PRIMARY_ITEMS)).toBe(true)
    expect(Array.isArray(NAVIGATION_SECONDARY_ITEMS)).toBe(true)
  })

  it('should define valid primary navigation items', () => {
    NAVIGATION_PRIMARY_ITEMS.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('labelKey')
      expect(typeof item.id).toBe('string')
      expect(typeof item.labelKey).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
      expect(item.labelKey.length).toBeGreaterThan(0)
    })

    const ids = NAVIGATION_PRIMARY_ITEMS.map(i => i.id)
    expect(ids).toContain('categories')
    expect(ids).toContain('products')
  })

  it('should define valid secondary navigation items', () => {
    NAVIGATION_SECONDARY_ITEMS.forEach(item => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('labelKey')
      expect(typeof item.id).toBe('string')
      expect(typeof item.labelKey).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
      expect(item.labelKey.length).toBeGreaterThan(0)
    })

    const ids = NAVIGATION_SECONDARY_ITEMS.map(i => i.id)
    expect(ids).toContain('brands')
    expect(ids).toContain('knowledgeHub')
    expect(ids).toContain('about')
    expect(ids).toContain('contact')
    expect(ids).toContain('account')
  })
})

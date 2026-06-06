import { describe, it, expect } from 'vitest'
import { tr } from '../dictionaries/tr'
import { en } from '../dictionaries/en'

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getKeys(value as Record<string, unknown>, fullKey)
    }
    return [fullKey]
  })
}

describe('i18n dictionary parity', () => {
  const trKeys = getKeys(tr as Record<string, unknown>).sort()
  const enKeys = getKeys(en as Record<string, unknown>).sort()

  it('tr and en should have identical key sets', () => {
    const missingInTr = enKeys.filter(k => !trKeys.includes(k))
    const missingInEn = trKeys.filter(k => !enKeys.includes(k))

    if (missingInTr.length > 0) {
      console.error('EN\'de var ama TR\'de eksik:', missingInTr)
    }
    if (missingInEn.length > 0) {
      console.error('TR\'de var ama EN\'de eksik:', missingInEn)
    }

    expect(missingInTr).toEqual([])
    expect(missingInEn).toEqual([])
  })

  it('should have the same number of keys', () => {
    expect(trKeys.length).toBe(enKeys.length)
  })
})

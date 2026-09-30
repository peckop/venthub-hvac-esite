import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  parseAmountInput,
  readVatIncludedPreference,
  VAT_PREFERENCE_KEY,
  writeVatIncludedPreference,
} from '../productPriceInput'

describe('parseAmountInput', () => {
  it('TR ve nokta biçimlerini çözer', () => {
    expect(parseAmountInput('2400')).toBe(2400)
    expect(parseAmountInput('2400.50')).toBe(2400.5)
    expect(parseAmountInput('2400,50')).toBe(2400.5)
    expect(parseAmountInput('2.400,50')).toBe(2400.5)
    expect(parseAmountInput('1.234.567,89')).toBe(1234567.89)
    expect(parseAmountInput('₺ 2 400,50')).toBe(2400.5)
    expect(parseAmountInput('2400 TL')).toBe(2400)
  })

  it('"2.400" binlik sayılır (yalnız noktadan sonra tam 3 hane); "2.4" ve "2.45" ondalıktır', () => {
    expect(parseAmountInput('2.400')).toBe(2400)
    expect(parseAmountInput('1.234.567')).toBe(1234567)
    expect(parseAmountInput('2.4')).toBe(2.4)
    expect(parseAmountInput('2.45')).toBe(2.45)
  })

  it('anlaşılmayan girdide null döner', () => {
    for (const kotu of ['', '   ', 'abc', '12abc', '1,2,3', '--5', '1..5', '.5.', 'Infinity']) {
      expect(parseAmountInput(kotu)).toBeNull()
    }
  })

  it('negatif işareti kabul etmez (sıfır/negatifi zaten servis reddeder; burada biçim çözülmez)', () => {
    expect(parseAmountInput('-5')).toBeNull()
  })
})

describe('KDV seçimi tercihi (tarayıcı)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('kayıt yokken KDV dahil (true) döner', () => {
    expect(readVatIncludedPreference()).toBe(true)
  })

  it('son seçimi saklar ve okur', () => {
    writeVatIncludedPreference(false)
    expect(window.localStorage.getItem(VAT_PREFERENCE_KEY)).toBe('false')
    expect(readVatIncludedPreference()).toBe(false)
    writeVatIncludedPreference(true)
    expect(readVatIncludedPreference()).toBe(true)
  })

  it('site verisi engelliyse (localStorage atar) okuma varsayılana düşer, yazma sessizce geçer', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('engelli')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('engelli')
    })
    expect(readVatIncludedPreference()).toBe(true)
    expect(() => writeVatIncludedPreference(false)).not.toThrow()
  })
})

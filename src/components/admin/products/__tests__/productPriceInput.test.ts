import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  formatAmountForInput,
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

  it('belirsiz virgüllü biçimler REDDEDİLİR: yanlış okumak fiyatı 1000 kat kaydırırdı (İngilizce biçim, 3+ kuruş hanesi)', () => {
    for (const belirsiz of ['1,500.00', '1,500', '1,234,567.89', '2400,555', '2.400,500', '2400,']) {
      expect(parseAmountInput(belirsiz), belirsiz).toBeNull()
    }
    // TR biçimleri etkilenmez
    expect(parseAmountInput('1500,5')).toBe(1500.5)
    expect(parseAmountInput('1.500,00')).toBe(1500)
  })

  it('formatAmountForInput: kayıtlı tutar virgüllü yazılır ve ayrıştırıcıdan AYNI değerle döner (1000 kat kayma yok)', () => {
    expect(formatAmountForInput(2400.5)).toBe('2400,5')
    expect(formatAmountForInput(2400)).toBe('2400')
    for (const tutar of [2400.5, 2400, 0.99, 123.45, 1234567.89]) {
      expect(parseAmountInput(formatAmountForInput(tutar)), String(tutar)).toBe(tutar)
    }
    // 3 ondalıklı kayıt (nadir) sessizce yanlış okunmaz: reddedilir, yönetici kuruşa yuvarlar
    expect(formatAmountForInput(123.456)).toBe('123,456')
    expect(parseAmountInput('123,456')).toBeNull()
    expect(parseAmountInput('123.456')).toBe(123456) // elle nokta yazımı binlik sayılır (belgelenmiş TR davranışı); alan ARTIK bu biçimle doldurulmaz
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

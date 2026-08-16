import { describe, expect,it } from 'vitest'

import { isValidTckn, isValidVkn } from '../taxIdentity'

/**
 * Bu testin kilit maddesi "geçersiz ama makul görünen" değerlerdir. Uzunluk kontrolü
 * `11111111111`'i geçirir — fatura tam olarak böyle bir değerle kesilemez.
 */
describe('isValidTckn', () => {
  it('geçerli numarayı kabul eder', () => {
    expect(isValidTckn('10000000146')).toBe(true)
  })

  it('uzunluk kontrolünün geçirdiği geçersiz numaraları reddeder', () => {
    // 11 hane, hepsi rakam, ilk hane 0 değil — yani ESKİ kontrolden geçiyordu.
    expect(isValidTckn('11111111111')).toBe(false)
    expect(isValidTckn('12345678901')).toBe(false)
    expect(isValidTckn('99999999999')).toBe(false)
  })

  it('biçim kurallarını uygular', () => {
    expect(isValidTckn('')).toBe(false)
    expect(isValidTckn('1000000014')).toBe(false)     // 10 hane
    expect(isValidTckn('100000001466')).toBe(false)   // 12 hane
    expect(isValidTckn('00000000146')).toBe(false)    // ilk hane 0
    expect(isValidTckn('1000000014a')).toBe(false)    // harf
    expect(isValidTckn(' 10000000146')).toBe(false)   // boşluk
  })

  it('son iki hanenin her biri ayrı ayrı denetlenir', () => {
    // 10. hane bozuldu (4 → 5), 11. hane doğru kaldı.
    expect(isValidTckn('10000000156')).toBe(false)
    // 11. hane bozuldu (6 → 7), 10. hane doğru kaldı.
    expect(isValidTckn('10000000147')).toBe(false)
  })
})

describe('isValidVkn', () => {
  it('geçerli numarayı kabul eder', () => {
    expect(isValidVkn('1234567890')).toBe(true)
  })

  it('geçersiz sağlamayı reddeder', () => {
    expect(isValidVkn('1234567891')).toBe(false)
    expect(isValidVkn('1111111111')).toBe(false)
  })

  it('biçim kurallarını uygular', () => {
    expect(isValidVkn('')).toBe(false)
    expect(isValidVkn('123456789')).toBe(false)    // 9 hane
    expect(isValidVkn('12345678901')).toBe(false)  // 11 hane
    expect(isValidVkn('123456789a')).toBe(false)   // harf
  })

  it('VKN 0 ile başlayabilir — TCKN kuralı buraya sızmamalı', () => {
    // TCKN'de ilk hane 0 olamaz; VKN'de olabilir. Aynı biçim kuralı yanlışlıkla
    // kopyalanırsa bu satır kırmızıya döner.
    expect(isValidVkn('0123456789')).toBe(true)
  })
})

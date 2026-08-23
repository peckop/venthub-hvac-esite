import { describe, expect,it } from 'vitest'

import { foldForSearch,localeLower, localeUpper } from '../case'

/**
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen C
 *
 * Bu takım yalnız yardımcının kendisini sınar. Yardımcının KULLANILDIĞINI
 * `src/__tests__/conformance/i18n-locale-case.test.ts` (INV-8) zorlar.
 */
describe('localeLower — Türkçe küçük harf', () => {
  it("İ → i (birleşen nokta ÜRETMEZ)", () => {
    expect(localeLower('İstanbul', 'tr')).toBe('istanbul')
    // Locale-siz çağrının ürettiği bozuk çıktıyı ÜRETMEDİĞİMİZİ kanıtla:
    expect(localeLower('İstanbul', 'tr')).not.toBe('İstanbul'.toLowerCase())
  })

  it('I → ı', () => {
    expect(localeLower('SIĞINAK', 'tr')).toBe('sığınak')
    expect(localeLower('SIĞINAK', 'tr')).not.toBe('SIĞINAK'.toLowerCase())
  })

  it('İngilizce için locale-bağımsız kural doğrudur', () => {
    expect(localeLower('SILENT', 'en')).toBe('silent')
    expect(localeLower('Vortice', 'en')).toBe('vortice')
  })

  it("'en' altında Türkçe kuralı UYGULANMAZ (I → i)", () => {
    expect(localeLower('INLINE', 'en')).toBe('inline')
  })
})

describe('localeUpper — Türkçe büyük harf', () => {
  it('i → İ', () => {
    expect(localeUpper('Sirkülasyon Fanları', 'tr')).toBe('SİRKÜLASYON FANLARI')
    expect(localeUpper('Sirkülasyon Fanları', 'tr')).not.toBe('Sirkülasyon Fanları'.toUpperCase())
  })

  it('ı → I', () => {
    expect(localeUpper('ısıtıcı', 'tr')).toBe('ISITICI')
  })

  it('İngilizce: i → I', () => {
    expect(localeUpper('silent', 'en')).toBe('SILENT')
  })
})

describe('foldForSearch — kasa VE aksan duyarsız eşleştirme', () => {
  it('Türkçe klavyesiz yazılan terimi eşleştirir', () => {
    expect(foldForSearch('Sığınak Fanı', 'tr')).toBe('siginak fani')
    expect(foldForSearch('Sığınak Fanı', 'tr').includes(foldForSearch('siginak', 'tr'))).toBe(true)
    expect(foldForSearch('SIĞINAK FANI', 'tr').includes(foldForSearch('sığınak', 'tr'))).toBe(true)
  })

  it('İ ile başlayan başlığı bulur', () => {
    expect(foldForSearch('İç Hava Kalitesi', 'tr')).toBe('ic hava kalitesi')
    expect(foldForSearch('İç Hava Kalitesi', 'tr').includes(foldForSearch('iç hava', 'tr'))).toBe(true)
  })

  it('tüm Türkçe aksanlı harfleri düşürür', () => {
    expect(foldForSearch('ÇĞİIÖŞÜ çğıiöşü', 'tr')).toBe('cgiiosu cgiiosu')
  })

  it('geriye birleşen işaret BIRAKMAZ', () => {
    const katlanmis = foldForSearch('İstanbul Çatı Sığınak', 'tr')
    const birlesen = [...katlanmis].filter((c) => c.charCodeAt(0) >= 0x0300 && c.charCodeAt(0) <= 0x036f)
    expect(birlesen).toEqual([])
  })

  it('İngilizce metni bozmaz', () => {
    expect(foldForSearch('Silent Inline Fan', 'en')).toBe('silent inline fan')
  })
})

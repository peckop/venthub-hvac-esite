import { describe, expect, it } from 'vitest'

import { EPOSTA_YER_TUTUCU, KIMLIK_NO_YER_TUTUCU, maskele, TELEFON_YER_TUTUCU } from '../maskele'

describe('maskele: e-posta', () => {
  it('düz, noktalı, artılı ve Türkçe harfli yerel kısımları maskeler', () => {
    for (const eposta of ['ahmet@firma.com', 'ahmet.yilmaz@firma.com.tr', 'ali+katalog@ornek.org', 'müşteri@örnek.com.tr']) {
      const sonuc = maskele(`bana ${eposta} adresinden yazın`)
      expect(sonuc.metin, eposta).toBe(`bana ${EPOSTA_YER_TUTUCU} adresinden yazın`)
      expect(sonuc.maskelenen.eposta).toBe(1)
    }
  })

  it('iki e-posta iki kez sayılır', () => {
    const sonuc = maskele('a@b.co ve c.d@e.com.tr')
    expect(sonuc.metin).toBe(`${EPOSTA_YER_TUTUCU} ve ${EPOSTA_YER_TUTUCU}`)
    expect(sonuc.maskelenen.eposta).toBe(2)
  })
})

describe('maskele: telefon (Türkiye biçimleri)', () => {
  const telefonlar = [
    '0532 123 45 67',
    '0532-123-45-67',
    '0532.123.45.67',
    '05321234567',
    '532 123 45 67',
    '5321234567',
    '0 532 123 45 67',
    '0 (532) 123 45 67',
    '+90 532 123 45 67',
    '+90 (532) 123 45 67',
    '+905321234567',
    '00905321234567',
    '0212 555 12 34',
    '(0212) 555 12 34',
    '0312-555-12-34',
  ]
  it.each(telefonlar)('%s maskelenir', (telefon) => {
    const sonuc = maskele(`beni ara: ${telefon} lütfen`)
    expect(sonuc.metin).toBe(`beni ara: ${TELEFON_YER_TUTUCU} lütfen`)
    expect(sonuc.maskelenen.telefon).toBe(1)
    expect(sonuc.metin).not.toMatch(/\d{3}/)
  })

  it('metnin başındaki ve sonundaki numara da maskelenir; virgülle ayrılmış iki numara iki kez', () => {
    expect(maskele('0532 123 45 67').metin).toBe(TELEFON_YER_TUTUCU)
    const iki = maskele('05321234567,05329876543')
    expect(iki.metin).toBe(`${TELEFON_YER_TUTUCU},${TELEFON_YER_TUTUCU}`)
    expect(iki.maskelenen.telefon).toBe(2)
  })
})

describe('maskele: 11 haneli kimlik numarası benzeri', () => {
  it('başı sıfır olmayan 11 hane maskelenir', () => {
    const sonuc = maskele('TC no 12345678901 yazılı')
    expect(sonuc.metin).toBe(`TC no ${KIMLIK_NO_YER_TUTUCU} yazılı`)
    expect(sonuc.maskelenen.kimlikNo).toBe(1)
  })

  it('daha uzun rakam dizisinin parçası maskelenmez (sipariş no gibi 12-13 hane)', () => {
    expect(maskele('sipariş 123456789012').metin).toBe('sipariş 123456789012')
    expect(maskele('sipariş 1234567890123').metin).toBe('sipariş 1234567890123')
  })
})

describe('maskele: ÜRÜN DEĞERLERİNE DOKUNMAZ', () => {
  const urunMetinleri = [
    'jet fan tünel için 2000 m³/h, IP55, sessiz olsun',
    'debi 2000 m3/h, çap 125 mm, IP55, 380 V, 50 Hz',
    'SEAT 20 · 950 d/dk · 0,18 kW · 380V',
    'STORM 16 ATEX · 2800 d/dk · 2,2 kW',
    'ADH-225 E2',
    'Zone 2, Category 3G, Directive 94/9/CE',
    'Vortice Lineo 125',
    'statik basınç 250 Pa, 45,5 dB(A), 3 m',
    '1.250.000 m³/h değil, 12 adet, 3500 m3/h ve 250 Pa',
    'ürün 2000 3000 4000 5000 aralığında',
  ]
  it.each(urunMetinleri)('%s aynen kalır', (metin) => {
    const sonuc = maskele(metin)
    expect(sonuc.metin).toBe(metin)
    expect(sonuc.maskelenen).toEqual({ eposta: 0, telefon: 0, kimlikNo: 0 })
  })
})

describe('maskele: karışık gerçekçi mesaj', () => {
  it('kişisel veriyi maskeler, ürün değerlerini korur', () => {
    const sonuc = maskele(
      'Merhaba, 0532 123 45 67 numaralı telefonum, ahmet@firma.com adresim, kimlik 12345678901. 2000 m³/h IP55 fan lazım.',
    )
    expect(sonuc.metin).toBe(
      `Merhaba, ${TELEFON_YER_TUTUCU} numaralı telefonum, ${EPOSTA_YER_TUTUCU} adresim, kimlik ${KIMLIK_NO_YER_TUTUCU}. 2000 m³/h IP55 fan lazım.`,
    )
    expect(sonuc.maskelenen).toEqual({ eposta: 1, telefon: 1, kimlikNo: 1 })
  })

  it('boş metin ve kişisel veri içermeyen metin değişmez; fırlatmaz', () => {
    expect(maskele('')).toEqual({ metin: '', maskelenen: { eposta: 0, telefon: 0, kimlikNo: 0 } })
    expect(maskele('sessiz fan').metin).toBe('sessiz fan')
  })

  it('aynı çağrı tekrarlandığında aynı sonucu verir (global düzenli ifadenin durumu sızmaz)', () => {
    const girdi = 'ara 0532 123 45 67 ve a@b.co'
    expect(maskele(girdi)).toEqual(maskele(girdi))
  })

  it('maskelenmiş metin tekrar maskelenince değişmez (idempotent)', () => {
    const bir = maskele('0532 123 45 67 a@b.co 12345678901').metin
    expect(maskele(bir).metin).toBe(bir)
  })
})

import { describe, expect, it } from 'vitest'

import { BILINMEYEN_IP, istemciIpAl, MAKS_IP_UZUNLUGU } from '../istemciIp'

function basliklar(kayit: Record<string, string>) {
  const harita = new Map(Object.entries(kayit).map(([k, v]) => [k.toLowerCase(), v]))
  return { get: (ad: string) => harita.get(ad.toLowerCase()) ?? null }
}

describe('istemciIpAl: emsal sırası (quote-request-guest 193-209)', () => {
  it('cf-connecting-ip diğer her şeyden önce gelir', () => {
    const sonuc = istemciIpAl(
      basliklar({ 'cf-connecting-ip': '203.0.113.1', 'x-real-ip': '203.0.113.2', 'x-forwarded-for': '9.9.9.9, 203.0.113.3' }),
    )
    expect(sonuc).toEqual({ ip: '203.0.113.1', kaynak: 'cf-connecting-ip' })
  })

  it('cf yoksa x-real-ip', () => {
    const sonuc = istemciIpAl(basliklar({ 'x-real-ip': '203.0.113.2', 'x-forwarded-for': '9.9.9.9, 203.0.113.3' }))
    expect(sonuc).toEqual({ ip: '203.0.113.2', kaynak: 'x-real-ip' })
  })

  it('yalnız x-forwarded-for varsa SON öğe alınır, ilk öğe DEĞİL', () => {
    const sonuc = istemciIpAl(basliklar({ 'x-forwarded-for': 'sahte-ilk, 10.0.0.1 , 203.0.113.9' }))
    expect(sonuc).toEqual({ ip: '203.0.113.9', kaynak: 'x-forwarded-for-son' })
  })

  it('başlık yoksa "bilinmeyen" ve kaynağı da bilinmeyen (çağıran ortak anahtara yazmamayı seçebilir)', () => {
    expect(istemciIpAl(basliklar({}))).toEqual({ ip: BILINMEYEN_IP, kaynak: 'bilinmeyen' })
    expect(BILINMEYEN_IP).toBe('bilinmeyen')
  })
})

describe('istemciIpAl: sayaç anahtarı istemci tarafından DEĞİŞTİRİLEMEZ', () => {
  it('istemci x-forwarded-for\'un İLK öğesini her istekte değiştirse de anahtar aynı kalır', () => {
    const anahtarlar = ['a1', 'a2', 'rastgele-3', '198.51.100.7'].map(
      (ilk) => istemciIpAl(basliklar({ 'x-forwarded-for': `${ilk}, 203.0.113.9` })).ip,
    )
    expect(new Set(anahtarlar).size).toBe(1)
    expect(anahtarlar[0]).toBe('203.0.113.9')
  })

  it('tek öğeli x-forwarded-for\'da o öğe alınır', () => {
    expect(istemciIpAl(basliklar({ 'x-forwarded-for': '203.0.113.9' })).ip).toBe('203.0.113.9')
  })
})

describe('istemciIpAl: kenar durumlar', () => {
  it('yalnız boşluktan oluşan başlık "var" sayılmaz', () => {
    const sonuc = istemciIpAl(basliklar({ 'cf-connecting-ip': '   ', 'x-real-ip': '', 'x-forwarded-for': ' , ,203.0.113.9' }))
    expect(sonuc).toEqual({ ip: '203.0.113.9', kaynak: 'x-forwarded-for-son' })
  })

  it('uzun başlık sayaç anahtarını şişirmez', () => {
    const sonuc = istemciIpAl(basliklar({ 'cf-connecting-ip': 'x'.repeat(500) }))
    expect(sonuc.ip).toHaveLength(MAKS_IP_UZUNLUGU)
    expect(MAKS_IP_UZUNLUGU).toBe(64)
  })

  it('başlık adı büyük/küçük harf duyarsızdır (gerçek Headers nesnesiyle)', () => {
    if (typeof Headers !== 'function') return
    const h = new Headers({ 'CF-Connecting-IP': '203.0.113.5' })
    expect(istemciIpAl(h)).toEqual({ ip: '203.0.113.5', kaynak: 'cf-connecting-ip' })
  })
})

/**
 * Karar 116 · ürün EN adı kural dönüşümü (REC-146). Ağa, DB'ye çıkmaz; adlar canlıdaki gerçek örneklerdir.
 *
 * Kilitlenenler:
 *   1. d/dk → rpm, ondalık virgül → nokta, HIZ ANAHTARI → SPEED CONTROLLER; model kodu ve marka aynen.
 *   2. Dile bağlı olmayan model adı → EN adı gerekmez (null), yazılmaz.
 *   3. Kalıntı (Türkçe harf, bilinmeyen Türkçe kelime, belirsiz nokta+3 hane) → RED, tahmin yok.
 *   4. Elle yazılmış EN ad ezilmez; aynı EN ad ikinci koşumda yazılmaz; pasif ürün plana girmez.
 */
import { describe, it, expect } from 'vitest'
import { enAd, adYazimPlani } from '../urun-ad-en.mjs'

describe('Karar 116 · enAd', () => {
  it('canlı örnekler kurala göre dönüşür, kodlar aynen kalır', () => {
    expect(enAd('SEAT 35 · 1400 d/dk · 7,5 kW · 380V').en).toBe('SEAT 35 · 1400 rpm · 7.5 kW · 380V')
    expect(enAd('KENTALFAN 400 M4 0,55kW').en).toBe('KENTALFAN 400 M4 0.55kW')
    expect(enAd('AVenS 2,5 A HIZ ANAHTARI').en).toBe('AVenS 2.5 A SPEED CONTROLLER')
    expect(enAd('DD 12/12 1100W 1F 6P 1V - 61091A').en).toBeNull()
    expect(enAd('Vortice MP 354 T').en).toBeNull()
  })

  it('SABOTAJ — Türkçe kalıntı ve belirsiz sayı RED', () => {
    expect(enAd('AVenS 750 ISI GERİ KAZANIM CİHAZI').red).toBe('Türkçe harf')
    expect(enAd('SEAT KANAL FANI 250').red).toBe('Türkçe kelime')
    expect(enAd('Fan 1.400 m3/h').red).toBe('belirsiz nokta+3 hane')
    expect(enAd('Fan 1,400 m3/h').red).toBe('belirsiz nokta+3 hane')
  })
})

describe('Karar 116 · adYazimPlani', () => {
  const u = (sku: string, name: string, en?: string, status = 'active') =>
    ({ id: sku, sku, name, status, name_i18n: en === undefined ? null : { tr: name, en } })

  it('yalnız değişen ve EN adı boş aktif ürün yazılır; diğer anahtarlar korunur', () => {
    const r = adYazimPlani([
      u('A', 'SEAT 15 · 950 d/dk · 0,18 kW · 380V'),
      u('B', 'Vortice MP 354 T'),
      u('C', 'AVenS 5 A HIZ ANAHTARI', 'AVenS 5 A Speed Switch'),
      u('D', 'SEAT 15 · 950 d/dk · 0,18 kW · 380V', 'SEAT 15 · 950 rpm · 0.18 kW · 380V'),
      u('E', 'SEAT 20 · 950 d/dk · 0,25 kW · 380V', undefined, 'archived'),
      u('F', 'AVenS 1000 ISI GERİ KAZANIM CİHAZI'),
      u('G', 'AVenS 750 ISI GERİ KAZANIM CİHAZI', 'AVenS 750 Heat Recovery Unit'),
    ])
    expect(r.yazilacak.map(y => y.sku)).toEqual(['A'])
    expect(r.yazilacak[0].yeni_name_i18n).toEqual({ en: 'SEAT 15 · 950 rpm · 0.18 kW · 380V' })
    expect(r.gereksiz).toBe(1)
    expect(r.dolu).toBe(2)
    expect(r.ayni).toEqual(['D'])
    expect(r.red.map(x => x.sku)).toEqual(['F'])
  })
})

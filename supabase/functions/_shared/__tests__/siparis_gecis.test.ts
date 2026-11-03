import { describe, expect, it } from 'vitest'

import {
  kargoIptaliKarari,
  kargolamaKarari,
  monotonIhlaliMi,
  odemeGecisiIzinliMi,
  siparisGecisiIzinliMi,
} from '../siparis_gecis'

/**
 * ALT-131 — edge yazıcılarının YAZMADAN ÖNCE verdiği kararlar (kargolama, kargo iptali) ve
 * veritabanı tetiğinin (VH409) tanınması. Tablo ↔ migration eşliği conformance testinde
 * (`siparis-monoton-durum.test.ts`, INV-SIPARIS-MONOTON-1).
 */

describe('kargoIptaliKarari — durum geri sarılmaz', () => {
  it('shipped: yalnız takip bilgisi temizlenir (status confirmed OLMAZ)', () => {
    const k = kargoIptaliKarari({ status: 'shipped', shipped_at: '2026-11-01T10:00:00Z' })
    expect(k).toEqual({ islem: 'takip_temizle' })
  })

  it('delivered: kargo iptali REDDEDİLİR (409), teslim geri alınamaz', () => {
    const k = kargoIptaliKarari({ status: 'delivered', shipped_at: '2026-11-01T10:00:00Z' })
    expect(k).toMatchObject({ islem: 'reddet', http: 409, kod: 'DELIVERED_SHIPMENT_CANCEL_FORBIDDEN' })
  })

  it.each(['pending', 'confirmed', 'processing', 'cancelled', null, 'bilinmeyen'])(
    'kargolanmamış/bilinmeyen durum %s: iptal edilecek kargo yok (409)',
    (status) => {
      const k = kargoIptaliKarari({ status, shipped_at: null })
      expect(k).toMatchObject({ islem: 'reddet', http: 409, kod: 'ORDER_NOT_SHIPPED' })
    },
  )
})

describe('kargolamaKarari — pending/cancelled kargoya verilemez', () => {
  it.each(['pending', 'cancelled'])('%s: reddedilir (409 ORDER_NOT_SHIPPABLE)', (status) => {
    expect(kargolamaKarari({ status, shipped_at: null })).toMatchObject({
      islem: 'reddet',
      http: 409,
      kod: 'ORDER_NOT_SHIPPABLE',
    })
  })

  it('cancelled sipariş shipped_at doluyken de reddedilir (eski iptal sonrası kalıntı)', () => {
    expect(kargolamaKarari({ status: 'cancelled', shipped_at: '2026-10-01T00:00:00Z' })).toMatchObject({
      islem: 'reddet',
      kod: 'ORDER_NOT_SHIPPABLE',
    })
  })

  it.each(['confirmed', 'processing'])('%s + shipped_at boş: ilk kargo', (status) => {
    expect(kargolamaKarari({ status, shipped_at: null, payment_status: 'paid' })).toEqual({ islem: 'ilk_kargo' })
  })

  it.each(['confirmed', 'processing'])('%s + ödeme pending: ORDER_NOT_PAID (pending/cancelled kodundan ayrı)', (status) => {
    expect(kargolamaKarari({ status, shipped_at: null, payment_status: 'pending' })).toMatchObject({
      islem: 'reddet', http: 409, kod: 'ORDER_NOT_PAID',
    })
  })

  it.each(['failed', 'refunded', 'partial_refunded', null, undefined])('ödeme %s iken ilk kargo reddedilir', (odeme) => {
    expect(kargolamaKarari({ status: 'confirmed', shipped_at: null, payment_status: odeme })).toMatchObject({ kod: 'ORDER_NOT_PAID' })
  })

  it('takip güncellemesi ödeme şartına bağlı değil (zaten kargolanmış sipariş)', () => {
    expect(kargolamaKarari({ status: 'shipped', shipped_at: '2026-11-01T10:00:00Z', payment_status: 'refunded' })).toEqual({ islem: 'takip_guncelle' })
  })

  it.each(['shipped', 'delivered'])('%s: yalnız takip güncellenir, durum değişmez', (status) => {
    expect(kargolamaKarari({ status, shipped_at: '2026-11-01T10:00:00Z' })).toEqual({ islem: 'takip_guncelle' })
  })

  it('bilinmeyen durum fail-closed (409), "ilk kargo" varsayılmaz', () => {
    expect(kargolamaKarari({ status: null, shipped_at: null })).toMatchObject({ islem: 'reddet', kod: 'ORDER_STATUS_UNKNOWN' })
    expect(kargolamaKarari({ status: 'paid', shipped_at: null })).toMatchObject({ islem: 'reddet', kod: 'ORDER_STATUS_UNKNOWN' })
  })

  it('kargo kararı her zaman izin tablosuna uyar: ilk kargo yalnız izinli bir geçiş yazar', () => {
    for (const status of ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']) {
      const k = kargolamaKarari({ status, shipped_at: null, payment_status: 'paid' })
      if (k.islem === 'ilk_kargo') expect(siparisGecisiIzinliMi(status, 'shipped')).toBe(true)
    }
  })
})

describe('monotonIhlaliMi', () => {
  it('PostgREST gövdesindeki VH409 kodunu tanır', () => {
    expect(monotonIhlaliMi('{"code":"VH409","message":"ALT131_MONOTON: siparis durumu delivered -> confirmed gecisi yasak"}')).toBe(true)
  })
  it('yalnız mesaj önekini de tanır (kod alanı düşerse)', () => {
    expect(monotonIhlaliMi('ALT131_MONOTON: odeme durumu pending -> refunded gecisi yasak')).toBe(true)
  })
  it('ilgisiz hatayı tanımaz', () => {
    expect(monotonIhlaliMi('{"code":"23514","message":"violates check constraint"}')).toBe(false)
  })
})

describe('izin yardımcıları', () => {
  it('bilinmeyen değer kilitli, kalıtsal anahtar kilitli', () => {
    expect(siparisGecisiIzinliMi('constructor', 'constructor')).toBe(false)
    expect(siparisGecisiIzinliMi('paid', 'paid')).toBe(false)
    expect(odemeGecisiIzinliMi('toString', 'paid')).toBe(false)
  })
  it('aynı değer serbest', () => {
    expect(siparisGecisiIzinliMi('delivered', 'delivered')).toBe(true)
    expect(odemeGecisiIzinliMi('refunded', 'refunded')).toBe(true)
  })
})

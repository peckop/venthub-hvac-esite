import { describe, expect, it } from 'vitest'

import {
  normalizeOrderStatus,
  ORDER_STEPS,
  orderStatusBadgeClass,
  orderStatusLabelKey,
  orderStepIndex,
  shipPhase,
  shipPhaseStepIndex,
} from '../orderStatusDisplay'

describe('orderStatusDisplay (URN-1)', () => {
  it('adım çubuğu 5 adımdır ve processing "Hazırlanıyor" adımıdır', () => {
    expect(ORDER_STEPS).toEqual(['pending', 'paid', 'processing', 'shipped', 'delivered'])
    expect(orderStatusLabelKey('processing')).toBe('orders.processing')
  })

  it('processing adım çubuğunda geri düşmez (eskiden 1. adıma düşüyordu)', () => {
    expect(orderStepIndex('processing')).toBe(2)
    expect(orderStepIndex('PROCESSING')).toBe(2)
    expect(orderStepIndex('shipped')).toBe(3)
    expect(orderStepIndex('delivered')).toBe(4)
  })

  it('confirmed = paid olarak normalleşir', () => {
    expect(normalizeOrderStatus('Confirmed')).toBe('paid')
    expect(orderStepIndex('confirmed')).toBe(1)
    expect(orderStatusLabelKey('confirmed')).toBe('orders.paid')
  })

  it('bilinmeyen / boş durum ham basılmaz, nötr etiket anahtarı döner', () => {
    expect(orderStatusLabelKey('beklenmeyen_durum')).toBe('orders.statusUnknown')
    expect(orderStatusLabelKey(undefined)).toBe('orders.statusUnknown')
    expect(orderStatusLabelKey(null)).toBe('orders.statusUnknown')
    expect(orderStatusBadgeClass('beklenmeyen_durum')).toBe('bg-gray-100 text-gray-800')
  })

  it('prototip anahtarları durum diye gelirse nesne üyesi sızmaz (REC-551 ile aynı kusur sınıfı)', () => {
    for (const durum of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      expect(orderStatusLabelKey(durum)).toBe('orders.statusUnknown')
      expect(typeof orderStatusLabelKey(durum)).toBe('string')
      expect(orderStatusBadgeClass(durum)).toBe('bg-gray-100 text-gray-800')
      expect(shipPhase({ status: durum })).toBe('unknown')
    }
  })

  it('çubukta yeri olmayan durum ilk adımda kalır', () => {
    expect(orderStepIndex('cancelled')).toBe(0)
    expect(orderStepIndex('refunded')).toBe(0)
    expect(orderStepIndex('')).toBe(0)
  })

  it('processing rozetinin kendi rengi vardır', () => {
    expect(orderStatusBadgeClass('processing')).toBe('bg-amber-100 text-amber-800')
  })

  describe('shipPhase', () => {
    it('yalnız pending "ödeme bekleniyor" sayılır', () => {
      expect(shipPhase({ status: 'pending' })).toBe('awaitingPayment')
      expect(shipPhase(undefined)).toBe('awaitingPayment')
    })

    it('iptal / başarısız / iade "Ödeme Bekleniyor" DEĞİL, kapanmış sayılır', () => {
      expect(shipPhase({ status: 'cancelled' })).toBe('closed')
      expect(shipPhase({ status: 'failed' })).toBe('closed')
      expect(shipPhase({ status: 'refunded' })).toBe('closed')
      expect(shipPhase({ status: 'Cancelled' })).toBe('closed')
    })

    it('kapanmış sipariş kargo işaretinden önce gelir (iptal edilmiş sipariş "Kargoda" görünmez)', () => {
      expect(shipPhase({ status: 'cancelled', tracking_number: 'TR123' })).toBe('closed')
      expect(shipPhase({ status: 'refunded', delivered_at: '2026-10-02' })).toBe('closed')
    })

    it('kapanmış siparişin etiketi siparişin kendi durumundan gelir', () => {
      expect(orderStatusLabelKey('cancelled')).toBe('orders.cancelled')
      expect(orderStatusLabelKey('failed')).toBe('orders.failed')
      expect(orderStatusLabelKey('refunded')).toBe('orders.refunded')
    })

    it('tanınmayan / boş durum "Hazırlanıyor" göstermez, nötr evre olur', () => {
      expect(shipPhase({ status: 'rejected' })).toBe('unknown')
      expect(shipPhase({ status: '' })).toBe('unknown')
      expect(shipPhase({})).toBe('unknown')
    })

    it('ödemesi alınmış sipariş hazırlanıyor sayılır', () => {
      expect(shipPhase({ status: 'confirmed' })).toBe('preparing')
      expect(shipPhase({ status: 'paid' })).toBe('preparing')
      expect(shipPhase({ status: 'processing' })).toBe('preparing')
    })

    it('kargo işareti ödeme beklerken de önceliklidir', () => {
      expect(shipPhase({ status: 'pending', tracking_number: 'TR123' })).toBe('shipped')
      expect(shipPhase({ status: 'confirmed', shipped_at: '2026-10-01' })).toBe('shipped')
      expect(shipPhase({ status: 'shipped' })).toBe('shipped')
      expect(shipPhase({ status: 'shipped', delivered_at: '2026-10-02' })).toBe('delivered')
      expect(shipPhase({ status: 'delivered' })).toBe('delivered')
    })

    it('adım çubuğu: ödeme bekleyen, kapanmış ve tanınmayan siparişte hiçbir adım aktif değildir', () => {
      expect(shipPhaseStepIndex('awaitingPayment')).toBe(-1)
      expect(shipPhaseStepIndex('closed')).toBe(-1)
      expect(shipPhaseStepIndex('unknown')).toBe(-1)
      expect(shipPhaseStepIndex('preparing')).toBe(0)
      expect(shipPhaseStepIndex('shipped')).toBe(1)
      expect(shipPhaseStepIndex('delivered')).toBe(2)
    })
  })
})

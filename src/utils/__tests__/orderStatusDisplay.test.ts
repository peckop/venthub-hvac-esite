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

  it('çubukta yeri olmayan durum ilk adımda kalır', () => {
    expect(orderStepIndex('cancelled')).toBe(0)
    expect(orderStepIndex('refunded')).toBe(0)
    expect(orderStepIndex('')).toBe(0)
  })

  it('processing rozetinin kendi rengi vardır', () => {
    expect(orderStatusBadgeClass('processing')).toBe('bg-amber-100 text-amber-800')
  })

  describe('shipPhase', () => {
    it('ödenmemiş (pending) sipariş "hazırlanıyor" DEĞİL, ödeme bekliyor sayılır', () => {
      expect(shipPhase({ status: 'pending' })).toBe('awaitingPayment')
      expect(shipPhase({ status: 'cancelled' })).toBe('awaitingPayment')
      expect(shipPhase({ status: 'failed' })).toBe('awaitingPayment')
      expect(shipPhase(undefined)).toBe('awaitingPayment')
    })

    it('ödemesi alınmış sipariş hazırlanıyor sayılır', () => {
      expect(shipPhase({ status: 'confirmed' })).toBe('preparing')
      expect(shipPhase({ status: 'paid' })).toBe('preparing')
      expect(shipPhase({ status: 'processing' })).toBe('preparing')
    })

    it('kargo işareti her zaman önceliklidir', () => {
      expect(shipPhase({ status: 'pending', tracking_number: 'TR123' })).toBe('shipped')
      expect(shipPhase({ status: 'confirmed', shipped_at: '2026-10-01' })).toBe('shipped')
      expect(shipPhase({ status: 'shipped' })).toBe('shipped')
      expect(shipPhase({ status: 'shipped', delivered_at: '2026-10-02' })).toBe('delivered')
      expect(shipPhase({ status: 'delivered' })).toBe('delivered')
    })

    it('adım çubuğu: ödeme bekleyende hiçbir adım aktif değildir', () => {
      expect(shipPhaseStepIndex('awaitingPayment')).toBe(-1)
      expect(shipPhaseStepIndex('preparing')).toBe(0)
      expect(shipPhaseStepIndex('shipped')).toBe(1)
      expect(shipPhaseStepIndex('delivered')).toBe(2)
    })
  })
})

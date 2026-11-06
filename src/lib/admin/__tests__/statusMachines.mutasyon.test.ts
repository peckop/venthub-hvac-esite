import { describe, expect, it } from 'vitest'

import {
  isOrderDbTransitionAllowed,
  isPaymentDbTransitionAllowed,
  ORDER_DB_STATUSES,
  PAYMENT_DB_STATUSES,
} from '../orderStatusDomain'
import { allowedNextOrderStatuses, canTransitionOrder, type OrderBoardStatus } from '../orderStatusMachine'

/**
 * OPS-224 — sipariş durum makinelerinin mutasyon yoklaması.
 *
 * Mutasyon koşusu iki boşluk ölçtü:
 *
 *  · Kanban makinesinde ileri ATLAMA kilitsizdi. `statusMachines.test.ts` geri gitmeyi ve
 *    birkaç izinli geçişi kilitliyor; ama `paid → delivered` ya da `processing → delivered`
 *    eklenince paket yeşil kalıyordu. Panoda "Yeni" sütunundaki ödenmiş sipariş, kargoya
 *    hiç verilmeden "Teslim edildi"ye sürüklenebilirdi.
 *  · DB etki alanı yardımcılarında bilinmeyen kaynak ve NULL ödeme durumu yalnız tek yönden
 *    ölçülüyordu (`siparis-monoton-durum.test.ts` R3 yalnız bilinen 6×6 ve 5×5 çifti gezer).
 *
 * Aşağıdaki tablo kanban makinesinin her statü için TAM hedef listesini yazar.
 */

const KANBAN: Readonly<Record<OrderBoardStatus, readonly OrderBoardStatus[]>> = {
  pending: ['confirmed', 'cancelled', 'refunded', 'partial_refunded'],
  paid: ['confirmed', 'cancelled', 'refunded', 'partial_refunded'],
  confirmed: ['processing', 'shipped', 'cancelled', 'refunded', 'partial_refunded'],
  processing: ['shipped', 'cancelled', 'refunded', 'partial_refunded'],
  shipped: ['delivered', 'cancelled', 'refunded', 'partial_refunded'],
  delivered: ['refunded', 'partial_refunded'],
  cancelled: [],
  refunded: [],
  partial_refunded: ['refunded'],
}

describe('OPS-224 · kanban makinesi: her statünün tam hedef listesi', () => {
  it.each(Object.keys(KANBAN) as OrderBoardStatus[])('%s', (kaynak) => {
    expect([...allowedNextOrderStatuses(kaynak)].sort()).toEqual([...KANBAN[kaynak]].sort())
  })

  it('teslim edildi yalnız kargodan gelir — hiçbir aşama kargoyu atlayamaz — M1, M2', () => {
    const girenler = (Object.keys(KANBAN) as OrderBoardStatus[]).filter((k) => canTransitionOrder(k, 'delivered'))
    expect(girenler).toEqual(['shipped'])
  })

  it('kargoya yalnız onaylanmış ya da hazırlanan sipariş verilir', () => {
    const girenler = (Object.keys(KANBAN) as OrderBoardStatus[]).filter((k) => canTransitionOrder(k, 'shipped'))
    expect(girenler.sort()).toEqual(['confirmed', 'processing'])
  })

  it('`paid` hiçbir zaman hedef değildir (ödeme durumu panodan yazılmaz)', () => {
    const girenler = (Object.keys(KANBAN) as OrderBoardStatus[]).filter((k) => canTransitionOrder(k, 'paid'))
    expect(girenler).toEqual([])
  })
})

describe('OPS-224 · DB etki alanı: bilinmeyen değer ve NULL ödeme', () => {
  it('bilinmeyen sipariş durumu kendine bile geçemez (kilitli) — D1', () => {
    expect(isOrderDbTransitionAllowed('bilinmeyen', 'bilinmeyen')).toBe(false)
    expect(isOrderDbTransitionAllowed('bilinmeyen', 'cancelled')).toBe(false)
    expect(isOrderDbTransitionAllowed('pending', 'bilinmeyen')).toBe(false)
  })

  it('kanban birleşik değerleri (`paid`, `refunded`) DB sipariş durumu değildir', () => {
    expect(isOrderDbTransitionAllowed('paid', 'paid')).toBe(false)
    expect(isOrderDbTransitionAllowed('shipped', 'refunded')).toBe(false)
  })

  it('bilinmeyen ödeme durumu kendine bile geçemez (kilitli) — D2', () => {
    expect(isPaymentDbTransitionAllowed('bilinmeyen', 'bilinmeyen')).toBe(false)
    expect(isPaymentDbTransitionAllowed('bilinmeyen', 'paid')).toBe(false)
    expect(isPaymentDbTransitionAllowed('paid', 'bilinmeyen')).toBe(false)
  })

  it('NULL ödeme durumu `pending` sayılır: ödenmemişe iade yazılamaz — D3', () => {
    expect(isPaymentDbTransitionAllowed(null, 'refunded')).toBe(false)
    expect(isPaymentDbTransitionAllowed(null, 'partial_refunded')).toBe(false)
    expect(isPaymentDbTransitionAllowed(null, 'failed')).toBe(true)
    expect(isPaymentDbTransitionAllowed(null, 'pending')).toBe(true)
    expect(isPaymentDbTransitionAllowed(null, null)).toBe(true)
  })

  it('hedef NULL da `pending` sayılır: ödenmiş sipariş ödenmemişe geri sarılamaz', () => {
    expect(isPaymentDbTransitionAllowed('paid', null)).toBe(false)
    expect(isPaymentDbTransitionAllowed('refunded', null)).toBe(false)
    expect(isPaymentDbTransitionAllowed('pending', null)).toBe(true)
  })

  it('sözlüklerdeki her değer kendine geçebilir (aynı değerin yeniden yazımı serbest)', () => {
    for (const s of ORDER_DB_STATUSES) expect(isOrderDbTransitionAllowed(s, s), s).toBe(true)
    for (const s of PAYMENT_DB_STATUSES) expect(isPaymentDbTransitionAllowed(s, s), s).toBe(true)
  })
})

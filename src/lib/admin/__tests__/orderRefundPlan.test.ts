import { describe, expect, it } from 'vitest'

import { planRefundFields } from '../orderStatusDomain'

/**
 * ALT-131 — iade yazımının DB alanları (OPS kararı). Beklenen değerler elle yazıldı;
 * `planRefundFields` çıktısını yeniden hesaplamıyor.
 */
describe('planRefundFields', () => {
  it.each(['pending', 'confirmed', 'processing'])('tam iade, %s + ödenmiş → cancelled + refunded', (status) => {
    expect(planRefundFields('refunded', { status, payment_status: 'paid' })).toEqual({
      ok: true,
      status: 'cancelled',
      payment_status: 'refunded',
    })
  })

  it.each(['shipped', 'delivered', 'cancelled'])('tam iade, %s: status KORUNUR (yalnız ödeme yazılır)', (status) => {
    const plan = planRefundFields('refunded', { status, payment_status: 'paid' })
    expect(plan).toEqual({ ok: true, payment_status: 'refunded' })
  })

  it('kısmi iade durumu hiç değiştirmez', () => {
    expect(planRefundFields('partial_refunded', { status: 'confirmed', payment_status: 'paid' })).toEqual({
      ok: true,
      payment_status: 'partial_refunded',
    })
  })

  it.each([
    ['refunded', 'pending'],
    ['refunded', 'failed'],
    ['refunded', null],
    ['partial_refunded', 'pending'],
    ['partial_refunded', 'refunded'],
  ] as const)('%s yazımı, ödeme %s iken REDDEDİLİR', (kind, odeme) => {
    const plan = planRefundFields(kind, { status: 'confirmed', payment_status: odeme })
    expect(plan.ok).toBe(false)
  })

  it('kısmi iade sonrası tam iade ve aynı değerin yeniden yazımı serbest', () => {
    expect(planRefundFields('refunded', { status: 'delivered', payment_status: 'partial_refunded' }).ok).toBe(true)
    expect(planRefundFields('refunded', { status: 'delivered', payment_status: 'refunded' }).ok).toBe(true)
    expect(planRefundFields('partial_refunded', { status: 'delivered', payment_status: 'partial_refunded' }).ok).toBe(true)
  })
})

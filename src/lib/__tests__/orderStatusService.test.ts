import { beforeEach,describe, expect, it, vi } from 'vitest'

import * as audit from '../audit'
import { syncOrderFromReturn,updateOrderStatus } from '../orderStatusService'
import { supabase } from '../supabase'

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis()
    })),
    // Teslim bildirimi bu uçtan gidiyor; mock'ta yoksa cagri sessizce yutulur
    // ve "bildirim gitti mi" sorusu OLCULEMEZ hale gelir.
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) }
  }
}))

vi.mock('../audit', () => ({
  logAdminAction: vi.fn().mockResolvedValue(true)
}))

describe('orderStatusService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateOrderStatus', () => {
    it('should update order status correctly', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn((table) => {
        if (table === 'venthub_orders') return { update: mockUpdate }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await updateOrderStatus({
        orderId: 'order-1',
        newStatus: 'shipped',
        oldStatus: 'processing',
        skipReturnsSync: true
      })

      expect(result.ok).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('venthub_orders')
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'shipped' })
      expect(mockEq).toHaveBeenCalledWith('id', 'order-1')
      expect(audit.logAdminAction).toHaveBeenCalled()
    })

    it('should handle refunded status correctly', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn((table) => {
        if (table === 'venthub_orders') return { update: mockUpdate }
        if (table === 'venthub_returns') return {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                })
            }),
            insert: vi.fn().mockResolvedValue({ error: null })
        }
        if (table === 'venthub_order_items') return {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
        }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await updateOrderStatus({
        orderId: 'order-1',
        newStatus: 'refunded',
        oldStatus: 'processing'
      })

      expect(result.ok).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled', payment_status: 'refunded' })
    })

    it('should handle partial_refunded status correctly', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
        const mockFrom = vi.fn((table) => {
          if (table === 'venthub_orders') return { update: mockUpdate }
          if (table === 'venthub_returns') return {
              select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                  })
              }),
              insert: vi.fn().mockResolvedValue({ error: null })
          }
          if (table === 'venthub_order_items') return {
              select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
              })
          }
          return {}
        })
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await updateOrderStatus({
          orderId: 'order-1',
          newStatus: 'partial_refunded',
          oldStatus: 'processing'
        })

        expect(result.ok).toBe(true)
        expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled', payment_status: 'partial_refunded' })
      })

      it('should handle unknown status by defaulting to cancelled', async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null })
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
        const mockFrom = vi.fn((table) => {
          if (table === 'venthub_orders') return { update: mockUpdate }
          return {}
        })
        ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

        const result = await updateOrderStatus({
          orderId: 'order-1',
          newStatus: 'unknown_status_xyz',
          oldStatus: 'processing',
          skipReturnsSync: true
        })

        expect(result.ok).toBe(true)
        expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' })
      })

    it('should return error if update fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: new Error('Update failed') })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn((table) => {
        if (table === 'venthub_orders') return { update: mockUpdate }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await updateOrderStatus({
        orderId: 'order-1',
        newStatus: 'shipped',
        skipReturnsSync: true
      })

      expect(result.ok).toBe(false)
      expect(result.error).toContain('Sipariş güncellenemedi: Update failed')
    })
  })

  describe('syncOrderFromReturn', () => {
    it('should map return status to order status correctly', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn((table) => {
        if (table === 'venthub_orders') return { update: mockUpdate }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await syncOrderFromReturn('order-1', 'refunded')

      expect(result.ok).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled', payment_status: 'refunded' })
    })

    it('should do nothing for unknown return status', async () => {
      const result = await syncOrderFromReturn('order-1', 'unknown')
      expect(result.ok).toBe(true)
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('should return error if update fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: new Error('Update failed') })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn((table) => {
        if (table === 'venthub_orders') return { update: mockUpdate }
        return {}
      })
      ;(supabase.from as import("vitest").Mock).mockImplementation(mockFrom)

      const result = await syncOrderFromReturn('order-1', 'approved')

      expect(result.ok).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})

/**
 * T058-VH — teslim zinciri.
 *
 * Denetimde ölçülen durum: `delivered_at` HİÇBİR yoldan yazılmıyordu. Tek yazıcısı
 * `shipping-webhook`'tu ve o webhook'un çağıranı yok (taşıyıcı entegrasyonu
 * kurulmamış) → sütun tüm siparişlerde NULL, teslim e-postası hiç gitmiyor.
 */
describe('updateOrderStatus — teslim damgası ve bildirimi (T058-VH)', () => {
  // Bu blok üstteki `describe`in KARDEŞİ; oradaki `beforeEach` buraya İŞLEMEZ.
  // Olmadığında `invoke` sayacı önceki testlerden devrediyor ve "çağrılmadı"
  // assert'leri yanlış KIRMIZI veriyordu.
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockDelivered(stampedRows: Array<{ id: string }>) {
    const select = vi.fn().mockResolvedValue({ data: stampedRows, error: null })
    const is = vi.fn().mockReturnValue({ select })
    const eqStamp = vi.fn().mockReturnValue({ is })
    const eqAlign = vi.fn().mockResolvedValue({ error: null })
    const update = vi
      .fn()
      .mockReturnValueOnce({ eq: eqStamp })
      .mockReturnValue({ eq: eqAlign })
    ;(supabase.from as import('vitest').Mock).mockImplementation((table: string) =>
      table === 'venthub_orders' ? { update } : {},
    )
    return { update, is, eqAlign }
  }

  it('teslim işaretlenince `delivered_at` YAZILIR', async () => {
    const { update } = mockDelivered([{ id: 'order-1' }])

    const result = await updateOrderStatus({
      orderId: 'order-1',
      newStatus: 'delivered',
      oldStatus: 'shipped',
      skipReturnsSync: true,
    })

    expect(result.ok).toBe(true)
    const payload = update.mock.calls[0][0] as Record<string, unknown>
    expect(payload.status).toBe('delivered')
    // Eski kodda bu alan HİÇ yazılmıyordu; bu assert o hâlde KIRMIZI verir.
    expect(typeof payload.delivered_at).toBe('string')
  })

  it('damga yalnız `delivered_at` NULL iken atılır (idempotent)', async () => {
    const { is } = mockDelivered([{ id: 'order-1' }])
    await updateOrderStatus({
      orderId: 'order-1', newStatus: 'delivered', oldStatus: 'shipped', skipReturnsSync: true,
    })
    // Koşul olmasaydı ileri-geri sürükleme ilk teslim anını EZERDİ.
    expect(is).toHaveBeenCalledWith('delivered_at', null)
  })

  it('ilk teslimde bildirim gönderilir', async () => {
    mockDelivered([{ id: 'order-1' }])
    await updateOrderStatus({
      orderId: 'order-1', newStatus: 'delivered', oldStatus: 'shipped', skipReturnsSync: true,
    })
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delivery-notification', {
      body: { order_id: 'order-1' },
    })
  })

  it('ZATEN teslim edilmişse bildirim TEKRAR gönderilmez', async () => {
    // Damga varsa güncelleme 0 satır döner → panoda ileri-geri sürükleyen admin
    // müşteriye tekrar tekrar "teslim edildi" e-postası göndermemeli.
    const { eqAlign } = mockDelivered([])
    const result = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'delivered', oldStatus: 'shipped', skipReturnsSync: true,
    })
    expect(result.ok).toBe(true)
    expect(eqAlign).toHaveBeenCalledWith('id', 'order-1')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('teslim DIŞI geçişlerde damga da bildirim de yok', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as import('vitest').Mock).mockImplementation((table: string) =>
      table === 'venthub_orders' ? { update } : {},
    )

    await updateOrderStatus({
      orderId: 'order-2', newStatus: 'shipped', oldStatus: 'processing', skipReturnsSync: true,
    })

    expect(update).toHaveBeenCalledWith({ status: 'shipped' })
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })
})

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
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
    // Stok geri verme tek bu uçtan gidiyor (T052-VH).
    rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
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

      /*
        SÖZLEŞME DEĞİŞTİ (2026-08-15, T058-VH). Eski davranış: BİLİNMEYEN her statü
        sessizce `cancelled` olarak yazılıyordu ("güvenli varsayılan"). Bu güvenli
        değil TEHLİKELİYDİ: tek bir yazım hatası ya da yeni bir statü adı, müşterinin
        siparişini hiçbir uyarı vermeden İPTAL EDERDİ. Monotonluk kapısı artık
        bilinmeyen hedefi reddediyor; yazma hiç denenmiyor.
      */
      it('bilinmeyen statü REDDEDİLİR — sessizce iptale çevrilmez', async () => {
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

        expect(result.ok).toBe(false)
        expect(mockUpdate).not.toHaveBeenCalled()
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

describe('updateOrderStatus — monotonluk kapısı SERVİSTE (T058-VH)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('geriye geçiş REDDEDİLİR ve veritabanına hiç dokunulmaz', async () => {
    const update = vi.fn()
    ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({ update }))

    const result = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'pending', oldStatus: 'delivered', skipReturnsSync: true,
    })

    expect(result.ok).toBe(false)
    // Kritik: yalnız "hata döndü" yetmez — YAZMA HİÇ DENENMEMELİ.
    expect(update).not.toHaveBeenCalled()
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('iptal edilmiş sipariş yeniden hazırlığa alınamaz', async () => {
    const update = vi.fn()
    ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({ update }))
    const result = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'processing', oldStatus: 'cancelled', skipReturnsSync: true,
    })
    expect(result.ok).toBe(false)
    expect(update).not.toHaveBeenCalled()
  })

  it('`oldStatus` yoksa kapı uygulanmaz (senkronizasyon yolu)', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({ update }))
    const result = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'cancelled', skipReturnsSync: true,
    })
    expect(result.ok).toBe(true)
    expect(update).toHaveBeenCalled()
  })
})

/**
 * T052-VH — stok geri verme artık KANITA BAĞLI tek RPC ile.
 *
 * Eski gövde sipariş KALEMLERİNE bakıp `quantity` kadar stok EKLİYORDU: "sipariş ne
 * kadardı" sorusunun cevabını geri veriyordu, "stoktan ne kadar düşüldü" sorusunun
 * değil. Satışta stok hiç düşmediği için her iptal saf HAYALİ STOK üretiyordu.
 */
describe('restoreStockForOrder — kanıta bağlı RPC (T052-VH)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockOrderUpdate() {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as import('vitest').Mock).mockImplementation(() => ({
      update,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }))
    return update
  }

  it('iptalde RPC `order_cancel` sebebiyle çağrılır', async () => {
    mockOrderUpdate()
    ;(supabase.rpc as import('vitest').Mock).mockResolvedValue({
      data: { success: true, restored_count: 2 }, error: null,
    })

    const res = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'cancelled', oldStatus: 'processing',
    })

    expect(res.ok).toBe(true)
    expect(res.warning).toBeUndefined()
    expect(supabase.rpc).toHaveBeenCalledWith('process_order_stock_restore', {
      p_order_id: 'order-1', p_reason: 'order_cancel',
    })
    // Eski gövde ürün tablosuna ELLE yazıyordu; artık tek yazıcı RPC'dir.
    expect(supabase.from).not.toHaveBeenCalledWith('venthub_order_items')
  })

  it('iadede sebep `order_refund` olur', async () => {
    mockOrderUpdate()
    ;(supabase.rpc as import('vitest').Mock).mockResolvedValue({ data: { success: true }, error: null })

    await updateOrderStatus({ orderId: 'order-1', newStatus: 'refunded', oldStatus: 'shipped' })

    expect(supabase.rpc).toHaveBeenCalledWith('process_order_stock_restore', {
      p_order_id: 'order-1', p_reason: 'order_refund',
    })
  })

  it('`success:false` BAŞARI SAYILMAZ — HTTP 200 tek başına yeterli değil', async () => {
    // T052'nin kök sebeplerinden biri buydu: dönüş zarfı okunmadan "oldu" varsayılıyordu.
    mockOrderUpdate()
    ;(supabase.rpc as import('vitest').Mock).mockResolvedValue({
      data: { success: false, error: 'Order not found' }, error: null,
    })

    const res = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'cancelled', oldStatus: 'processing',
    })

    // Statü değişti (sipariş gerçekten iptal edildi) AMA uyarı taşınıyor.
    expect(res.ok).toBe(true)
    expect(res.warning).toBe('Order not found')
  })

  it('RPC hatası sessizce YUTULMAZ, uyarı olarak taşınır', async () => {
    mockOrderUpdate()
    ;(supabase.rpc as import('vitest').Mock).mockResolvedValue({
      data: null, error: { message: 'not authorized' },
    })

    const res = await updateOrderStatus({
      orderId: 'order-1', newStatus: 'cancelled', oldStatus: 'processing',
    })

    expect(res.ok).toBe(true)
    expect(res.warning).toBe('not authorized')
  })

  it('zaten iptal/iade olmuş siparişte stok geri verme TEKRAR denenmez', async () => {
    mockOrderUpdate()
    ;(supabase.rpc as import('vitest').Mock).mockResolvedValue({ data: { success: true }, error: null })

    await updateOrderStatus({ orderId: 'order-1', newStatus: 'refunded', oldStatus: 'cancelled' })

    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})

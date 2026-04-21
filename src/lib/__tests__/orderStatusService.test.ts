import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateOrderStatus, syncOrderFromReturn } from '../orderStatusService'
import { supabase } from '../supabase'
import * as audit from '../audit'

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis()
    }))
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

import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import PaymentWatcher from '../PaymentWatcher'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/some/path'
}))

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn()
}

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('PaymentWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does nothing if STORAGE_KEY is not set', () => {
    render(<PaymentWatcher />)
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('checks and pushes to success when order is paid', async () => {
    const orderId = '123'
    localStorage.setItem('vh_pending_order', JSON.stringify({ orderId }))

    mockSupabase.maybeSingle.mockResolvedValue({ data: { status: 'paid' }, error: null })

    render(<PaymentWatcher />)

    // trigger check
    await vi.runOnlyPendingTimersAsync()

    expect(mockSupabase.from).toHaveBeenCalledWith('venthub_orders')
    expect(mockPush).toHaveBeenCalledWith(`/payment-success?orderId=${orderId}&status=success`)
    expect(localStorage.getItem('vh_pending_order')).toBeNull()
  })

  it('checks and pushes to failure when order is failed', async () => {
    const orderId = '456'
    localStorage.setItem('vh_pending_order', JSON.stringify({ orderId }))

    mockSupabase.maybeSingle.mockResolvedValue({ data: { status: 'failed' }, error: null })

    render(<PaymentWatcher />)

    // trigger check
    await vi.runOnlyPendingTimersAsync()

    expect(mockSupabase.from).toHaveBeenCalledWith('venthub_orders')
    expect(mockPush).toHaveBeenCalledWith(`/payment-success?orderId=${orderId}&status=failure`)
    expect(localStorage.getItem('vh_pending_order')).toBeNull()
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import CommandPalette from '../CommandPalette'

// Hoisted mocks for database responses
const mockDb = vi.hoisted(() => {
  const ordersData = [{ id: 'order-1', order_number: 'ORD-123', customer_name: 'Alize', customer_email: 'alize@test.com' }]
  const returnsData = [{ id: 'return-1', reason: 'Defective item', status: 'requested', venthub_orders: { order_number: 'ORD-123' } }]
  const categoriesData = [{ id: 'cat-1', name: 'Cooling Fans', slug: 'cooling-fans', description: 'Industrial cooling fans' }]
  const usersData = [{ id: 'user-1', full_name: 'John Doe', phone: '555-1234', role: 'admin' }]
  const couponsData = [{ id: 'coupon-1', code: 'WINTER20', discount_type: 'percent', discount_value: 20 }]
  const movementsData = [{ id: 'mov-1', reason: 'Stock entry', delta: 50, products: { name: 'Fan Coil unit', sku: 'FC-100' } }]
  const errorGroupsData = [{ id: 'err-1', signature: 'TypeError: undefined', last_message: 'Cannot read property id', status: 'unresolved' }]
  const auditData = [{ id: 'audit-1', table_name: 'products', row_pk: 'prod-1', comment: 'Created product', action: 'INSERT' }]
  const inventoryData = [{ product_id: 'prod-1', name: 'Centrifugal Fan', physical_stock: 10, available_stock: 8, warehouse_location: 'A-3', supplier_name: 'AirCorp' }]

  const mockSupabase = {
    from: vi.fn((table) => {
      let mockData: object[] = []
      if (table === 'view_admin_orders') mockData = ordersData
      if (table === 'venthub_returns') mockData = returnsData
      if (table === 'categories') mockData = categoriesData
      if (table === 'user_profiles') mockData = usersData
      if (table === 'coupons') mockData = couponsData
      if (table === 'inventory_movements') mockData = movementsData
      if (table === 'error_groups') mockData = errorGroupsData
      if (table === 'admin_audit_log') mockData = auditData
      if (table === 'inventory_velocity') mockData = inventoryData

      const chain = {
        select: vi.fn().mockImplementation(() => chain),
        or: vi.fn().mockImplementation(() => chain),
        limit: vi.fn().mockImplementation(() => Promise.resolve({ data: mockData, error: null }))
      }
      return chain
    })
  }

  return { mockSupabase }
})

// Mock all external modules
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: mockDb.mockSupabase }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))

vi.mock('@/lib/services/product.service', () => ({
  adminSearchProducts: vi.fn().mockResolvedValue([
    { id: 'prod-1', name: 'Axial Fan', sku: 'AX-200' }
  ])
}))

const mockCanAccess = vi.fn().mockReturnValue(true)
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    canAccess: mockCanAccess,
    loading: false,
    role: 'admin'
  })
}))

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string, options?: { term?: string }) => {
      if (options && options.term) return `No results found for "${options.term}".`
      return key
    },
    lang: 'tr'
  })
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin'
}))

describe('CommandPalette — federated search, RBAC, keyboard & a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCanAccess.mockReturnValue(true)
  })

  it('ctrl+k ile acilir ve bos aramada yalniz yetkili nav ogelerini listeler', async () => {
    render(<CommandPalette />)
    expect(screen.queryByRole('dialog')).toBeNull()

    // Open palette
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Initially lists accessible menu keys
    expect(screen.getByText('admin.menu.orders')).toBeInTheDocument()
    expect(screen.getByText('admin.menu.products')).toBeInTheDocument()
    expect(screen.getByText('admin.menu.inventory')).toBeInTheDocument()
  })

  it('RBAC path filter yetkisiz menuleri gizler', async () => {
    // Mock user having access to orders but not inventory or users
    mockCanAccess.mockImplementation((path) => {
      return path.includes('orders') || path === '/admin'
    })

    render(<CommandPalette />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    expect(screen.getByText('admin.menu.orders')).toBeInTheDocument()
    expect(screen.queryByText('admin.menu.inventory')).toBeNull()
    expect(screen.queryByText('admin.menu.users')).toBeNull()
  })

  it('paralel federe arama calistirir ve sonuclari gruplar', async () => {
    vi.useFakeTimers()
    render(<CommandPalette />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'fan' } })

    // Fast-forward debounce
    vi.advanceTimersByTime(300)
    vi.useRealTimers()

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Axial Fan')).toBeInTheDocument()
      expect(screen.getByText('ORD-123')).toBeInTheDocument()
      expect(screen.getByText('Cooling Fans')).toBeInTheDocument()
      expect(screen.getByText('Centrifugal Fan')).toBeInTheDocument()
    })
  })

  it('klavye navigasyonu ve secim mantigi calisir', async () => {
    vi.useFakeTimers()
    render(<CommandPalette />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'fan' } })

    vi.advanceTimersByTime(300)
    vi.useRealTimers()

    await waitFor(() => {
      expect(screen.getByText('Axial Fan')).toBeInTheDocument()
    })

    // Key Down to navigate to the first element and press Enter
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockPush).toHaveBeenCalled()
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<CommandPalette />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

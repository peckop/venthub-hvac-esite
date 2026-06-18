import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchInboxCounts } from '@/lib/admin/inboxCounts'
import { testA11y } from '@/utils/testA11y'

import AdminRealtimeNotifications from '../AdminRealtimeNotifications'

// Mock Supabase Client and bound mock values using vi.hoisted
const { mockSupabase, mockCanWrite } = vi.hoisted(() => {
  return {
    mockSupabase: {
      from: vi.fn(),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      })),
      removeChannel: vi.fn()
    },
    mockCanWrite: vi.fn().mockReturnValue(true)
  }
})

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: mockSupabase
}))

// Mock fetchInboxCounts service
vi.mock('@/lib/admin/inboxCounts', () => ({
  fetchInboxCounts: vi.fn().mockResolvedValue({
    pendingReturnsCount: 3,
    pendingShipmentsCount: 5,
    lowStockAlarmsCount: 2,
    unresolvedErrorsCount: 4
  })
}))

// Mock useRole hook
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    canWrite: mockCanWrite,
    loading: false,
    role: 'admin'
  })
}))

// Mock useI18n hook
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    lang: 'tr'
  })
}))

// Mock useRouter hook
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin'
}))

// Mock useTenant hook
vi.mock('@/hooks/useTenant', () => ({
  useTenant: () => ({
    id: 'test-tenant'
  })
}))

describe('AdminRealtimeNotifications — Inbox Counts, RBAC, and a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCanWrite.mockReturnValue(true)
    
    // Default Supabase mock responses for recent activity
    mockSupabase.from.mockImplementation((_table) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      }
      return chain
    })
  })

  it('renders zil/bell button and starts with dropdown closed', () => {
    render(<AdminRealtimeNotifications />)
    const button = screen.getByRole('button', { name: /admin.dashboard.notificationCenter/i })
    expect(button).toBeInTheDocument()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens dropdown on click, fetches attention items, and shows them if count > 0', async () => {
    render(<AdminRealtimeNotifications />)
    const button = screen.getByRole('button', { name: /admin.dashboard.notificationCenter/i })
    
    fireEvent.click(button)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(fetchInboxCounts).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByText('admin.dashboard.inbox.title')).toBeInTheDocument()
      expect(screen.getByText('admin.dashboard.inbox.pendingReturns')).toBeInTheDocument()
      expect(screen.getByText('admin.dashboard.inbox.pendingShipments')).toBeInTheDocument()
      expect(screen.getByText('admin.dashboard.inbox.lowStock')).toBeInTheDocument()
      expect(screen.getByText('admin.dashboard.inbox.unresolvedErrors')).toBeInTheDocument()
    })
  })

  it('applies RBAC filter correctly — sales role does not see unresolved errors', async () => {
    // Mock canWrite to simulate sales role: has access to orders/returns but not inventory or errors
    mockCanWrite.mockImplementation((entity: string) => {
      return ['orders', 'returns'].includes(entity)
    })

    render(<AdminRealtimeNotifications />)
    const button = screen.getByRole('button', { name: /admin.dashboard.notificationCenter/i })
    
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('admin.dashboard.inbox.pendingReturns')).toBeInTheDocument()
      expect(screen.getByText('admin.dashboard.inbox.pendingShipments')).toBeInTheDocument()
      expect(screen.queryByText('admin.dashboard.inbox.lowStock')).toBeNull()
      expect(screen.queryByText('admin.dashboard.inbox.unresolvedErrors')).toBeNull()
    })
  })

  it('closes dropdown when Escape key is pressed', async () => {
    render(<AdminRealtimeNotifications />)
    const button = screen.getByRole('button', { name: /admin.dashboard.notificationCenter/i })
    
    fireEvent.click(button)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('passes basic accessibility audit (axe check = 0)', async () => {
    const { container } = render(<AdminRealtimeNotifications />)
    const button = screen.getByRole('button', { name: /admin.dashboard.notificationCenter/i })
    
    // Open dropdown to render menu items for axe check
    fireEvent.click(button)
    
    await testA11y(container)
  })
})

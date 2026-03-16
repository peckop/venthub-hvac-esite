import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AccountReturnsPage from '../AccountReturnsPage'
import { supabase } from '../../../lib/supabase'

// Mocks
const mockNavigate = vi.fn()
const mockReplace = vi.fn()
const mockUser = { id: 'u1' }
const mockAuth = { user: mockUser, loading: false }
const mockI18n = { t: (k: string) => k, lang: 'tr' }
const mockSearchParamsObj = {
  get: vi.fn().mockImplementation((key: string) => key === 'new' ? 'ord1' : null)
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockNavigate,
    replace: mockReplace,
    prefetch: vi.fn()
  }),
  usePathname: () => '/account/returns',
  useSearchParams: () => mockSearchParamsObj
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockAuth
}))

vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => mockI18n
}))

const mockedSupabase = vi.mocked(supabase)
mockedSupabase.from.mockImplementation((table: string) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback) => {
      if (table === 'venthub_returns') return callback({ data: [], error: null })
      if (table === 'venthub_orders') return callback({ data: [{ id: 'ord1', order_number: 'VH-76543210', created_at: new Date().toISOString() }], error: null })
      return callback({ data: [], error: null })
    })
  }
  return chain as any
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('AccountReturnsPage modal', () => {
  it('?new= parametresiyle açılır ve dışına tıklayınca kapanır', async () => {
    const { container } = render(<AccountReturnsPage />)

    // Modal başlığı (heading) görünmeli
    const modalHeading = await screen.findByRole('heading', { name: /returns\.new/i })
    expect(modalHeading).toBeInTheDocument()

    // Overlay'i seç ve tıkla. Modal dışı alan backdrop-blur-sm içeren div'dir.
    const overlay = container.querySelector('.backdrop-blur-sm') as HTMLElement
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay)

    await waitFor(() => {
      // Modal başlığının (heading) gitmesini bekliyoruz, tetikleyici butonun değil.
      expect(screen.queryByRole('heading', { name: /returns\.new/i })).not.toBeInTheDocument()
    })
  })
})

// @vitest-environment happy-dom
import React from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import CheckoutPage from '@/pages/CheckoutPage'
import { I18nProvider } from '@/i18n/I18nProvider'
import { MemoryRouter } from 'react-router-dom'

vi.mock('lucide-react', () => ({ ArrowLeft: () => null, CreditCard: () => null, MapPin: () => null, User: () => null, Lock: () => null, CheckCircle: () => null }))
vi.mock('@/components/SecurityRibbon', () => ({ default: () => null }))
vi.mock('react-hot-toast', () => ({ default: Object.assign(() => {}, { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() }) }))

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' }, loading: false }) }))
vi.mock('@/hooks/useCartHook', () => ({ useCart: () => ({ items: [], getCartTotal: () => 0, clearCart: vi.fn() }) }))

afterEach(() => cleanup())

describe('CheckoutPage - boş sepet koruması', () => {
  it('Sepet boşsa uyarı ekranı gösterir', () => {
    window.localStorage.setItem('lang', 'tr')
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={[{ pathname: '/checkout' }]}>
          <CheckoutPage />
        </MemoryRouter>
      </I18nProvider>
    )
    expect(screen.getByText('Sepetiniz Boş')).toBeInTheDocument()
    expect(screen.getByText('Alışverişe Başla')).toBeInTheDocument()
  })
})


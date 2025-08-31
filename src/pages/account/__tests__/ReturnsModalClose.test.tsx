import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AccountReturnsPage from '../AccountReturnsPage'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mocks
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false })
}))

vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => ({
      'returns.title': 'İadeler',
      'returns.new': 'Yeni İade',
      'returns.selectOrder': 'Sipariş seçin',
      'returns.reason': 'İade Nedeni',
      'returns.selectReason': 'Neden seçin',
      'returns.description': 'Açıklama',
      'returns.descriptionPh': 'Detayları yazın',
      'returns.submit': 'Gönder',
      'returns.empty': 'Kayıt yok',
      'returns.fetchError': 'İadeler alınamadı',
      'returns.createdToast': 'İade oluşturuldu',
      'returns.createError': 'İade hatası',
      'returns.order': 'Sipariş',
      'common.cancel': 'İptal'
    } as Record<string,string>)[k] || k
  })
}))

function selectResult(data: unknown) {
  return Promise.resolve({ data, error: null })
}

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'venthub_returns') {
        return {
          select: () => ({ order: () => selectResult([]) }),
          insert: () => selectResult(null),
        }
      }
      if (table === 'venthub_orders') {
        return {
          select: () => ({
            eq: () => ({ order: () => selectResult([{ id: 'ord1', order_number: 'VH-76543210', created_at: new Date().toISOString() }]) })
          })
        }
      }
      return { select: () => ({}) }
    }
  }
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe.skip('AccountReturnsPage modal', () => {
  it('?new= parametresiyle açılır ve dışına tıklayınca kapanır', async () => {
    const { container } = render(
<MemoryRouter initialEntries={[ '/account/returns?new=ord1' ]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/account/returns" element={<AccountReturnsPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Modal başlığı (heading) görünmeli
    expect(await screen.findByRole('heading', { name: 'Yeni İade' })).toBeInTheDocument()

    // Overlay'i seç ve tıkla
    const overlay = container.querySelector('div.fixed.inset-0.z-50') as HTMLElement
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay)

    await waitFor(() => {
      expect(screen.queryByText('Yeni İade')).not.toBeInTheDocument()
    })
  })
})


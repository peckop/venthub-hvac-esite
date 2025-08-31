import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'u@u.com', user_metadata: {} }, loading: false })
}))

vi.mock('../../hooks/useCartHook', () => ({
  useCart: () => ({ addToCart: vi.fn() })
}))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string, _?: Record<string, unknown>) => ({
      'orders.title': 'Siparişler',
      'orders.subtitle': 'Geçmiş siparişleriniz',
      'orders.status': 'Durum',
      'orders.all': 'Tümü',
      'orders.pending': 'Beklemede',
      'orders.paid': 'Ödendi',
      'orders.shipped': 'Kargolandı',
      'orders.delivered': 'Teslim Edildi',
      'orders.failed': 'Başarısız',
      'orders.startDate': 'Başlangıç',
      'orders.endDate': 'Bitiş',
      'orders.orderCode': 'Sipariş No (son 8)',
      'orders.orderCodePlaceholder': 'örn: ABC12345',
      'orders.product': 'Ürün',
      'orders.productSearchPlaceholder': 'Ürün adı',
      'orders.clearFilters': 'Filtreleri temizle',
      'orders.noOrdersTitle': 'Sipariş yok',
      'orders.noOrdersDesc': 'Henüz sipariş oluşturmadınız',
      'orders.exploreProducts': 'Ürünleri keşfet',
      'orders.details': 'Detaylar',
      'orders.fetchError': 'Siparişler alınamadı',
      'orders.unexpectedError': 'Beklenmeyen hata',
      'orders.reorderedToast': 'Sepete eklendi',
      'orders.reorderNotFound': 'Ürün bulunamadı',
      'orders.reorderError': 'Tekrar sipariş hatası',
    } as Record<string,string>)[k] || k
  })
}))

// Minimal Supabase mock
const ordersRow = {
  id: 'ord_1234567890',
  total_amount: 1234.5,
  status: 'paid',
  created_at: new Date().toISOString(),
  customer_name: 'Ali',
  customer_email: 'ali@example.com',
  shipping_address: { fullAddress: 'Adres' },
  order_number: 'VH-12345678',
  conversation_id: null,
  carrier: null,
  tracking_number: null,
  tracking_url: null,
  shipped_at: null,
  delivered_at: null,
  venthub_order_items: [
    { id: 'oi1', product_id: 'p1', product_name: 'Ürün 1', quantity: 2, price_at_time: 100, product_image_url: null }
  ]
}

function chainResult(data: unknown) {
  return {
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [data], error: null })
      })
    })
  }
}

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'venthub_orders') return chainResult(ordersRow)
      if (table === 'products') {
        return {
          select: () => ({ in: () => Promise.resolve({ data: [], error: null }) })
        }
      }
      return chainResult([])
    }
  }
}))

// Import component AFTER mocks are set up
import OrdersPage from '../OrdersPage'

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="loc-path">{loc.pathname}</div>
}

describe.skip('OrdersPage', () => {
  it('Detaylar butonuna tıklayınca order detail sayfasına yönlendirir', async () => {
    render(
<MemoryRouter initialEntries={[ '/account/orders' ]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/account/orders" element={<><LocationProbe /><OrdersPage /></>} />
          <Route path="/account/orders/:id" element={<><LocationProbe /><div data-testid="detail">Detay sayfası</div></>} />
        </Routes>
      </MemoryRouter>
    )

    // Liste yüklenene kadar "Detaylar" butonunu bekle
    const detailsBtn = await screen.findByRole('button', { name: /Detaylar/i }, { timeout: 5000 })
    const user = userEvent.setup()
    await user.click(detailsBtn)

    await waitFor(() => {
      expect(screen.getByTestId('loc-path').textContent).toMatch(/^\/account\/orders\//)
      expect(screen.getByTestId('detail')).toBeInTheDocument()
    })
  })
})


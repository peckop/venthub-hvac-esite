import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'u@u.com', user_metadata: {} }, loading: false })
}))

vi.mock('../../../hooks/useCartHook', () => ({
  useCart: () => ({ addToCart: vi.fn() })
}))

vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => ({
      'auth.back': 'Geri',
      'orders.title': 'Sipariş',
      'orders.pending': 'Beklemede',
      'orders.paid': 'Ödendi',
      'orders.shipped': 'Kargolandı',
      'orders.delivered': 'Teslim Edildi',
      'orders.tabs.overview': 'Özet',
      'orders.tabs.items': 'Ürünler',
      'orders.tabs.shipping': 'Kargo Takibi',
      'orders.tabs.invoice': 'Fatura',
      'orders.customerInfo': 'Müşteri Bilgileri',
      'orders.deliveryAddress': 'Teslimat Adresi',
      'orders.orderInfo': 'Sipariş Bilgileri',
      'orders.productCol': 'Ürün',
      'orders.imageCol': 'Görsel',
      'orders.qtyCol': 'Adet',
      'orders.unitPriceCol': 'Birim Fiyat',
      'orders.totalCol': 'Toplam',
      'orders.grandTotal': 'Genel Toplam',
      'orders.carrier': 'Kargo',
      'orders.trackingNumber': 'Takip No',
      'orders.trackingLink': 'Takip Linki',
      'orders.openLink': 'Bağlantıyı aç',
      'orders.shippedAt': 'Kargoya Veriliş',
      'orders.deliveredAt': 'Teslimat',
      'orders.invoicePdf': 'PDF indir',
      'orders.reorder': 'Tekrar Sipariş',
      'orders.unexpectedError': 'Beklenmeyen hata',
      'orders.copy': 'Kopyala',
      'orders.copied': 'Kopyalandı',
      'orders.copyFailed': 'Kopyalanamadı'
    } as Record<string,string>)[k] || k
  })
}))

const orderRow = {
  id: 'ord1',
  total_amount: 250,
  status: 'shipped',
  created_at: new Date().toISOString(),
  customer_name: 'Ayşe',
  customer_email: 'ayse@example.com',
  shipping_address: { fullAddress: 'Adres 1', city: 'İstanbul', district: 'Kadıköy' },
  order_number: 'VH-55554444',
  conversation_id: 'conv_1',
  carrier: 'Yurtiçi',
  tracking_number: 'TRK123',
  tracking_url: 'https://kargo.example.com/track/TRK123',
  shipped_at: new Date().toISOString(),
  delivered_at: null,
  venthub_order_items: [
    { id: 'oi1', product_id: null, product_name: 'Kanal', quantity: 1, price_at_time: 250, product_image_url: null }
  ]
}

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'venthub_orders') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => ({ single: () => Promise.resolve({ data: orderRow, error: null }) })
            })
          })
        }
      }
      if (table === 'products') {
        return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) }
      }
      return { select: () => ({}) } as any
    }
  }
}))
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'venthub_orders') {
        return {
          select: () => ({
            eq: () => ({
              limit: () => ({ single: () => Promise.resolve({ data: orderRow, error: null }) })
            })
          })
        }
      }
      if (table === 'products') {
        return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) }
      }
      return { select: () => ({}) } as any
    }
  }
}))

beforeEach(() => { mockNavigate.mockReset() })

// Import component AFTER mocks
import OrderDetailPage from '../OrderDetailPage'

describe.skip('OrderDetailPage', () => {
  it('Sekme geçişi çalışır ve tracking link görünür', async () => {
    render(
<MemoryRouter initialEntries={[ '/account/orders/ord1' ]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Özet sekmesi görünene kadar bekle (sayfa yüklendi işareti)
    await screen.findByRole('button', { name: 'Özet' }, { timeout: 5000 } as any)

    // Kargo Takibi sekmesine geçiş
    const shippingTab = screen.getByRole('button', { name: 'Kargo Takibi' })
    fireEvent.click(shippingTab)

    // Link görünmeli
    const link = await screen.findByRole('link', { name: /Bağlantıyı aç/i })
    expect(link).toHaveAttribute('href', 'https://kargo.example.com/track/TRK123')
  })
})


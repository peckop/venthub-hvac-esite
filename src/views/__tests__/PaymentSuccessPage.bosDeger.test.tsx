/**
 * URN-84 — ödeme başarı ekranında, metni sözlükte BOŞ ('') bırakılan güven rozeti yarım (yalnız kalkan simgesi)
 * çizilmez.
 *
 * NİÇİN: `payment.securedBy3d` tabloda BOŞ (rozet başarı ekranında koşulsuz basılıyordu, 3D Secure'un o ödemede
 * uygulandığını gösteren veri okunmuyor). Kalkan olan şey metinle birlikte rozetin kendisidir.
 */
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const durum = vi.hoisted(() => ({ rozet: '' }))
const sorguParams = new URLSearchParams({ status: 'success', orderId: 'ord-1' })

vi.mock('next/navigation', () => ({
  useSearchParams: () => sorguParams,
}))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'tr',
    t: (k: string) =>
      k === 'payment.securedBy3d'
        ? durum.rozet
        : ({ 'payment.orderCompletedTitle': 'Siparişiniz Tamamlandı' } as Record<string, string>)[k] || k,
  }),
}))

vi.mock('../../hooks/useCartHook', () => ({
  useCart: () => ({ clearCart: vi.fn() }),
}))

vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({
    home: () => '/tr',
    account: { orders: () => '/tr/hesabim/siparisler', orderDetail: (id: string) => `/tr/hesabim/siparisler/${id}` },
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {
    functions: { invoke: vi.fn() },
    from: vi.fn(() => ({
      // URN-83: başarı ekranı yalnız veritabanında ÖDENMİŞ görünen siparişte çıkar; bu test rozeti ölçtüğü için
      // sipariş ödenmiş döner (yoksa doğrulama başarısız sayılır, "kontrol ediliyor" ekranı çıkar ve rozet hiç çizilmez).
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: { status: 'confirmed', payment_status: 'paid' }, error: null })),
        })),
      })),
    })),
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/errorReporter', () => ({ reportError: vi.fn() }))

import PaymentSuccessPage from '../PaymentSuccessPage'

afterEach(() => {
  durum.rozet = ''
})

describe('PaymentSuccessPage — boş güven rozeti çizilmez', () => {
  it('metin boşken kalkan simgesi de çizilmez (yarım rozet yok)', async () => {
    durum.rozet = ''
    const { container } = render(<PaymentSuccessPage />)
    await waitFor(() => expect(screen.getByText('Siparişiniz Tamamlandı')).toBeInTheDocument())
    expect(container.querySelector('svg.lucide-shield-check')).toBeNull()
  })

  it('OLUMLU KONTROL: metin doluysa rozet (simge + metin) çizilir', async () => {
    durum.rozet = 'Güvenli ödeme'
    const { container } = render(<PaymentSuccessPage />)
    await waitFor(() => expect(screen.getByText('Siparişiniz Tamamlandı')).toBeInTheDocument())
    expect(screen.getByText('Güvenli ödeme')).toBeInTheDocument()
    expect(container.querySelector('svg.lucide-shield-check')).not.toBeNull()
  })
})

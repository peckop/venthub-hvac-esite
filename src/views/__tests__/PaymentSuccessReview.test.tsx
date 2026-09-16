/**
 * REC-355 Faz 1 — ödeme ekranı `needs_review` davranışı.
 *
 * NİÇİN BU TEST VAR: `iyzico-callback` ödemeyi aldı ama ödeme-sipariş eşleşmesini
 * doğrulayamadıysa `needs_review` dönüyor ve siparişe HİÇBİR ŞEY yazmıyor. Bu ekran o
 * cevabı `error` ile aynı kovaya koyarsa müşteriye "Ödeme Başarısız" + "Tekrar Dene"
 * gösterir. Parası çekilmiş müşteri büyük olasılıkla ikinci kez öder.
 *
 * Bu yüzden kapı iki şeyi birden ölçer: doğru metin GÖRÜNÜYOR mu, ve tekrar ödeme yolu
 * GERÇEKTEN kapalı mı (checkout'a giden hiçbir bağlantı yok).
 */
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

const sorguParams = new URLSearchParams({ status: 'needs_review', orderId: 'ord-1' })

vi.mock('next/navigation', () => ({
  useSearchParams: () => sorguParams,
}))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'tr',
    t: (k: string) => ({
      'payment.reviewTitle': 'Ödemeniz Alındı, Doğrulama Sürüyor',
      'payment.reviewDesc': 'Ödemeniz bankanızdan başarıyla alındı.',
      'payment.reviewWarning': 'Lütfen tekrar ödeme yapmayın.',
      'payment.reviewBackHome': 'Ana Sayfaya Dön',
      'payment.viewOrderDetails': 'Sipariş Detaylarını Gör',
      'payment.orderNoLabel': 'Sipariş No',
      'payment.failedTitle': 'Ödeme Başarısız',
      'payment.retry': 'Tekrar Dene',
    } as Record<string, string>)[k] || k,
  }),
}))

const temizlendi = vi.fn()
vi.mock('../../hooks/useCartHook', () => ({
  useCart: () => ({ clearCart: temizlendi }),
}))

vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({
    home: () => '/tr',
    checkout: () => '/tr/odeme',
    cart: () => '/tr/sepet',
    account: { orders: () => '/tr/hesabim/siparisler' },
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {
    functions: { invoke: vi.fn() },
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) })),
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/errorReporter', () => ({ reportError: vi.fn() }))

import PaymentSuccessPage from '../PaymentSuccessPage'

describe('PaymentSuccessPage — needs_review (REC-355 Faz 1)', () => {
  it('parası çekilmiş müşteriye "başarısız" DEĞİL, "doğrulama sürüyor" gösterir', async () => {
    render(<PaymentSuccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Ödemeniz Alındı, Doğrulama Sürüyor')).toBeInTheDocument()
    })

    // Hata ekranının metinleri GÖRÜNMEMELİ.
    expect(screen.queryByText('Ödeme Başarısız')).not.toBeInTheDocument()
    expect(screen.queryByText('Tekrar Dene')).not.toBeInTheDocument()
  })

  it('tekrar ödeme yolunu kapatır — checkout ve sepete giden bağlantı YOK', async () => {
    render(<PaymentSuccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Ödemeniz Alındı, Doğrulama Sürüyor')).toBeInTheDocument()
    })

    const adresler = screen.getAllByRole('link').map((a) => a.getAttribute('href') || '')
    expect(adresler.length).toBeGreaterThan(0)
    expect(adresler.some((h) => h.includes('odeme') || h.includes('checkout'))).toBe(false)
    expect(adresler.some((h) => h.includes('sepet') || h.includes('cart'))).toBe(false)
  })

  it('ödeme gerçekleştiği için sepeti temizler', async () => {
    render(<PaymentSuccessPage />)
    await waitFor(() => {
      expect(temizlendi).toHaveBeenCalled()
    })
  })
})

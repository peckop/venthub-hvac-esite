// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'

import {
  anahtarFarki,
  ODEME_ADRES_ALANLARI,
  ODEME_ISTEGI_ALANLARI,
  ODEME_KALEM_ALANLARI,
  ODEME_MUSTERI_ALANLARI,
} from '@/lib/sozlesme/edgeSozlesmeleri'
import { buildPaymentRequest } from '@/views/checkout/buildPaymentRequest'

/**
 * INV-SOZLESME-ODEME-3 · ödeme sözleşmesi, İSTEMCİ ayağı (ALT-126).
 *
 * Bu dosya bilerek vitrinin yanında durur: ödeme gövdesini bugün `src/views/checkout/buildPaymentRequest.ts`
 * kuruyor. Yeni vitrin gövdeyi başka yerde kurarsa bu test oraya taşınır (yalnız import yolu değişir);
 * ölçüt ortak şemadır (src/lib/sozlesme/edgeSozlesmeleri.ts), Edge ayağı src/__tests__/conformance/sozlesme-odeme.test.ts.
 */

const GIRDI = {
  amount: 300,
  items: [{ id: 'c1', quantity: 2, unitPrice: 150, product: { id: 'p1', name: 'Ürün', image_url: 'https://example.com/x.webp' } }],
  customer: { name: 'Ali', email: 'ali@example.com', phone: '+905000000000' },
  shipping: { fullAddress: 'A', city: 'İstanbul', district: 'Kadıköy', postalCode: '34000' },
  billing: null,
  sameAsShipping: true,
  userId: 'u1',
  invoiceType: 'individual' as const,
  invoiceInfo: {},
  legalConsents: { kvkk: true, distanceSales: true, preInfo: true, orderConfirm: true },
  couponCode: 'KOD10',
}

describe('INV-SOZLESME-ODEME-3 · buildPaymentRequest çıktısı ortak şemaya birebir uyar', () => {
  const govde = buildPaymentRequest(GIRDI)

  it('üst düzey alanlar = şema', () => {
    expect(anahtarFarki(Object.keys(govde), ODEME_ISTEGI_ALANLARI)).toEqual({ eksik: [], fazla: [] })
  })

  it('sepet kalemi, müşteri ve iki adres alanları = şema', () => {
    expect(anahtarFarki(Object.keys(govde.cartItems[0]), ODEME_KALEM_ALANLARI)).toEqual({ eksik: [], fazla: [] })
    expect(anahtarFarki(Object.keys(govde.customerInfo), ODEME_MUSTERI_ALANLARI)).toEqual({ eksik: [], fazla: [] })
    expect(anahtarFarki(Object.keys(govde.shippingAddress), ODEME_ADRES_ALANLARI)).toEqual({ eksik: [], fazla: [] })
    expect(anahtarFarki(Object.keys(govde.billingAddress), ODEME_ADRES_ALANLARI)).toEqual({ eksik: [], fazla: [] })
  })

  it('sabotaj: gövdeden alan düşerse ya da eklenirse ölçüt KIRMIZI', () => {
    const { couponCode: _dusen, ...eksikGovde } = govde
    expect(anahtarFarki(Object.keys(eksikGovde), ODEME_ISTEGI_ALANLARI).eksik).toEqual(['couponCode'])
    expect(anahtarFarki([...Object.keys(govde), 'discountCode'], ODEME_ISTEGI_ALANLARI).fazla).toEqual(['discountCode'])
  })
})

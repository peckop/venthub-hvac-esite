// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { buildPaymentRequest } from '@/pages/checkout/buildPaymentRequest'

describe('buildPaymentRequest', () => {
  it('doğru payload üretir (sameAsShipping = true)', () => {
    const payload = buildPaymentRequest({
      amount: 1234,
      items: [
        { id: 'c1', quantity: 2, product: { id: 'p1', name: 'Ürün', price: '100.50', image_url: 'x' } },
      ],
      customer: { name: 'Ali', email: 'ali@example.com', phone: '+90...' },
      shipping: { fullAddress: 'A', city: 'İstanbul', district: 'Kadıköy', postalCode: '34000' },
      billing: { fullAddress: 'B', city: 'Ankara', district: 'Çankaya', postalCode: '06000' },
      sameAsShipping: true,
      userId: 'u1',
      invoiceType: 'individual',
      invoiceInfo: { tckn: '12345678901' },
      legalConsents: { kvkk: true, distanceSales: true, preInfo: true, orderConfirm: true },
    })

    expect(payload.amount).toBe(1234)
    expect(payload.cartItems[0]).toEqual({
      product_id: 'p1',
      quantity: 2,
      price: 100.5,
      product_name: 'Ürün',
      product_image_url: 'x',
    })
    expect(payload.shippingAddress.city).toBe('İstanbul')
    expect(payload.billingAddress.city).toBe('İstanbul') // same as shipping
    expect(payload.invoiceType).toBe('individual')
    expect(payload.invoiceInfo.type).toBe('individual')
    expect(payload.legalConsents.orderConfirm.accepted).toBe(true)
    expect(typeof payload.legalConsents.orderConfirm.ts).toBe('string')
  })

  it('doğru payload üretir (sameAsShipping = false)', () => {
    const payload = buildPaymentRequest({
      amount: 500,
      items: [],
      customer: { name: 'Veli', email: 'v@example.com', phone: '+90' },
      shipping: { fullAddress: 'S', city: 'İzmir', district: 'Konak', postalCode: '35000' },
      billing: { fullAddress: 'B', city: 'Bursa', district: 'Nilüfer', postalCode: '16000' },
      sameAsShipping: false,
      userId: null,
      invoiceType: 'corporate',
      invoiceInfo: { companyName: 'Acme', vkn: '1234567890', taxOffice: 'XYZ' },
      legalConsents: { kvkk: true, distanceSales: true, preInfo: true, orderConfirm: true, marketing: false },
    })

    expect(payload.billingAddress.city).toBe('Bursa')
    expect(payload.invoiceType).toBe('corporate')
    expect(payload.invoiceInfo.type).toBe('corporate')
  })
})


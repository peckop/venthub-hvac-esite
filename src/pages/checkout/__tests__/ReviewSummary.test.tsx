// @vitest-environment happy-dom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import ReviewSummary, { CustomerInfo, AddressInfo } from '@/pages/checkout/ReviewSummary'
import { I18nProvider } from '@/i18n/I18nProvider'

vi.mock('@/i18n/dictionaries/tr', () => ({
  tr: {
    checkout: {
      review: { title: 'Siparişi Gözden Geçir', edit: 'Düzenle' },
      personal: { title: 'Kişisel Bilgileriniz' },
      shipping: { title: 'Teslimat Adresi' },
      billing: { title: 'Fatura Adresi' },
      invoice: { title: 'Fatura Tipi ve Bilgileri', individual: 'Bireysel', corporate: 'Ticari' },
    },
  }
}))

vi.mock('lucide-react', () => ({ ArrowLeft: () => null, CreditCard: () => null, MapPin: () => null, User: () => null, Lock: () => null, CheckCircle: () => null }))

afterEach(() => cleanup())

function wrap(ui: React.ReactElement) {
  window.localStorage.setItem('lang', 'tr')
  return render(<I18nProvider>{ui}</I18nProvider>)
}

const customer: CustomerInfo = { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+90...' }
const ship: AddressInfo = { fullAddress: 'Sokak 1', city: 'İstanbul', district: 'Kadıköy', postalCode: '34000' }
const bill: AddressInfo = { fullAddress: 'Cadde 2', city: 'Ankara', district: 'Çankaya', postalCode: '06000' }

describe('ReviewSummary', () => {
  it('sameAsShipping = true iken 3 kart gösterir', () => {
    wrap(
      <ReviewSummary
        customer={customer}
        shipping={ship}
        billing={bill}
        sameAsShipping={true}
        invoiceType="individual"
        invoiceInfo={{ tckn: '12345678901' }}
        onEditPersonal={vi.fn()}
        onEditShipping={vi.fn()}
        onEditBilling={vi.fn()}
        onEditInvoice={vi.fn()}
      />
    )
    const heading = screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })
    const section = heading.closest('div')!
    const edits = within(section).getAllByRole('button', { name: 'Düzenle' })
    expect(edits.length).toBe(3)
  })

  it('sameAsShipping = false iken 4 kart gösterir', () => {
    wrap(
      <ReviewSummary
        customer={customer}
        shipping={ship}
        billing={bill}
        sameAsShipping={false}
        invoiceType="corporate"
        invoiceInfo={{ companyName: 'Acme', vkn: '1234567890', taxOffice: 'XYZ' }}
        onEditPersonal={vi.fn()}
        onEditShipping={vi.fn()}
        onEditBilling={vi.fn()}
        onEditInvoice={vi.fn()}
      />
    )
    const heading = screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })
    const section = heading.closest('div')!
    const edits = within(section).getAllByRole('button', { name: 'Düzenle' })
    expect(edits.length).toBe(4)
  })

  it('edit düğmeleri callbackleri çağırır', () => {
    const onPersonal = vi.fn()
    const onShipping = vi.fn()
    const onBilling = vi.fn()
    const onInvoice = vi.fn()

    wrap(
      <ReviewSummary
        customer={customer}
        shipping={ship}
        billing={bill}
        sameAsShipping={false}
        invoiceType="individual"
        invoiceInfo={{ tckn: '12345678901' }}
        onEditPersonal={onPersonal}
        onEditShipping={onShipping}
        onEditBilling={onBilling}
        onEditInvoice={onInvoice}
      />
    )
    const heading = screen.getByRole('heading', { name: 'Siparişi Gözden Geçir' })
    const section = heading.closest('div')!
    const buttons = within(section).getAllByRole('button', { name: 'Düzenle' })

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])
    fireEvent.click(buttons[2])
    fireEvent.click(buttons[3])

    expect(onPersonal).toHaveBeenCalled()
    expect(onShipping).toHaveBeenCalled()
    expect(onBilling).toHaveBeenCalled()
    expect(onInvoice).toHaveBeenCalled()
  })
})


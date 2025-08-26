// @vitest-environment happy-dom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup, configure } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Component under test
import CheckoutPage from '@/pages/CheckoutPage'

// I18n Provider
import { I18nProvider } from '@/i18n/I18nProvider'
import { tr } from '@/i18n/dictionaries/tr'

// Mocks
// lucide iconlarını ve SecurityRibbon'u hafiflet
vi.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  CreditCard: () => null,
  MapPin: () => null,
  User: () => null,
  Lock: () => null,
  CheckCircle: () => null,
}))
vi.mock('@/components/SecurityRibbon', () => ({ default: () => null }))

// react-hot-toast mock (zamanlayıcı sızıntılarını önlemek için)
vi.mock('react-hot-toast', () => {
  const fn = (..._args: any[]) => {}
  ;(fn as any).success = vi.fn()
  ;(fn as any).error = vi.fn()
  ;(fn as any).dismiss = vi.fn()
  return { default: fn }
})

// i18n TR sözlüğünü minimal mock'la hafiflet (Provider tr dilini kullanıyor)
vi.mock('@/i18n/dictionaries/tr', () => ({
  tr: {
    checkout: {
      review: { title: 'Siparişi Gözden Geçir', edit: 'Düzenle' },
      nav: { next: 'Devam Et', proceedPayment: 'Ödemeye Geç' },
      personal: { title: 'Kişisel Bilgileriniz', namePlaceholder: 'Adınız ve soyadınız', emailPlaceholder: 'ornek@email.com', phonePlaceholder: '+90 (5xx) xxx xx xx' },
      shipping: { title: 'Teslimat Adresi', addressPlaceholder: 'Mahalle, sokak, apartman/site adı, kapı no, daire no', cityPlaceholder: 'İstanbul', districtPlaceholder: 'Pendik', postalPlaceholder: '34890' },
      billing: { title: 'Fatura Adresi', sameAsShipping: 'Teslimat adresi ile aynı', addressPlaceholder: 'Fatura adresi', cityPlaceholder: 'Şehir', districtPlaceholder: 'İlçe', postalPlaceholder: 'Posta kodu' },
      invoice: { title: 'Fatura Tipi ve Bilgileri', tcknPlaceholder: '11 haneli TCKN' },
      paymentSectionTitle: 'Ödeme İşlemi',
      saved: { seeAll: 'Tüm adresleri gör' },
    },
    legalLinks: { kvkk: 'KVKK Aydınlatma Metni', distanceSales: 'Mesafeli Satış Sözleşmesi', preInformation: 'Ön Bilgilendirme Formu' },
    consents: { orderConfirmText: 'Siparişi onaylıyor, ürün ve teslimat bilgilerinin doğruluğunu kabul ediyorum.' },
    orders: { qtyCol: 'Adet' },
  }
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'u@u.com', user_metadata: { full_name: 'Test User', phone: '+905551112233' } }, loading: false })
}))

vi.mock('@/hooks/useCartHook', () => ({
  useCart: () => ({
    items: [
      { id: 'c1', quantity: 1, product: { id: 'p1', name: 'Ürün', price: '1000', image_url: '' } },
    ],
    getCartTotal: () => 1000,
    clearCart: vi.fn(),
  })
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { data: { token: 'tok', orderId: 'o1', conversationId: 'cvid' } } }) },
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { status: 'pending' } }) }) }) }),
  },
  listAddresses: vi.fn().mockResolvedValue([]),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: { data: { token: 'tok', orderId: 'o1', conversationId: 'cvid' } } }) },
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { status: 'pending' } }) }) }) }),
  },
  listAddresses: vi.fn().mockResolvedValue([]),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
}))

// RTL findBy/waitFor timeout'u kısa tutarak beklemeyi sınırla
configure({ asyncUtilTimeout: 1200 })

function renderWithProviders() {
  // Testlerde dili TR yap
  window.localStorage.setItem('lang', 'tr')
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[{ pathname: '/checkout' }]}>
        <CheckoutPage />
      </MemoryRouter>
    </I18nProvider>
  )
}

// Helper: go to Address, fill minimal valid data, then to Review
async function goToReview() {
  renderWithProviders()
  // Step 1: Kişisel Bilgiler - alanları doldur ve devam et
  fireEvent.change(screen.getByPlaceholderText(tr.checkout.personal.namePlaceholder), { target: { value: 'Test Kullanıcı' } })
  fireEvent.change(screen.getByPlaceholderText(tr.checkout.personal.emailPlaceholder), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByPlaceholderText(tr.checkout.personal.phonePlaceholder), { target: { value: '+905551112233' } })
  const nextBtn1 = screen.getByRole('button', { name: tr.checkout.nav.next })
  fireEvent.click(nextBtn1)

  // Step 2: Adres Bilgileri - teslimat alanlarını doldur
  const address = screen.getByPlaceholderText(tr.checkout.shipping.addressPlaceholder)
  fireEvent.change(address, { target: { value: 'Adres satırı 1' } })
  const city = screen.getByPlaceholderText(tr.checkout.shipping.cityPlaceholder)
  fireEvent.change(city, { target: { value: 'İstanbul' } })
  const district = screen.getByPlaceholderText(tr.checkout.shipping.districtPlaceholder)
  fireEvent.change(district, { target: { value: 'Kadıköy' } })
  const postal = screen.getByPlaceholderText(tr.checkout.shipping.postalPlaceholder)
  fireEvent.change(postal, { target: { value: '34000' } })

  // Fatura tipi bireysel ise TCKN isteyecek
  const tcknInput = screen.getByPlaceholderText(tr.checkout.invoice.tcknPlaceholder)
  fireEvent.change(tcknInput, { target: { value: '12345678901' } })

  // KVKK, Mesafeli, Ön Bilgi, Siparişi onaylıyorum
  const checkboxes = screen.getAllByRole('checkbox')
  // sameAsShipping dahil toplam 5 checkbox var; son 4'ünü işaretleyelim (yasal onaylar)
  // safer: locate by text
  fireEvent.click(screen.getByText(tr.legalLinks.kvkk, { selector: 'a' }).closest('label')!.querySelector('input')!)
  fireEvent.click(screen.getByText(tr.legalLinks.distanceSales, { selector: 'a' }).closest('label')!.querySelector('input')!)
  fireEvent.click(screen.getByText(tr.legalLinks.preInformation, { selector: 'a' }).closest('label')!.querySelector('input')!)
  fireEvent.click(screen.getByText(tr.checkout.consents.orderConfirmText))

  const nextBtn2 = screen.getByRole('button', { name: tr.checkout.nav.next })
  fireEvent.click(nextBtn2)
}

afterEach(() => {
  cleanup()
})

describe('CheckoutPage - Gözden Geçir', () => {

  it('Başlangıçta 3 özet kartı gösterir (Fatura adresi aynı ise)', async () => {
    await goToReview()

    // Review başlığı ve bölüm
    const heading = await screen.findByRole('heading', { name: tr.checkout.review.title })
    const section = heading.closest('div')!
    const cards = within(section).getAllByRole('button', { name: tr.checkout.review.edit }) // her kartta Düzenle butonu var

    // Personal + Shipping + Invoice = 3 kart
    expect(cards.length).toBe(3)
  })

  it('Fatura adresi farklı seçilince 4. kart görünür', async () => {
    renderWithProviders()
    // Step 1 -> 2
    fireEvent.click(screen.getByRole('button', { name: tr.checkout.nav.next }))

    // Teslimat doldur
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.shipping.addressPlaceholder), { target: { value: 'Adres' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.shipping.cityPlaceholder), { target: { value: 'İstanbul' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.shipping.districtPlaceholder), { target: { value: 'Kadıköy' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.shipping.postalPlaceholder), { target: { value: '34000' } })

    // sameAsShipping checkbox'ını kapat
    const sameAs = screen.getByLabelText(tr.checkout.billing.sameAsShipping)
    fireEvent.click(sameAs)

    // Fatura adresi alanlarını da doldur
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.billing.addressPlaceholder), { target: { value: 'Fatura Adresi' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.billing.cityPlaceholder), { target: { value: 'Ankara' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.billing.districtPlaceholder), { target: { value: 'Çankaya' } })
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.billing.postalPlaceholder), { target: { value: '06000' } })

    // TCKN ve onaylar
    fireEvent.change(screen.getByPlaceholderText(tr.checkout.invoice.tcknPlaceholder), { target: { value: '12345678901' } })
    fireEvent.click(screen.getByText(tr.legalLinks.kvkk, { selector: 'a' }).closest('label')!.querySelector('input')!)
    fireEvent.click(screen.getByText(tr.legalLinks.distanceSales, { selector: 'a' }).closest('label')!.querySelector('input')!)
    fireEvent.click(screen.getByText(tr.legalLinks.preInformation, { selector: 'a' }).closest('label')!.querySelector('input')!)
    fireEvent.click(screen.getByText(tr.checkout.consents.orderConfirmText))

    // Review'a geç
    fireEvent.click(screen.getByRole('button', { name: tr.checkout.nav.next }))

    // 4 kart beklenir: Personal, Shipping, Billing, Invoice
    const heading = await screen.findByRole('heading', { name: tr.checkout.review.title })
    const section = heading.closest('div')!
    const cards = within(section).getAllByRole('button', { name: tr.checkout.review.edit })
    expect(cards.length).toBe(4)
  })

  it('Gözden Geçir -> Ödemeye Geç ile 4. adıma geçer', async () => {
    await goToReview()
    const proceed = screen.getByRole('button', { name: tr.checkout.nav.proceedPayment })
    fireEvent.click(proceed)

    // Ödeme başlığı görünsün
    expect(await screen.findByText(tr.checkout.paymentSectionTitle)).toBeInTheDocument()
  })
})


import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import OrderFormModal from '../OrderFormModal'

/**
 * ALAN SEVİYESİ DOĞRULAMA GERİ BİLDİRİMİ — cetvel §4.6.
 * Hata mesajının ekranda olması yetmez: bozuk girdiye `aria-invalid` +
 * `aria-describedby` ile BAĞLI olmalı (toast bu bağı kuramaz).
 */

const sb = vi.hoisted(() => {
  const order = {
    id: 'ord-1',
    user_id: 'u1',
    total_amount: 100,
    status: 'pending',
    payment_status: 'pending',
    created_at: '2026-01-01T00:00:00.000Z',
    customer_name: '', // zorunlu → boş bırakıldı
    customer_email: 'gecersiz-adres', // e-posta biçimi bozuk
    customer_phone: '',
    shipping_address: null,
    order_number: 'VH-1',
    conversation_id: null,
    carrier: null,
    tracking_number: null,
    tracking_url: null,
    shipped_at: null,
    delivered_at: null,
    shipping_method: 'standard',
    invoice_type: null,
    invoice_info: null,
    legal_consents: null,
    venthub_order_items: [],
  }
  return {
    order,
    client: {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: order, error: null }),
          }),
        }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) },
    },
  }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
// `t` KARARLI olmalı: sipariş yükleme efekti `t`'ye bağımlı — her render yeni bir
// `t` üretilirse efekt sonsuz yeniden koşar ve yükleme durumu hiç kapanmaz.
const i18n = vi.hoisted(() => ({ value: { t: (k: string) => k, lang: 'tr' } }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => i18n.value }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false }),
}))
vi.mock('@/lib/orderStatusService', () => ({
  updateOrderStatus: () => Promise.resolve({ ok: true }),
}))

function renderModal() {
  return render(
    <ConfirmProvider>
      <OrderFormModal open onOpenChange={() => {}} orderId="ord-1" onSuccess={() => {}} />
    </ConfirmProvider>,
  )
}

function submitForm(): void {
  const form = document.getElementById('order-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('order-form bulunamadı')
  fireEvent.submit(form)
}

describe('OrderFormModal — alan seviyesi hata geri bildirimi', () => {
  it('geçersiz alanlarla submit: aria-invalid + inline mesaj + aria-describedby bağı', async () => {
    renderModal()

    const nameInput = await screen.findByLabelText('admin.orders.form.customerName')
    submitForm()

    // (a) aria-invalid
    await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'))

    // (b) mesaj DOM'da ve role="alert"
    const message = screen.getByText('admin.orders.form.validation.customerNameRequired')
    expect(message).toBeInTheDocument()
    expect(message).toHaveAttribute('role', 'alert')

    // (c) aria-describedby bağı
    expect(nameInput.getAttribute('aria-describedby')).toBe(message.id)
    expect(message.id).toBe('order-customer-name-error')
  })

  it('bozuk e-posta alana bağlanır ve odak ilk bozuk alana taşınır', async () => {
    renderModal()

    const nameInput = await screen.findByLabelText('admin.orders.form.customerName')
    const emailInput = screen.getByLabelText('admin.orders.form.customerEmail')
    submitForm()

    await waitFor(() => expect(emailInput).toHaveAttribute('aria-invalid', 'true'))
    const emailMessage = screen.getByText('admin.orders.form.validation.emailInvalid')
    expect(emailInput.getAttribute('aria-describedby')).toBe(emailMessage.id)

    expect(document.activeElement).toBe(nameInput)
  })

  it('kullanıcı düzeltmeye başlayınca o alanın hatası temizlenir', async () => {
    renderModal()

    const emailInput = await screen.findByLabelText('admin.orders.form.customerEmail')
    submitForm()
    await waitFor(() => expect(emailInput).toHaveAttribute('aria-invalid', 'true'))

    fireEvent.change(emailInput, { target: { value: 'gecerli@venthub.com' } })

    await waitFor(() => expect(emailInput).not.toHaveAttribute('aria-invalid'))
    expect(screen.queryByText('admin.orders.form.validation.emailInvalid')).not.toBeInTheDocument()
  })
})

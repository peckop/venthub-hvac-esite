import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import PricingRuleFormModal from '../PricingRuleFormModal'

/**
 * ALAN SEVİYESİ DOĞRULAMA GERİ BİLDİRİMİ — cetvel §4.6.
 *
 * Bu form 15 girdi taşır: "bir alan hatalı" diyen bir toast HANGİ alanın bozuk
 * olduğunu söylemez. Mesaj alanın altında durmalı, `aria-invalid` +
 * `aria-describedby` ile ona bağlanmalı ve odak oraya taşınmalı.
 */

const sb = vi.hoisted(() => ({
  client: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) },
  },
}))

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false }),
}))
// Kapsam seçici AYRI bir bileşen (bu işin dosya kapsamında değil) → testte no-op.
vi.mock('../RuleScopeTargetPicker', () => ({ default: () => null }))
vi.mock('@/lib/services/pricing.service', () => ({
  computePriceFromRule: () => null,
  resolvePrice: () => Promise.resolve({ price: null }),
  ruleMatchesProduct: () => false,
  sortRules: (rules: { id: string }[]) => rules,
}))
vi.mock('@/lib/services/pricingAdmin.service', () => ({
  coefficientToMarginPct: (c: number) => (c - 1) * 100,
  marginPctToCoefficient: (p: number) => 1 + p / 100,
  countProductsInScope: () => Promise.resolve(0),
  sampleProductsInScope: () => Promise.resolve([]),
  listPricingRules: () => Promise.resolve([]),
  createPricingRule: () => Promise.resolve(undefined),
  updatePricingRule: () => Promise.resolve(undefined),
}))

function renderModal() {
  return render(
    <ConfirmProvider>
      <PricingRuleFormModal open rule={null} onClose={() => {}} onSaved={() => {}} />
    </ConfirmProvider>,
  )
}

function submitForm(): void {
  const form = document.getElementById('pricing-rule-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('pricing-rule-form bulunamadı')
  fireEvent.submit(form)
}

describe('PricingRuleFormModal — alan seviyesi hata geri bildirimi', () => {
  it('aralık dışı KDV ile submit: aria-invalid + inline mesaj + aria-describedby bağı', async () => {
    renderModal()

    const vatInput = await screen.findByLabelText('admin.pricing.rules.form.vatRatePct')
    // KDV şemada [0,100] — 150 vererek alanı KASITLI bozuyoruz.
    fireEvent.change(vatInput, { target: { value: '150' } })
    submitForm()

    // (a) aria-invalid
    await waitFor(() => expect(vatInput).toHaveAttribute('aria-invalid', 'true'))

    // (b) mesaj DOM'da ve role="alert"
    const message = screen.getByText('admin.pricing.rules.validation.vatRange')
    expect(message).toBeInTheDocument()
    expect(message).toHaveAttribute('role', 'alert')

    // (c) aria-describedby bağı
    expect(vatInput.getAttribute('aria-describedby')).toBe(message.id)
    expect(message.id).toBe('rule-vat-error')

    // ilk bozuk alana odak (15 alanlı formda kullanıcı scroll etmesin)
    expect(document.activeElement).toBe(vatInput)
  })

  it('kullanıcı düzeltmeye başlayınca o alanın hatası temizlenir', async () => {
    renderModal()

    const vatInput = await screen.findByLabelText('admin.pricing.rules.form.vatRatePct')
    fireEvent.change(vatInput, { target: { value: '150' } })
    submitForm()
    await waitFor(() => expect(vatInput).toHaveAttribute('aria-invalid', 'true'))

    // Bu alan `register` değil `setValue` ile sürülüyor → hatayı elle temizleyen
    // `clearErrors` olmasaydı mesaj EKRANDA KALIRDI. Kapı tam burada.
    fireEvent.change(vatInput, { target: { value: '20' } })

    await waitFor(() => expect(vatInput).not.toHaveAttribute('aria-invalid'))
    expect(screen.queryByText('admin.pricing.rules.validation.vatRange')).not.toBeInTheDocument()
  })

  it('min_quantity negatifse alan bağlanır', async () => {
    renderModal()

    const minQtyInput = await screen.findByLabelText('admin.pricing.rules.form.minQuantity')
    fireEvent.change(minQtyInput, { target: { value: '-5' } })
    submitForm()

    await waitFor(() => expect(minQtyInput).toHaveAttribute('aria-invalid', 'true'))
    const message = screen.getByText('admin.pricing.rules.validation.minQuantity')
    expect(minQtyInput.getAttribute('aria-describedby')).toBe(message.id)
    expect(message).toHaveAttribute('role', 'alert')
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import PricingRuleFormModal from '../PricingRuleFormModal'

/**
 * ÜRÜN BAŞINA TEK SABİT KURAL İNDEKSİ İHLALİ (REC-412 tekillik; çürütme bulgusu O1).
 *
 * Kural formu mevcut bir kuralı (adet, kapsam, yöntem ya da ürün değiştirerek) tekillik indeksinin koşuluna sokabilir; DB 23505
 * fırlatır. Kullanıcı genel "kaydedilemedi" DEĞİL, ne yapacağını söyleyen mesajı görmeli; ham SQL metni ve `details`
 * (`Key (tenant_id, product_id)=(…)`) toast'a BASILMAMALI.
 */

const m = vi.hoisted(() => ({
  create: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: { error: m.toastError, success: m.toastSuccess } }))
vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: { auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) } },
}))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false }),
}))
vi.mock('../RuleScopeTargetPicker', () => ({ default: () => null }))
vi.mock('@/lib/admin/mutateWithAudit', () => ({
  AdminPermissionError: class AdminPermissionError extends Error {},
  mutateWithAudit: async (_supabase: unknown, opts: { fn: () => Promise<void> }) => {
    await opts.fn()
  },
}))
vi.mock('@/lib/services/pricing.service', () => ({
  computePriceFromRule: () => null,
  resolvePrice: () => Promise.resolve({ price: null }),
  ruleMatchesProduct: () => false,
  sortRules: (rules: { id: string }[]) => rules,
}))
// Gerçek `isProductFixedRuleConflict` KULLANILIR (mock'a yazılmaz): sınanan şey tam da onun modal ile bağı.
vi.mock('@/lib/services/pricingAdmin.service', async (importOriginal) => {
  const gercek = await importOriginal<typeof import('@/lib/services/pricingAdmin.service')>()
  return {
    coefficientToMarginPct: (c: number) => (c - 1) * 100,
    marginPctToCoefficient: (p: number) => 1 + p / 100,
    countProductsInScope: () => Promise.resolve(0),
    sampleProductsInScope: () => Promise.resolve([]),
    listPricingRules: () => Promise.resolve([]),
    createPricingRule: m.create,
    updatePricingRule: () => Promise.resolve(undefined),
    isProductFixedRuleConflict: gercek.isProductFixedRuleConflict,
  }
})

function submitForm(): void {
  const form = document.getElementById('pricing-rule-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('pricing-rule-form bulunamadı')
  fireEvent.submit(form)
}

function renderModal() {
  return render(
    <ConfirmProvider>
      <PricingRuleFormModal open rule={null} onClose={() => {}} onSaved={() => {}} />
    </ConfirmProvider>,
  )
}

describe('PricingRuleFormModal — tekillik indeksi ihlali', () => {
  beforeEach(() => {
    m.create.mockReset()
    m.toastError.mockReset()
    m.toastSuccess.mockReset()
  })

  it('tek sabit kural indeksi 23505 → ne yapılacağını söyleyen mesaj; ham metin ve details toast\'a basılmaz', async () => {
    m.create.mockRejectedValue({
      code: '23505',
      message: 'duplicate key value violates unique constraint "pricing_rule_urun_tek_sabit_uq"',
      details: 'Key (tenant_id, product_id)=(tenant-1, p1) already exists.',
      hint: null,
    })
    renderModal()
    await screen.findByLabelText('admin.pricing.rules.form.vatRatePct')

    submitForm()

    await waitFor(() => expect(m.toastError).toHaveBeenCalledTimes(1))
    expect(m.toastError).toHaveBeenCalledWith('admin.pricing.rules.errors.productFixedExists')
    expect(JSON.stringify(m.toastError.mock.calls)).not.toContain('duplicate key')
    expect(JSON.stringify(m.toastError.mock.calls)).not.toContain('tenant')
  })

  it('başka bir indeksin 23505 hatası bu mesajı ALMAZ: genel saveFailed', async () => {
    m.create.mockRejectedValue({
      code: '23505',
      message: 'duplicate key value violates unique constraint "baska_uq"',
      details: null,
      hint: null,
    })
    renderModal()
    await screen.findByLabelText('admin.pricing.rules.form.vatRatePct')

    submitForm()

    await waitFor(() => expect(m.toastError).toHaveBeenCalledTimes(1))
    expect(m.toastError).toHaveBeenCalledWith('admin.pricing.rules.toasts.saveFailed')
  })
})

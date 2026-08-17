import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import PricingSettingsFormModal, { DEFAULT_PRICING_SETTINGS } from '../PricingSettingsFormModal'

/**
 * ALAN SEVİYESİ DOĞRULAMA GERİ BİLDİRİMİ — cetvel §4.6.
 * Mesaj bozuk girdinin ALTINDA durur ve `aria-invalid` + `aria-describedby`
 * ile ona bağlanır; ekran okuyucu ancak bu bağla hatayı duyar.
 */

const sb = vi.hoisted(() => ({
  client: {
    from: () => ({ upsert: () => Promise.resolve({ error: null }) }),
    auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) },
  },
}))

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false }),
}))

// `default_round_to` şemada gt(0) — 0 vererek alanı KASITLI bozuyoruz.
const INVALID_VALUES = { ...DEFAULT_PRICING_SETTINGS, default_round_to: 0 }

function renderModal() {
  return render(
    <ConfirmProvider>
      <PricingSettingsFormModal
        open
        onOpenChange={() => {}}
        initialValues={INVALID_VALUES}
        onSuccess={() => {}}
      />
    </ConfirmProvider>,
  )
}

function submitForm(): void {
  const form = document.getElementById('pricing-settings-modal-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('pricing-settings-modal-form bulunamadı')
  fireEvent.submit(form)
}

describe('PricingSettingsFormModal — alan seviyesi hata geri bildirimi', () => {
  it('geçersiz yuvarlama birimiyle submit: aria-invalid + inline mesaj + aria-describedby bağı', async () => {
    renderModal()

    const roundToInput = await screen.findByLabelText('admin.pricing.settings.defaultRoundToLabel')
    submitForm()

    // (a) aria-invalid
    await waitFor(() => expect(roundToInput).toHaveAttribute('aria-invalid', 'true'))

    // (b) mesaj DOM'da ve role="alert"
    const message = screen.getByText('admin.pricing.settings.validation.positiveNumber')
    expect(message).toBeInTheDocument()
    expect(message).toHaveAttribute('role', 'alert')

    // (c) aria-describedby bağı
    expect(roundToInput.getAttribute('aria-describedby')).toBe(message.id)
    expect(message.id).toBe('pricing-settings-round-to-error')

    // ilk (ve tek) bozuk alana odak
    expect(document.activeElement).toBe(roundToInput)
  })

  it('kullanıcı düzeltmeye başlayınca o alanın hatası temizlenir', async () => {
    renderModal()

    const roundToInput = await screen.findByLabelText('admin.pricing.settings.defaultRoundToLabel')
    submitForm()
    await waitFor(() => expect(roundToInput).toHaveAttribute('aria-invalid', 'true'))

    fireEvent.change(roundToInput, { target: { value: '0.05' } })

    await waitFor(() => expect(roundToInput).not.toHaveAttribute('aria-invalid'))
    expect(screen.queryByText('admin.pricing.settings.validation.positiveNumber')).not.toBeInTheDocument()
  })
})

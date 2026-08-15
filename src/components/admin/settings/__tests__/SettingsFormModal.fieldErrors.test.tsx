import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import SettingsFormModal from '../SettingsFormModal'

/**
 * ALAN SEVİYESİ DOĞRULAMA GERİ BİLDİRİMİ — cetvel §4.6.
 * 13 girdilik bir formda "bir alan hatalı" toast'ı hangi alan olduğunu söylemez;
 * mesaj alanın altında durmalı ve `aria-describedby` ile ona BAĞLI olmalı.
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

const INVALID_GENERAL = {
  site_name: '',
  tagline: '',
  contact_email: 'bozuk-eposta',
  support_phone: '',
  headquarters: '',
  logo_url: '',
}

function renderModal() {
  return render(
    <ConfirmProvider>
      <SettingsFormModal
        open
        onOpenChange={() => {}}
        section="general"
        initialValues={INVALID_GENERAL}
        onSuccess={() => {}}
      />
    </ConfirmProvider>,
  )
}

function submitForm(): void {
  const form = document.getElementById('settings-modal-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('settings-modal-form bulunamadı')
  fireEvent.submit(form)
}

describe('SettingsFormModal — alan seviyesi hata geri bildirimi', () => {
  it('boş zorunlu alanla submit: aria-invalid + inline mesaj + aria-describedby bağı', async () => {
    renderModal()

    const siteNameInput = await screen.findByLabelText('admin.settings.siteName')
    submitForm()

    // (a) aria-invalid
    await waitFor(() => expect(siteNameInput).toHaveAttribute('aria-invalid', 'true'))

    // (b) mesaj DOM'da ve role="alert"
    const message = screen.getByText('admin.settings.validation.siteNameRequired')
    expect(message).toBeInTheDocument()
    expect(message).toHaveAttribute('role', 'alert')

    // (c) aria-describedby bağı
    expect(siteNameInput.getAttribute('aria-describedby')).toBe(message.id)
    expect(message.id).toBe('settings-site-name-error')
  })

  it('bozuk e-posta alana bağlanır ve odak ilk bozuk alana taşınır', async () => {
    renderModal()

    const siteNameInput = await screen.findByLabelText('admin.settings.siteName')
    const emailInput = screen.getByLabelText('admin.settings.contactEmail')
    submitForm()

    await waitFor(() => expect(emailInput).toHaveAttribute('aria-invalid', 'true'))
    const emailMessage = screen.getByText('admin.settings.validation.emailInvalid')
    expect(emailInput.getAttribute('aria-describedby')).toBe(emailMessage.id)

    expect(document.activeElement).toBe(siteNameInput)
  })

  it('kullanıcı düzeltmeye başlayınca o alanın hatası temizlenir', async () => {
    renderModal()

    const siteNameInput = await screen.findByLabelText('admin.settings.siteName')
    submitForm()
    await waitFor(() => expect(siteNameInput).toHaveAttribute('aria-invalid', 'true'))

    fireEvent.change(siteNameInput, { target: { value: 'VentHub' } })

    await waitFor(() => expect(siteNameInput).not.toHaveAttribute('aria-invalid'))
    expect(screen.queryByText('admin.settings.validation.siteNameRequired')).not.toBeInTheDocument()
  })
})

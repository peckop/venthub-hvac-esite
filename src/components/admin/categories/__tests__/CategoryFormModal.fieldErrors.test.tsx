import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'

import CategoryFormModal from '../CategoryFormModal'

/**
 * ALAN SEVİYESİ DOĞRULAMA GERİ BİLDİRİMİ — cetvel §4.6.
 *
 * Kapı burada: hata mesajının EKRANDA olması yetmez, bozuk girdiye BAĞLI olması
 * gerekir. Ekran okuyucu kullanıcısı alana odaklandığında hatayı ancak
 * `aria-invalid` + `aria-describedby` üçgeni kuruluysa duyar; toast duyurmaz.
 */

const sb = vi.hoisted(() => ({
  client: {
    from: () => ({
      select: () => ({
        is: () => ({
          neq: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      insert: () => Promise.resolve({ error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }),
    },
  },
}))

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('@/components/ui/VentImage', () => ({ default: () => null }))

function renderModal() {
  return render(
    <ConfirmProvider>
      <CategoryFormModal open onOpenChange={() => {}} category={null} onSuccess={() => {}} />
    </ConfirmProvider>,
  )
}

function submitForm(): void {
  const form = document.getElementById('category-form')
  if (!(form instanceof HTMLFormElement)) throw new Error('category-form bulunamadı')
  fireEvent.submit(form)
}

describe('CategoryFormModal — alan seviyesi hata geri bildirimi', () => {
  it('boş zorunlu alanla submit: aria-invalid + inline mesaj + aria-describedby bağı', async () => {
    renderModal()

    const nameInput = await screen.findByLabelText('admin.categories.formName')
    submitForm()

    // (a) bozuk girdi aria-invalid taşır
    await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'))

    // (b) hata mesajı DOM'da GÖRÜNÜR (toast değil)
    const message = screen.getByText('admin.categories.nameRequired')
    expect(message).toBeInTheDocument()
    expect(message).toHaveAttribute('role', 'alert')

    // (c) mesaj aria-describedby ile ALANA BAĞLI
    const describedBy = nameInput.getAttribute('aria-describedby')
    expect(describedBy).toBe('category-name-error')
    expect(message.id).toBe(describedBy)
  })

  it('slug alanı da bağlanır ve ilk bozuk alana odak taşınır', async () => {
    renderModal()

    const nameInput = await screen.findByLabelText('admin.categories.formName')
    const slugInput = screen.getByLabelText('admin.categories.formSlug')
    submitForm()

    await waitFor(() => expect(slugInput).toHaveAttribute('aria-invalid', 'true'))
    const slugMessage = screen.getByText('admin.categories.slugRequired')
    expect(slugInput.getAttribute('aria-describedby')).toBe(slugMessage.id)

    // 14 alanlı formda kullanıcı hatayı aramasın: odak ilk bozuk alanda.
    expect(document.activeElement).toBe(nameInput)
  })

  it('kullanıcı düzeltmeye başlayınca o alanın hatası temizlenir', async () => {
    renderModal()

    const nameInput = await screen.findByLabelText('admin.categories.formName')
    submitForm()
    await waitFor(() => expect(nameInput).toHaveAttribute('aria-invalid', 'true'))

    fireEvent.change(nameInput, { target: { value: 'Fanlar' } })

    await waitFor(() => expect(nameInput).not.toHaveAttribute('aria-invalid'))
    expect(screen.queryByText('admin.categories.nameRequired')).not.toBeInTheDocument()
  })
})

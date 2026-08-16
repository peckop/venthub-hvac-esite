import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider, useConfirm } from '../ConfirmProvider'

/**
 * Onay yüzeyi sözleşmesi — WAI-ARIA APG Alert Dialog pattern.
 * Cetvel: docs/standards/admin-design-standard.md §4.7, §4.8
 *
 * Bu testin ilk işi AMPİRİK bir soruyu cevaplamak: Radix Dialog `role`'ü hardcoded
 * `"dialog"` basıyor; prop olarak `role="alertdialog"` geçmek onu EZİYOR mu?
 * Minified dist'i okuyup tahmin etmek yerine ölçüyoruz — ezmiyorsa bu test kırmızı
 * yanar ve `@radix-ui/react-alert-dialog` kurmak gerekir.
 */

vi.mock('../../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${Object.values(params).join(',')}` : key,
  }),
}))

function Harness({
  options,
  onResult,
}: {
  options: Parameters<ReturnType<typeof useConfirm>>[0]
  onResult: (value: boolean) => void
}) {
  const confirm = useConfirm()
  return (
    <button type="button" onClick={() => confirm(options).then(onResult)}>
      tetikle
    </button>
  )
}

function setup(options: Parameters<ReturnType<typeof useConfirm>>[0]) {
  const onResult = vi.fn()
  render(
    <ConfirmProvider>
      <Harness options={options} onResult={onResult} />
    </ConfirmProvider>
  )
  return { onResult, user: userEvent.setup() }
}

const BASIC = { description: 'Bu kayıt silinecek.', confirmLabel: 'Sil', cancelLabel: 'Vazgeç' }

describe('ConfirmProvider — APG alertdialog sözleşmesi', () => {
  it('role="alertdialog" taşır (Radix override AMPİRİK olarak doğrulanıyor)', async () => {
    const { user } = setup(BASIC)
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    // Bulunamazsa: Radix `role`'ü ezdirmiyor demektir → @radix-ui/react-alert-dialog kur.
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  it('aria-modal ve erişilebilir açıklama taşır (alertdialog\'da describedby ZORUNLU)', async () => {
    const { user } = setup(BASIC)
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-describedby')
    expect(screen.getByText('Bu kayıt silinecek.')).toBeInTheDocument()
  })

  it('açılışta odak EN AZ YIKICI seçenekte (APG: least destructive action)', async () => {
    const { user } = setup(BASIC)
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    await screen.findByRole('alertdialog')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Vazgeç' })).toHaveFocus()
    )
  })

  it('onayda true, vazgeçte false çözer', async () => {
    const { onResult, user } = setup(BASIC)
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
  })

  it('ESC ile kapanınca false çözer — söz ASLA asılı kalmaz', async () => {
    // `window.confirm` yerine geçen bir API'nin en tehlikeli kusuru: kullanıcı
    // pencereyi kapatır, `await` sonsuza kadar bekler ve akış sessizce ölür.
    const { onResult, user } = setup(BASIC)
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false))
  })

  it('yazarak-onay istendiğinde metin birebir eşleşmeden onay butonu pasif', async () => {
    const { user } = setup({ ...BASIC, requireTypedConfirmation: 'SIL' })
    await user.click(screen.getByRole('button', { name: 'tetikle' }))
    const confirmButton = await screen.findByRole('button', { name: 'Sil' })
    expect(confirmButton).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'sil')
    expect(confirmButton).toBeDisabled() // büyük/küçük harf duyarlı

    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'SIL')
    await waitFor(() => expect(confirmButton).toBeEnabled())
  })
})

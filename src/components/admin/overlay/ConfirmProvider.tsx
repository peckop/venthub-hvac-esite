'use client'

import * as Dialog from '@radix-ui/react-dialog'
import React from 'react'

import { useI18n } from '../../../i18n/I18nProvider'
import {
  adminButtonSecondaryClass,
  adminModalContentClass,
  adminTableActionDangerClass,
  adminTableActionPrimaryClass
} from '../../../utils/adminUi'

/**
 * ONAY YÜZEYİ — `window.confirm` yerine.
 * Cetvel: docs/standards/admin-design-standard.md §4.7, §4.8
 *
 * NEDEN `window.confirm` YASAK (2026-08-15 denetimi):
 *  · stilsiz ve i18n'i taşıyamaz,
 *  · mobilde "bu site tekrar sormasın" ile **kalıcı olarak susturulabilir** → `confirm`
 *    `false` döner, silme sessizce iptal olur ve kullanıcı hiçbir şey görmez,
 *  · ana iş parçacığını bloklar, e2e'de `page.on('dialog')` gerektirir.
 *
 * API BİLİNÇLİ OLARAK `window.confirm`'e BİREBİR OTURUR:
 *   önce:  if (!confirm(mesaj)) return
 *   sonra: if (!(await confirm({ description: mesaj }))) return
 * Böylece 18 çağrı yerinin göçü mekanik ve gözle denetlenebilir kalıyor.
 *
 * APG Alert Dialog sözleşmesi:
 *  · `role="alertdialog"` (Radix Dialog'a prop olarak geçilir; testle doğrulanır)
 *  · `aria-describedby` **ZORUNLU** (dialog'da opsiyonel, alertdialog'da değil)
 *  · açılışta odak **en az yıkıcı** seçenekte — "set focus on the least destructive action"
 *  · dışarı tıklama ile kapanmaz (yıkıcı karar kazara kapatılmamalı); ESC kapatır
 *  · butonlar sonucu özetler ("Ürünü sil" / "Vazgeç") — "Evet/Hayır" YASAK
 */

export interface ConfirmOptions {
  /** Başlık — kısa ve sonucu söyleyen. */
  title?: string
  /** Ne olacağını anlatan gövde. `aria-describedby` buna bağlanır (APG: zorunlu). */
  description: string
  /** Onay butonunun etiketi — FİİL + İSİM ("Ürünü sil"). "Evet" yazma. */
  confirmLabel?: string
  cancelLabel?: string
  /**
   * `danger` = geri alınamaz / veri kaybı. Görsel vurgu + odak vazgeç butonunda kalır.
   * `default` = ileri götüren, yıkıcı olmayan onay.
   */
  tone?: 'danger' | 'default'
  /**
   * Verilirse kullanıcı bu metni **birebir yazmadan** onay butonu etkinleşmez.
   * Cetvel §4.7'nin en üst risk kademesi: "ciddi / geri alınamaz / zincirleme sonuç".
   */
  requireTypedConfirmation?: string
}

type Resolver = (value: boolean) => void

const ConfirmContext = React.createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null)

/**
 * Onay isteyen imperatif kanca.
 * `AdminLayout` içinde `<ConfirmProvider>` mount edilmiş olmalı.
 */
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) {
    throw new Error(
      'useConfirm, <ConfirmProvider> dışında çağrıldı. Sağlayıcı admin kabuğunda mount edilir.'
    )
  }
  return ctx
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)
  const [typed, setTyped] = React.useState('')
  const resolverRef = React.useRef<Resolver | null>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const confirm = React.useCallback((next: ConfirmOptions) => {
    setTyped('')
    setOptions(next)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const settle = React.useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
    setTyped('')
  }, [])

  // Kapanış hangi yoldan gelirse gelsin (ESC, kapat butonu) söz mutlaka çözülür;
  // aksi halde çağıran `await` üzerinde SONSUZA kadar asılı kalır.
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) settle(false)
    },
    [settle]
  )

  const isDanger = options?.tone === 'danger'
  const needsTyped = Boolean(options?.requireTypedConfirmation)
  const typedOk = !needsTyped || typed.trim() === options?.requireTypedConfirmation

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog.Root open={options !== null} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          {/* Overlay = perde + body scroll lock. ASLA çıkarma (cetvel §2.5). */}
          <Dialog.Overlay className="fixed inset-0 z-backdrop bg-black/60" />
          <Dialog.Content
            // APG: onay yüzeyi `alertdialog`'dur, `dialog` değil.
            role="alertdialog"
            // Radix `aria-modal` basmıyor (dist doğrulandı) → elle.
            aria-modal="true"
            // `w-full` + `max-w-90vw`: dar ekranda kenarlara yapışmaz, geniş ekranda
            // modal genişliğinde durur (cetvel §4.10 — dialog ekranı doldurmaz).
            className={`${adminModalContentClass} w-full max-w-90vw sm:max-w-modal`}
            // Yıkıcı karar dışarı tıklamayla kazara kapatılmamalı.
            onPointerDownOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            // APG: "set focus on the least destructive action".
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              cancelRef.current?.focus()
            }}
          >
            <div className="p-6 space-y-4">
              <Dialog.Title className="text-base font-semibold text-admin-fg">
                {options?.title ?? t('admin.confirm.defaultTitle')}
              </Dialog.Title>
              {/* APG: alertdialog'da `aria-describedby` ZORUNLU. */}
              <Dialog.Description className="text-sm leading-relaxed text-admin-fg-muted">
                {options?.description}
              </Dialog.Description>

              {needsTyped && (
                <label className="block space-y-2">
                  <span className="block text-xs text-admin-fg-muted">
                    {t('admin.confirm.typeToConfirm', {
                      value: options?.requireTypedConfirmation ?? ''
                    })}
                  </span>
                  <input
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    className="w-full rounded-admin-sm border border-admin-border bg-admin-surface-2 px-3 py-2
                      text-sm text-admin-fg focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-admin-accent/30"
                  />
                </label>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={() => settle(false)}
                  className={adminButtonSecondaryClass}
                >
                  {options?.cancelLabel ?? t('admin.confirm.cancel')}
                </button>
                <button
                  type="button"
                  disabled={!typedOk}
                  onClick={() => settle(true)}
                  className={`${isDanger ? adminTableActionDangerClass : adminTableActionPrimaryClass}
                    h-12 px-6 disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {options?.confirmLabel ?? t('admin.confirm.confirm')}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  )
}

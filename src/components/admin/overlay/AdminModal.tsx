'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import React from 'react'

import { adminModalContentClass, adminModalScrollAreaClass } from '../../../utils/adminUi'

/**
 * MODAL ÇALIŞMA YÜZEYİ — elle yazılmış `fixed inset-0` overlay'lerin yerine.
 * Cetvel: docs/standards/admin-design-standard.md §4.2, §4.8, §4.10
 *
 * NİÇİN VAR (2026-08-15 ölçümü, D13/D14):
 *  Admin'de ~26 bağımsız overlay implementasyonu vardı ve ortak sarmalayıcı YOKTU.
 *  `OrdersTableBody.tsx`teki üç yüzeyde §4.8'in 11 maddesinden 8'i eksikti:
 *  `role="dialog"` yok · `aria-modal` yok · `aria-labelledby`/`aria-describedby` yok ·
 *  odak tuzağı yok · açılışta odak taşıma yok · kapanışta odağı tetikleyiciye geri
 *  verme yok · ESC yok (dosyada TEK BİR keydown handler'ı yoktu) · gövde kaydırma
 *  kilidi yok. Bunların hiçbirini tsc/lint/build görmez.
 *
 * NE ZAMAN BU, NE ZAMAN `AdminSidePanel`:
 *  · Kullanıcı bir KARAR veriyor / veri YAZIYOR (form, onay, düzenleme) → **bu bileşen**.
 *  · Kullanıcı yalnızca BAKIYOR ve arkadaki bağlam korunmalı → `AdminSidePanel`
 *    (§4.3: "Modal bir drawer, sadece şekli değişmiş bir modaldır").
 *
 * RADIX TUZAKLARI (lokal `@radix-ui/react-dialog` dist'inden doğrulandı):
 *  1. Radix `aria-modal` özniteliğini KENDİ BAŞINA BASMAZ → `Dialog.Content`e ELLE yazılır.
 *  2. Gövde kaydırma kilidi `<Dialog.Overlay>` bileşeninin İÇİNDEDİR. "Backdrop
 *     istemiyorum" diye Overlay'i çıkaran uyarlama kilidi SESSİZCE kaybeder.
 *     Overlay burada koşulsuz render edilir.
 *  3. Portal içeriği `document.body`ye taşınır → katman token'ı zorunlu
 *     (`z-backdrop`/`z-modal`), ham `z-40`/`z-50` yasak (§4.9).
 */
export interface AdminModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Görünür başlık. `aria-labelledby` buna bağlanır (§4.8/8). */
  title: string
  /** Yüzeyin ne olduğunu bir cümlede söyler; `aria-describedby` buna bağlanır (§4.8/11). */
  description: string
  /** Kapat butonunun erişilebilir adı — metin sözlükten gelir, çağıran verir. */
  closeLabel: string
  /**
   * Genişlik sınıfı. Varsayılan `max-w-modal` (420px) — cetvel §4.10 dialog'u
   * 280–560px arasında ve dar ekranda kenarlara yapışmadan ister.
   */
  widthClass?: string
  /** Aksiyon çubuğu (en fazla 2 birincil aksiyon — §4.2). */
  footer?: React.ReactNode
  children: React.ReactNode
}

export function AdminModal({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  widthClass = 'w-full max-w-90vw sm:max-w-modal',
  footer,
  children,
}: AdminModalProps): React.ReactElement {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Perde + BODY SCROLL LOCK burada yaşar — ASLA çıkarma (cetvel §2.5). */}
        <Dialog.Overlay className="fixed inset-0 z-backdrop bg-black/60" />
        <Dialog.Content
          /* Radix `aria-modal` basmıyor (dist doğrulandı) → elle (cetvel §4.8/7). */
          aria-modal="true"
          className={`${adminModalContentClass} ${widthClass}`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-admin-border p-5 md:p-6">
            <div className="min-w-0 space-y-1">
              <Dialog.Title className="text-base font-semibold leading-6 text-admin-fg">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-relaxed text-admin-fg-muted">
                {description}
              </Dialog.Description>
            </div>
            {/* APG §4.8/9: kapatma butonu tab sırasında GÖRÜNÜR olmalı. */}
            <Dialog.Close
              aria-label={closeLabel}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-admin-sm
                border border-admin-border bg-admin-surface text-admin-fg-muted transition-colors
                hover:bg-admin-surface-2 hover:text-admin-fg focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-admin-ring focus-visible:ring-offset-2
                focus-visible:ring-offset-admin-surface"
            >
              <X size={16} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className={`flex-1 ${adminModalScrollAreaClass}`}>{children}</div>

          {footer ? (
            <div
              className="flex flex-wrap items-center justify-end gap-2 border-t border-admin-border
                bg-admin-surface-2 px-5 py-4 md:px-6"
            >
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AdminModal

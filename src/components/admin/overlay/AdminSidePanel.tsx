'use client'

import { X } from 'lucide-react'
import React from 'react'
import { createPortal } from 'react-dom'

import { adminModalScrollAreaClass } from '../../../utils/adminUi'

/**
 * NON-MODAL YAN PANEL — "sadece bakılıyor" yüzeyleri için.
 * Cetvel: docs/standards/admin-design-standard.md §4.1, §4.3
 *
 * NİÇİN RADIX DIALOG DEĞİL:
 *  §4.3'ün tek cümlesi bu bileşenin varlık sebebi: *"Yan panelin ayırt edici özelliği
 *  yandan gelmesi değil, MODAL OLUP OLMAMASIDIR. Modal bir drawer, sadece şekli
 *  değişmiş bir modaldır — bağlam korunmaz."* Radix Dialog `modal={false}` ile
 *  non-modal koşabilir, ama o modda `<Dialog.Overlay>` **null döner** (dist
 *  doğrulandı) — yani "Dialog.Content varsa Dialog.Overlay da olmalı" değişmezini
 *  (INV-ADMIN-OVERLAY-2) yalnız METİN düzeyinde geçerdi: kaynakta duran ama hiç
 *  render edilmeyen bir Overlay. Bu tam olarak projenin "sessiz-yeşil" dediği şey.
 *  Bu yüzden non-modal yüzey Radix Dialog'a HİÇ girmiyor ve §4.3'ün kendi
 *  sözleşmesini elle karşılıyor.
 *
 * §4.3 NON-MODAL SÖZLEŞMESİ (Cloudscape) — dördü de burada:
 *  1. `role="region"` + `aria-labelledby` (görünür başlığa),
 *  2. açılışta odak panele girer,
 *  3. kapanışta odak TETİKLEYİCİYE döner,
 *  4. arka içerik ETKİLEŞİMLİ kalır → perde YOK, `inert` YOK, gövde kaydırma
 *     kilidi YOK (bunlar modal düzenekleridir; buraya konursa panel modal olur).
 *
 * ESC: belge seviyesinde dinlenir. Panelin KENDİ düğümüne bağlamak D14'ün ta
 * kendisidir — odak panelden çıktığı anda (non-modal'da çıkabilir) tuş hiç gelmez.
 */
export interface AdminSidePanelProps {
  open: boolean
  onClose: () => void
  /** Görünür başlık; `aria-labelledby` buna bağlanır. */
  title: string
  /** Panelin ne gösterdiğini bir cümlede söyler. */
  description: string
  /** Kapat butonunun erişilebilir adı — metin sözlükten gelir, çağıran verir. */
  closeLabel: string
  children: React.ReactNode
}

export function AdminSidePanel({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
}: AdminSidePanelProps): React.ReactElement | null {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  // `onClose` kimliği her render değişebilir; efektin bağımlılığına konursa
  // odak yeniden panele taşınır ve tetikleyici referansı PANELİN KENDİSİ olur.
  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    // `mounted` de bağımlılık: panel AÇIK olarak ilk kez monte edilirse ilk turda
    // portal henüz basılmamıştır ve `panelRef` boştur — odak sessizce taşınmazdı.
    if (!open || !mounted) return

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [open, mounted])

  if (!open || !mounted) return null

  return createPortal(
    /* `fixed` bir öğe, dönüştürülmüş (transform) bir ata içinde viewport'a değil O
       ataya göre konumlanır. Tablo kabı ileride transform alırsa panel yanlış yere
       düşerdi → portal ile `document.body`ye taşınıyor. */
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      className="fixed inset-y-0 right-0 z-modal flex w-full flex-col border-l border-admin-border
        bg-admin-surface shadow-admin-overlay focus-visible:outline-none sm:w-480px"
    >
      <div className="flex items-start justify-between gap-4 border-b border-admin-border p-5 md:p-6">
        <div className="min-w-0 space-y-1">
          <h2 id={titleId} className="text-base font-semibold leading-6 text-admin-fg">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm leading-relaxed text-admin-fg-muted">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-admin-sm
            border border-admin-border bg-admin-surface text-admin-fg-muted transition-colors
            hover:bg-admin-surface-2 hover:text-admin-fg focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-admin-ring focus-visible:ring-offset-2
            focus-visible:ring-offset-admin-surface"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className={`flex-1 ${adminModalScrollAreaClass}`}>{children}</div>
    </div>,
    document.body,
  )
}

export default AdminSidePanel

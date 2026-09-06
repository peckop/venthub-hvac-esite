'use client'

/**
 * Header "Teklif" öğesi ve açılır paneli — REC-129 Faz 1c (tasarım v13, ekran 12).
 *
 * `YENI_KABUK_GEZINMESI` bayrağı KAPALIYKEN hiç render edilmez.
 *
 * ⭐BU ÖĞE MASAÜSTÜ KURALIDIR — mobilde GİZLENİR (StickyHeader'da `hidden md:block`).
 * Sebep varsayım değil, GÖRÜLDÜ: bayrak açık hâliyle ekran görüntüsü alındığında
 * mobilde "Teklif" hem burada hem alt sekme çubuğunda duruyordu — aynı ad, aynı iş,
 * iki farklı davranış (burası panel açıyor, çubuk `/cart`'a gidiyordu). Tasarım v13
 * (K5/K9) mobilde üstte yalnız logo + arama istiyor. Mobilde panelin girişi artık
 * alt çubuğun Teklif sekmesidir.
 *
 * İÇERİK BURADA DEĞİL: üç hâl (dolu / boş / girişsiz), fotoğrafın niçin olmadığı ve
 * "Teklif iste" düğmesinin niçin meşru olduğu → `TeklifPaneliIcerigi`. İçerik iki
 * yüzeyde çizildiği için tek kaynağa taşındı; burası yalnız DÜĞME ve ÇERÇEVE.
 */
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { YENI_KABUK_GEZINMESI } from '../../config/features'
import { useCart } from '../../hooks/useCartHook'
import { useI18n } from '../../i18n/I18nProvider'
import TeklifPaneliIcerigi from './TeklifPaneliIcerigi'

export default function HeaderTeklifPaneli() {
  const { t } = useI18n()
  const pathname = usePathname()
  const { getCartCount } = useCart()

  const [acik, setAcik] = useState(false)
  const [gomulu, setGomulu] = useState(false)
  const baslikId = useId()
  const dugme = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // Sayı SUNUCUDA çizilmez: sepet istemci durumudur, sunucu HTML'ine yazılırsa
  // hidrasyon uyuşmazlığı olur (StickyHeader'daki `isMounted` deseninin aynısı).
  useEffect(() => setGomulu(true), [])

  // Gezinince panel kapanır — yoksa yeni sayfada havada kalır.
  useEffect(() => setAcik(false), [pathname])

  const kapat = useCallback(() => {
    setAcik(false)
    dugme.current?.focus()
  }, [])

  useEffect(() => {
    if (!acik) return
    const tus = (e: KeyboardEvent) => { if (e.key === 'Escape') kapat() }
    const disari = (e: MouseEvent) => {
      const h = e.target as Node
      if (!panel.current?.contains(h) && !dugme.current?.contains(h)) setAcik(false)
    }
    document.addEventListener('keydown', tus)
    document.addEventListener('mousedown', disari)
    return () => {
      document.removeEventListener('keydown', tus)
      document.removeEventListener('mousedown', disari)
    }
  }, [acik, kapat])

  if (!YENI_KABUK_GEZINMESI) return null

  const sayi = gomulu ? getCartCount() : 0

  return (
    <div className="relative">
      <button
        ref={dugme}
        type="button"
        aria-expanded={acik}
        aria-haspopup="dialog"
        onClick={() => setAcik((a) => !a)}
        className={
          'flex items-center gap-2 rounded-lg px-3 min-h-11 text-sm font-semibold ' +
          'text-primary-navy hover:bg-light-gray focus-visible:outline-none ' +
          'focus-visible:ring-2 focus-visible:ring-primary-navy'
        }
      >
        <span>{t('teklifPaneli.teklif')}</span>
        {sayi > 0 && (
          // Zemin `--brand-cyan-ink` (#00708F): beyaz metinle ölçülen kontrast 5.65:1
          // (AA 4.5 eşiğinin üstünde). K25-b: "Teklif/Sepet sayacı zemini
          // --brand-cyan-ink, metin beyaz". Ham turkuaz (#0088B0, 4.08) burada
          // KULLANILMAZ — bu yüzden ayrı bir koyu token var.
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan-ink px-1 text-xs font-bold text-clean-white">
            {sayi}
          </span>
        )}
        {/* Sayı SÖZLE de veriliyor: rozet tek başına bilgi taşıyıcısı olamaz. */}
        <span className="sr-only">{t('teklifPaneli.kalemSayisi').replace('{n}', String(sayi))}</span>
      </button>

      {acik && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby={baslikId}
          className="absolute right-0 z-50 mt-2 w-80 max-h-mobil-yaprak overflow-y-auto rounded-hvac-md border border-light-gray bg-clean-white p-4 shadow-2xl"
        >
          <TeklifPaneliIcerigi kapat={kapat} baslikId={baslikId} />
        </div>
      )}
    </div>
  )
}

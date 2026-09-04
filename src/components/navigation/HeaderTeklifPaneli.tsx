'use client'

/**
 * Header "Teklif" öğesi ve paneli — REC-129 Faz 1c (tasarım v13, ekran 12).
 *
 * `YENI_KABUK_GEZINMESI` bayrağı KAPALIYKEN hiç render edilmez.
 *
 * ÜÇ HÂL — üçü de tasarımda ayrı çizildi ve üçü de burada var:
 *  1. DOLU     — "Teklif listesi · N kalem", en fazla 3 satır, teklif talebi düğmesi, kısayollar.
 *  2. BOŞ      — "Teklif listesi boş / Ürünlerden ekleyin" + tek çıkış.
 *  3. GİRİŞSİZ — liste + talep düğmesi, ama hesaba bağlı kısayollar YOK; yerine giriş daveti.
 *
 * ⭐NİÇİN GİRİŞSİZDE "Tekliflerim / Projelerim / Favorilerim" GİZLİ:
 * Üçü de `/account/**` altına gider; girişsiz ziyaretçi tıklarsa giriş duvarına çarpar.
 * Görünen ama çalışmayan kapı, olmayan kapıdan kötüdür. Tasarım da o hâlde tek satırlık
 * giriş daveti gösteriyor. (Tasarımın girişsiz bloğunda kısayolların tekrar görünüp
 * görünmediği METİN OLARAK BELİRSİZDİ; "ölü kapı açma" ilkesine göre karar verildi ve
 * karar burada YAZILI — sonradan tersi istenirse bilinçli değiştirilir.)
 *
 * ⛔TASARIMDAKİ "[foto]" YOK — VE UYDURULMADI:
 * Ekran 12 her satırda ürün fotoğrafı gösteriyor. Ölçüldü: `image_url` kolonu DB'den
 * DROP edilmiş ve tipte de `Omit`'lenmiş (`src/types/db-rows.ts`, "DroppedLegacyProductColumns").
 * Yani bugün bu satırlar için fotoğraf KAYNAĞI yok. Sepet sayfası da bu yüzden fotoğraf
 * değil marka ikonu kullanıyor; aynı desen burada da kullanıldı. Fotoğraf ayrı bir iştir
 * (ürün görseli kaynağı), bu bileşenin kapsamında değil ve kapsıyormuş gibi yapılmıyor.
 *
 * ⭐"TEKLİF İSTE" NİÇİN BURADA MEŞRU (geri-bildirim §36 ile çelişmiyor):
 * §36, mobil MENÜDEN "Teklif iste"yi kaldırdı çünkü orada NESNESİZDİ ("hangi ürün?").
 * Buradaki panel zaten teklif listesini gösteriyor; düğmenin nesnesi LİSTENİN KENDİSİ.
 * Bu ayrım not düşülüyor ki ileride "bu kaldırılmıştı" diye yanlışlıkla geri alınmasın.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { YENI_KABUK_GEZINMESI } from '../../config/features'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCartHook'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import QuoteRequestButton from '../quotes/QuoteRequestButton'

/** Panelde en fazla kaç kalem gösterilir — tasarım v13 ekran 12. */
const GOSTERILEN_KALEM = 3

export default function HeaderTeklifPaneli() {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const pathname = usePathname()
  const { items, getCartCount } = useCart()
  const { user } = useAuth()

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
  const gosterilen = gomulu ? items.slice(0, GOSTERILEN_KALEM) : []
  const bos = gomulu && sayi === 0

  const kisayol =
    'block rounded-lg px-3 py-2 min-h-11 text-sm text-industrial-gray ' +
    'hover:bg-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy'

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
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-navy px-1 text-xs font-bold text-clean-white">
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
          <h2 id={baslikId} className="mb-3 text-sm font-semibold text-primary-navy">
            {bos
              ? t('teklifPaneli.bosBaslik')
              : t('teklifPaneli.baslik').replace('{n}', String(sayi))}
          </h2>

          {bos ? (
            <>
              <p className="mb-3 text-sm text-steel-gray">{t('teklifPaneli.bosAciklama')}</p>
              <Link href={Routes.products()} onClick={kapat} className={kisayol}>
                {t('teklifPaneli.urunlereGit')}
              </Link>
            </>
          ) : (
            <>
              <ul className="mb-3 flex flex-col gap-2">
                {gosterilen.map((k) => (
                  <li key={k.id} className="flex flex-col">
                    <span className="text-sm text-industrial-gray">{k.product.name}</span>
                    {/* Marka + SKU: fotoğraf kaynağı olmadığı için ayırt edici bilgi
                        bunlar (sepet sayfasıyla aynı desen). */}
                    <span className="text-xs text-steel-gray">
                      {k.product.brand}
                      {k.product.sku ? ` · ${k.product.sku}` : ''}
                    </span>
                  </li>
                ))}
              </ul>

              {sayi > GOSTERILEN_KALEM && (
                <Link href={Routes.cart()} onClick={kapat} className={kisayol}>
                  {t('teklifPaneli.tumListe').replace('{n}', String(sayi))}
                </Link>
              )}

              <div className="mb-3">
                <QuoteRequestButton
                  source="cart"
                  items={items.map((k) => ({
                    productId: k.product.id,
                    productName: k.product.name,
                    qty: k.quantity,
                  }))}
                />
              </div>
            </>
          )}

          <nav className="flex flex-col gap-1 border-t border-light-gray pt-3">
            {user ? (
              <>
                <Link href={Routes.account.quotes()} onClick={kapat} className={kisayol}>
                  {t('teklifPaneli.tekliflerim')}
                </Link>
                <Link href={Routes.account.projects()} onClick={kapat} className={kisayol}>
                  {t('teklifPaneli.projelerim')}
                </Link>
                <Link href={Routes.account.favorites()} onClick={kapat} className={kisayol}>
                  {t('teklifPaneli.favorilerim')}
                </Link>
              </>
            ) : (
              // Girişsizde hesaba bağlı kısayol GÖSTERİLMEZ (yukarıdaki gerekçe):
              // görünen ama giriş duvarına çarpan kapı, olmayan kapıdan kötüdür.
              <Link href={Routes.auth.login()} onClick={kapat} className={kisayol}>
                {t('teklifPaneli.girisDaveti')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}

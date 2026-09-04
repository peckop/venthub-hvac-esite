'use client'

/**
 * Mobil alt sekme çubuğu — REC-129 Faz 1b (tasarım v13, ekran 01/02/12).
 *
 * Beş sekme: Ana sayfa · Ürünler · Teklif (rozet) · Destek · Hesap.
 * `YENI_KABUK_GEZINMESI` bayrağı KAPALIYKEN hiç render edilmez (bileşen `null` döner),
 * ve açıkken de yalnız `md` altı kırılımda görünür — masaüstünde `hidden`.
 *
 * ⭐NİÇİN KENDİ PANELİNİ TAŞIYOR (ölçüldü, varsayılmadı):
 * "Ürünler'e dokununca header'ın menüsü açılsın" tasarlanabilirdi ama AÇILAMAZ:
 * `useNavigationState` bir CONTEXT değil, bileşen-yerel `useState`'tir (ölçüldü:
 * depoda `NavigationContext`/`NavigationProvider` YOK). Bu çubuktan çağrılsa
 * StickyHeader'ınkinden AYRI bir durum açardı ve header'ın menüsü açılmazdı.
 * Bu yüzden çubuk kendi alt panelini yönetir. Durumu birleştirmek Faz 1c'nin işidir
 * (header tek öğeye inerken); burada sahte bir birleşme taklidi yapılmıyor.
 *
 * ⛔BU BİLEŞENİN VAAT ETMEDİĞİ ŞEY: "Teklif" sekmesindeki sayı teklif listesindeki
 * kalem sayısıdır — sipariş değil. Site teklif modundadır ve buradaki hiçbir metin
 * satın alma/sipariş vaat etmez (vaat-bütünlüğü cetveli §1.4).
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { YENI_KABUK_GEZINMESI } from '../../config/features'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCartHook'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import LanguageSwitcher from '../LanguageSwitcher'
import TeklifPaneliIcerigi from './TeklifPaneliIcerigi'

type SekmeKimlik = 'anasayfa' | 'urunler' | 'teklif' | 'destek' | 'hesap'

/** 44px dokunma hedefi — v13 ekran 01. Token: `min-h-11` = 2.75rem = 44px. */
const DOKUNMA_HEDEFI = 'min-h-11 min-w-11'

function Ikon({ d, dolu = false }: { d: string; dolu?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={dolu ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

const YOLLAR: Record<SekmeKimlik, string> = {
  anasayfa: 'M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75',
  // "Ürünler" ikonu marka işaretinin sadeleştirilmiş hâli (eğik kanatçık) — v13.
  urunler: 'M4 7.5h10.5a3.5 3.5 0 1 1-3.5 3.5M4 12h6.5M4 16.5h13a3.5 3.5 0 1 0-3.5-3.5',
  teklif: 'M6 7V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 7Z',
  destek: 'M12 18.75a6.75 6.75 0 1 0-6.75-6.75v4.5A2.25 2.25 0 0 0 7.5 18.75h.75v-6h-3M18.75 12.75h-3v6h.75a2.25 2.25 0 0 0 2.25-2.25v-3.75',
  hesap: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
}

export default function MobilAltSekmeCubugu() {
  // Bayrak kapalıyken HİÇBİR şey render edilmez — hook'lardan önce dönmüyoruz ki
  // React hook sırası bozulmasın; erken dönüş en aşağıda, tüm hook'lardan sonra.
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const pathname = usePathname()
  const { getCartCount } = useCart()
  const { user } = useAuth()

  const [destekAcik, setDestekAcik] = useState(false)
  const [urunlerAcik, setUrunlerAcik] = useState(false)
  const [teklifAcik, setTeklifAcik] = useState(false)
  const [hesapAcik, setHesapAcik] = useState(false)
  const [gomulu, setGomulu] = useState(false)
  const destekBaslikId = useId()
  const urunlerBaslikId = useId()
  const teklifBaslikId = useId()
  const hesapBaslikId = useId()
  const destekDugmesi = useRef<HTMLButtonElement>(null)
  const urunlerDugmesi = useRef<HTMLButtonElement>(null)
  const teklifDugmesi = useRef<HTMLButtonElement>(null)
  const hesapDugmesi = useRef<HTMLButtonElement>(null)

  // Rozet SUNUCUDA çizilmez: sepet sayısı istemci durumudur ve sunucu HTML'ine
  // yazılırsa hidrasyon uyuşmazlığı olur. StickyHeader'daki `isMounted` deseni.
  useEffect(() => setGomulu(true), [])

  // Yol değişince açık panelleri kapat — yoksa gezindikten sonra panel havada kalır.
  useEffect(() => {
    setDestekAcik(false)
    setUrunlerAcik(false)
    setTeklifAcik(false)
    setHesapAcik(false)
  }, [pathname])

  const kapat = useCallback(() => {
    setDestekAcik(false)
    setUrunlerAcik(false)
    setTeklifAcik(false)
    setHesapAcik(false)
  }, [])

  // Escape ile kapanma + odağı açan düğmeye geri verme (a11y: klavye tuzağı yok).
  useEffect(() => {
    if (!destekAcik && !urunlerAcik && !teklifAcik && !hesapAcik) return
    const el = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const geriDonulecek = destekAcik
        ? destekDugmesi.current
        : urunlerAcik
          ? urunlerDugmesi.current
          : teklifAcik
            ? teklifDugmesi.current
            : hesapDugmesi.current
      kapat()
      geriDonulecek?.focus()
    }
    document.addEventListener('keydown', el)
    return () => document.removeEventListener('keydown', el)
  }, [destekAcik, urunlerAcik, teklifAcik, hesapAcik, kapat])

  const sayi = gomulu ? getCartCount() : 0
  const aktif = (yol: string) => pathname === yol || pathname.startsWith(`${yol}/`)

  if (!YENI_KABUK_GEZINMESI) return null

  const sekmeSinifi = (secili: boolean) =>
    [
      'flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2',
      DOKUNMA_HEDEFI,
      'text-xs font-medium leading-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-1',
      secili ? 'text-primary-navy' : 'text-steel-gray',
    ].join(' ')

  const yaprakOgesi =
    'flex items-center gap-3 rounded-lg px-4 py-3 min-h-11 text-sm text-industrial-gray ' +
    'hover:bg-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy'

  return (
    <>
      {(destekAcik || urunlerAcik || teklifAcik) && (
        // Perde: panel açıkken arkaya dokunmak kapatır. `aria-hidden` çünkü perdenin
        // kendisi okunacak bir içerik değil; kapatma yolu Escape ve düğme ile de var.
        <div
          aria-hidden="true"
          onClick={kapat}
          className="fixed inset-0 z-40 bg-industrial-gray/40 md:hidden"
        />
      )}

      {urunlerAcik && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={urunlerBaslikId}
          className="fixed inset-x-0 bottom-0 z-50 max-h-mobil-yaprak overflow-y-auto rounded-t-2xl bg-clean-white p-4 shadow-2xl md:hidden"
        >
          <h2 id={urunlerBaslikId} className="mb-3 text-base font-semibold text-primary-navy">
            {t('altSekme.urunler')}
          </h2>
          <nav className="flex flex-col gap-1">
            <Link href={Routes.products()} onClick={kapat} className={yaprakOgesi}>
              {t('altSekme.tumUrunler')}
            </Link>
            <Link href={Routes.brands()} onClick={kapat} className={yaprakOgesi}>
              {t('altSekme.markalar')}
            </Link>
          </nav>
        </div>
      )}

      {destekAcik && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={destekBaslikId}
          className="fixed inset-x-0 bottom-0 z-50 max-h-mobil-yaprak overflow-y-auto rounded-t-2xl bg-clean-white p-4 shadow-2xl md:hidden"
        >
          <h2 id={destekBaslikId} className="mb-3 text-base font-semibold text-primary-navy">
            {t('altSekme.destek')}
          </h2>
          <nav className="flex flex-col gap-1">
            <Link href={Routes.destek.home()} onClick={kapat} className={yaprakOgesi}>
              {t('altSekme.teknikDestek')}
            </Link>
            <Link href={Routes.contact()} onClick={kapat} className={yaprakOgesi}>
              {t('altSekme.iletisim')}
            </Link>
          </nav>
        </div>
      )}

      {hesapAcik && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={hesapBaslikId}
          className="fixed inset-x-0 bottom-0 z-50 max-h-mobil-yaprak overflow-y-auto rounded-t-2xl bg-clean-white p-4 shadow-2xl md:hidden"
        >
          <h2 id={hesapBaslikId} className="mb-3 text-base font-semibold text-primary-navy">
            {t('altSekme.hesap')}
          </h2>

          {/* ⭐DİL EN ÜSTTE — yüzen seçici kaldırıldığı için mobildeki TEK dil girişi
              burasıdır. Aşağı konsaydı ve liste uzasaydı görünmeyebilirdi. */}
          <div className="mb-3 flex items-center justify-between border-b border-light-gray pb-3">
            <span className="text-sm text-steel-gray">{t('altSekme.dil')}</span>
            <LanguageSwitcher id="alt-sekme-dil-secici" />
          </div>

          <nav className="flex flex-col gap-1">
            {user ? (
              <>
                <Link href={Routes.account.overview()} onClick={kapat} className={yaprakOgesi}>
                  {t('altSekme.hesabim')}
                </Link>
                <Link href={Routes.account.quotes()} onClick={kapat} className={yaprakOgesi}>
                  {t('teklifPaneli.tekliflerim')}
                </Link>
                <Link href={Routes.account.projects()} onClick={kapat} className={yaprakOgesi}>
                  {t('teklifPaneli.projelerim')}
                </Link>
              </>
            ) : (
              <>
                <Link href={Routes.auth.login()} onClick={kapat} className={yaprakOgesi}>
                  {t('altSekme.girisYapin')}
                </Link>
                {/* ⭐KİLİTLİ — bağlantı DEĞİL: Recep hükmü "Tekliflerim/Projelerim
                    kilitli". Görünürler ki hesapla ne kazanılacağı bilinsin, ama
                    tıklanamazlar; tıklanabilir olsalar giriş duvarına çarpan ÖLÜ KAPI
                    olurlardı. `aria-disabled` ile ekran okuyucuya da kilitli denir. */}
                {/* Anahtarlar LİTERAL yazılı, döngüyle değil: `t(değişken)` çağrısında
                    ölü-anahtar bekçisi anahtarı GÖREMEZ ve sözlükten silinse kimse
                    fark etmez. Kapı bunu yakaladı; iki satır tekrar, bir kör nokta. */}
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 min-h-11 text-sm text-steel-gray opacity-60"
                >
                  {t('teklifPaneli.tekliflerim')}
                  <span className="text-xs">{t('altSekme.kilitli')}</span>
                </span>
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 min-h-11 text-sm text-steel-gray opacity-60"
                >
                  {t('teklifPaneli.projelerim')}
                  <span className="text-xs">{t('altSekme.kilitli')}</span>
                </span>
              </>
            )}
          </nav>
        </div>
      )}

      {teklifAcik && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={teklifBaslikId}
          className="fixed inset-x-0 bottom-0 z-50 max-h-mobil-yaprak overflow-y-auto rounded-t-2xl bg-clean-white p-4 shadow-2xl md:hidden"
        >
          {/* İçerik header panelininkiyle AYNI BİLEŞEN — kopyalanmadı. İki yüzey
              zamanla ayrışsaydı hiçbir kapı bunu görmezdi; tek kaynak bunu imkânsız kılar. */}
          <TeklifPaneliIcerigi kapat={kapat} baslikId={teklifBaslikId} />
        </div>
      )}

      <nav
        aria-label={t('altSekme.etiket')}
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-light-gray bg-clean-white pb-guvenli-alan md:hidden"
      >
        <Link href={Routes.home()} className={sekmeSinifi(pathname === Routes.home())}>
          <Ikon d={YOLLAR.anasayfa} />
          {t('altSekme.anasayfa')}
        </Link>

        <button
          ref={urunlerDugmesi}
          type="button"
          aria-expanded={urunlerAcik}
          onClick={() => { setDestekAcik(false); setUrunlerAcik((a) => !a) }}
          className={sekmeSinifi(aktif(Routes.products()) || urunlerAcik)}
        >
          <Ikon d={YOLLAR.urunler} />
          {t('altSekme.urunler')}
        </button>

        {/* ⭐DÜĞME, BAĞLANTI DEĞİL — ve bu düzeltme ölçüme dayanıyor:
            Önce `/cart`'a giden bir `Link`'ti. Bayrak açık hâliyle görüntülendiğinde
            mobilde header'daki "Teklif" öğesiyle YAN YANA duruyordu; ikisi aynı işi
            iki farklı davranışla sunuyordu (biri panel, biri sayfa). Header öğesi
            mobilde gizlendi, panelin girişi BURASI oldu — böylece "Teklif" mobilde
            TEK yerde ve TEK davranışta. Tam liste hâlâ panelin içinden `/cart`'a gider. */}
        <button
          ref={teklifDugmesi}
          type="button"
          aria-expanded={teklifAcik}
          aria-haspopup="dialog"
          onClick={() => { setUrunlerAcik(false); setDestekAcik(false); setTeklifAcik((a) => !a) }}
          className={sekmeSinifi(aktif(Routes.cart()) || teklifAcik)}
        >
          <span className="relative">
            <Ikon d={YOLLAR.teklif} />
            {sayi > 0 && (
              <span
                // Rozet TEK BAŞINA anlam taşımaz: yanındaki metin ("Teklif") ve
                // aria-label sayıyı sözle de söyler. Renk tek bilgi taşıyıcı değil.
                className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-navy px-1 text-xs font-bold text-clean-white"
              >
                {sayi}
              </span>
            )}
          </span>
          <span>{t('altSekme.teklif')}</span>
          <span className="sr-only">{t('altSekme.teklifSayisi').replace('{n}', String(sayi))}</span>
        </button>

        <button
          ref={destekDugmesi}
          type="button"
          aria-expanded={destekAcik}
          onClick={() => { setUrunlerAcik(false); setDestekAcik((a) => !a) }}
          className={sekmeSinifi(destekAcik)}
        >
          <Ikon d={YOLLAR.destek} />
          {t('altSekme.destek')}
        </button>

        {/* ⭐YAPRAK AÇAR — Recep hükmü (2026-09-04 12:30). Önce koşulsuz `/account`'a
            bağlıyordu ve girişsiz ziyaretçi giriş duvarına çarpıyordu (görüntüde
            görüldü). Ara çözüm olarak girişsizde doğrudan girişe yollamıştım; hüküm
            bundan farklı: yaprak açılır, EN ÜSTÜNDE dil seçici (yüzen düğme kalktığı
            için mobildeki tek dil girişi burasıdır), altında giriş daveti ya da
            hesap kısayolları. */}
        <button
          ref={hesapDugmesi}
          type="button"
          aria-expanded={hesapAcik}
          aria-haspopup="dialog"
          onClick={() => { setUrunlerAcik(false); setDestekAcik(false); setTeklifAcik(false); setHesapAcik((a) => !a) }}
          className={sekmeSinifi(aktif(Routes.account.overview()) || hesapAcik)}
        >
          <Ikon d={YOLLAR.hesap} />
          {t('altSekme.hesap')}
        </button>
      </nav>
    </>
  )
}

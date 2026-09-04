'use client'

import { usePathname } from 'next/navigation'
import React, { lazy, Suspense, useEffect, useState } from 'react'

import { YENI_KABUK_GEZINMESI } from '../../config/features'
import { useScrollThrottle } from '../../hooks/useScrollThrottle'
import BackToTopButton from '../BackToTopButton'
import Footer from '../Footer'
import LanguageSwitcher from '../LanguageSwitcher'
// Bileşenler
import MobilAltSekmeCubugu from '../navigation/MobilAltSekmeCubugu'
import PaymentWatcher from '../PaymentWatcher'
import ScrollToTop from '../ScrollToTop'
import StickyHeader from '../StickyHeader'


// Lazy Overlays
const Toaster = lazy(() => import('sonner').then(m => ({ default: m.Toaster })))
const AddToCartToast = lazy(() => import('../AddToCartToast'))
const WhatsAppFloat = lazy(() => import('../WhatsAppFloat'))

interface MainLayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    
    const isScrolled = useScrollThrottle({ 
        showAt: 100, 
        hideBelow: 60, 
        throttleMs: 16, 
        initialDelayMs: 180, 
        syncKey: pathname || '' 
    })

    // --- Global Overlays Logic ---
    const [enableToaster, setEnableToaster] = useState(false)
    useEffect(() => {
        const enable = () => setEnableToaster(true)
        window.addEventListener('pointerdown', enable, { once: true })
        window.addEventListener('keydown', enable, { once: true })
        return () => {
            window.removeEventListener('pointerdown', enable)
            window.removeEventListener('keydown', enable)
        }
    }, [])

    const [enableWhatsApp, setEnableWhatsApp] = useState(false)
    useEffect(() => {
        const enable = () => setEnableWhatsApp(true)
        window.addEventListener('scroll', enable, { once: true, passive: true })
        return () => window.removeEventListener('scroll', enable)
    }, [])

    /**
     * ADMIN: hiçbir kabuk sarmalamaz — `AdminLayout` tek ve tam kabuktur.
     *
     * Eskiden burada `min-h-screen` + kendi marka çubuğu vardı; `AdminLayout` ise
     * `h-screen` + `overflow-hidden` kuruyordu. İkisi aynı dikey akışta olduğu için
     * toplam yükseklik DAİMA viewport + çubuk oluyordu → kalıcı iki scrollbar, footer
     * hep katlanın altında, üst üste iki marka çubuğu, zoom'da büyüyen kırılma.
     * Ayrıca bu erken dönüş aşağıdaki `<Toaster/>` bloğunu atlıyordu, yani admin'deki
     * 127 `toast.*` çağrısı sessizce ölüydü (denetim 2026-08-15, D1 ve D11).
     *
     * Cetvel: docs/standards/admin-design-standard.md §2.1 — "Kabuk kökü scroll
     * konteyneri olamaz" ve kabuk başına tek tam-ekran katman.
     * Toaster artık `AdminLayout` içinde mount ediliyor.
     */
    if (isAdmin) {
        return <>{children}</>
    }

    return (
        <div className="relative min-h-screen bg-white flex flex-col">
            <ScrollToTop />
            
            <StickyHeader isScrolled={isScrolled} />

            {/* Sayfa Geçişleri için Animasyonu kapattık (Sorun kaynağı buydu) */}
            <main 
                id="main-content" 
                className="flex-grow transition-colors duration-300"
            >
                {children}
            </main>

            {/* ⭐YÜZEN YIĞIN MOBİLDE ÇUBUĞUN ÜSTÜNE ÇIKAR — ve bu KOZMETİK DEĞİL:
                Dil seçici buradan kaldırıldıktan sonra bile yığın (geri-yukarı,
                WhatsApp) alt sekme çubuğunun sağ ucuna biniyor ve **"Hesap" sekmesi
                TIKLANAMIYOR**. Ekran görüntüsünde görünmüyordu — düğmeler o an
                görünmezdi ama kapsayıcıları dokunuşu yutuyordu; kusuru ancak sekmeye
                DOKUNMAYA çalışınca gördük (Playwright "subtree intercepts pointer
                events" dedi). Göz de kaçırabilir; etkileşim yakaladı.
                `bottom-24` (6rem) çubuğun 44px dokunma hedefi + güvenli alanını aşar.
                Ölçek değeri, keyfi Tailwind değeri değil (kural 8).
                Bayrak KAPALIYKEN bugünkü konum aynen sürer. */}
            <div
                className={`fixed right-6 z-toast flex flex-col items-end gap-3 pointer-events-none ${
                    YENI_KABUK_GEZINMESI ? 'bottom-24 md:bottom-6' : 'bottom-6'
                }`}
            >
                <div className="pointer-events-auto">
                    <BackToTopButton />
                </div>
                
                {enableWhatsApp && (
                    <div className="pointer-events-auto">
                        <Suspense fallback={null}>
                            <WhatsAppFloat />
                        </Suspense>
                    </div>
                )}

                {/* ⭐YÜZEN DİL SEÇİCİ BAYRAK AÇIKKEN YOK — Recep hükmü (2026-09-04 12:30):
                    "yeni tasarımda yüzen dil seçici yok." Kaldırılmıyor, TAŞINIYOR:
                    masaüstünde header'ın sağ kümesine, mobilde alt çubuğun Hesap
                    yaprağının en üstüne. Önce yalnız yukarı kaydırmıştım (alt çubuğu
                    kapatmasın diye); o çakışmayı çözerdi ama tasarım kararına uymazdı.
                    Bayrak KAPALIYKEN bugünkü yüzen hâl aynen sürer. */}
                {!YENI_KABUK_GEZINMESI && (
                    <div className="pointer-events-auto">
                        <LanguageSwitcher />
                    </div>
                )}
            </div>

            <PaymentWatcher />
            <Footer />

            {/* REC-129 Faz 1b — mobil alt sekme çubuğu.
                BAYRAK KAPALIYKEN bileşen `null` döner; yani bugün müşteri hiçbir şey
                görmez. Buna rağmen BAĞLANIYOR: bağlanmamış bir bileşen "indi" sayılır
                ama erişilebilir olmaz ve bayrak açıldığı gün eksik olduğu fark edilir.
                Kapı (INV-ALTSEKME-1) bu bağın varlığını da ölçer. */}
            <MobilAltSekmeCubugu />

            {enableToaster && (
                <Suspense fallback={null}>
                    <AddToCartToast />
                    <Toaster
                        richColors
                        position="top-right"
                    />
                </Suspense>
            )}
        </div>
    )
}

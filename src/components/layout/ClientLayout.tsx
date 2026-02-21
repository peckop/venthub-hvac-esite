'use client'

import React, { Suspense, lazy } from 'react'
import { CartProvider } from '../../contexts/CartProvider'
import { AuthProvider } from '../../contexts/AuthContext'
import { useScrollThrottle } from '../../hooks/useScrollThrottle'
import { usePathname } from 'next/navigation'

import StickyHeader from '../StickyHeader'
import ScrollToTop from '../ScrollToTop'
import LanguageSwitcher from '../LanguageSwitcher'
import PaymentWatcher from '../PaymentWatcher'
import BackToTopButton from '../BackToTopButton'
import LoadingSpinner from '../LoadingSpinner'
import Footer from '../Footer'

const Toaster = lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })))
const AddToCartToast = lazy(() => import('../AddToCartToast'))
const WhatsAppFloat = lazy(() => import('../WhatsAppFloat'))

import { I18nProvider } from '../../i18n/I18nProvider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </AuthProvider>
        </I18nProvider>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isScrolled = useScrollThrottle({ showAt: 100, hideBelow: 60, throttleMs: 16, initialDelayMs: 180, syncKey: pathname || '' })

    const [enableToaster, setEnableToaster] = React.useState(false)
    React.useEffect(() => {
        if (enableToaster) return
        const enable = () => {
            setEnableToaster(true)
            window.removeEventListener('pointerdown', enable)
            window.removeEventListener('keydown', enable)
            window.removeEventListener('touchstart', enable)
        }
        window.addEventListener('pointerdown', enable, { once: true })
        window.addEventListener('keydown', enable, { once: true })
        window.addEventListener('touchstart', enable, { once: true })
        return () => {
            window.removeEventListener('pointerdown', enable)
            window.removeEventListener('keydown', enable)
            window.removeEventListener('touchstart', enable)
        }
    }, [enableToaster])

    const [enableWhatsApp, setEnableWhatsApp] = React.useState(false)
    React.useEffect(() => {
        try {
            const coarse = window.matchMedia('(pointer: coarse)').matches
            if (!coarse || enableWhatsApp) return
            const enable = () => {
                setEnableWhatsApp(true)
                window.removeEventListener('scroll', enable)
                window.removeEventListener('pointerdown', enable)
                window.removeEventListener('touchstart', enable)
            }
            window.addEventListener('scroll', enable, { once: true, passive: true })
            window.addEventListener('pointerdown', enable, { once: true })
            window.addEventListener('touchstart', enable, { once: true })
            return () => {
                window.removeEventListener('scroll', enable)
                window.removeEventListener('pointerdown', enable)
                window.removeEventListener('touchstart', enable)
            }
        } catch { }
    }, [enableWhatsApp])

    // --- Navigation History Tracker (VH Smart Nav Stack Logic) ---
    React.useEffect(() => {
        if (typeof window === 'undefined') return

        // 1. Native Tarayıcı Geri/İleri buton dinleyicisi
        const handlePopState = () => {
            sessionStorage.setItem('vh_is_pop', 'true')
        }
        window.addEventListener('popstate', handlePopState)

        // 2. State temizliği (Gelecek PUSH navigasyonlarını etkilememesi için)
        // Diğer bileşenlerin (useManualScrollRestoration) okumasına fırsat vermek için kısa bir delay ile sıfırlanır
        const popResetTimeout = setTimeout(() => {
            sessionStorage.setItem('vh_is_pop', 'false')
        }, 800)

        // pathname + search + hash bilgisini tam olarak al
        const currentFullPath = window.location.pathname + window.location.search + window.location.hash

        // Ürün sayfaları "durak" sayfası sayılmaz, hiyerarşiyi bozmamak için diziye eklenmezler.
        if (currentFullPath.includes('/products/')) return

        let stack: string[] = [];
        try {
            stack = JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]');
        } catch { stack = []; }

        const lastItem = stack[stack.length - 1]
        const secondLastItem = stack[stack.length - 2]

        // SADECE pathname değiştiğinde veya yeni bir hash eklendiğinde işlem yap
        if (currentFullPath === lastItem) return

        if (currentFullPath === secondLastItem) {
            // Geri gelmişiz (Hiyerarşide bir üst basamak), mevcut durağı temizle
            stack.pop()
        } else {
            // Yeni bir durak veya mevcut durağın hash güncellemesi
            // Eğer sadece hash değiştiyse (aynı pathname), son elemanı güncelle
            if (lastItem && lastItem.split('#')[0] === currentFullPath.split('#')[0]) {
                stack[stack.length - 1] = currentFullPath
            } else {
                // Tamamen yeni bir sayfa, stack'e ekle
                stack.push(currentFullPath)
            }
            if (stack.length > 10) stack.shift()
        }

        sessionStorage.setItem('vh_nav_stack', JSON.stringify(stack))

        return () => {
            window.removeEventListener('popstate', handlePopState)
            clearTimeout(popResetTimeout)
        }
    }, [pathname])

    return (
        <div className="min-h-screen bg-white">
            <ScrollToTop />
            <StickyHeader isScrolled={isScrolled} />

            <main id="main-content" className={isScrolled ? 'pt-16' : ''}>
                <BackToTopButton />
                {(() => {
                    try { return typeof window !== 'undefined' && localStorage.getItem('vh_pending_order') ? <PaymentWatcher /> : null } catch { return null }
                })()}
                <LanguageSwitcher />
                <Suspense fallback={<LoadingSpinner />}>
                    {children}
                </Suspense>
            </main>

            <Footer />

            {enableWhatsApp && (
                <Suspense fallback={null}>
                    <WhatsAppFloat />
                </Suspense>
            )}

            {enableToaster && (
                <Suspense fallback={null}>
                    <AddToCartToast />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: { background: '#FFFFFF', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '0.75rem', fontSize: '14px' },
                            success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
                            error: { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
                        }}
                    />
                </Suspense>
            )}
        </div>
    )
}




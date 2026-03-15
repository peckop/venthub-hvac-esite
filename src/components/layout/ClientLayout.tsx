'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { CartProvider } from '../../contexts/CartProvider'
import { AuthProvider } from '../../contexts/AuthContext'
import { useScrollThrottle } from '../../hooks/useScrollThrottle'
import { usePathname, useSearchParams } from 'next/navigation'

import StickyHeader from '../StickyHeader'
import ScrollToTop from '../ScrollToTop'
import LanguageSwitcher from '../LanguageSwitcher'
import PaymentWatcher from '../PaymentWatcher'
import BackToTopButton from '../BackToTopButton'
import Footer from '../Footer'

const Toaster = lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })))
const AddToCartToast = lazy(() => import('../AddToCartToast'))
const WhatsAppFloat = lazy(() => import('../WhatsAppFloat'))

import { I18nProvider } from '../../i18n/I18nProvider'
import { ProjectProvider } from '../../contexts/ProjectProvider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider>
            <AuthProvider>
                <CartProvider>
                    <ProjectProvider>
                        {children}
                    </ProjectProvider>
                </CartProvider>
            </AuthProvider>
        </I18nProvider>
    )
}

/**
 * useSearchParams() kullanan navigasyon takip mantığı.
 * Ayrı bir bileşen olarak Suspense içinde tutulmalıdır.
 */
function NavigationTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return

        const handlePopState = () => sessionStorage.setItem('vh_is_pop', 'true')
        window.addEventListener('popstate', handlePopState)

        const handleInteraction = () => sessionStorage.setItem('vh_is_pop', 'false')
        document.addEventListener('mousedown', handleInteraction, { capture: true })
        document.addEventListener('keydown', handleInteraction, { capture: true })

        const updateStack = () => {
            if (!pathname) return
            const search = searchParams?.toString() || ''
            const hash = window.location.hash || ''
            const currentFullPath = pathname + (search ? '?' + search : '') + hash

            if (pathname === '/' && !hash) {
                sessionStorage.setItem('vh_nav_stack', JSON.stringify(['/']))
                return
            }

            if (pathname.includes('/products/')) return

            let stack: string[] = []
            try {
                stack = JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]')
            } catch { stack = [] }

            const lastItem = stack[stack.length - 1]
            const secondLastItem = stack[stack.length - 2]

            if (currentFullPath === lastItem) return

            if (currentFullPath === secondLastItem) {
                stack.pop()
            } else {
                if (lastItem && lastItem.split('?')[0].split('#')[0] === pathname) {
                    stack[stack.length - 1] = currentFullPath
                } else {
                    stack.push(currentFullPath)
                }
                if (stack.length > 10) stack.shift()
            }
            sessionStorage.setItem('vh_nav_stack', JSON.stringify(stack))
        }

        updateStack()
        window.addEventListener('hashchange', updateStack)

        return () => {
            window.removeEventListener('popstate', handlePopState)
            window.removeEventListener('hashchange', updateStack)
            document.removeEventListener('mousedown', handleInteraction, { capture: true })
            document.removeEventListener('keydown', handleInteraction, { capture: true })
        }
    }, [pathname, searchParams])

    return null
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    const isScrolled = useScrollThrottle({ 
        showAt: 100, 
        hideBelow: 60, 
        throttleMs: 16, 
        initialDelayMs: 180, 
        syncKey: pathname || '' 
    })

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

    return (
        <div className={`min-h-screen bg-white ${isAdmin ? 'overflow-hidden' : ''}`}>
            <ScrollToTop />
            {!isAdmin && <StickyHeader isScrolled={isScrolled} />}

            <main id="main-content" className={!isAdmin && isScrolled ? 'pt-16' : ''}>
                {!isAdmin && <BackToTopButton />}
                {typeof window !== 'undefined' && localStorage.getItem('vh_pending_order') && <PaymentWatcher />}
                {!isAdmin && <LanguageSwitcher />}
                {children}
            </main>

            {!isAdmin && <Footer />}

            <Suspense fallback={null}>
                <NavigationTracker />
            </Suspense>

            {enableWhatsApp && !isAdmin && (
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

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ClientLayoutInner>
                {children}
            </ClientLayoutInner>
        </Suspense>
    )
}

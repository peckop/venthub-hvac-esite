'use client'

import React, { Suspense, useEffect } from 'react'
import { CartProvider } from '../../contexts/CartProvider'
import AuthProvider from '../../contexts/AuthContext'
import { CategoryProvider } from '../../contexts/CategoryContext'
import { usePathname, useSearchParams } from 'next/navigation'
import MainLayout from './MainLayout'
import { I18nProvider } from '../../i18n/I18nProvider'
import { ProjectProvider } from '../../contexts/ProjectProvider'
import CookieConsent from './CookieConsent'

import { SupabaseProvider } from '@/providers/SupabaseProvider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseProvider>
            <I18nProvider>
                <AuthProvider>
                    <CategoryProvider>
                        <CartProvider>
                            <ProjectProvider>
                                {children}
                            </ProjectProvider>
                        </CartProvider>
                    </CategoryProvider>
                </AuthProvider>
            </I18nProvider>
        </SupabaseProvider>
    )
}

/**
 * useSearchParams() kullanan navigasyon takip mantÄ±ÄŸÄ±.
 * AyrÄ± bir bileÅŸen olarak Suspense iÃ§inde tutulmalÄ±dÄ±r.
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
    return (
        <MainLayout>
            {children}
            <CookieConsent />
            {/* MantÄ±ksal TakipÃ§iler */}
            <Suspense fallback={null}>
                <NavigationTracker />
            </Suspense>
        </MainLayout>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClientLayoutInner>
            {children}
        </ClientLayoutInner>
    )
}

'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScrollThrottle } from '../../hooks/useScrollThrottle'
import '@/lib/three-setup'

// Bileşenler
import StickyHeader from '../StickyHeader'
import Footer from '../Footer'
import BackToTopButton from '../BackToTopButton'
import ScrollToTop from '../ScrollToTop'
import LanguageSwitcher from '../LanguageSwitcher'
import PaymentWatcher from '../PaymentWatcher'

// Lazy Overlays
const Toaster = lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })))
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

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shrink-0 z-[100]">
                    <span className="font-bold tracking-tighter">VH / ADMIN</span>
                    <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors uppercase font-bold tracking-widest">Siteye Dön</Link>
                </div>
                <div className="flex-grow overflow-auto">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-white flex flex-col">
            <ScrollToTop />
            
            <StickyHeader isScrolled={isScrolled} />

            {/* Sayfa Geçişleri için Animasyonu kapattık (Sorun kaynağı buydu) */}
            <main 
                id="main-content" 
                className="flex-grow transition-all duration-300"
            >
                {children}
            </main>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <BackToTopButton />
                
                {enableWhatsApp && (
                    <Suspense fallback={null}>
                        <WhatsAppFloat />
                    </Suspense>
                )}
            </div>

            <PaymentWatcher />
            <LanguageSwitcher />
            <Footer />

            {enableToaster && (
                <Suspense fallback={null}>
                    <AddToCartToast />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: { 
                                background: '#FFFFFF', 
                                color: '#374151', 
                                border: '1px solid #E5E7EB', 
                                borderRadius: '0.75rem', 
                                fontSize: '14px' 
                            }
                        }}
                    />
                </Suspense>
            )}
        </div>
    )
}

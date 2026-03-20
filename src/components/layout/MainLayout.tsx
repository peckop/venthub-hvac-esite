'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollThrottle } from '../../hooks/useScrollThrottle'

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

/**
 * P01-016: Master Şablon (Master Layout)
 * VentHub'ın tüm sayfalarını kapsayan merkezi mimari kabuk.
 * Sayfa geçiş animasyonları ve global katmanlar burada yönetilir.
 */
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
        return <div className="min-h-screen bg-gray-50 overflow-hidden">{children}</div>
    }

    return (
        <div className="relative min-h-screen bg-white flex flex-col">
            <ScrollToTop />
            
            <StickyHeader isScrolled={isScrolled} />

            {/* Sayfa Geçiş Animasyonu ve Ana İçerik */}
            <main 
                id="main-content" 
                className={`flex-grow transition-all duration-300 ${isScrolled ? 'pt-16' : ''}`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                            duration: 0.35, 
                            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for premium feel
                        }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Global Overlays & Utilities */}
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

            {/* Toast & Notifications */}
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
                            },
                            success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
                            error: { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
                        }}
                    />
                </Suspense>
            )}
        </div>
    )
}

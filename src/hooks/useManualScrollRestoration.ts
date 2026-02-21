import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Async veri yüklenen sayfalarda "Geri" (POP) navigasyonu sonrası scroll pozisyonunu geri yükler.
 * Tarayıcı native restorasyonunun yetersiz kaldığı (skeleton loading vb.) durumlarda gereklidir.
 * 
 * @param loading Verinin yüklenme durumu. True ise restorasyon beklemede kalır.
 */
export const useManualScrollRestoration = (loading: boolean) => {
    const pathname = usePathname()
    const restoredRef = useRef(false)

    // 1. Scroll pozisyonunu pathname bazlı kaydet (Throttle: 100ms)
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handler = () => {
            if (timeout) return
            timeout = setTimeout(() => {
                try {
                    sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString())
                } catch { }
                timeout = undefined!
            }, 100)
        }

        window.addEventListener('scroll', handler, { passive: true })
        return () => {
            window.removeEventListener('scroll', handler)
            if (timeout) clearTimeout(timeout)
        }
    }, [pathname])

    // 2. Loading bittiğinde restore et
    useEffect(() => {
        if (loading) return
        if (restoredRef.current) return // Sadece bir kere dene

        try {
            const saved = sessionStorage.getItem(`scroll_${pathname}`)
            if (saved) {
                const y = parseInt(saved, 10)

                // DOM'un tam render olmasını bekle ve birden fazla deneme yap
                const restoreScroll = (attempt = 0) => {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, y)

                        // Eğer sayfa yüksekliği yeterli değilse ve henüz max deneme sayısına ulaşmadıysak tekrar dene
                        if (attempt < 5 && document.documentElement.scrollHeight < y + window.innerHeight) {
                            setTimeout(() => restoreScroll(attempt + 1), 100)
                        }
                    })
                }

                // İlk deneme
                restoreScroll()

                // Garantili son deneme (görseller ve layout shift için)
                setTimeout(() => window.scrollTo(0, y), 300)
            }
        } catch { }

        restoredRef.current = true
    }, [loading, pathname])
}






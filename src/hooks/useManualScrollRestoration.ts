import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Async veri yüklenen sayfalarda "Geri" (POP) navigasyonu sonrası scroll pozisyonunu geri yükler.
 * Tarayıcı native restorasyonunun yetersiz kaldığı (skeleton loading vb.) durumlarda gereklidir.
 * 
 *
 * @param loading Verinin yüklenme durumu. True ise restorasyon beklemede kalır.
 */
export const useManualScrollRestoration = (loading: boolean) => {
    const pathname = usePathname()
    const restoredRef = useRef(false)

    // 1. Tarayıcı kontrolünü eline al
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // 2. Scroll pozisyonunu kaydet (Throttle: 100ms)
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handler = () => {
            if (timeout) return
            timeout = setTimeout(() => {
                try {
                    const currentY = window.scrollY
                    // Sadece makul değerleri kaydet (0 dahil, ama mount/restore anında 0'ı koru)
                    if (currentY > 0 || restoredRef.current) {
                        sessionStorage.setItem(`scroll_v4_${pathname}`, currentY.toString())
                    }
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

    // 3. Restorasyon
    useEffect(() => {
        if (loading) return
        if (restoredRef.current) return

        try {
            const saved = sessionStorage.getItem(`scroll_v4_${pathname}`)
            const isPop = sessionStorage.getItem('vh_is_pop') === 'true'

            if (saved && isPop) {
                const targetY = parseInt(saved, 10)
                if (targetY <= 0) {
                    restoredRef.current = true
                    return
                }

                let attempts = 0
                const restore = () => {
                    attempts++
                    window.scrollTo(0, targetY)

                    // Sayfa yüksekliği henüz hedef scroll+ekran yüksekliğine ulaşmadıysa (render bitmediyse)
                    if (document.documentElement.scrollHeight < targetY + 100 && attempts < 20) {
                        setTimeout(restore, 100)
                    } else {
                        // Son bir kez kesinleştir
                        setTimeout(() => window.scrollTo(0, targetY), 50)
                        restoredRef.current = true
                    }
                }

                // İlk deneme için kısa bir pay bırak (layout shift önleme)
                setTimeout(restore, 100)
            } else {
                restoredRef.current = true
            }
        } catch { restoredRef.current = true }
    }, [loading, pathname])
}






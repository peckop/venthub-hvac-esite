import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Manually restores the scroll position upon "Back" (POP) navigation in pages with async data loading.
 * 
 * Required when the browser's native scroll restoration falls short, such as during skeleton loading.
 * It hijacks the native history scroll restoration and relies on tracking scroll positions in sessionStorage.
 *
 * @param loading - The data loading state; if true, scroll restoration is paused
 * @returns void
 *
 * @example
 * const { loading } = useData();
 * useManualScrollRestoration(loading);
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
        if (typeof window === 'undefined') return

        let timeout: NodeJS.Timeout
        const handler = () => {
            if (timeout) return
            timeout = setTimeout(() => {
                try {
                    const currentY = window.scrollY
                    // Next.js sayfadan ayrılırken scroll'u anlık olarak 0'a çekebiliyor.
                    // Sayfanın en başında (0-50 px) olmak çok önemli bir geri yükleme noktası değil.
                    // Bu yüzden 0'ı (veya 0'a yakın anlık sıfırlamaları) kaydetmiyoruz.
                    if (currentY > 50) {
                        sessionStorage.setItem(`scroll_v5_${pathname}`, currentY.toString())
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
        if (typeof window === 'undefined') return
        if (loading) return
        if (restoredRef.current) return

        try {
            const saved = sessionStorage.getItem(`scroll_v5_${pathname}`)
            const isPop = sessionStorage.getItem('vh_is_pop') === 'true'

            if (saved && isPop) {
                const targetY = parseInt(saved, 10)
                if (targetY <= 50) {
                    restoredRef.current = true
                    return
                }

                let attempts = 0
                const restore = () => {
                    attempts++
                    window.scrollTo(0, targetY)

                    // Sayfa yüksekliği henüz hedef scroll+ekran yüksekliğine ulaşmadıysa (render bitmediyse)
                    if (document.documentElement.scrollHeight < targetY + 100 && attempts < 20) {
                        setTimeout(restore, 150) // Daha sabırlı ol (20 x 150ms = 3 saniye)
                    } else {
                        // Son bir kez kesinleştir
                        setTimeout(() => window.scrollTo(0, targetY), 100)
                        restoredRef.current = true
                    }
                }

                // İlk deneme için kısa bir pay bırak (layout shift önleme)
                setTimeout(restore, 250) // Biraz daha bekle ki Kategori Component'ı animasyon setup'ını yapsın
            } else {
                restoredRef.current = true
            }
        } catch { restoredRef.current = true }
    }, [loading, pathname])
}






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

    // 1. Scroll pozisyonunu pathname + hash bazlı kaydet (Throttle: 100ms)
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handler = () => {
            if (timeout) return
            timeout = setTimeout(() => {
                try {
                    const currentY = window.scrollY
                    const fullKey = pathname + window.location.hash

                    // Eğer restorasyon denemeleri sırasında yanlışlıkla 0'ı kaydederse geri dönüş bozulur
                    // Sadece kullanıcı gerçekten sayfada ise (mount bittiyse) ve makul bir değer ise kaydet
                    if (currentY > 0 || (restoredRef.current && currentY === 0)) {
                        sessionStorage.setItem(`scroll_${fullKey}`, currentY.toString())
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

    // 2. Loading bittiğinde restore et
    useEffect(() => {
        if (loading) return
        if (restoredRef.current) return // Sadece bir kere dene

        try {
            const currentHash = typeof window !== 'undefined' ? window.location.hash : ''
            const fullKey = pathname + currentHash
            const saved = sessionStorage.getItem(`scroll_${fullKey}`)

            if (saved) {
                const isPop = sessionStorage.getItem('vh_is_pop') === 'true'
                if (!isPop) {
                    restoredRef.current = true
                    return // Sadece POP (Geri/İleri) aksiyonunda restore et
                }

                const y = parseInt(saved, 10)
                if (y === 0) {
                    restoredRef.current = true
                    return
                }

                // DOM'un tam render olmasını bekle ve birden fazla deneme yap
                const restoreScroll = (attempt = 0) => {
                    if (attempt >= 15) {
                        restoredRef.current = true
                        return
                    }

                    requestAnimationFrame(() => {
                        window.scrollTo(0, y)

                        // Eğer sayfa yüksekliği yeterli değilse (DOM henüz uzamadıysa) tekrar dene
                        if (document.documentElement.scrollHeight < y + window.innerHeight) {
                            setTimeout(() => restoreScroll(attempt + 1), 100)
                        } else {
                            // Hedef yüksekliğe ulaşıldı, bir kez daha kesinleştir
                            setTimeout(() => window.scrollTo(0, y), 50)
                            restoredRef.current = true
                        }
                    })
                }

                // İlk deneme - Çocuk bileşenlerin (useEffect/Hash/Layout) işlerini bitirmesi için pay bırak
                setTimeout(() => restoreScroll(), 150)
            } else {
                restoredRef.current = true
            }
        } catch { restoredRef.current = true }
    }, [loading, pathname])
}






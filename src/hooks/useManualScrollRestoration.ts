import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Async veri yüklenen sayfalarda "Geri" (POP) navigasyonu sonrası scroll pozisyonunu geri yükler.
 * Tarayıcı native restorasyonunun yetersiz kaldığı (skeleton loading vb.) durumlarda gereklidir.
 * 
 * @param loading Verinin yüklenme durumu. True ise restorasyon beklemede kalır.
 */
export const useManualScrollRestoration = (loading: boolean) => {
    const { key } = useLocation()
    const navType = useNavigationType()
    const restoredRef = useRef(false)

    // 1. Scroll pozisyonunu key bazlı kaydet (Throttle: 100ms)
    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handler = () => {
            if (timeout) return
            timeout = setTimeout(() => {
                try {
                    sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString())
                } catch { }
                timeout = undefined!
            }, 100)
        }

        window.addEventListener('scroll', handler, { passive: true })
        return () => {
            window.removeEventListener('scroll', handler)
            if (timeout) clearTimeout(timeout)
        }
    }, [key])

    // 2. Loading bittiğinde ve POP ise restore et
    useEffect(() => {
        if (loading) return
        if (restoredRef.current) return // Sadece bir kere dene
        if (navType !== 'POP') return

        try {
            const saved = sessionStorage.getItem(`scroll_${key}`)
            if (saved) {
                const y = parseInt(saved, 10)
                // İçerik render edildikten hemen sonra
                window.scrollTo(0, y)

                // Gecikmeli kontrol (görseller vs. layout shift yaparsa)
                setTimeout(() => window.scrollTo(0, y), 50)
            }
        } catch { }

        restoredRef.current = true
    }, [loading, key, navType])
}

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Route değişiminde sayfayı anında en üste kaydırır (Sadece PUSH aksiyonlarında).
 * Geri dönüşlerde (POP) tarayıcının native scroll restorasyonuna izin verir.
 */
const ScrollToTop = () => {
  const pathname = usePathname()

  useLayoutEffect(() => {
    // 1. Geri dönüş (POP) navigasyonu ise scroll'u sıfırlama (Restorasyona izin ver)
    const isPop = typeof window !== 'undefined' && sessionStorage.getItem('vh_is_pop') === 'true'
    if (isPop) return

    // 2. Hash anchor varsa (/#section) scroll'u engellemeyelim
    if (window.location.hash) return

    // Instant scroll, smooth değil — gezinme sonrası titreme olmasın
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default ScrollToTop





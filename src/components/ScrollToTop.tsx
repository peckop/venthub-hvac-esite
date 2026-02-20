import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Route değişiminde sayfayı anında en üste kaydırır (Sadece PUSH aksiyonlarında).
 * Geri dönüşlerde (POP) tarayıcının native scroll restorasyonuna izin verir.
 */
const ScrollToTop = () => {
  const pathname = usePathname()

  useLayoutEffect(() => {
    // Hash anchor varsa (/#section) scroll'u engellemeyelim
    if (window.location.hash) return

    // Instant scroll, smooth değil — gezinme sonrası titreme olmasın
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default ScrollToTop


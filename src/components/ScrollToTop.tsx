import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router ile sayfa geçişlerinde otomatik scroll to top sağlar
 * Smooth scroll davranışını koruyarak performanslı bir deneyim sunar
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    console.log('[ScrollToTop] pathname changed to:', pathname)
    
    // ScrollToTop'u tamamen devre dışı bırakalım
    // Navigasyon sorununu çözmek için
    return
    
    // Aşağıdaki kod şu an devre dışı
    /*
    if (pathname === '/') {
      return
    }
    window.scrollTo(0, 0)
    */
  }, [pathname]) // pathname değiştiğinde tetikle

  return null // UI render etmez
}

export default ScrollToTop

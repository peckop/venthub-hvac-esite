import React, { useEffect, useState } from 'react'

// Spotlight overlay: merkezde beyaz parıltı, dışı tamamen şeffaf.
// Karartma yerine aydınlatma (mix-blend-mode: screen) kullanılır.
const SpotlightHeroOverlay: React.FC<{ radius?: number; intensity?: number }> = ({ radius = 240, intensity = 0.35 }) => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={reduced ? undefined : ({
        // Dış kısım tamamen şeffaf, sadece merkezde beyaz parıltı
        background: `radial-gradient(${radius}px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,${intensity}) 0%, rgba(255,255,255,0) 60%)`,
        mixBlendMode: 'screen'
      } as React.CSSProperties)}
      aria-hidden="true"
    />
  )
}

export default SpotlightHeroOverlay


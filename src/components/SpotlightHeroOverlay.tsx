import React, { useEffect, useRef, useState } from 'react'

// Spotlight overlay: imleci takip eden ışık efekti (motion-safe)
const SpotlightHeroOverlay: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [reduced])

  // Karartma overlay: merkezde şeffaf, dışarıda yarı saydam
  // Mask yerine doğrudan radial-gradient ile uygulandı (daha uyumlu)
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10"
      style={reduced ? undefined : ({
        background: 'radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 70%)'
      } as React.CSSProperties)}
      aria-hidden="true"
    />
  )
}

export default SpotlightHeroOverlay


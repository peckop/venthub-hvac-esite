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

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-10"
      style={reduced ? undefined : ({ WebkitMaskImage: 'radial-gradient(220px at var(--mx,50%) var(--my,50%), #000 0%, transparent 65%)' } as React.CSSProperties)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-white/10" />
    </div>
  )
}

export default SpotlightHeroOverlay


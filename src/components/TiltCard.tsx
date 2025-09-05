import React, { useRef, useState } from 'react'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const TiltCard: React.FC<React.PropsWithChildren<{ maxTilt?: number }>> = ({ children, maxTilt = 18 }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState(false)
  const supportsTilt = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!supportsTilt || prefersReduced) {
    return <>{children}</>
  }

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const container = wrapperRef.current
    const el = innerRef.current
    if (!el || !container) return
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = clamp((0.5 - y) * maxTilt, -maxTilt, maxTilt)
    const ry = clamp((x - 0.5) * maxTilt, -maxTilt, maxTilt)
    container.style.setProperty('--px', `${Math.round(x * 100)}%`)
    container.style.setProperty('--py', `${Math.round(y * 100)}%`)
    // Hafif büyütme ve imleç yönüne doğru gölge
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0) scale(${hover ? 1.04 : 1})`
    const sx = (x - 0.5) * 16 // px
    const sy = (y - 0.5) * 16 // px
    el.style.boxShadow = `${sx}px ${sy}px 28px rgba(0,0,0,0.18)`
  }

  const onEnter: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setHover(true)
    onMove(e)
  }

  const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setHover(false)
    const el = innerRef.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)'
    el.style.boxShadow = '0 0 0 rgba(0,0,0,0)'
  }

  return (
    <div ref={wrapperRef} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave} className="relative group">
      <div
        ref={innerRef}
        className="transition-transform duration-200 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
      {/* Shine overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
'radial-gradient(200px circle at var(--px,50%) var(--py,50%), rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}

export default TiltCard


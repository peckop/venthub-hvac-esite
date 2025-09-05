import React, { useRef } from 'react'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const TiltCard: React.FC<React.PropsWithChildren<{ maxTilt?: number }>> = ({ children, maxTilt = 8 }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  if (isCoarse) {
    return <>{children}</>
  }

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = clamp((0.5 - y) * maxTilt, -maxTilt, maxTilt)
    const ry = clamp((x - 0.5) * maxTilt, -maxTilt, maxTilt)
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
  }

  const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="transition-transform duration-200 will-change-transform"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

export default TiltCard


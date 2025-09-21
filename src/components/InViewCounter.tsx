import React, { useEffect, useRef, useState } from 'react'

interface CounterProps {
  label: string
  to: number
  suffix?: string
  durationMs?: number
}

const InViewCounter: React.FC<CounterProps> = ({ label, to, suffix = '', durationMs = 1200 }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)

  // Respect reduced motion and avoid animation on coarse pointers (mobile) to reduce CPU/TBT
  useEffect(() => {
    try {
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
      const coarse = window.matchMedia('(pointer: coarse)')
      const update = () => setShouldAnimate(!(rm.matches || coarse.matches))
      update()
      rm.addEventListener?.('change', update)
      coarse.addEventListener?.('change', update)
      return () => {
        rm.removeEventListener?.('change', update)
        coarse.removeEventListener?.('change', update)
      }
    } catch {
      setShouldAnimate(true)
    }
  }, [])

  useEffect(() => {
    if (!shouldAnimate) {
      setValue(to)
      setStarted(false)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setStarted(true)
      })
    }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [shouldAnimate, to])

  useEffect(() => {
    if (!shouldAnimate || !started) return
    let raf = 0
    const t0 = performance.now()
    const animate = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setValue(Math.floor(eased * to))
      if (p < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [shouldAnimate, started, to, durationMs])

  return (
    <div ref={ref} className="rounded-2xl border border-light-gray bg-white p-6 text-center">
      <div className="text-4xl font-bold text-primary-navy tabular-nums">{value}{suffix}</div>
      <div className="text-steel-gray mt-1">{label}</div>
    </div>
  )
}

export default InViewCounter


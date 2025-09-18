import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

// Hafif bir görsel akış/slider (kütüphane kullanmadan)
// - Otomatik geçiş (pause on hover veya manuel)
// - Klavye ile erişim (sol/sağ)
// - Swipe (touch) desteği (basit)
// - Parallax arka plan + hafif canvas parçacıkları (prefers-reduced-motion uyumlu)

// Slide metinleri i18n'den alınır; renkler sabit

const AUTOPLAY_MS = 6000

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

const VisualShowcase: React.FC = () => {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const startXRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  const disableFancy = reducedMotion || isCoarse || (typeof window !== 'undefined' && window.innerWidth < 640)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })

  const slides = useMemo(() => ([
    { title: t('homeShowcase.slide1.title'), subtitle: t('homeShowcase.slide1.subtitle'), colorFrom: 'from-primary-navy', colorTo: 'to-secondary-blue' },
    { title: t('homeShowcase.slide2.title'), subtitle: t('homeShowcase.slide2.subtitle'), colorFrom: 'from-emerald-600', colorTo: 'to-cyan-500' },
    { title: t('homeShowcase.slide3.title'), subtitle: t('homeShowcase.slide3.subtitle'), colorFrom: 'from-indigo-600', colorTo: 'to-sky-400' },
  ] as const), [t])
  const slidesCount = slides.length

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slidesCount), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [playing, slidesCount])

  const prev = React.useCallback(() => setIndex((i) => (i - 1 + slidesCount) % slidesCount), [slidesCount])
  const next = React.useCallback(() => setIndex((i) => (i + 1) % slidesCount), [slidesCount])

  // Klavye desteği
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === ' ') setPlaying(p => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current == null) return
    const dx = e.changedTouches[0].clientX - startXRef.current
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev()
      else next()
    }
    startXRef.current = null
  }

  // Parallax mouse hareketi (reduced motion değilse)
  useEffect(() => {
    if (!containerRef.current || reducedMotion) return
    const el = containerRef.current
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      // Basit sönümleme ile güncelle
      setMouse(prev => ({ x: prev.x + (x - prev.x) * 0.15, y: prev.y + (y - prev.y) * 0.15 }))
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [reducedMotion])

  // Canvas parçacıkları
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particles = useMemo(() => {
    return Array.from({ length: 28 }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random()-0.5)*0.0008, vy: (Math.random()-0.5)*0.0008, r: 1 + Math.random()*2
    }))
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    const parent = containerRef.current
    if (!canvas || !parent) return
    const ctx = canvas.getContext('2d')!

    let raf = 0
    const render = () => {
      const w = canvas.width = parent.clientWidth
      const h = canvas.height = parent.clientHeight
      ctx.clearRect(0,0,w,h)
      ctx.globalAlpha = 0.5
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        const px = p.x*w, py = p.y*h
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI*2)
        ctx.fillStyle = 'white'
        ctx.fill()
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [particles, reducedMotion])

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl"
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
        >
          {/* Canvas particles (arka plan) */}
          {!disableFancy && (
            <canvas ref={canvasRef} className="absolute inset-0 z-0" aria-hidden="true" />
          )}

          {/* Parallax Layers */}
          {!disableFancy && (
            <>
              <div className="pointer-events-none absolute -top-10 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl z-0"
                   style={{ transform: `translate(${(mouse.x-0.5)*20}px, ${(mouse.y-0.5)*20}px)` }} />
              <div className="pointer-events-none absolute -bottom-12 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl z-0"
                   style={{ transform: `translate(${(mouse.x-0.5)*-24}px, ${(mouse.y-0.5)*-24}px)` }} />
            </>
          )}

          {/* Slides */}
          <div className="relative h-48 sm:h-64 lg:h-72 z-10">
            {slides.map((s, i) => (
              <div
                key={s.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-out bg-gradient-to-br ${s.colorFrom} ${s.colorTo} ${i === index ? 'opacity-100' : 'opacity-0'}`}
                role={i === index ? 'group' : undefined}
                aria-hidden={i !== index}
              >
                <div className="h-full w-full flex items-center justify-center text-center text-white px-6">
                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-sm">{s.title}</div>
                    <div className="mt-2 text-base sm:text-lg text-white/90">{s.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none z-20">
            <button
              onClick={prev}
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-industrial-gray w-10 h-10 shadow"
              aria-label={t('homeShowcase.prevAria')}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setPlaying(p=>!p)}
                className="inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-industrial-gray w-10 h-10 shadow"
                aria-label={playing ? t('homeShowcase.pauseAria') : t('homeShowcase.playAria')}
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={next}
                className="inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-industrial-gray w-10 h-10 shadow"
                aria-label={t('homeShowcase.nextAria')}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/70 hover:bg-white'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default VisualShowcase


import React, { useEffect, useRef, useState } from 'react'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  alt?: string
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeSrc, afterSrc, alt = 'before-after' }) => {
  const [pos, setPos] = useState(50) // yüzde
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Klavye ile kontrol
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPos(p => Math.max(0, p - 5))
      if (e.key === 'ArrowRight') setPos(p => Math.min(100, p + 5))
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">Öncesi / Sonrası</h2>
          <p className="text-steel-gray">Uygulama etkisini hızlıca görün</p>
        </div>
        <div
          ref={containerRef}
          tabIndex={0}
          className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-light-gray shadow"
          aria-label="Öncesi / sonrası karşılaştırma"
        >
          <img src={afterSrc} alt={alt} loading="lazy" decoding="async" {...({ fetchpriority: 'low' } as Record<string, string>)} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ width: `${pos}%`, overflow: 'hidden' }}>
            <img src={beforeSrc} alt={alt} loading="lazy" decoding="async" {...({ fetchpriority: 'low' } as Record<string, string>)} className="w-full h-full object-cover object-center" />
          </div>
          {/* Divider */}
          <div className="absolute top-0" style={{ left: `${pos}%` }}>
            <div className="-ml-0.5 h-full w-1 bg-white shadow" />
          </div>
          {/* Range control */}
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 accent-primary-navy"
            aria-label="Karşılaştırma konumu"
          />
        </div>
      </div>
    </section>
  )
}

export default BeforeAfterSlider


import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

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

const Lane: React.FC<{ items: typeof HVAC_BRANDS; speed?: number }> = ({ items, speed = 20 }) => {
  const [offset, setOffset] = useState(0)
  const [hover, setHover] = useState(false)
  const [halfWidth, setHalfWidth] = useState(0)
  const trackRef = React.useRef<HTMLDivElement | null>(null)

  const doubled = useMemo(() => [...items, ...items], [items])

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      // Toplam genişliğin yarısı: tek kopyanın genişliği
      setHalfWidth(el.scrollWidth / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [doubled])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!hover) {
        setOffset(prev => {
          let next = prev - speed * dt // sola doğru
          if (halfWidth > 0 && Math.abs(next) >= halfWidth) {
            next += halfWidth
          }
          return next
        })
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [speed, hover, halfWidth])

  return (
    <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div
        ref={trackRef}
        className="flex items-stretch gap-0 will-change-transform"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {doubled.map((brand, idx) => (
          <Link key={brand.slug + '-' + idx} to={`/brands/${brand.slug}`} className="group block">
            <div className="w-44 sm:w-48 md:w-56 h-24 sm:h-28 md:h-32 bg-white shadow-sm overflow-hidden flex items-center justify-center p-4 rounded-none">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 flex items-center justify-center">
                  <BrandIcon brand={brand.name} />
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="text-sm font-semibold text-industrial-gray group-hover:text-primary-navy line-clamp-1">{brand.name}</div>
                  <div className="text-xs text-steel-gray">{brand.country}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const BrandsShowcase: React.FC = () => {
  const { t } = useI18n()
  const reduced = usePrefersReducedMotion()
  const brands = HVAC_BRANDS

  return (
    <section className="py-16 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray mb-3">
            {t('brands.sectionTitle')}
          </h2>
          <p className="text-lg md:text-xl text-steel-gray max-w-3xl mx-auto">
            {t('brands.sectionSubtitle')}
          </p>
        </div>

        {/* Reduced motion: statik grid */}
        {reduced ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/brands/${brand.slug}`}
                className="group bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-hvac transition-all duration-200 text-center border border-light-gray"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 border border-light-gray flex items-center justify-center">
                    <BrandIcon brand={brand.name} />
                  </div>
                </div>
                <h3 className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors mb-1">
                  {brand.name}
                </h3>
                <p className="text-xs text-steel-gray">{brand.country}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="relative w-screen left-1/2 -translate-x-1/2 mb-10">
            {/* Kenarlarda yumuşak maske */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-light-gray to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-light-gray to-transparent" />
            {/* Tek satır, kesintisiz akış (full-bleed) */}
            <Lane items={brands} speed={22} />
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            to="/brands"
            className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
          >
            {t('brands.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BrandsShowcase

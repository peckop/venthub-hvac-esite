import React, { useMemo } from 'react'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

// CSS-only marquee lane to minimize main-thread JS work (seamless)
const Lane: React.FC<{ items: typeof HVAC_BRANDS; durationSec?: number }> = ({ items, durationSec = 40 }) => {
  // Duplicate content exactly twice and scroll -50% so the second half
  // seamlessly continues the first half without a visible jump.
  const REPEAT = 2
  const repeated = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => items), [items])

  const isCoarse = (() => {
    try { return window.matchMedia('(pointer: coarse)').matches } catch { return false }
  })()
  const dur = isCoarse ? 14 : durationSec

  return (
    <div className="relative overflow-hidden group">
      <style>{`
        @keyframes brands-scroll-left { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        .brands-track { animation: brands-scroll-left ${dur}s linear infinite; will-change: transform; backface-visibility: hidden; }
        .brands-lane:hover .brands-track { animation-play-state: paused; }
      `}</style>
      <div className="brands-lane">
        <div className="brands-track flex items-stretch gap-0 w-max">
          {repeated.map((brand, idx) => (
            <Link key={brand.slug + '-' + idx} to={`/brands/${brand.slug}`} className="group block">
              <div className="w-44 sm:w-48 md:w-56 h-24 sm:h-28 md:h-32 bg-white shadow-sm overflow-hidden flex items-center justify-center p-3 sm:p-4 rounded-none flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 flex items-center justify-center">
                    <BrandIcon brand={brand.name} />
                  </div>
                  <div className="block min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-industrial-gray group-hover:text-primary-navy truncate max-w-[7rem] sm:max-w-[10rem]">{brand.name}</div>
                    <div className="text-[10px] sm:text-xs text-steel-gray">{brand.country}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export const BrandsShowcase: React.FC = () => {
  const { t } = useI18n()
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

        {/* Continuous marquee lane (CSS animation) */}
        <div className="relative w-screen left-1/2 -translate-x-1/2 mb-10">
          {/* Edge gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-light-gray to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-light-gray to-transparent" />
          <Lane items={brands} durationSec={40} />
        </div>

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

import React, { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
const SpotlightHeroOverlay = React.lazy(() => import('./SpotlightHeroOverlay'))
const InViewCounter = React.lazy(() => import('./InViewCounter'))
// Responsive hero variants generated at build-time via vite-imagetools
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import avifSet from '../../public/images/industrial_HVAC_air_handling_unit_warehouse.jpg?w=640;960;1200;1600&format=avif&quality=60&srcset'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import webpSet from '../../public/images/industrial_HVAC_air_handling_unit_warehouse.jpg?w=640;960;1200;1600&format=webp&quality=80&srcset'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jpgSet from '../../public/images/industrial_HVAC_air_handling_unit_warehouse.jpg?w=640;960;1200;1600&format=jpg&quality=88&srcset'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import hero1600 from '../../public/images/industrial_HVAC_air_handling_unit_warehouse.jpg?w=1600&format=jpg&quality=88'

const HeroPicture: React.FC = () => {
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1600px'
  return (
    <picture>
      <source type="image/avif" srcSet={avifSet as unknown as string} sizes={sizes} />
      <source type="image/webp" srcSet={webpSet as unknown as string} sizes={sizes} />
      <img
        src={hero1600 as unknown as string}
        srcSet={jpgSet as unknown as string}
        sizes={sizes}
        alt="HVAC Equipment"
        width={1200}
        height={800}
        loading="eager"
        {...({ fetchpriority: 'high' } as Record<string, string>)}
        decoding="async"
        className="w-full rounded-xl shadow-hvac-lg object-cover object-center"
      />
    </picture>
  )
}

export const HeroSection: React.FC = () => {
  const { t } = useI18n()
  const heroRef = useRef<HTMLDivElement | null>(null)
  const enableParallax = (() => {
    try {
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const coarse = window.matchMedia('(pointer: coarse)').matches
      return !rm && !coarse
    } catch { return false }
  })()
  // Lazy mount spotlight overlay only on fine pointer devices after idle
  const [showOverlay, setShowOverlay] = React.useState(false)
  React.useEffect(() => {
    try {
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (coarse || rm) return
      const win = window as unknown as { requestIdleCallback?: (cb: () => void) => number }
      const idle = (cb: () => void) => (typeof win.requestIdleCallback === 'function' ? win.requestIdleCallback(cb) : setTimeout(cb, 800))
      idle(() => setShowOverlay(true))
    } catch {}
  }, [])

  return (
    <div
      ref={heroRef}
      onMouseMove={(e) => {
        if (!enableParallax) return
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
        ;(e.currentTarget as HTMLDivElement).style.setProperty('--mx', `${x}%`)
        ;(e.currentTarget as HTMLDivElement).style.setProperty('--my', `${y}%`)
      }}
      className="relative bg-gradient-to-br from-air-blue via-clean-white to-light-gray overflow-hidden"
    >
      {/* Background (decorative) moved to CSS to keep it out of LCP */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 md:opacity-20"
        aria-hidden="true"
        role="presentation"
      >
        <img
          src="/images/modern-industrial-HVAC-rooftop-blue-sky-facility.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-navy/20 to-transparent" />
      </div>

      {/* Spotlight Overlay */}
      {showOverlay && (
        <React.Suspense fallback={null}>
          <SpotlightHeroOverlay />
        </React.Suspense>
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-industrial-gray leading-tight">
                {t('home.heroTitle')}
              </h1>
              <p className="text-xl text-steel-gray max-w-lg">
                {t('home.heroSubtitle')}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckIcon className="text-success-green flex-shrink-0" />
                <span className="text-steel-gray">{t('home.features.euQuality')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <TruckIcon className="text-success-green flex-shrink-0" />
                <span className="text-steel-gray">{t('home.features.fastDelivery')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldIcon className="text-success-green flex-shrink-0" />
                <span className="text-steel-gray">{t('home.features.warranty')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="text-success-green flex-shrink-0" />
                <span className="text-steel-gray">{t('home.features.support')}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors group"
              >
                <span>{t('common.exploreProducts')}</span>
                <ArrowRightIcon className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                type="button"
                onClick={() => { const w = (window as unknown) as { openLeadModal?: () => void }; if (w.openLeadModal) w.openLeadModal() }}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold rounded-lg transition-colors"
              >
                {t('common.getQuote')}
              </button>
            </div>
          </div>

          {/* Right Content - Featured Product/Stats */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Stats Counters (in-view) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <React.Suspense fallback={<div className="rounded-2xl border border-light-gray bg-white p-6 text-center h-20" />}>
                <InViewCounter label={t('home.stats.premiumBrands') as string} to={6} />
              </React.Suspense>
              <React.Suspense fallback={<div className="rounded-2xl border border-light-gray bg-white p-6 text-center h-20" />}>
                <InViewCounter label={t('home.stats.productTypes') as string} to={50} suffix="+" />
              </React.Suspense>
              <React.Suspense fallback={<div className="rounded-2xl border border-light-gray bg-white p-6 text-center h-20" />}>
                <InViewCounter label={t('home.stats.yearsExperience') as string} to={15} suffix="+" />
              </React.Suspense>
              <React.Suspense fallback={<div className="rounded-2xl border border-light-gray bg-white p-6 text-center h-20" />}>
                <InViewCounter label={t('home.stats.happyCustomers') as string} to={1000} suffix="+" />
              </React.Suspense>
            </div>

            {/* Featured Image (hide on mobile to reduce clutter; visible from lg) */}
            <div className="relative hidden lg:block">
              {/* Responsive picture with AVIF/WebP/JPEG via vite-imagetools */}
              <HeroPicture />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-navy/20 to-transparent rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}

// Minimal inline icons to avoid loading lucide-react on initial load
function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function TruckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="1" y="7" width="13" height="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 9h4l3 3v3h-7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="6" cy="17" r="2" fill="currentColor"/>
      <circle cx="18" cy="17" r="2" fill="currentColor"/>
    </svg>
  )
}
function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l7 4v5c0 5-3 8-7 11C8 19 5 16 5 11V6l7-4z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  )
}
function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.16 9.81 19.8 19.8 0 0 1 .09 1.18 2 2 0 0 1 2.07-.99h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L6.5 7.5a16 16 0 0 0 6 6l1.99-1.74a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

export default HeroSection

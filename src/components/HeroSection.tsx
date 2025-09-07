import React, { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { ArrowRight, CheckCircle, Truck, Shield, Phone } from 'lucide-react'
import SpotlightHeroOverlay from './SpotlightHeroOverlay'
import InViewCounter from './InViewCounter'

export const HeroSection: React.FC = () => {
  const { t } = useI18n()
  const heroRef = useRef<HTMLDivElement | null>(null)
  return (
    <div
      ref={heroRef}
      onMouseMove={(e) => {
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
        className="absolute inset-0 pointer-events-none opacity-20"
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
      <SpotlightHeroOverlay />

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
                <CheckCircle className="text-success-green flex-shrink-0" size={20} />
                <span className="text-steel-gray">{t('home.features.euQuality')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="text-success-green flex-shrink-0" size={20} />
                <span className="text-steel-gray">{t('home.features.fastDelivery')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="text-success-green flex-shrink-0" size={20} />
                <span className="text-steel-gray">{t('home.features.warranty')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-success-green flex-shrink-0" size={20} />
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
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
          <div className="space-y-6">
            {/* Stats Counters (in-view) */}
            <div className="grid grid-cols-2 gap-4">
              <InViewCounter label={t('home.stats.premiumBrands') as string} to={6} />
              <InViewCounter label={t('home.stats.productTypes') as string} to={50} suffix="+" />
              <InViewCounter label={t('home.stats.yearsExperience') as string} to={15} suffix="+" />
              <InViewCounter label={t('home.stats.happyCustomers') as string} to={1000} suffix="+" />
            </div>

            {/* Featured Image */}
            <div className="relative">
              <img
                src="/images/industrial_HVAC_air_handling_unit_warehouse.jpg"
                alt="HVAC Equipment"
                width={1200}
                height={800}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full rounded-xl shadow-hvac-lg object-cover object-center"
              />
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

export default HeroSection

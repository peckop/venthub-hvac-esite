'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '../../i18n/I18nProvider'

export const EliteHero: React.FC = () => {
  const { t } = useI18n()
  const [isHovering, setIsHovering] = useState(false)

  // Explicitly getting fallback strings in case keys are not yet fully available
  const title = t('home.hero.title') || "Endüstriyel ve ticari HVAC çözümlerini doğru ürün, doğru kategori ve uzman destekle bulun."
  const subtitle = t('home.hero.subtitle') || "Fanlar, hava perdeleri, hız kontrol cihazları, ısı geri kazanım ve proje odaklı havalandırma çözümleri. Ürün keşfi, teknik yönlendirme ve hızlı teklif tek platformda."
  const primaryCta = t('home.hero.primaryCta') || "Ürünleri Keşfet"
  const secondaryCta = t('home.hero.secondaryCta') || "Hızlı Teklif Al"
  const quickAccessLabel = t('home.hero.quickAccessLabel') || "Hızlı Erişim"

  // Safe extraction of arrays with fallbacks
  const getArray = (key: string, fallback: string[]) => {
    const val = t(key) as unknown as string[]
    return Array.isArray(val) ? val : fallback
  }

  const trustStrips = getArray('home.hero.trustStrips', ["Yetkili markalar", "Teknik danışmanlık", "Türkiye geneli teslimat", "Proje desteği"])
  const quickChips = getArray('home.hero.quickChips', ["Fanlar", "Hava Perdeleri", "Isı Geri Kazanım", "Hız Kontrol", "Teklif Al"])

  return (
    <section className="relative w-full bg-white overflow-hidden pt-16 pb-8 lg:pt-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop Layout: 2 Columns. Mobile Layout: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Messaging */}
          <div className="flex flex-col z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-industrial-gray leading-tight tracking-tight mb-6">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-steel-gray mb-8 max-w-xl">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-primary-navy text-white font-semibold text-base shadow-sm hover:bg-secondary-blue hover:shadow-md transition-all duration-200"
              >
                {primaryCta}
              </Link>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    ;(window as any).openLeadModal?.()
                  }
                }}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border-2 border-primary-navy text-primary-navy font-semibold text-base hover:bg-primary-navy hover:text-white transition-all duration-200"
              >
                {secondaryCta}
              </button>
            </div>

            {/* Desktop Trust Strip (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-steel-gray">
              {trustStrips.map((strip, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{strip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Premium Visual (Controlled 3D / Static) */}
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-square bg-light-gray rounded-2xl overflow-hidden shadow-sm group border border-gray-100 flex items-center justify-center">
            {/* Placeholder for the premium visual - deliberately avoiding heavy 3D loading initially for mobile clarity */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 transition-transform duration-700 ease-out group-hover:scale-105"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            />

            {/* Very controlled, lightweight premium visual atmosphere */}
            <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center">
                <div className={`transition-all duration-1000 ease-in-out ${isHovering ? 'scale-110 drop-shadow-2xl' : 'scale-100 drop-shadow-xl'}`}>
                    <img
                        src="/images/industrial_HVAC_air_handling_unit_warehouse.jpg"
                        alt="Premium HVAC Solutions"
                        className="rounded-xl object-cover shadow-lg w-full h-full max-h-[400px]"
                        loading="eager"
                        fetchPriority="high"
                    />
                </div>
            </div>

            {/* Subtle overlay gradients */}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
          </div>

        </div>

        {/* Mobile Quick Chips (Visible only on Mobile below the hero) */}
        <div className="mt-8 lg:hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">{quickAccessLabel}</p>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-2 scrollbar-hide snap-x">
            {quickChips.map((chip, idx) => (
              <Link
                key={idx}
                href={chip === 'Teklif Al' ? '#' : `/products?q=${encodeURIComponent(chip)}`}
                onClick={(e) => {
                  if (chip === 'Teklif Al') {
                    e.preventDefault();
                    if (typeof window !== 'undefined') {
                      ;(window as any).openLeadModal?.()
                    }
                  }
                }}
                className="snap-start flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-sm font-medium text-industrial-gray hover:bg-gray-200 transition-colors border border-gray-200"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

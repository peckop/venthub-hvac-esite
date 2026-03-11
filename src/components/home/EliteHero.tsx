'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface EliteHeroProps {
  onQuoteClick: () => void
}

export const EliteHero: React.FC<EliteHeroProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-slate-950 flex items-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/industrial_HVAC_air_handling_unit_warehouse.jpg"
          alt={t('home.hero.visualAlt')}
          fill
          priority
          className="object-cover object-center scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-sm backdrop-blur-md mb-6">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>{t('home.hero.eyebrow')}</span>
          </div>

          <h1 className="text-4xl font-light leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[4rem]">
            {t('home.hero.title')}
          </h1>

          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-slate-300 sm:text-xl">
            {t('home.hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/products"
              className="inline-flex h-14 items-center justify-center rounded-none bg-white px-8 text-[15px] font-semibold tracking-wide text-slate-950 transition-all duration-300 hover:bg-slate-200"
            >
              {t('home.hero.primaryCta')}
            </Link>

            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex h-14 items-center justify-center rounded-none border border-white/30 bg-transparent px-8 text-[15px] font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50"
            >
              {t('home.hero.secondaryCta')}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-70 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest text-white">Scroll</span>
        <div className="w-[1px] h-8 bg-white/50" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slow-pan {
          from { transform: scale(1.05) translate(0, 0); }
          to { transform: scale(1.1) translate(-2%, 1%); }
        }
      `}} />
    </section>
  )
}

export default EliteHero

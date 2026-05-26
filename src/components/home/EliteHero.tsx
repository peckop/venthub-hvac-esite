'use client'

import { Routes } from '@/utils/routes';
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
    <section className="relative w-full h-[100vh] min-h-[700px] overflow-hidden bg-slate-950 flex items-center">
      {/* Background Image & Overlay with Motion */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: 'scale(1.05)', animation: 'heroScale 10s ease-out forwards' }}
      >
        <style>{`
          @keyframes heroScale {
            from { transform: scale(1.1); }
            to { transform: scale(1); }
          }
        `}</style>
        <Image
          src="/images/hero_hvac_industrial_premium_1.png"
          alt={t('home.hero.visualAlt')}
          fill
          priority
          sizes="100vw"
          fetchPriority="high"
          className="object-cover object-center brightness-[0.6] saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm backdrop-blur-md mb-8"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
          >
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t('home.hero.eyebrow')}</span>
          </div>

          <h1
            className="text-5xl font-light leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-[5.5rem]"
            style={{ animation: 'fadeInUp 1s ease-out 0.7s both' }}
          >
            {t('home.hero.title')}
          </h1>

          <p
            className="mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300 sm:text-2xl"
            style={{ animation: 'fadeInUp 1s ease-out 0.9s both' }}
          >
            {t('home.hero.subtitle')}
          </p>

          <div
            className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center"
            style={{ animation: 'fadeInUp 1s ease-out 1.1s both' }}
          >
            <Link
              href={Routes.products()}
              className="inline-flex h-16 items-center justify-center rounded-none bg-white px-10 text-base font-bold uppercase tracking-widest text-slate-950 transition-transform duration-500 hover:bg-cyan-400 hover:scale-105"
            >
              {t('home.hero.primaryCta')}
            </Link>

            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex h-16 items-center justify-center rounded-none border border-white/30 bg-white/5 px-10 text-base font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-transform duration-500 hover:bg-white/10 hover:border-white/60 hover:scale-105"
            >
              {t('home.hero.secondaryCta')}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        style={{ animation: 'fadeIn 1s ease-out 2s both', opacity: 0.7 }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(10px); }
          }
        `}</style>
        <span className="text-xs uppercase tracking-[0.3em] text-white/60">Explore</span>
        <div
          className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent"
          style={{ animation: 'bounce 2s infinite' }}
        />
      </div>
    </section>
  )
}

export default EliteHero

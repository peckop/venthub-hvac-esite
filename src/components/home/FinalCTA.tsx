'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface FinalCTAProps {
  onQuoteClick: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#38bdf8_140%)] px-6 py-8 text-white shadow-[0_32px_80px_-40px_rgba(15,23,42,0.55)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
              {t('home.finalCta.eyebrow')}
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.4rem]">
              {t('home.finalCta.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              {t('home.finalCta.subtitle')}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {t('home.finalCta.primaryCta')}
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/16"
            >
              {t('home.finalCta.secondaryCta')}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              {t('home.finalCta.tertiaryCta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA

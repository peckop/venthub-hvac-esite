'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface FinalCTAProps {
  onQuoteClick: () => void
}

const supportKeys = ['authorizedBrands', 'engineeringSupport', 'projectGuidance'] as const

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_42%,#0f3a64_76%,#38bdf8_150%)] p-2 shadow-[0_36px_90px_-44px_rgba(15,23,42,0.6)] sm:p-3">
          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-5 py-6 text-white sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-8">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                {t('home.finalCta.eyebrow')}
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.5rem]">
                {t('home.finalCta.title')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
                {t('home.finalCta.subtitle')}
              </p>

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

            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/28 p-5 backdrop-blur-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                {t('home.hero.visualEyebrow')}
              </div>
              <div className="mt-3 grid gap-3">
                {supportKeys.map((key) => (
                  <div key={key} className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white/82">
                    {t(`home.hero.trustStrip.${key}`)}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-white/68">
                <div className="font-semibold text-white/88">{t('home.hero.visualTitle')}</div>
                <p className="mt-2">{t('home.hero.visualSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA

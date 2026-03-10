'use client'

import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const proofKeys = ['brands', 'guidance', 'delivery', 'support'] as const
const trustStripKeys = ['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuidance'] as const

export const TrustProofSection: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200/75 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
              {t('home.trustProof.eyebrow')}
            </div>
            <h2 className="mt-2 max-w-lg text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.35rem]">
              {t('home.trustProof.title')}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
              {t('home.trustProof.subtitle')}
            </p>

            <div className="mt-6 rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)]">
              <div className="grid gap-3 sm:grid-cols-2">
                {trustStripKeys.map((key) => (
                  <div key={key} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                    {t(`home.hero.trustStrip.${key}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {proofKeys.map((key) => (
              <div
                key={key}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_22px_45px_-36px_rgba(15,23,42,0.32)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex rounded-full border border-primary-navy/10 bg-primary-navy/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-navy">
                  {t(`home.trustProof.items.${key}.eyebrow`)}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950 sm:text-xl">{t(`home.trustProof.items.${key}.title`)}</h3>
                <p className="mt-3 text-sm leading-6 text-steel-gray sm:text-[15px]">{t(`home.trustProof.items.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustProofSection

'use client'

import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const proofKeys = ['brands', 'guidance', 'delivery', 'support'] as const

export const TrustProofSection: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200/75 bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:px-8">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
            {t('home.trustProof.eyebrow')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.2rem]">
            {t('home.trustProof.title')}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
            {t('home.trustProof.subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {proofKeys.map((key) => (
            <div
              key={key}
              className="rounded-[1.7rem] border border-slate-200 bg-slate-50/85 p-5 shadow-[0_18px_35px_-34px_rgba(15,23,42,0.35)]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-navy">
                {t(`home.trustProof.items.${key}.eyebrow`)}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{t(`home.trustProof.items.${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-steel-gray">{t(`home.trustProof.items.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustProofSection

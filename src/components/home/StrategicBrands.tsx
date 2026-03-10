'use client'

import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import BrandsShowcase from '../BrandsShowcase'

export const StrategicBrands: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200/75 bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
            {t('home.strategicBrands.eyebrow')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.2rem]">
            {t('home.strategicBrands.title')}
          </h2>
          <p className="mt-3 text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
            {t('home.strategicBrands.subtitle')}
          </p>
        </div>
      </div>

      <BrandsShowcase />
    </section>
  )
}

export default StrategicBrands

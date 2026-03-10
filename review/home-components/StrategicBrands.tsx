'use client'

import React, { Suspense } from 'react'
import { useI18n } from '../../src/i18n/I18nProvider'

const BrandsShowcase = React.lazy(() => import('../../src/components/BrandsShowcase'))

export const StrategicBrands: React.FC = () => {
  const { t } = useI18n()

  const mainTitle = t('home.strategicBrands.title') || "Çalıştığımız Premium Markalar"
  const mainSubtitle = t('home.strategicBrands.subtitle') || "Performans, enerji verimliliği ve dayanıklılık konusunda kendini kanıtlamış dünya markalarını sizin için seçiyoruz."

  return (
    <section className="py-16 md:py-24 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Strong Strategic Context Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{mainTitle}</h2>
          <p className="mt-3 text-base md:text-lg text-steel-gray">
            {mainSubtitle}
          </p>
        </div>

        {/* Existing Brand Showcase wrapped safely */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden">
          <Suspense fallback={<div className="min-h-[120px] bg-gray-50 animate-pulse rounded-2xl" aria-hidden="true" />}>
            <BrandsShowcase />
          </Suspense>
        </div>

      </div>
    </section>
  )
}

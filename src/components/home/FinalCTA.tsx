'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '../../i18n/I18nProvider'

export const FinalCTA: React.FC = () => {
  const { t } = useI18n()

  const title = t('home.finalCta.title') || "Doğru HVAC çözümünü birlikte belirleyelim"
  const subtitle = t('home.finalCta.subtitle') || "Alanında uzman mühendis kadromuz, projenizin tüm süreçlerinde yanınızda."
  const contactExpert = t('home.finalCta.contactExpert') || "Uzmanla Görüş"
  const requestQuote = t('home.finalCta.requestQuote') || "Teklif Talep Et"
  const exploreProducts = t('home.finalCta.exploreProducts') || "Ürünleri Keşfet"

  return (
    <section className="py-20 md:py-28 bg-gray-50 border-t border-gray-100 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-industrial-gray leading-tight tracking-tight">
              {title}
            </h2>
            <p className="mt-4 text-lg text-steel-gray max-w-xl mx-auto md:mx-0 font-medium">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-primary-navy text-primary-navy font-bold text-lg hover:bg-primary-navy hover:text-white transition-all transform hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              {exploreProducts}
            </Link>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  ;(window as any).openLeadModal?.()
                }
              }}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-navy text-white font-bold text-lg hover:bg-secondary-blue shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              {requestQuote}
            </button>
          </div>

        </div>

        {/* Support link for extreme edge cases directly under CTA */}
        <div className="mt-8 text-center">
          <Link href="/contact" className="text-sm font-medium text-steel-gray hover:text-primary-navy hover:underline transition-colors">
            {contactExpert} →
          </Link>
        </div>
      </div>
    </section>
  )
}

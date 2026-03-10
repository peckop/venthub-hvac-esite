'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const solutionItems = [
  { id: 'parking', href: '/category/fanlar/otopark-jet-fanlari', tone: 'from-secondary-blue/18 via-secondary-blue/6 to-white' },
  { id: 'kitchen', href: '/category/fanlar/kanal-tipi-fanlar', tone: 'from-amber-500/16 via-amber-500/5 to-white' },
  { id: 'entrance', href: '/category/hava-perdeleri', tone: 'from-primary-navy/18 via-primary-navy/6 to-white' },
  { id: 'comfort', href: '/category/isi-geri-kazanim-cihazlari', tone: 'from-emerald-500/16 via-emerald-500/5 to-white' },
] as const

export const ApplicationSolutions: React.FC = () => {
  const { t } = useI18n()

  return (
    <section id="applications" className="border-b border-slate-200/75 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
              {t('home.applicationSolutions.eyebrow')}
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.2rem]">
              {t('home.applicationSolutions.title')}
            </h2>
            <p className="mt-3 text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
              {t('home.applicationSolutions.subtitle')}
            </p>
          </div>

          <Link href="/products#applications" className="inline-flex items-center text-sm font-semibold text-primary-navy transition-colors hover:text-secondary-blue">
            {t('home.applicationSolutions.viewAll')} →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {solutionItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-34px_rgba(15,23,42,0.38)] sm:p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                    {t(`home.applicationSolutions.items.${item.id}.eyebrow`)}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                    {t(`home.applicationSolutions.items.${item.id}.title`)}
                  </h3>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-primary-navy shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                  <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              <p className="mt-4 max-w-xl text-sm leading-6 text-steel-gray sm:text-[15px]">
                {t(`home.applicationSolutions.items.${item.id}.description`)}
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-sm font-medium text-slate-700">
                  {t(`home.applicationSolutions.items.${item.id}.point1`)}
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-sm font-medium text-slate-700">
                  {t(`home.applicationSolutions.items.${item.id}.point2`)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ApplicationSolutions

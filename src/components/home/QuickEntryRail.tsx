'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes'

interface QuickEntryRailProps {
  onQuoteClick: () => void
}

const quickEntryItems = [
  {
    id: 'category',
    href: '#categories',
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'application',
    href: '#applications',
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'support',
    href: Routes.destek.home(),
    icon: (
      <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1l2.5 3 2.5-3H16a2 2 0 002-2v-4z" />
      </svg>
    ),
  },
] as const

export const QuickEntryRail: React.FC<QuickEntryRailProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200/75 bg-white/95">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-steel-gray">
              {t('home.quickEntry.eyebrow')}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-950 sm:text-xl">
              {t('home.quickEntry.title')}
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-6 text-steel-gray lg:block">
            {t('home.quickEntry.subtitle')}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickEntryItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-h-[88px] items-start gap-3 rounded-hvac-lg border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-primary-navy/20 hover:shadow-[0_22px_40px_-28px_rgba(37,99,235,0.45)]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-navy/10 bg-primary-navy/[0.06] text-primary-navy transition-colors group-hover:border-primary-navy/20 group-hover:bg-primary-navy/10">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">
                  {t(`home.quickEntry.items.${item.id}.title`)}
                </span>
                <span className="mt-1 block text-sm leading-6 text-steel-gray">
                  {t(`home.quickEntry.items.${item.id}.description`)}
                </span>
              </span>
            </Link>
          ))}

          <button
            type="button"
            onClick={onQuoteClick}
            className="group flex min-h-[88px] items-start gap-3 rounded-hvac-lg border border-primary-navy/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.02),rgba(37,99,235,0.06))] px-4 py-4 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-0.5 hover:border-primary-navy/25 hover:shadow-[0_22px_40px_-28px_rgba(37,99,235,0.45)]"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-navy/15 bg-primary-navy text-white shadow-sm transition-colors group-hover:bg-secondary-blue">
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M7 4h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-slate-950">
                {t('home.quickEntry.items.quote.title')}
              </span>
              <span className="mt-1 block text-sm leading-6 text-steel-gray">
                {t('home.quickEntry.items.quote.description')}
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default QuickEntryRail

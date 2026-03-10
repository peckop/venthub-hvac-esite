'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface EliteHeroProps {
  onQuoteClick: () => void
}

const quickChipConfig = [
  { id: 'fans', href: '/products?category=fanlar', isQuote: false },
  { id: 'airCurtains', href: '/products?category=hava-perdeleri', isQuote: false },
  { id: 'heatRecovery', href: '/products?category=isi-geri-kazanim-cihazlari', isQuote: false },
  { id: 'speedControl', href: '/products?category=hiz-kontrolu-cihazlari', isQuote: false },
  { id: 'quote', href: '', isQuote: true },
] as const

const trustStripConfig = ['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuidance'] as const

export const EliteHero: React.FC<EliteHeroProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f7fbff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_26%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-navy/10 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-navy shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-secondary-blue" />
            <span>{t('home.hero.eyebrow')}</span>
          </div>

          <h1 className="mt-5 text-[2rem] font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-[2.8rem] lg:text-[4rem]">
            {t('home.hero.title')}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
            {t('home.hero.subtitle')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-primary-navy px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary-blue"
            >
              {t('home.hero.primaryCta')}
            </Link>

            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-navy/25 hover:text-primary-navy"
            >
              {t('home.hero.secondaryCta')}
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {trustStripConfig.map((itemKey) => (
              <div
                key={itemKey}
                className="rounded-2xl border border-white/75 bg-white/92 px-3 py-3 text-sm font-medium text-slate-700 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.38)] backdrop-blur-sm"
              >
                {t(`home.hero.trustStrip.${itemKey}`)}
              </div>
            ))}
          </div>

          <div className="mt-7 lg:hidden">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
              {t('home.hero.quickAccessLabel')}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickChipConfig.map((chip) => {
                const label = t(`home.hero.quickChips.${chip.id}`)

                if (chip.isQuote) {
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={onQuoteClick}
                      className="shrink-0 rounded-full border border-primary-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-primary-navy shadow-sm transition-colors hover:border-primary-navy/25 hover:bg-primary-navy hover:text-white"
                    >
                      {label}
                    </button>
                  )
                }

                return (
                  <Link
                    key={chip.id}
                    href={chip.href}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:text-primary-navy"
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-secondary-blue/15 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-primary-navy/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 shadow-[0_36px_80px_-36px_rgba(15,23,42,0.65)]">
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.52))]" />
            <Image
              src="/images/industrial_HVAC_air_handling_unit_warehouse.jpg"
              alt={t('home.hero.visualAlt')}
              width={960}
              height={1100}
              priority
              className="h-[380px] w-full object-cover object-center sm:h-[460px] lg:h-[560px]"
            />

            <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
              <div className="max-w-md rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4 text-white backdrop-blur-md">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-blue">
                  {t('home.hero.visualEyebrow')}
                </div>
                <div className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">
                  {t('home.hero.visualTitle')}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/72 sm:text-[15px]">
                  {t('home.hero.visualSubtitle')}
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/80">
                    {t('home.hero.visualPoints.selection')}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/80">
                    {t('home.hero.visualPoints.routing')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EliteHero

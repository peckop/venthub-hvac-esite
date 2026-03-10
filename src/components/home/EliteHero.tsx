'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, type Category } from '../../lib/supabase'
import { getCategoryDescription, getCategoryDisplayName } from '../../utils/categoryHelpers'
import CategorySpotlightScene from '../navigation/CategorySpotlightScene'

interface EliteHeroProps {
  onQuoteClick: () => void
}

const preferredCategorySlugs = ['fanlar', 'hava-perdeleri', 'isi-geri-kazanim-cihazlari', 'hiz-kontrolu-cihazlari'] as const
const trustStripConfig = ['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuidance'] as const
const categorySummaryKeyMap = {
  fanlar: 'fans',
  'hava-perdeleri': 'airCurtains',
  'isi-geri-kazanim-cihazlari': 'heatRecovery',
  'hiz-kontrolu-cihazlari': 'speedControl',
} as const

const trustIcons: Record<(typeof trustStripConfig)[number], React.ReactNode> = {
  authorizedBrands: (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.2-2.7 8-7 10-4.3-2-7-5.8-7-10V6l7-3z" />
    </svg>
  ),
  engineeringSupport: (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  ),
  nationwideDelivery: (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 17H6a2 2 0 01-2-2V7a2 2 0 012-2h9a2 2 0 012 2v1m0 9h1a2 2 0 002-2v-3l-3-3h-3m0 8a2 2 0 104 0m-10 0a2 2 0 104 0" />
    </svg>
  ),
  projectGuidance: (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.5 1.5L5 16l9.5-9.5a2.12 2.12 0 013 3L9 20z" />
    </svg>
  ),
}

export const EliteHero: React.FC<EliteHeroProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const data = await getCategories()
        if (!active) return

        setCategories(data)
        const rootCategories = data.filter((category) => category.level === 0)
        const firstPreferred = preferredCategorySlugs.find((slug) => rootCategories.some((category) => category.slug === slug))
        setSelectedSlug(firstPreferred || rootCategories[0]?.slug || null)
      } catch (error) {
        console.error('Failed to load homepage hero categories:', error)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const mainCategories = useMemo(() => {
    const rootCategories = categories.filter((category) => category.level === 0)

    return preferredCategorySlugs
      .map((slug) => rootCategories.find((category) => category.slug === slug))
      .filter((category): category is Category => Boolean(category))
  }, [categories])

  const selectedCategory = useMemo(
    () => mainCategories.find((category) => category.slug === selectedSlug) || mainCategories[0] || null,
    [mainCategories, selectedSlug]
  )

  const selectedSeries = useMemo(() => {
    if (!selectedCategory) return []
    return categories.filter((category) => category.parent_id === selectedCategory.id)
  }, [categories, selectedCategory])

  const seriesCount = selectedSeries.length
  const selectedSummary = selectedCategory
    ? t(`home.hero.categorySummaries.${categorySummaryKeyMap[selectedCategory.slug as keyof typeof categorySummaryKeyMap]}`)
    : t('home.guidedDiscovery.panelFallback')

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#020617_0%,#04122a_50%,#0b1730_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(37,99,235,0.18),transparent_24%),radial-gradient(circle_at_72%_82%,rgba(14,116,144,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pb-10 lg:pt-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] xl:items-center">
          <div className="max-w-md xl:pr-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary-blue/30 bg-secondary-blue/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-secondary-blue" />
              <span>{t('home.hero.eyebrow')}</span>
            </div>

            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-[3rem] lg:text-[3.6rem]">
              <span className="block">{t('home.hero.titleLineOne')}</span>
              <span className="block">{t('home.hero.titleLineTwo')}</span>
            </h1>

            <p className="mt-4 max-w-sm text-[15px] leading-7 text-slate-300 sm:text-base sm:leading-7">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_20px_50px_-28px_rgba(255,255,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary-blue hover:text-white"
              >
                {t('home.hero.primaryCta')}
              </Link>
              <button
                type="button"
                onClick={onQuoteClick}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-blue/40 hover:bg-white/[0.1]"
              >
                {t('home.hero.secondaryCta')}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-slate-300">
              <Link href="#categories" className="transition-colors hover:text-white">
                {t('home.quickEntry.items.category.title')}
              </Link>
              <Link href="#applications" className="transition-colors hover:text-white">
                {t('home.quickEntry.items.application.title')}
              </Link>
              <Link href="/support" className="transition-colors hover:text-white">
                {t('home.quickEntry.items.support.title')}
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {trustStripConfig.map((itemKey) => (
                <div
                  key={itemKey}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-secondary-blue">
                    {trustIcons[itemKey]}
                  </span>
                  <span>{t(`home.hero.trustStrip.${itemKey}`)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-3 shadow-[0_36px_120px_-56px_rgba(2,6,23,1)] backdrop-blur-sm sm:p-4">
              <div className="grid grid-cols-2 gap-2 pb-3 lg:grid-cols-4">
                {mainCategories.map((category) => {
                  const isActive = selectedCategory?.id === category.id

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedSlug(category.slug)}
                      className={`min-h-[52px] rounded-[1rem] border px-3 py-2 text-sm font-medium transition-all duration-300 ${isActive ? 'border-secondary-blue/45 bg-secondary-blue/16 text-white shadow-[0_18px_40px_-28px_rgba(56,189,248,0.85)]' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'}`}
                    >
                      {getCategoryDisplayName(category)}
                    </button>
                  )
                })}
              </div>

              <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_30%),linear-gradient(180deg,#081121_0%,#050b16_100%)] lg:h-[560px]">
                {selectedCategory ? (
                  <>
                    <div className="grid lg:h-full lg:grid-cols-[minmax(0,1.28fr)_320px]">
                      <div className="relative min-h-[360px] overflow-hidden border-b border-white/10 sm:min-h-[420px] lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r">
                        <div className="absolute left-1/2 top-1/2 z-0 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-blue/18 blur-3xl sm:h-[420px] sm:w-[420px]" />
                        <CategorySpotlightScene categorySlug={selectedCategory.slug} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.04)_50%,rgba(2,6,23,0.22)_100%)]" />

                        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue backdrop-blur-md sm:left-5 sm:top-5">
                          {t('home.hero.visualEyebrow')}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/58 px-4 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-secondary-blue" />
                            <span>{t('home.hero.metrics.productSeries', { count: seriesCount })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 sm:p-6 lg:h-full">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                          {t('home.guidedDiscovery.panelEyebrow')}
                        </div>
                        <h2 className="mt-3 text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[2.2rem]">
                          {getCategoryDisplayName(selectedCategory)}
                        </h2>
                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-300 sm:min-h-[84px] sm:text-[15px]">
                          {selectedSummary || getCategoryDescription(selectedCategory) || t('home.guidedDiscovery.panelFallback')}
                        </p>

                        <div className="mt-5 grid gap-3">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-blue">
                              {t('home.guidedDiscovery.seriesEyebrow')}
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">{t('home.hero.metrics.productSeries', { count: seriesCount })}</div>
                          </div>

                          <div className="grid h-[196px] gap-2 overflow-hidden">
                            {selectedSeries.slice(0, 4).map((series) => (
                              <Link
                                key={series.id}
                                href={`/category/${selectedCategory.slug}/${series.slug}`}
                                className="group rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 transition-all duration-300 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="min-w-0 truncate text-sm font-semibold text-white">{getCategoryDisplayName(series)}</span>
                                  <span className="text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">→</span>
                                </div>
                              </Link>
                            ))}
                            {selectedSeries.length === 0 && (
                              <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                                {t('home.guidedDiscovery.loading')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 pt-5">
                          <Link
                            href={`/category/${selectedCategory.slug}`}
                            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-secondary-blue hover:text-white"
                          >
                            {t('home.guidedDiscovery.primaryCta')}
                          </Link>
                          <Link
                            href="#applications"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                          >
                            {t('home.guidedDiscovery.secondaryCta')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[460px] items-center justify-center px-6 text-center text-sm text-white/60">
                    {t('home.guidedDiscovery.loading')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EliteHero

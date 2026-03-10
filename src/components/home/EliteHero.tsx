'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, type Category } from '../../lib/supabase'
import { getCategoryDescription, getCategoryDisplayName } from '../../utils/categoryHelpers'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import CategorySpotlightScene from '../navigation/CategorySpotlightScene'

interface EliteHeroProps {
  onQuoteClick: () => void
}

const preferredCategorySlugs = ['fanlar', 'hava-perdeleri', 'isi-geri-kazanim-cihazlari', 'hiz-kontrolu-cihazlari'] as const
const trustStripConfig = ['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuidance'] as const
const routeCardConfig = [
  { id: 'category', href: '#categories' },
  { id: 'application', href: '#applications' },
  { id: 'support', href: '/support' },
] as const

const routeIcons: Record<(typeof routeCardConfig)[number]['id'], React.ReactNode> = {
  category: (
    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="1.8" />
    </svg>
  ),
  application: (
    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
    </svg>
  ),
  support: (
    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1l2.5 3 2.5-3H16a2 2 0 002-2v-4z" />
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

  const coreCategoryCount = mainCategories.length || preferredCategorySlugs.length
  const seriesCount = categories.filter((category) => category.level > 0).length || 12

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#020617_0%,#061123_44%,#0f172a_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(37,99,235,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,116,144,0.16),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary-blue/30 bg-secondary-blue/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue shadow-[0_0_0_1px_rgba(56,189,248,0.08)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-secondary-blue" />
              <span>{t('home.hero.eyebrow')}</span>
            </div>

            <h1 className="mt-5 max-w-[12ch] text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-[3.5rem] lg:text-[4.85rem]">
              {t('home.hero.title')}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary-blue hover:text-white"
              >
                {t('home.hero.primaryCta')}
              </Link>

              <button
                type="button"
                onClick={onQuoteClick}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-blue/40 hover:bg-white/[0.1]"
              >
                {t('home.hero.secondaryCta')}
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                <div className="text-2xl font-semibold text-white sm:text-[2rem]">{coreCategoryCount}+</div>
                <div className="mt-1 text-sm leading-6 text-slate-300">{t('home.hero.metrics.coreCategories')}</div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                <div className="text-2xl font-semibold text-white sm:text-[2rem]">{seriesCount}+</div>
                <div className="mt-1 text-sm leading-6 text-slate-300">{t('home.hero.metrics.productSeries')}</div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                <div className="text-2xl font-semibold text-white sm:text-[2rem]">3</div>
                <div className="mt-1 text-sm leading-6 text-slate-300">{t('home.hero.metrics.entryPaths')}</div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {routeCardConfig.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue/35 hover:bg-white/[0.08]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-secondary-blue transition-colors group-hover:border-secondary-blue/25 group-hover:bg-secondary-blue/10">
                    {routeIcons[item.id]}
                  </span>
                  <div className="mt-4 text-sm font-semibold text-white">
                    {t(`home.quickEntry.items.${item.id}.title`)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {t(`home.quickEntry.items.${item.id}.description`)}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">
                    <span aria-hidden="true">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-3 shadow-[0_40px_120px_-56px_rgba(2,6,23,1)] backdrop-blur-sm sm:p-4">
            <div className="rounded-[1.55rem] border border-white/10 bg-slate-950/45 px-4 py-4 sm:px-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                {t('home.hero.visualEyebrow')}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                {t('home.hero.visualTitle')}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                {t('home.hero.visualSubtitle')}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-slate-200">
                  {t('home.hero.visualPoints.selection')}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-slate-200">
                  {t('home.hero.visualPoints.routing')}
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-col xl:overflow-visible xl:pb-0">
                {mainCategories.map((category) => {
                  const isActive = selectedCategory?.id === category.id
                  const count = categories.filter((item) => item.parent_id === category.id).length

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedSlug(category.slug)}
                      className={`shrink-0 rounded-[1.45rem] border px-4 py-3 text-left transition-all duration-300 xl:w-full ${isActive ? 'border-secondary-blue/40 bg-secondary-blue/16 text-white shadow-[0_24px_60px_-42px_rgba(56,189,248,0.75)]' : 'border-white/10 bg-white/[0.03] text-white/78 hover:border-white/20 hover:bg-white/[0.08]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-secondary-blue">
                          {getCategoryIcon(category.slug, { size: 20 })}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white">{getCategoryDisplayName(category)}</span>
                          <span className="mt-1 block text-xs text-white/55">{t('home.guidedDiscovery.seriesCount', { count })}</span>
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="relative min-h-[480px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_32%),linear-gradient(180deg,#081121_0%,#050b16_100%)]">
                {selectedCategory ? (
                  <>
                    <CategorySpotlightScene categorySlug={selectedCategory.slug} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.12)_44%,rgba(2,6,23,0.82)_100%)]" />

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/72 p-5 backdrop-blur-md">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                          {t('home.guidedDiscovery.panelEyebrow')}
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">
                          {getCategoryDisplayName(selectedCategory)}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                          {getCategoryDescription(selectedCategory) || t('home.guidedDiscovery.panelFallback')}
                        </p>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <Link
                            href={`/category/${selectedCategory.slug}`}
                            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-secondary-blue hover:text-white"
                          >
                            {t('home.guidedDiscovery.primaryCta')}
                          </Link>
                          <Link
                            href="#applications"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                          >
                            {t('home.guidedDiscovery.secondaryCta')}
                          </Link>
                        </div>

                        <div className="mt-5 border-t border-white/10 pt-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                            {t('home.guidedDiscovery.seriesEyebrow')}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedSeries.slice(0, 4).map((series) => (
                              <Link
                                key={series.id}
                                href={`/category/${selectedCategory.slug}/${series.slug}`}
                                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/82 transition-colors hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                              >
                                {getCategoryDisplayName(series)}
                              </Link>
                            ))}
                            {selectedSeries.length === 0 && (
                              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/55">
                                {t('home.guidedDiscovery.loading')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[480px] items-center justify-center px-6 text-center text-sm text-white/60">
                    {t('home.guidedDiscovery.loading')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trustStripConfig.map((itemKey) => (
            <div
              key={itemKey}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-medium text-slate-200 shadow-[0_18px_40px_-34px_rgba(2,6,23,0.95)] backdrop-blur-sm"
            >
              {t(`home.hero.trustStrip.${itemKey}`)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EliteHero

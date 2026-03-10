'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, type Category } from '../../lib/supabase'
import { getCategoryDescription, getCategoryDisplayName } from '../../utils/categoryHelpers'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import CategorySpotlightScene from '../navigation/CategorySpotlightScene'

const preferredCategorySlugs = ['fanlar', 'hava-perdeleri', 'isi-geri-kazanim-cihazlari', 'hiz-kontrolu-cihazlari'] as const

export const GuidedCategoryDiscovery: React.FC = () => {
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
        const firstPreferred = preferredCategorySlugs.find((slug) => data.some((category) => category.slug === slug && category.level === 0))
        setSelectedSlug(firstPreferred || data.find((category) => category.level === 0)?.slug || null)
      } catch (error) {
        console.error('Failed to load homepage categories:', error)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const mainCategories = useMemo(() => {
    const levelZero = categories.filter((category) => category.level === 0)
    return preferredCategorySlugs
      .map((slug) => levelZero.find((category) => category.slug === slug))
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

  return (
    <section id="categories" className="border-b border-slate-200/75 bg-slate-950 py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
            {t('home.guidedDiscovery.eyebrow')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.35rem]">
            {t('home.guidedDiscovery.title')}
          </h2>
          <p className="mt-3 text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
            {t('home.guidedDiscovery.subtitle')}
          </p>
        </div>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          {mainCategories.map((category) => {
            const isActive = selectedCategory?.id === category.id
            const count = categories.filter((item) => item.parent_id === category.id).length

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedSlug(category.slug)}
                className={`shrink-0 rounded-[1.35rem] border px-4 py-3 text-left transition-all duration-300 ${isActive ? 'border-secondary-blue/45 bg-secondary-blue/18 text-white' : 'border-white/10 bg-white/[0.05] text-white/75'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-secondary-blue">
                    {getCategoryIcon(category.slug, { size: 20 })}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{getCategoryDisplayName(category)}</span>
                    <span className="mt-1 block text-xs text-white/50">{t('home.guidedDiscovery.seriesCount', { count })}</span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
          <div className="hidden gap-3 lg:grid">
            {mainCategories.map((category) => {
              const isActive = selectedCategory?.id === category.id
              const count = categories.filter((item) => item.parent_id === category.id).length

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedSlug(category.slug)}
                  className={`rounded-[1.6rem] border p-4 text-left transition-all duration-300 ${isActive ? 'border-secondary-blue/40 bg-secondary-blue/14 shadow-[0_24px_60px_-40px_rgba(56,189,248,0.8)]' : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-secondary-blue">
                      {getCategoryIcon(category.slug, { size: 20 })}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{getCategoryDisplayName(category)}</span>
                      <span className="mt-1 block text-sm leading-6 text-white/58">
                        {getCategoryDescription(category) || t('home.guidedDiscovery.categoryFallback')}
                      </span>
                    </span>
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
                    {t('home.guidedDiscovery.seriesCount', { count })}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_32px_80px_-44px_rgba(15,23,42,0.7)]">
            {selectedCategory ? (
              <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative min-h-[300px] overflow-hidden border-b border-white/10 lg:min-h-full lg:border-b-0 lg:border-r">
                  <CategorySpotlightScene categorySlug={selectedCategory.slug} />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/20 to-slate-950/88" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="max-w-lg rounded-[1.6rem] border border-white/10 bg-slate-950/68 p-5 backdrop-blur-md">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                        {t('home.guidedDiscovery.panelEyebrow')}
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[2rem]">
                        {getCategoryDisplayName(selectedCategory)}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/68 sm:text-[15px]">
                        {getCategoryDescription(selectedCategory) || t('home.guidedDiscovery.panelFallback')}
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/category/${selectedCategory.slug}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-secondary-blue hover:text-white"
                        >
                          {t('home.guidedDiscovery.primaryCta')}
                        </Link>
                        <Link
                          href="#applications"
                          className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/82 transition-colors hover:bg-white/[0.08]"
                        >
                          {t('home.guidedDiscovery.secondaryCta')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col p-5 sm:p-6">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      {t('home.guidedDiscovery.seriesEyebrow')}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {t('home.guidedDiscovery.seriesTitle', { category: getCategoryDisplayName(selectedCategory) })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {selectedSeries.slice(0, 4).map((series) => (
                      <Link
                        key={series.id}
                        href={`/category/${selectedCategory.slug}/${series.slug}`}
                        className="group rounded-[1.35rem] border border-white/10 bg-white/[0.05] px-4 py-4 transition-all duration-300 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">{getCategoryDisplayName(series)}</div>
                            <div className="mt-1 truncate text-xs text-white/50">{series.description || t('home.guidedDiscovery.seriesFallback')}</div>
                          </div>
                          <span className="text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto pt-5 text-sm leading-6 text-white/56">{t('home.guidedDiscovery.footerNote')}</div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center px-6 text-center text-sm text-white/60">
                {t('home.guidedDiscovery.loading')}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuidedCategoryDiscovery

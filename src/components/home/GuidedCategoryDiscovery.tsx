'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, type Category } from '../../lib/supabase'
import { getCategoryDescription, getCategoryDisplayName } from '../../utils/categoryHelpers'
import { getCategoryIcon } from '../../utils/getCategoryIcon'

const preferredCategorySlugs = ['fanlar', 'hava-perdeleri', 'isi-geri-kazanim-cihazlari', 'hiz-kontrolu-cihazlari'] as const
const stepKeys = ['select', 'compare', 'convert'] as const

export const GuidedCategoryDiscovery: React.FC = () => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const data = await getCategories()
        if (!active) return
        setCategories(data)
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

  return (
    <section id="categories" className="border-b border-slate-200/75 bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_360px] lg:items-start">
          <div>
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                {t('home.guidedDiscovery.eyebrow')}
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.35rem]">
                {t('home.guidedDiscovery.title')}
              </h2>
              <p className="mt-3 text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
                {t('home.guidedDiscovery.subtitle')}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {mainCategories.map((category) => {
                const count = categories.filter((item) => item.parent_id === category.id).length

                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group relative flex flex-col items-start gap-4 rounded-none border-b border-slate-200/60 pb-8 pt-4 transition-all duration-500 hover:-translate-y-1 hover:border-secondary-blue sm:flex-row"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-primary-navy/[0.03] text-secondary-blue transition-colors group-hover:border-secondary-blue/20 group-hover:bg-secondary-blue/10">
                        {getCategoryIcon(category.slug, { size: 22 })}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">{getCategoryDisplayName(category)}</h3>
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-blue">
                            {t('home.guidedDiscovery.seriesCount', { count })}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-steel-gray sm:text-[15px]">
                          {getCategoryDescription(category) || t('home.guidedDiscovery.categoryFallback')}
                        </p>
                        <div className="mt-5 inline-flex items-center text-sm font-semibold text-primary-navy transition-transform group-hover:translate-x-1 group-hover:text-secondary-blue">
                          {t('home.guidedDiscovery.primaryCta')} →
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="rounded-none border-l-2 border-slate-900 bg-slate-50 p-8 text-slate-950 sm:p-10 lg:sticky lg:top-32">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
              {t('home.guidedDiscovery.panelEyebrow')}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              {t('home.guidedDiscovery.panelTitle')}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px]">
              {t('home.guidedDiscovery.panelBody')}
            </p>

            <div className="mt-6 grid gap-3">
              {stepKeys.map((stepKey, index) => (
                <div key={stepKey} className="rounded-[1.35rem] border border-slate-200/70 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-blue">0{index + 1}</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{t(`home.guidedDiscovery.steps.${stepKey}.title`)}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-900/68">{t(`home.guidedDiscovery.steps.${stepKey}.description`)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-secondary-blue hover:text-slate-900"
              >
                {t('home.featuredCommercial.cta')}
              </Link>
              <Link
                href="#applications"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/[0.08]"
              >
                {t('home.guidedDiscovery.secondaryCta')}
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-4 text-sm leading-6 text-slate-900/58">
              {t('home.guidedDiscovery.footerNote')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuidedCategoryDiscovery

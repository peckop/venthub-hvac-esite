'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Grid3X3, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useI18n } from '../../i18n/I18nProvider'
import type { Category } from '../../lib/supabase'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import CategorySpotlightScene from './CategorySpotlightScene'

interface CategoryHubOverlayProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  isLoading: boolean
  loadError: string | null
  hasLoadedOnce: boolean
  onRetry: () => void
  onCategorySelect: (category: Category) => void
}

const CategoryHubOverlay: React.FC<CategoryHubOverlayProps> = ({
  isOpen,
  onClose,
  categories,
  isLoading,
  loadError,
  hasLoadedOnce,
  onRetry,
  onCategorySelect,
}) => {
  const router = useRouter()
  const { t } = useI18n()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null)
  const [lockedCategoryId, setLockedCategoryId] = useState<string | null>(null)

  const mainCategories = useMemo(() => categories.filter((category) => category.level === 0), [categories])

  const activeCategory = useMemo(() => {
    const targetId = lockedCategoryId || focusedCategoryId || mainCategories[0]?.id
    return mainCategories.find((category) => category.id === targetId) || mainCategories[0] || null
  }, [focusedCategoryId, lockedCategoryId, mainCategories])

  const activeSubCategories = useMemo(() => {
    if (!activeCategory) return []

    return categories.filter(
      (category) => category.parent_id === activeCategory.id && category.slug !== activeCategory.slug
    )
  }, [activeCategory, categories])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      setFocusedCategoryId(null)
      setLockedCategoryId(null)
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!mainCategories.length) return

    setFocusedCategoryId((current) => current || mainCategories[0].id)
  }, [mainCategories])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isOpen) return

      if (lockedCategoryId) {
        setLockedCategoryId(null)
        return
      }

      onClose()
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, lockedCategoryId, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleCategoryActivate = (category: Category) => {
    const hasSeries = categories.some((item) => item.parent_id === category.id && item.slug !== category.slug)

    setFocusedCategoryId(category.id)

    if (hasSeries) {
      setLockedCategoryId(category.id)
      return
    }

    onCategorySelect(category)
  }

  const handleSubCategoryClick = (category: Category) => {
    if (!activeCategory) {
      router.push(`/category/${category.slug}`)
      onClose()
      return
    }

    router.push(`/category/${activeCategory.slug}/${category.slug}`)
    onClose()
  }

  const handleRailHover = (categoryId: string) => {
    if (lockedCategoryId) return
    setFocusedCategoryId(categoryId)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.86),rgba(2,6,23,0.94))] backdrop-blur-xl" onClick={onClose} />

      <div
        className={`absolute left-1/2 top-1/2 flex max-h-[90vh] w-[96vw] max-w-7xl -translate-x-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-[0_40px_120px_-28px_rgba(15,23,42,0.75)] transition-all duration-300 ${isAnimating ? '-translate-y-1/2 scale-100' : '-translate-y-[46%] scale-[0.985]'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(14,165,233,0.14),transparent_24%)]" />

        <div className="relative flex w-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              {lockedCategoryId ? (
                <button
                  type="button"
                  onClick={() => setLockedCategoryId(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t('categoryHub.backToRail')}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary-blue/20 bg-secondary-blue/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                  <Grid3X3 className="h-4 w-4" />
                  <span>{t('categoryHub.navigatorEyebrow')}</span>
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white sm:text-xl">{t('common.categories')}</h2>
                <p className="hidden text-sm text-white/50 md:block">{t('categoryHub.categoryHint')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(340px,1.05fr)_minmax(420px,1fr)]">
            <div className="relative min-h-[340px] overflow-hidden border-b border-white/10 lg:min-h-0 lg:border-b-0 lg:border-r">
              {activeCategory && !isLoading && !loadError && (
                <>
                  <CategorySpotlightScene categorySlug={activeCategory.slug} />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/10 to-slate-950" />
                </>
              )}

              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                {isLoading ? (
                  <div className="space-y-5 animate-pulse">
                    <div className="h-8 w-32 rounded-full bg-white/10" />
                    <div className="h-12 w-3/4 rounded-2xl bg-white/10" />
                    <div className="h-20 w-full rounded-3xl bg-white/5" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-2xl bg-white/5" />
                      <div className="h-20 rounded-2xl bg-white/5" />
                    </div>
                  </div>
                ) : loadError ? (
                  <div className="flex h-full flex-col items-start justify-center gap-4">
                    <div className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">
                      {t('categoryHub.previewLabel')}
                    </div>
                    <h3 className="text-3xl font-semibold text-white">{t('categoryHub.loadFailed')}</h3>
                    <p className="max-w-md text-sm leading-6 text-white/65">{t('categoryHub.hoverHint')}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary-navy transition-colors hover:bg-secondary-blue hover:text-white"
                    >
                      {t('common.retry')}
                    </button>
                  </div>
                ) : activeCategory ? (
                  <>
                    <div className="max-w-xl space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                        <span>{t('categoryHub.previewLabel')}</span>
                      </div>

                      <div className="space-y-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-secondary-blue shadow-[0_18px_38px_-24px_rgba(56,189,248,0.75)]">
                          {getCategoryIcon(activeCategory.slug, { size: 24 })}
                        </div>
                        <div>
                          <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.2rem]">
                            {getCategoryDisplayName(activeCategory)}
                          </h3>
                          <p className="mt-3 max-w-lg text-sm leading-6 text-white/68 sm:text-[15px]">
                            {activeCategory.description || t('categoryHub.emptyDescription')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                          {t('categoryHub.curatedSeries')}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-white">{activeSubCategories.length}</div>
                        <div className="mt-1 text-sm text-white/55">{t('categoryHub.seriesPanelTitle', { category: getCategoryDisplayName(activeCategory) })}</div>
                      </div>
                      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                          {t('categoryHub.quickOpen')}
                        </div>
                        <button
                          type="button"
                          onClick={() => onCategorySelect(activeCategory)}
                          className="mt-2 inline-flex items-center gap-2 text-left text-sm font-semibold text-secondary-blue transition-colors hover:text-air-blue"
                        >
                          <span>{t('categoryHub.viewCategory')}</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 text-sm text-white/60">
                    {t('categoryHub.empty')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      {t('categoryHub.mainCategories')}
                    </div>
                    <div className="mt-1 text-sm text-white/55">{t('categoryHub.hoverHint')}</div>
                  </div>
                  {lockedCategoryId && activeCategory && (
                    <Link
                      href={`/category/${activeCategory.slug}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>{t('common.viewAll')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="h-[84px] animate-pulse rounded-[1.4rem] border border-white/10 bg-white/5" />
                      ))
                    : mainCategories.map((category) => {
                        const isActive = activeCategory?.id === category.id
                        const hasSeries = categories.some(
                          (item) => item.parent_id === category.id && item.slug !== category.slug
                        )

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onMouseEnter={() => handleRailHover(category.id)}
                            onFocus={() => handleRailHover(category.id)}
                            onClick={() => handleCategoryActivate(category)}
                            className={`group rounded-[1.4rem] border px-3 py-3 text-left transition-all duration-300 ${isActive ? 'border-secondary-blue/40 bg-secondary-blue/15 shadow-[0_18px_40px_-28px_rgba(56,189,248,0.8)]' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/15'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${isActive ? 'border-secondary-blue/30 bg-secondary-blue/15 text-secondary-blue' : 'border-white/10 bg-white/5 text-white/65'} transition-colors`}>
                                {getCategoryIcon(category.slug, { size: 20 })}
                              </span>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${isActive ? 'bg-white/10 text-white/80' : 'bg-white/[0.06] text-white/45'}`}>
                                {hasSeries ? t('categoryHub.exploreSeries') : t('categoryHub.quickOpen')}
                              </span>
                            </div>
                            <div className="mt-3 text-sm font-semibold text-white">{getCategoryDisplayName(category)}</div>
                            <div className="mt-1 text-xs text-white/50">
                              {t('categoryHub.seriesCount', {
                                count: categories.filter(
                                  (item) => item.parent_id === category.id && item.slug !== category.slug
                                ).length,
                              })}
                            </div>
                          </button>
                        )
                      })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                {loadError ? (
                  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[1.8rem] border border-rose-400/20 bg-rose-500/10 px-6 text-center">
                    <p className="text-sm text-white/80">{loadError}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-navy transition-colors hover:bg-secondary-blue hover:text-white"
                    >
                      {t('common.retry')}
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-[152px] animate-pulse rounded-[1.6rem] border border-white/10 bg-white/5" />
                    ))}
                  </div>
                ) : activeCategory ? (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {t('categoryHub.seriesPanelTitle', { category: getCategoryDisplayName(activeCategory) })}
                        </h3>
                        <p className="mt-1 text-sm text-white/50">{t('categoryHub.subcategoryHint')}</p>
                      </div>
                    </div>

                    {activeSubCategories.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {activeSubCategories.map((subCategory) => (
                          <button
                            key={subCategory.id}
                            type="button"
                            onClick={() => handleSubCategoryClick(subCategory)}
                            className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue/30 hover:bg-[linear-gradient(180deg,rgba(59,130,246,0.18),rgba(255,255,255,0.06))] hover:shadow-[0_24px_60px_-34px_rgba(59,130,246,0.7)]"
                          >
                            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50" />
                            <div className="flex items-start justify-between gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue transition-colors group-hover:border-secondary-blue/30 group-hover:bg-secondary-blue/10">
                                {getCategoryIcon(subCategory.slug, { size: 20 })}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors group-hover:text-white/70">
                                {t('categoryHub.quickOpen')}
                              </span>
                            </div>

                            <div className="mt-5">
                              <div className="text-base font-semibold text-white transition-colors group-hover:text-air-blue">
                                {getCategoryDisplayName(subCategory)}
                              </div>
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/58">
                                {subCategory.description || t('categoryHub.windowFallback')}
                              </p>
                            </div>

                            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">
                              <span>{t('common.viewDetails')}</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </button>
                        ))}

                        <Link
                          href={`/category/${activeCategory.slug}`}
                          onClick={onClose}
                          className="group flex min-h-[220px] flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-secondary-blue/35 bg-secondary-blue/10 p-6 text-center transition-all duration-300 hover:border-secondary-blue hover:bg-secondary-blue/16 hover:shadow-[0_24px_60px_-34px_rgba(56,189,248,0.75)]"
                        >
                          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary-blue/16 text-secondary-blue transition-colors group-hover:bg-secondary-blue/24 group-hover:text-white">
                            <ChevronRight className="h-7 w-7" />
                          </span>
                          <span className="text-base font-semibold text-secondary-blue transition-colors group-hover:text-white">
                            {t('categoryHub.viewAllInCategory', { category: getCategoryDisplayName(activeCategory) })}
                          </span>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/5 px-6 text-center">
                        <div className="text-lg font-semibold text-white">{t('categoryHub.noSubcategories')}</div>
                        <button
                          type="button"
                          onClick={() => onCategorySelect(activeCategory)}
                          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <span>{t('categoryHub.viewCategory')}</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : hasLoadedOnce ? (
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-[1.8rem] border border-white/10 bg-white/5 text-sm text-white/60">
                    {t('categoryHub.empty')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryHubOverlay

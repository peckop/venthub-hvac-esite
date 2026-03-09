'use client'

import React, { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Compass, ExternalLink, Grid3X3, Library, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

import { useI18n } from '../../i18n/I18nProvider'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { Category } from '../../lib/supabase'
import { trackEvent } from '../../utils/analytics'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import Category3DIcon from '../products/Category3DIcon'
import CategorySpotlightScene from './CategorySpotlightScene'
import NavSceneShell from './NavSceneShell'

interface EliteMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

interface MobileMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

type MenuSection = 'overview' | 'categories' | 'company'

interface MenuDestination {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

function buildChildrenMap(categories: Category[]) {
  return categories.reduce<Record<string, Category[]>>((acc, category) => {
    if (!category.parent_id) return acc
    acc[category.parent_id] = acc[category.parent_id] ? [...acc[category.parent_id], category] : [category]
    return acc
  }, {})
}

function SectionTabs({
  activeSection,
  onChange,
  t,
  compact = false,
}: {
  activeSection: MenuSection
  onChange: (section: MenuSection) => void
  t: (key: string, params?: Record<string, string | number>) => string
  compact?: boolean
}) {
  const tabs: { id: MenuSection; label: string }[] = [
    { id: 'overview', label: t('megamenu.sectionOverview') },
    { id: 'categories', label: t('common.categories') },
    { id: 'company', label: t('megamenu.sectionCompany') },
  ]

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full font-medium transition-all duration-300 ${compact ? 'px-3 py-2 text-[13px]' : 'px-4 py-2 text-sm'} ${activeSection === tab.id ? 'bg-white text-slate-950 shadow-sm' : 'text-white/65 hover:text-white'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function DestinationCard({
  destination,
  cta,
  onClick,
}: {
  destination: MenuDestination
  cta: string
  onClick?: () => void
}) {
  return (
    <Link
      href={destination.href}
      onClick={onClick}
      className="group rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue/30 hover:bg-[linear-gradient(180deg,rgba(59,130,246,0.18),rgba(255,255,255,0.06))] hover:shadow-[0_24px_60px_-34px_rgba(59,130,246,0.7)]"
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue transition-colors group-hover:border-secondary-blue/30 group-hover:bg-secondary-blue/10">
        {destination.icon}
      </div>
      <div className="mt-4 text-base font-semibold text-white">{destination.title}</div>
      <p className="mt-2 text-sm leading-6 text-white/58">{destination.description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">
        <span>{cta}</span>
        <ExternalLink className="h-4 w-4" />
      </div>
    </Link>
  )
}

function MobileMenuRowLink({
  href,
  icon,
  title,
  description,
  onClick,
  emphasis = 'default',
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  emphasis?: 'default' | 'accent'
}) {
  const accentClasses =
    emphasis === 'accent'
      ? 'border-secondary-blue/30 bg-secondary-blue/10'
      : 'border-white/10 bg-white/[0.05] hover:border-secondary-blue/20 hover:bg-white/[0.08]'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-[1.35rem] border px-4 py-3.5 transition-all duration-300 ${accentClasses}`}
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/55">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-secondary-blue" />
    </Link>
  )
}

function MobileQuickChip({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/75 transition-colors duration-300 hover:bg-white/[0.1] hover:text-white"
    >
      {label}
    </button>
  )
}

function MobileMini3DThumb({ categorySlug }: { categorySlug: string }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 text-secondary-blue">
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.25]}
        frameloop={prefersReducedMotion ? 'never' : 'demand'}
        camera={{ position: [0, 0.1, 2.05], fov: 40 }}
      >
        <ambientLight intensity={1.45} />
        <directionalLight position={[3, 3, 4]} intensity={1.8} />
        <Suspense fallback={null}>
          <group rotation={[0, prefersReducedMotion ? 0.25 : 0.45, 0]}>
            <Category3DIcon categorySlug={categorySlug} scale={0.6} offsetContext="centered" />
          </group>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </span>
  )
}

function buildGlobalDestinations(t: (key: string, params?: Record<string, string | number>) => string): MenuDestination[] {
  return [
    {
      id: 'products',
      title: t('common.products'),
      description: t('megamenu.productsDescription'),
      href: '/products',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      id: 'brands',
      title: t('common.brands'),
      description: t('megamenu.brandsDescription'),
      href: '/brands',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: 'knowledgeHub',
      title: t('common.knowledgeHub'),
      description: t('megamenu.knowledgeHubDescription'),
      href: '/destek/merkez',
      icon: <Library className="h-5 w-5" />,
    },
    {
      id: 'support',
      title: t('common.supportCenter'),
      description: t('megamenu.supportDescription'),
      href: '/destek',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ]
}

function buildCompanyDestinations(t: (key: string, params?: Record<string, string | number>) => string): MenuDestination[] {
  return [
    {
      id: 'about',
      title: t('common.about'),
      description: t('megamenu.aboutDescription'),
      href: '/about',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: 'contact',
      title: t('common.contact'),
      description: t('megamenu.contactDescription'),
      href: '/contact',
      icon: <PhoneCall className="h-5 w-5" />,
    },
  ]
}

export const EliteMegaMenu: React.FC<EliteMegaMenuProps> = ({ isOpen, onClose, categories }) => {
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<MenuSection>('overview')
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null)

  const mainCategories = useMemo(() => categories.filter((category) => category.level === 0), [categories])
  const childrenMap = useMemo(() => buildChildrenMap(categories), [categories])
  const globalDestinations = useMemo(() => buildGlobalDestinations(t), [t])
  const companyDestinations = useMemo(() => buildCompanyDestinations(t), [t])

  const featuredCategory = useMemo(() => {
    const targetId = focusedCategoryId || mainCategories[0]?.id
    return mainCategories.find((category) => category.id === targetId) || mainCategories[0] || null
  }, [focusedCategoryId, mainCategories])

  const featuredSeries = useMemo(() => {
    if (!featuredCategory) return []
    return (childrenMap[featuredCategory.id] || []).filter((category) => category.slug !== featuredCategory.slug)
  }, [childrenMap, featuredCategory])

  const handleNavigate = (target: string) => {
    trackEvent('nav_click', { target, source: 'mega_menu_scene' })
    onClose()
  }

  return (
    <NavSceneShell
      isOpen={isOpen}
      onClose={onClose}
      closeLabel={t('common.close')}
      eyebrow={t('megamenu.navigation')}
      title={t('megamenu.globalNavigatorTitle')}
      description={t('megamenu.globalNavigatorDescription')}
      panelClassName="top-4 bottom-4"
      bodyClassName="grid min-h-0 lg:grid-cols-[minmax(360px,0.92fr)_minmax(540px,1.15fr)]"
    >
      <div className="relative min-h-[320px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
        {featuredCategory && (
          <>
            <CategorySpotlightScene categorySlug={featuredCategory.slug} />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/15 to-slate-950" />
          </>
        )}

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary-blue/25 bg-secondary-blue/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
              <Grid3X3 className="h-4 w-4" />
              <span>{t('megamenu.curatedCategories')}</span>
            </div>

            {featuredCategory ? (
              <>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-secondary-blue shadow-[0_18px_38px_-24px_rgba(56,189,248,0.75)]">
                  {getCategoryIcon(featuredCategory.slug, { size: 24 })}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-[2.2rem]">
                    {getCategoryDisplayName(featuredCategory)}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/68 sm:text-[15px]">
                    {featuredCategory.description || t('categoryHub.emptyDescription')}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">
                {t('categoryHub.empty')}
              </div>
            )}
          </div>

          {featuredCategory && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  {t('categoryHub.curatedSeries')}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{featuredSeries.length}</div>
                <div className="mt-1 text-sm text-white/55">{t('categoryHub.seriesPanelTitle', { category: getCategoryDisplayName(featuredCategory) })}</div>
              </div>

              <Link
                href={`/category/${featuredCategory.slug}`}
                onClick={() => handleNavigate(`category:${featuredCategory.slug}`)}
                className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.1]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  {t('categoryHub.quickOpen')}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-secondary-blue">
                  <span>{t('categoryHub.viewCategory')}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col p-5 lg:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <SectionTabs activeSection={activeSection} onChange={setActiveSection} t={t} />

          <div className="hidden items-center gap-2 text-xs text-white/45 xl:flex">
            <span>{t('megamenu.sectionHint')}</span>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="grid gap-3 md:grid-cols-2">
              {globalDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  cta={t('megamenu.exploreSection')}
                  onClick={() => handleNavigate(destination.id)}
                />
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                {t('megamenu.sectionCompany')}
              </div>
              <p className="mt-1 text-sm text-white/55">{t('megamenu.companyPanelDescription')}</p>

              <div className="mt-4 grid gap-3">
                {companyDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    cta={t('megamenu.exploreSection')}
                    onClick={() => handleNavigate(destination.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'categories' && (
          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="mb-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  {t('common.categories')}
                </div>
                <p className="mt-1 text-sm text-white/55">{t('megamenu.pickCategory')}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {mainCategories.map((category) => {
                  const isActive = featuredCategory?.id === category.id
                  const seriesCount = (childrenMap[category.id] || []).filter((item) => item.slug !== category.slug).length

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => setFocusedCategoryId(category.id)}
                      onFocus={() => setFocusedCategoryId(category.id)}
                      onClick={() => setFocusedCategoryId(category.id)}
                      className={`group rounded-[1.35rem] border px-3 py-3 text-left transition-all duration-300 ${isActive ? 'border-secondary-blue/40 bg-secondary-blue/15 shadow-[0_18px_40px_-28px_rgba(56,189,248,0.8)]' : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${isActive ? 'border-secondary-blue/30 bg-secondary-blue/15 text-secondary-blue' : 'border-white/10 bg-white/5 text-white/65'}`}>
                          {getCategoryIcon(category.slug, { size: 20 })}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                          {t('categoryHub.seriesCount', { count: seriesCount })}
                        </span>
                      </div>

                      <div className="mt-3 text-sm font-semibold text-white">{getCategoryDisplayName(category)}</div>
                      <div className="mt-1 text-xs text-white/55">{category.description || t('categoryHub.windowFallback')}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                    {t('megamenu.seriesShowcaseTitle')}
                  </div>
                  <p className="mt-1 text-sm text-white/55">
                    {featuredCategory
                      ? t('categoryHub.seriesPanelTitle', { category: getCategoryDisplayName(featuredCategory) })
                      : t('categoryHub.empty')}
                  </p>
                </div>

                {featuredCategory && (
                  <Link
                    href={`/category/${featuredCategory.slug}`}
                    onClick={() => handleNavigate(`category:${featuredCategory.slug}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>{t('common.viewAll')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {featuredSeries.length > 0 && featuredCategory ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featuredSeries.map((series) => (
                      <Link
                        key={series.id}
                        href={`/category/${featuredCategory.slug}/${series.slug}`}
                        onClick={() => handleNavigate(`series:${series.slug}`)}
                        className="group rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 transition-all duration-300 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue">
                            {getCategoryIcon(series.slug, { size: 18 })}
                          </span>
                          <ChevronRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-secondary-blue" />
                        </div>
                        <div className="mt-4 text-sm font-semibold text-white">{getCategoryDisplayName(series)}</div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">{series.description || t('categoryHub.windowFallback')}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] text-sm text-white/55">
                    {t('categoryHub.noSubcategories')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'company' && (
          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid gap-3">
              {companyDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  cta={t('megamenu.exploreSection')}
                  onClick={() => handleNavigate(destination.id)}
                />
              ))}
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                {t('megamenu.quickAccess')}
              </div>
              <p className="mt-1 text-sm text-white/55">{t('megamenu.companyPanelDescription')}</p>

              <div className="mt-4 grid gap-3">
                {globalDestinations.map((destination) => (
                  <Link
                    key={destination.id}
                    href={destination.href}
                    onClick={() => handleNavigate(destination.id)}
                    className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.05] px-4 py-4 transition-colors duration-300 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-3 text-white">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue">
                        {destination.icon}
                      </span>
                      <span className="text-sm font-semibold">{destination.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/35" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </NavSceneShell>
  )
}

export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({ isOpen, onClose, categories }) => {
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<MenuSection>('categories')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const mainCategories = useMemo(() => categories.filter((category) => category.level === 0), [categories])
  const childrenMap = useMemo(() => buildChildrenMap(categories), [categories])
  const globalDestinations = useMemo(() => buildGlobalDestinations(t), [t])
  const companyDestinations = useMemo(() => buildCompanyDestinations(t), [t])

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return mainCategories.find((category) => category.id === selectedCategoryId) || null
  }, [mainCategories, selectedCategoryId])

  const selectedSeries = useMemo(() => {
    if (!selectedCategory) return []
    return (childrenMap[selectedCategory.id] || []).filter((category) => category.slug !== selectedCategory.slug)
  }, [childrenMap, selectedCategory])

  return (
    <NavSceneShell
      isOpen={isOpen}
      onClose={() => {
        setActiveSection('categories')
        setSelectedCategoryId(null)
        onClose()
      }}
      closeLabel={t('common.close')}
      eyebrow={t('megamenu.navigation')}
      title={selectedCategory ? getCategoryDisplayName(selectedCategory) : t('megamenu.mobileNavigatorTitle')}
      description={selectedCategory ? t('categoryHub.subcategoryHint') : t('megamenu.mobileNavigatorDescription')}
      panelClassName="inset-x-0 bottom-0 top-[9vh] md:inset-x-5 md:top-5 md:bottom-5"
      bodyClassName="flex flex-col"
    >
      {selectedCategory ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-white/10 px-5 py-4">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('categoryHub.backToRail')}</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(255,255,255,0.03))]">
              <div className="relative h-44 border-b border-white/10 bg-slate-950/70">
                <CategorySpotlightScene categorySlug={selectedCategory.slug} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/5 to-slate-950/50" />
              </div>

              <div className="p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-secondary-blue">
                  {getCategoryIcon(selectedCategory.slug, { size: 20 })}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{getCategoryDisplayName(selectedCategory)}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{selectedCategory.description || t('categoryHub.emptyDescription')}</p>
              </div>
            </div>

            {selectedSeries.length > 0 ? (
              <div className="space-y-3">
                {selectedSeries.map((series) => (
                  <MobileMenuRowLink
                    key={series.id}
                    href={`/category/${selectedCategory.slug}/${series.slug}`}
                    icon={getCategoryIcon(series.slug, { size: 18 })}
                    title={getCategoryDisplayName(series)}
                    description={series.description || t('categoryHub.windowFallback')}
                    onClick={onClose}
                  />
                ))}

                <Link
                  href={`/category/${selectedCategory.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-[1.35rem] border border-dashed border-secondary-blue/35 bg-secondary-blue/10 px-4 py-3.5 text-sm font-semibold text-secondary-blue transition-colors hover:bg-secondary-blue/16 hover:text-white"
                >
                  <span>{t('categoryHub.viewAllInCategory', { category: getCategoryDisplayName(selectedCategory) })}</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.05] p-5 text-center text-sm text-white/60">
                {t('categoryHub.noSubcategories')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
          <div className="mb-4 space-y-3">
            <div className="overflow-x-auto pb-1">
              <SectionTabs activeSection={activeSection} onChange={setActiveSection} t={t} compact />
            </div>

            <div className="flex flex-wrap gap-2">
              <MobileQuickChip label={t('common.products')} onClick={() => setActiveSection('overview')} />
              <MobileQuickChip label={t('common.categories')} onClick={() => setActiveSection('categories')} />
              <MobileQuickChip label={t('common.contact')} onClick={() => setActiveSection('company')} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {activeSection === 'overview' && (
              <div className="space-y-3">
                <div className="px-1 pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  {t('megamenu.mobileExploreLead')}
                </div>
                {globalDestinations.map((destination) => (
                  <MobileMenuRowLink
                    key={destination.id}
                    href={destination.href}
                    icon={destination.icon}
                    title={destination.title}
                    description={destination.description}
                    onClick={onClose}
                  />
                ))}
              </div>
            )}

            {activeSection === 'categories' && (
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(255,255,255,0.03))] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                    {t('common.categories')}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">{t('megamenu.mobileCategoryLead')}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection('overview')}
                  className="flex w-full items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition-colors duration-300 hover:bg-white/[0.08]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{t('megamenu.needDifferentRoute')}</span>
                    <span className="mt-1 block text-xs text-white/50">{t('megamenu.needDifferentRouteHint')}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/35" />
                </button>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      {t('common.categories')}
                    </div>
                    <p className="mt-1 text-sm text-white/55">{t('megamenu.mobileCategoryPrompt')}</p>
                  </div>

                  <div className="space-y-3">
                    {mainCategories.map((category) => {
                      const seriesCount = (childrenMap[category.id] || []).filter((item) => item.slug !== category.slug).length

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(category.id)}
                          className="group flex w-full items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-3.5 text-left transition-all duration-300 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
                        >
                          <MobileMini3DThumb categorySlug={category.slug} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">{getCategoryDisplayName(category)}</span>
                            <span className="mt-1 block text-xs text-white/50">{t('categoryHub.seriesCount', { count: seriesCount })}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-secondary-blue" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'company' && (
              <div className="space-y-3">
                <div className="px-1 pb-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  {t('megamenu.mobileCompanyLead')}
                </div>
                {companyDestinations.map((destination) => (
                  <MobileMenuRowLink
                    key={destination.id}
                    href={destination.href}
                    icon={destination.icon}
                    title={destination.title}
                    description={destination.description}
                    onClick={onClose}
                  />
                ))}

                <MobileMenuRowLink
                  href="/destek"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title={t('common.supportCenter')}
                  description={t('megamenu.supportDescription')}
                  onClick={onClose}
                  emphasis="accent"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </NavSceneShell>
  )
}

export default EliteMegaMenu

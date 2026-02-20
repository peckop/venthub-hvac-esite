import React, { useState, Suspense, useEffect } from 'react'

import Link from 'next/link'
import { getCategories, Category } from '../lib/supabase'
const HeroCarousel = React.lazy(() => import('../components/HeroCarousel').then(module => ({ default: module.HeroCarousel })))

import HeroSkeleton from '../components/HeroSkeleton'
import { useI18n } from '../i18n/I18nProvider'
import { getActiveApplicationCards } from '../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../utils/applicationUi'
const TiltCard = React.lazy(() => import('../components/TiltCard'))
import { trackEvent } from '../utils/analytics'
const LeadModal = React.lazy(() => import('../components/LeadModal'))
import Seo from '../components/Seo'

const hero1200 = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

// Optimize edilmiş bağımsız bileşenler
import BentoGrid from '../components/BentoGrid'
import BrandsShowcase from '../components/BrandsShowcase'
// New optimized components
const SmartRouting = React.lazy(() => import('../components/SmartRouting'))
const WhyVentHubEnhanced = React.lazy(() => import('../components/WhyVentHubEnhanced'))

export const HomePage: React.FC = () => {
  const [leadOpen, setLeadOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { t } = useI18n()

  useEffect(() => {
    // Fetch categories for Hero Carousel
    getCategories().then(setCategories).catch(console.error)
  }, [])

  // Preload LCP hero image only on homepage and only on desktop (lg+) where it's visible
  useEffect(() => {
    try {
      const desktop = window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
      if (!desktop) return
      const link = document.createElement('link')
      link.setAttribute('rel', 'preload')
      link.setAttribute('as', 'image')
      link.setAttribute('href', hero1200)
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
      return () => { document.head.removeChild(link) }
    } catch { }
  }, [])




  // Global lead modal trigger for HeroSection button
  if (typeof window !== 'undefined') {
    ; ((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)
  }

  return (
    <div className="min-h-screen">
      <Seo
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/`}
      />
      {/* Hero Section - Carousel or Static Fallback */}
      <Suspense fallback={<HeroSkeleton />}>
        {categories.length > 0 ? (
          <HeroCarousel categories={categories} />
        ) : (
          <HeroSkeleton />
        )}
      </Suspense>

      {/* JSON-LD: Organization & WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'VentHub',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'VentHub',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/`,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/products?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Bento Grid (hover video önizleme) */}
      <div id="categories" className="cv-600 scroll-mt-20">
        <Suspense fallback={<div className="min-h-[200px]" aria-hidden="true" />}>
          <BentoGrid />
        </Suspense>
      </div>

      {/* Premium HVAC Markaları (BentoGrid sonrası) */}
      <div className="cv-320">
        <Suspense fallback={<div className="min-h-[120px]" aria-hidden="true" />}>
          <BrandsShowcase />
        </Suspense>
      </div>


      {/* Uygulamaya Göre Çözümler */}
      <section id="applications" className="py-16 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="applications-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="applications-heading" className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('common.byApplication')}</h2>
            <a href="/products#applications" className="text-primary-navy hover:underline text-sm font-medium">{t('common.viewAll')} →</a>
          </div>
          {(() => {
            const appCards = getActiveApplicationCards()
            return (
              <div className={`${gridColsClass(appCards.length)}`}>
                {appCards.map(card => (
                  <Suspense key={card.key} fallback={<div className="rounded-xl border border-light-gray bg-white h-32 animate-pulse" />}>
                    <TiltCard>
                      <Link
                        href={card.href}
                        className="group relative overflow-hidden rounded-xl border border-light-gray bg-white hover:shadow-md transition transform hover:-translate-y-0.5 ring-1 ring-black/5"
                        onClick={() => {
                          trackEvent('application_click', { key: card.key, source: 'home' })
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${accentOverlayClass(card.accent)} to-transparent`}></div>
                        <div className="p-5 relative z-10">
                          <div className="flex items-center gap-2 text-primary-navy">
                            {iconFor(card.icon, 18)}
                            <span className="text-sm font-semibold">{t(`applications.${card.key}.title`)}</span>
                          </div>
                          <p className="mt-1 text-sm text-steel-gray">{t(`applications.${card.key}.subtitle`)}</p>
                          <div className="mt-4 text-sm font-medium text-primary-navy">{t('common.discover')} →</div>
                        </div>
                      </Link>
                    </TiltCard>
                  </Suspense>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Smart Routing - Niyet Bazlı Yönlendirme */}
      <Suspense fallback={<div className="min-h-[200px]" aria-hidden="true" />}>
        <SmartRouting />
      </Suspense>

      {/* Neden VentHub Enhanced (Trust Signals dahil) */}
      <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
        <WhyVentHubEnhanced />
      </Suspense>

      {/* Alt CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-industrial-gray">{t('home.bottomCtaTitle')}</h3>
              <p className="text-steel-gray mt-1">{t('home.bottomCtaSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <a href="/products" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                {t('common.exploreProducts')}
              </a>
              <button
                onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
                className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
              >
                {t('common.getQuote')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default HomePage

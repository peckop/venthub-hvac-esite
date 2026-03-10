import React, { useState, Suspense, useEffect } from 'react'

import { useI18n } from '../src/i18n/I18nProvider'
import Seo from '../src/components/Seo'

const LeadModal = React.lazy(() => import('../src/components/LeadModal'))

const hero1200 = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

// Elite Homepage Architecture Components
const EliteHero = React.lazy(() => import('./home-components/EliteHero').then(m => ({ default: m.EliteHero })))
const QuickEntryRail = React.lazy(() => import('./home-components/QuickEntryRail').then(m => ({ default: m.QuickEntryRail })))
const GuidedCategoryDiscovery = React.lazy(() => import('./home-components/GuidedCategoryDiscovery').then(m => ({ default: m.GuidedCategoryDiscovery })))
const ApplicationSolutions = React.lazy(() => import('./home-components/ApplicationSolutions').then(m => ({ default: m.ApplicationSolutions })))
const FeaturedCommercialBlocks = React.lazy(() => import('./home-components/FeaturedCommercialBlocks').then(m => ({ default: m.FeaturedCommercialBlocks })))
const TrustProofSection = React.lazy(() => import('./home-components/TrustProofSection').then(m => ({ default: m.TrustProofSection })))
const StrategicBrands = React.lazy(() => import('./home-components/StrategicBrands').then(m => ({ default: m.StrategicBrands })))
const KnowledgeBlock = React.lazy(() => import('./home-components/KnowledgeBlock').then(m => ({ default: m.KnowledgeBlock })))
const FinalCTA = React.lazy(() => import('./home-components/FinalCTA').then(m => ({ default: m.FinalCTA })))

export const HomePage: React.FC = () => {
  const [leadOpen, setLeadOpen] = useState(false)
  const { t } = useI18n()

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

      {/* --- WAVE 1: Elite Hero & Quick Entry Rail --- */}
      <Suspense fallback={<div className="min-h-[500px]" aria-hidden="true" />}>
        <EliteHero />
      </Suspense>

      <Suspense fallback={<div className="min-h-[100px]" aria-hidden="true" />}>
        <QuickEntryRail />
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

      {/* --- WAVE 2: Guided Category Discovery & Application Solutions --- */}
      <Suspense fallback={<div className="min-h-[400px]" aria-hidden="true" />}>
        <GuidedCategoryDiscovery />
      </Suspense>

      <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
        <ApplicationSolutions />
      </Suspense>

      {/* --- WAVE 3: Commerce, Trust & Strategic Brands --- */}
      <Suspense fallback={<div className="min-h-[400px]" aria-hidden="true" />}>
        <FeaturedCommercialBlocks />
      </Suspense>

      <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
        <TrustProofSection />
      </Suspense>

      <Suspense fallback={<div className="min-h-[250px]" aria-hidden="true" />}>
        <StrategicBrands />
      </Suspense>

      {/* --- WAVE 4: Knowledge Block & Final CTA --- */}
      <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
        <KnowledgeBlock />
      </Suspense>

      <Suspense fallback={<div className="min-h-[400px]" aria-hidden="true" />}>
        <FinalCTA />
      </Suspense>

      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default HomePage




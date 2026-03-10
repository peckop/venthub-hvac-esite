import React, { Suspense, useEffect, useState } from 'react'

import Seo from '../components/Seo'
import EliteHero from '../components/home/EliteHero'
import QuickEntryRail from '../components/home/QuickEntryRail'
import GuidedCategoryDiscovery from '../components/home/GuidedCategoryDiscovery'
import ApplicationSolutions from '../components/home/ApplicationSolutions'
import FeaturedCommercialBlocks from '../components/home/FeaturedCommercialBlocks'
import TrustProofSection from '../components/home/TrustProofSection'
import StrategicBrands from '../components/home/StrategicBrands'
import KnowledgeBlock from '../components/home/KnowledgeBlock'
import FinalCTA from '../components/home/FinalCTA'
import { useI18n } from '../i18n/I18nProvider'

const LeadModal = React.lazy(() => import('../components/LeadModal'))

const hero1200 = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'

export const HomePage: React.FC = () => {
  const [leadOpen, setLeadOpen] = useState(false)
  const { t } = useI18n()

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

      return () => {
        document.head.removeChild(link)
      }
    } catch {
      return undefined
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const target = window as unknown as { openLeadModal?: () => void }
    target.openLeadModal = () => setLeadOpen(true)

    return () => {
      delete target.openLeadModal
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/`}
      />

      <EliteHero onQuoteClick={() => setLeadOpen(true)} />
      <QuickEntryRail onQuoteClick={() => setLeadOpen(true)} />

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

      <GuidedCategoryDiscovery />
      <ApplicationSolutions />
      <FeaturedCommercialBlocks />
      <TrustProofSection />
      <StrategicBrands />
      <KnowledgeBlock />
      <FinalCTA onQuoteClick={() => setLeadOpen(true)} />

      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default HomePage

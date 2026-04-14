import React from 'react'

import HomeSinevizyon from '../components/home/HomeSinevizyon'
import CinematicProductShowcase from '../components/home/CinematicProductShowcase'
import GuidedCategoryDiscovery from '../components/home/GuidedCategoryDiscovery'
import ApplicationSolutions from '../components/home/ApplicationSolutions'
import TrustProofSection from '../components/home/TrustProofSection'
import FeaturedCommercialBlocks from '../components/home/FeaturedCommercialBlocks'
import StrategicBrands from '../components/home/StrategicBrands'
import KnowledgeBlock from '../components/home/KnowledgeBlock'
import RevealSection from '../components/home/RevealSection'
import HomePageClientWrapper from '../components/home/HomePageClientWrapper'
import { ScrollObserver } from '../components/ui/ScrollObserver'
import { Product } from '../lib/supabase'
import { DomainCategory } from '../lib/type-converters'
import { CategoryViewModelLite } from '../components/home/GuidedCategoryDiscovery'

interface HomePageProps {
  initialCategories?: CategoryViewModelLite[]
  rawCategories?: DomainCategory[]
  initialProducts?: Product[]
  dictionary: typeof import('../i18n/dictionaries/tr').tr.home
}

const HomePage: React.FC<HomePageProps> = ({ 
  initialCategories = [], 
  rawCategories = [],
  initialProducts = [],
  dictionary
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      <ScrollObserver />
      <HomePageClientWrapper>
        <HomeSinevizyon />

        {/* Cinematic Spacing and Transition: Dark to Light */}
        <div className="relative h-32 lg:h-64 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-white h-32 lg:h-64 opacity-100" />
        </div>

        <div className="-mt-16 relative z-10">
          <GuidedCategoryDiscovery displayCategories={initialCategories} />
        </div>

        <div className="space-y-32 lg:space-y-48 pb-32">
          <RevealSection>
            <CinematicProductShowcase />
          </RevealSection>

          <ApplicationSolutions dictionary={dictionary.applicationSolutions} />

          <TrustProofSection dictionary={dictionary.trustProof} trustStripDict={dictionary.hero.trustStrip} />

          <RevealSection>
            <FeaturedCommercialBlocks initialProducts={initialProducts} initialCategories={rawCategories} />
          </RevealSection>

          <StrategicBrands dictionary={dictionary.strategicBrands} />

          <KnowledgeBlock 
            dictionary={dictionary.knowledge} 
            finalCtaDict={dictionary.finalCta}
            statsExperience={dictionary.stats?.yearsExperience || ''}
          />
        </div>
      </HomePageClientWrapper>
    </div>
  )
}

export default HomePage

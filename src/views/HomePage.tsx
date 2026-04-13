import React from 'react'

import dynamic from 'next/dynamic'
const HomeSinevizyon = dynamic(() => import('../components/home/HomeSinevizyon'), { loading: () => <div className="w-full h-[80vh] lg:h-[90vh] min-h-[650px] bg-slate-950 animate-pulse" /> })
const CinematicProductShowcase = dynamic(() => import('../components/home/CinematicProductShowcase'), { loading: () => <div className="w-full h-[600px] bg-white animate-pulse" /> })
const GuidedCategoryDiscovery = dynamic(() => import('../components/home/GuidedCategoryDiscovery'), { loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const ApplicationSolutions = dynamic(() => import('../components/home/ApplicationSolutions'), { loading: () => <div className="w-full h-[500px] bg-white animate-pulse" /> })
const TrustProofSection = dynamic(() => import('../components/home/TrustProofSection'), { loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const FeaturedCommercialBlocks = dynamic(() => import('../components/home/FeaturedCommercialBlocks'), { loading: () => <div className="w-full h-[600px] bg-white animate-pulse" /> })
const StrategicBrands = dynamic(() => import('../components/home/StrategicBrands'), { loading: () => <div className="w-full h-[300px] bg-white animate-pulse" /> })
const KnowledgeBlock = dynamic(() => import('../components/home/KnowledgeBlock'), { loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const RevealSection = dynamic(() => import('../components/home/RevealSection'))
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

export const HomePage: React.FC<HomePageProps> = ({ 
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

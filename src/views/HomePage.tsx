import React from 'react'

import dynamic from 'next/dynamic'
const HomeSinevizyon = dynamic(() => import('../components/home/HomeSinevizyon'), { ssr: false, loading: () => <div className="w-full h-[80vh] lg:h-[90vh] min-h-[650px] bg-slate-950 animate-pulse" /> })
const CinematicProductShowcase = dynamic(() => import('../components/home/CinematicProductShowcase'), { ssr: false, loading: () => <div className="w-full h-[600px] bg-white animate-pulse" /> })
const GuidedCategoryDiscovery = dynamic(() => import('../components/home/GuidedCategoryDiscovery'), { ssr: false, loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const ApplicationSolutions = dynamic(() => import('../components/home/ApplicationSolutions'), { ssr: false, loading: () => <div className="w-full h-[500px] bg-white animate-pulse" /> })
const TrustProofSection = dynamic(() => import('../components/home/TrustProofSection'), { ssr: false, loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const FeaturedCommercialBlocks = dynamic(() => import('../components/home/FeaturedCommercialBlocks'), { ssr: false, loading: () => <div className="w-full h-[600px] bg-white animate-pulse" /> })
const StrategicBrands = dynamic(() => import('../components/home/StrategicBrands'), { ssr: false, loading: () => <div className="w-full h-[300px] bg-white animate-pulse" /> })
const KnowledgeBlock = dynamic(() => import('../components/home/KnowledgeBlock'), { ssr: false, loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const FinalCTA = dynamic(() => import('../components/home/FinalCTA'), { ssr: false, loading: () => <div className="w-full h-[400px] bg-white animate-pulse" /> })
const RevealSection = dynamic(() => import('../components/home/RevealSection'), { ssr: false })
import HomePageClientWrapper from '../components/home/HomePageClientWrapper'
import { Category, Product } from '../lib/supabase'

interface HomePageProps {
  initialCategories?: Category[]
  initialProducts?: Product[]
}

export const HomePage: React.FC<HomePageProps> = ({ initialCategories = [], initialProducts = [] }) => {
  return (
    <div className="min-h-screen bg-white selection:bg-cyan-100 selection:text-cyan-900">
      <HomePageClientWrapper>
        {(onQuoteClick) => (
          <>
            <HomeSinevizyon onQuoteClick={onQuoteClick} />

            {/* Cinematic Spacing and Transition: Dark to Light */}
            <div className="relative h-32 lg:h-64 bg-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-white h-32 lg:h-64 opacity-100" />
            </div>

            <RevealSection>
              <div className="-mt-16 relative z-10">
                <GuidedCategoryDiscovery categories={initialCategories} />
              </div>
            </RevealSection>

            <div className="space-y-32 lg:space-y-48 pb-32">
              <RevealSection>
                <CinematicProductShowcase />
              </RevealSection>

              <RevealSection>
                <ApplicationSolutions />
              </RevealSection>

              <RevealSection>
                <TrustProofSection />
              </RevealSection>

              <RevealSection>
                <FeaturedCommercialBlocks initialProducts={initialProducts} initialCategories={initialCategories} />
              </RevealSection>

              <RevealSection>
                <StrategicBrands />
              </RevealSection>

              <RevealSection>
                <KnowledgeBlock />
              </RevealSection>

              <RevealSection>
                <FinalCTA onQuoteClick={onQuoteClick} />
              </RevealSection>
            </div>
          </>
        )}
      </HomePageClientWrapper>
    </div>
  )
}

export default HomePage

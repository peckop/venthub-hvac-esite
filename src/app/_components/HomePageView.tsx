import React from 'react'

import dynamic from 'next/dynamic'
import { Skeleton } from '../../components/ui/Skeleton'

const HomeSinevizyon = dynamic(() => import('../../components/home/HomeSinevizyon'), { ssr: false, loading: () => <Skeleton variant="dark" className="w-full h-[80vh] lg:h-[90vh] min-h-[650px] rounded-none" /> })
const CinematicProductShowcase = dynamic(() => import('../../components/home/CinematicProductShowcase'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[600px] rounded-none" /> })
const GuidedCategoryDiscovery = dynamic(() => import('../../components/home/GuidedCategoryDiscovery'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[400px] rounded-none" /> })
const ApplicationSolutions = dynamic(() => import('../../components/home/ApplicationSolutions'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[500px] rounded-none" /> })
const TrustProofSection = dynamic(() => import('../../components/home/TrustProofSection'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[400px] rounded-none" /> })
const FeaturedCommercialBlocks = dynamic(() => import('../../components/home/FeaturedCommercialBlocks'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[600px] rounded-none" /> })
const StrategicBrands = dynamic(() => import('../../components/home/StrategicBrands'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[300px] rounded-none" /> })
const KnowledgeBlock = dynamic(() => import('../../components/home/KnowledgeBlock'), { ssr: false, loading: () => <Skeleton variant="light" className="w-full h-[400px] rounded-none" /> })
const RevealSection = dynamic(() => import('../../components/home/RevealSection'), { ssr: false })
import HomePageClientWrapper from '../../components/home/HomePageClientWrapper'
import { Product } from '../../lib/supabase'
import { DomainCategory } from '../../lib/type-converters'

interface HomePageProps {
  initialCategories?: DomainCategory[]
  initialProducts?: Product[]
}


export const HomePage: React.FC<HomePageProps> = ({ initialCategories = [], initialProducts = [] }) => {
  // SSR to Client Prop aktarım kuralı gereği, 'onQuoteClick' gibi event handlerlar Server Component'ten geçilemez.
  // Bu nedenle butona basılınca tetiklenecek fonksiyonlar artık doğrudan Client wrapper içerisinden çağrılıyor olacak veya 'window' bazlı çağrılacak.

  return (
    <div className="min-h-screen bg-white selection:bg-cyan-100 selection:text-cyan-900">
      <HomePageClientWrapper>
        <HomeSinevizyon />

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
        </div>
      </HomePageClientWrapper>
    </div>
  )
}

export default HomePage

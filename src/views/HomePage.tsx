import React from 'react'

import type { Product } from '@/types/ui-models'

import ApplicationSolutions from '../components/home/ApplicationSolutions'
import CinematicProductShowcase from '../components/home/CinematicProductShowcase'
import FeaturedCommercialBlocks from '../components/home/FeaturedCommercialBlocks'
import GuidedCategoryDiscovery from '../components/home/GuidedCategoryDiscovery'
import { CategoryViewModelLite } from '../components/home/GuidedCategoryDiscovery'
import HomePageClientWrapper from '../components/home/HomePageClientWrapper'
import HomeSinevizyon from '../components/home/HomeSinevizyon'
import KnowledgeBlock from '../components/home/KnowledgeBlock'
import RevealSection from '../components/home/RevealSection'
import StrategicBrands from '../components/home/StrategicBrands'
import TrustProofSection from '../components/home/TrustProofSection'
import { ScrollObserver } from '../components/ui/ScrollObserver'
import { DomainCategory } from '../lib/type-converters'

interface HomePageProps {
  initialCategories?: CategoryViewModelLite[]
  rawCategories?: DomainCategory[]
  initialProducts?: Product[]
  /**
   * URN-98: ürün vitrini bloğunun çizim kapısı (satış kipi açık VE seçili ürün var, karar sayfa
   * sunucusunda). Varsayılan KAPALI: yeni bir çağıran kapıyı unutursa blok çıkmaz, çıkmaması güvenli yöndür.
   */
  urunVitrini?: boolean
  dictionary: typeof import('../i18n/dictionaries/tr').tr.home
  lang: string
}

const HomePage: React.FC<HomePageProps> = ({
  initialCategories = [],
  rawCategories = [],
  initialProducts = [],
  urunVitrini = false,
  dictionary,
  lang
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

          <ApplicationSolutions dictionary={dictionary.applicationSolutions} lang={lang} categories={rawCategories} />

          <TrustProofSection dictionary={dictionary.trustProof} trustStripDict={dictionary.hero.trustStrip} />

          {/* URN-98: kapalıyken sarmalayıcı da çizilmez; `space-y` yalnız var olan kardeşler arasına
              aralık koyar, yani boşluk ya da çift aralık kalmaz. */}
          {urunVitrini && (
            <RevealSection>
              <FeaturedCommercialBlocks initialProducts={initialProducts} initialCategories={rawCategories} />
            </RevealSection>
          )}

          <StrategicBrands dictionary={dictionary.strategicBrands} />

          <KnowledgeBlock
            dictionary={dictionary.knowledge}
            finalCtaDict={dictionary.finalCta}
            lang={lang}
          />
        </div>
      </HomePageClientWrapper>
    </div>
  )
}

export default HomePage

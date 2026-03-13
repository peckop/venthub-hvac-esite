"use client";

import React, { Suspense, useEffect, useState } from 'react'

import HomeSinevizyon from '../components/home/HomeSinevizyon'
import CinematicProductShowcase from '../components/home/CinematicProductShowcase'
import GuidedCategoryDiscovery from '../components/home/GuidedCategoryDiscovery'
import ApplicationSolutions from '../components/home/ApplicationSolutions'
import TrustProofSection from '../components/home/TrustProofSection'
import FeaturedCommercialBlocks from '../components/home/FeaturedCommercialBlocks'
import StrategicBrands from '../components/home/StrategicBrands'
import KnowledgeBlock from '../components/home/KnowledgeBlock'
import FinalCTA from '../components/home/FinalCTA'
import { motion } from 'framer-motion'
import { Category, Product } from '../lib/supabase'

const LeadModal = React.lazy(() => import('../components/LeadModal'))

const RevealSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.div>
)

interface HomePageProps {
  initialCategories?: Category[]
  initialProducts?: Product[]
}

export const HomePage: React.FC<HomePageProps> = ({ initialCategories = [], initialProducts = [] }) => {
  const [leadOpen, setLeadOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const target = window as unknown as { openLeadModal?: () => void }
    target.openLeadModal = () => setLeadOpen(true)
    return () => { delete target.openLeadModal }
  }, [])

  return (
    <div className="min-h-screen bg-white selection:bg-cyan-100 selection:text-cyan-900">
      <HomeSinevizyon onQuoteClick={() => setLeadOpen(true)} />

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
          <FinalCTA onQuoteClick={() => setLeadOpen(true)} />
        </RevealSection>
      </div>

      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default HomePage

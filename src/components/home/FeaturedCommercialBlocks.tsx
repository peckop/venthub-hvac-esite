'use client'

import { Routes } from '@/utils/routes';
import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import ProductCard from '../ProductCard'
import { useI18n } from '../../i18n/I18nProvider'
import { type Category, type Product } from '../../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

type CommercialTab = 'featured' | 'newArrivals' | 'bestSellers'

const tabOrder: CommercialTab[] = ['featured', 'newArrivals', 'bestSellers']

interface FeaturedCommercialBlocksProps {
  initialProducts?: Product[]
  initialCategories?: Category[]
}

const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url || url.trim().length === 0) return '/images/vortice_lineo_futuristic.png';
  const trimmedUrl = url.trim();
  if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('/')) return trimmedUrl;
  return `/${trimmedUrl}`;
};

const FeaturedCommercialBlocks: React.FC<FeaturedCommercialBlocksProps> = ({
  initialProducts = []
}) => {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<CommercialTab>('featured')

  const productsByTab = useMemo(() => {
    // Featured: specific flag or fallback to first 4
    let featured = initialProducts.filter((p) => p.is_featured).slice(0, 4)
    if (featured.length === 0) featured = initialProducts.slice(0, 4)

    // New Arrivals: sort by creation date
    const newArrivals = [...initialProducts]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 4)

    // Best Sellers: fallback to another slice of the list
    let bestSellers = initialProducts.slice(4, 8)
    if (bestSellers.length === 0) bestSellers = initialProducts.slice(0, 4)

    return { featured, newArrivals, bestSellers }
  }, [initialProducts])

  const activeProducts = productsByTab[activeTab]

  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
            >
              {t('home.featuredCommercial.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t('home.featuredCommercial.title')}
            </motion.h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="max-w-md text-lg text-slate-500 font-light leading-relaxed"
            >
              {t('home.featuredCommercial.subtitle')}
            </motion.p>

            <div className="flex p-1 bg-slate-200/50 backdrop-blur-sm rounded-xl border border-slate-200 gap-1" role="tablist">
              {tabOrder.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-label={t(`home.featuredCommercial.tabs.${tab}`)}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 rounded-lg ${
                    activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="v3TabGlow"
                      className="absolute inset-0 bg-slate-900 rounded-lg shadow-lg shadow-slate-900/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{t(`home.featuredCommercial.tabs.${tab}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Showcase Grid + Sidebar */}
        <div className="grid gap-10 lg:grid-cols-[1fr,320px]">
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              >
                {activeProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ProductCard product={product} compact />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Contextual Focus Sidebar */}
          <aside className="relative">
            <motion.div 
              layout
              className="sticky top-32 p-10 rounded-[2.5rem] bg-slate-950 text-white overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {t('home.featuredCommercial.panelEyebrow')}
                </div>

                <div className="aspect-square relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-8 p-8">
                  <Image
                    src={normalizeImageUrl(activeProducts[0]?.image_url)}
                    alt={activeProducts[0]?.name || "Product Focus"}
                    fill
                    sizes="300px"
                    className="object-contain opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 p-8"
                  />
                  <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-pulse" />
                </div>

                <h3 className="text-xl font-bold mb-4 tracking-tight">{t(`home.featuredCommercial.panelTitles.${activeTab}`)}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-8 font-light italic">
                  {t(`home.featuredCommercial.panelDescriptions.${activeTab}`)}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                    <div className="text-[8px] text-slate-500 uppercase mb-1 font-bold">Grade</div>
                    <div className="text-xl font-black text-cyan-400">A++</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                    <div className="text-[8px] text-slate-500 uppercase mb-1 font-bold">Standard</div>
                    <div className="text-xl font-black text-white">ERP</div>
                  </div>
                </div>

                <Link 
                  href={Routes.products()}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                  {t('home.featuredCommercial.cta')}
                </Link>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCommercialBlocks

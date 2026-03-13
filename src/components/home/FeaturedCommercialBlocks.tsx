'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from '../ProductCard'
import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, getProducts, type Category, type Product } from '../../lib/supabase'

type CommercialTab = 'featured' | 'airCurtains' | 'heatRecovery'

const tabOrder: CommercialTab[] = ['featured', 'airCurtains', 'heatRecovery']

export const FeaturedCommercialBlocks: React.FC = () => {
  const { t } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<CommercialTab>('featured')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [productData, categoryData] = await Promise.all([getProducts(12), getCategories()])
        if (!active) return
        setProducts(productData)
        setCategories(categoryData)
      } catch (error) {
        console.error('Failed to load featured commerce data:', error)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const categoryIds = useMemo(
    () => ({
      airCurtains: categories.find((c) => c.slug === 'hava-perdeleri')?.id || null,
      heatRecovery: categories.find((c) => c.slug === 'isi-geri-kazanim-cihazlari')?.id || null,
    }),
    [categories]
  )

  const productsByTab = useMemo(() => {
    const featured = products.filter((p) => p.is_featured).slice(0, 4)
    const airCurtains = categoryIds.airCurtains
      ? products.filter((p) => p.category_id === categoryIds.airCurtains || p.subcategory_id === categoryIds.airCurtains).slice(0, 4)
      : []
    const heatRecovery = categoryIds.heatRecovery
      ? products.filter((p) => p.category_id === categoryIds.heatRecovery || p.subcategory_id === categoryIds.heatRecovery).slice(0, 4)
      : []

    return {
      featured: featured.length > 0 ? featured : products.slice(0, 4),
      airCurtains: airCurtains.length > 0 ? airCurtains : products.slice(0, 4),
      heatRecovery: heatRecovery.length > 0 ? heatRecovery : products.slice(0, 4),
    }
  }, [categoryIds.airCurtains, categoryIds.heatRecovery, products])

  const activeProducts = productsByTab[activeTab] || []

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-primary-navy"
          >
            <span className="h-px w-8 bg-primary-navy/40" />
            {t('home.featuredCommercial.eyebrow')}
          </motion.div>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {t('home.featuredCommercial.title')}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            {t('home.featuredCommercial.subtitle')}
          </p>
        </div>

        {/* Modern Animated Tabs */}
        <div className="mt-12 flex justify-center lg:justify-start">
          <div className="inline-flex rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200">
            {tabOrder.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-primary-navy'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 z-0 rounded-xl bg-primary-navy shadow-lg shadow-primary-navy/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t(`home.featuredCommercial.tabs.${tab}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr,360px]">
          {/* Product Grid Area */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
              >
                {activeProducts.map((product, index) => (
                  <motion.div
                    key={`${activeTab}-${product.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} highlightFeatured />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Technical Info Panel (HUD Style) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 lg:sticky lg:top-24"
          >
            {/* HUD Scan Effect */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary-navy/20 to-transparent animate-pulse" />
            
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <img
                src="/images/industrial_fan_vortice_style_premium_2.png"
                alt="Technical Detail"
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
              
              {/* Technical Target Marks */}
              <div className="absolute top-4 left-4 h-4 w-4 border-l-2 border-t-2 border-primary-navy/30" />
              <div className="absolute bottom-4 right-4 h-4 w-4 border-r-2 border-b-2 border-primary-navy/30" />
            </div>

            <div className="mt-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                {t('home.featuredCommercial.panelEyebrow')}
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                {t(`home.featuredCommercial.panelTitles.${activeTab}`)}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                {t(`home.featuredCommercial.panelDescriptions.${activeTab}`)}
              </p>

              <div className="mt-8 space-y-3">
                {activeProducts.slice(0, 3).map((product) => (
                  <div key={`summary-${product.id}`} className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-white p-1">
                      <img src={product.image_url || ''} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary-navy/60">{product.brand}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a 
                href="/products" 
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-primary-navy hover:shadow-xl hover:shadow-primary-navy/20"
              >
                {t('home.featuredCommercial.cta')}
                <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCommercialBlocks

'use client'

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

    return () => {
      active = false
    }
  }, [])

  const categoryIds = useMemo(
    () => ({
      airCurtains: categories.find((category) => category.slug === 'hava-perdeleri')?.id || null,
      heatRecovery: categories.find((category) => category.slug === 'isi-geri-kazanim-cihazlari')?.id || null,
    }),
    [categories]
  )

  const productsByTab = useMemo(() => {
    const featured = products.filter((product) => product.is_featured).slice(0, 4)
    const airCurtains = categoryIds.airCurtains
      ? products.filter((product) => product.category_id === categoryIds.airCurtains || product.subcategory_id === categoryIds.airCurtains).slice(0, 4)
      : []
    const heatRecovery = categoryIds.heatRecovery
      ? products.filter((product) => product.category_id === categoryIds.heatRecovery || product.subcategory_id === categoryIds.heatRecovery).slice(0, 4)
      : []

    return {
      featured: featured.length > 0 ? featured : products.slice(0, 4),
      airCurtains: airCurtains.length > 0 ? airCurtains : products.slice(0, 4),
      heatRecovery: heatRecovery.length > 0 ? heatRecovery : products.slice(0, 4),
    }
  }, [categoryIds.airCurtains, categoryIds.heatRecovery, products])

  const activeProducts = productsByTab[activeTab]

  return (
    <section className="border-b border-slate-200/75 bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
            {t('home.featuredCommercial.eyebrow')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.2rem]">
            {t('home.featuredCommercial.title')}
          </h2>
          <p className="mt-3 text-base leading-7 text-steel-gray sm:text-lg sm:leading-8">
            {t('home.featuredCommercial.subtitle')}
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {tabOrder.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${activeTab === tab ? 'border-primary-navy bg-primary-navy text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-primary-navy'}`}
            >
              {t(`home.featuredCommercial.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {activeProducts.map((product, index) => (
              <ProductCard key={`${activeTab}-${product.id}`} product={product} priority={index === 0} highlightFeatured />
            ))}
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.35)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
              {t('home.featuredCommercial.panelEyebrow')}
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">{t(`home.featuredCommercial.panelTitles.${activeTab}`)}</h3>
            <p className="mt-3 text-sm leading-6 text-steel-gray">{t(`home.featuredCommercial.panelDescriptions.${activeTab}`)}</p>

            <div className="mt-5 grid gap-2">
              {activeProducts.slice(0, 3).map((product) => (
                <div key={`summary-${product.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{product.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-steel-gray">{product.brand}</div>
                </div>
              ))}
            </div>

            <a href="/products" className="mt-6 inline-flex items-center text-sm font-semibold text-primary-navy transition-colors hover:text-secondary-blue">
              {t('home.featuredCommercial.cta')} →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCommercialBlocks

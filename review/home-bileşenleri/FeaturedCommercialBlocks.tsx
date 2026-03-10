'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '../../i18n/I18nProvider'
import { getProducts, Product } from '../../lib/supabase'

// Using real data via supabase. If API fails, fall back to safe curated blocks.
export const FeaturedCommercialBlocks: React.FC = () => {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'popular' | 'professional' | 'newlyAdded'>('popular')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    // Fetch real products using the correct argument type (number for limit)
    // We fetch a few featured products to represent the commercial block safely.
    getProducts(4)
      .then(res => setProducts(res || []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [activeTab])

  const mainTitle = t('home.featuredCommerce.title') || "Öne Çıkan Çözümler"
  const mainSubtitle = t('home.featuredCommerce.subtitle') || "Projeleriniz için en çok tercih edilen profesyonel ekipmanlar."
  const viewAll = t('home.featuredCommerce.viewAll') || "Tüm Ürünleri Gör"
  const unavailable = t('home.featuredCommerce.unavailable') || "Ürünler şu anda listelenemiyor."
  const tabPop = t('home.featuredCommerce.tabs.popular') || "Popüler Ürünler"
  const tabProf = t('home.featuredCommerce.tabs.professional') || "Profesyonel Seri"
  const tabNew = t('home.featuredCommerce.tabs.newlyAdded') || "Yeni Eklenenler"

  const tabs = [
    { id: 'popular', label: tabPop },
    { id: 'professional', label: tabProf },
    { id: 'newlyAdded', label: tabNew }
  ] as const

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{mainTitle}</h2>
            <p className="mt-2 text-sm md:text-base text-steel-gray">{mainSubtitle}</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto scrollbar-hide shrink-0 max-w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                  ? 'bg-white text-primary-navy shadow-sm'
                  : 'text-gray-500 hover:text-industrial-gray'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4 h-80 bg-gray-50 animate-pulse flex flex-col">
                <div className="h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-gray-100 p-4 bg-white hover:border-primary-navy/30 hover:shadow-lg transition-all flex flex-col h-full"
              >
                <div className="relative aspect-square rounded-xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center">
                   {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                   ) : (
                     <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                   )}
                </div>

                <div className="flex-1 flex flex-col">
                  {product.brand && (
                    <span className="text-xs font-semibold text-gray-400 mb-1">{product.brand}</span>
                  )}
                  <h3 className="text-base font-bold text-industrial-gray line-clamp-2 group-hover:text-primary-navy transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-semibold text-primary-navy">
                      {product.price ? `₺${Number(product.price).toLocaleString('tr-TR', {minimumFractionDigits: 2})}` : 'Fiyat Sorunuz'}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-steel-gray">
             {unavailable}
          </div>
        )}

        <div className="mt-10 flex justify-center md:justify-start">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-semibold text-primary-navy hover:text-secondary-blue transition-colors group"
          >
            {viewAll}
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

// Gateway Architecture Tools
import { useCategoryGateway } from '../hooks/useCategoryGateway'
import CategoryGridView from './category/CategoryGridView'
import CategoryHero from '../components/category/CategoryHero'

// Skeleton and Lazy Components
const OrbitSkeleton = () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-3xl" />
const ApplicationSkeleton = () => <div className="h-[300px] bg-slate-50 animate-pulse rounded-xl" />

const CategoryOrbitCarousel = dynamic(() => import('../components/products').then(mod => mod.CategoryOrbitCarousel), { 
  ssr: false,
  loading: () => <OrbitSkeleton />
})
const ApplicationCards = dynamic(() => import('../components/products').then(mod => mod.ApplicationCards), { 
  ssr: false,
  loading: () => <ApplicationSkeleton />
})

import type { Product, Category } from '../lib/supabase'
import type { DbCategory } from '../types/db-rows'

interface ProductsPageProps {
  initialProducts?: Product[]
  initialCategories?: Category[]
}

/**
 * Modernize edilmiş ve Gateway Mimarisine entegre edilmiş Products Page.
 * Tek bir mantık (hook) üzerinden tüm ürün havuzunu yönetir.
 */
const ProductsPage: React.FC<ProductsPageProps> = ({ 
  initialProducts = [],
  initialCategories = []
}) => {
  const { t } = useI18n()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  // GATEWAY: Tüm ürünleri listelemek için null category ile çağırıyoruz
  const {
    category,
    subCategories,
    filteredProducts,
    availableBrands,
    loading,
    filters,
    updateFilters
  } = useCategoryGateway(null)

  // Products sayfası için "Sanal" bir kategori nesnesi oluşturuyoruz (Hero ve Filters için)
  const virtualCategory = {
    id: 'root-products',
    name: t('common.products') || 'Tüm Ürünler',
    slug: 'products',
    description: t('products.heroDesc') || 'Premium HVAC çözümlerimizi ve endüstriyel ekipmanlarımızı keşfedin.',
    image_url: null,
    parent_id: null,
    level: 0,
    metadata: {}
  } as any

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Seo 
        title={`${t('common.products')} | VentHub`} 
        description={t('home.seoDesc')} 
        canonical={`${origin}/products`}
      />

      {/* Hero Layer - Products Özel Tasarımı Korunuyor */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-16 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,450px] gap-12 items-center">
            <div className="space-y-8">
              <CategoryHero 
                category={virtualCategory}
                productCount={filteredProducts.length}
              />
            </div>
            <div className="relative hidden lg:block">
              <CategoryOrbitCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Unified Grid Layer */}
      <div className="flex-1">
        <CategoryGridView 
          category={virtualCategory}
          subCategories={initialCategories as any[]} // Üst kategorileri filtre olarak sunmak için
          availableBrands={availableBrands}
          products={filteredProducts}
          filters={filters}
          onUpdateFilters={updateFilters}
          loading={loading}
        />
      </div>

      {/* Footer Content */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <ApplicationCards />
        </div>
      </section>
    </div>
  )
}

export default ProductsPage

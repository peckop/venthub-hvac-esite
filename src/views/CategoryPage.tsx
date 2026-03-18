'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import { getCategoryDisplayName } from '../utils/categoryHelpers'

// The new Gateway Hook
import { useCategoryGateway } from '../hooks/useCategoryGateway'

// Sub-Views
import CategoryGridView from './category/CategoryGridView'
import CategoryShowcase from '../components/category/CategoryShowcase'
import CategoryLanding from '../components/category/CategoryLanding'
import CategoryHero from '../components/category/CategoryHero'

import type { DbCategory } from '../types/db-rows'

export interface CategoryPageProps {
  initialCategory?: DbCategory | null
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory }) => {
  const { t } = useI18n()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  // 1. GATEWAY: Veri çekme ve filtreleme işini Hook'a delege et
  const {
    category,
    parentCategory,
    subCategories,
    products,
    filteredProducts,
    availableBrands,
    loading,
    filters,
    updateFilters,
    displayMode
  } = useCategoryGateway(initialCategory)

  // 2. LOADING & ERROR STATES
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
          <p className="text-steel-gray font-medium">{t('category.loading') || 'Kategori Yükleniyor...'}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('category.notFound') || 'Kategori Bulunamadı'}</h1>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary-navy text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-secondary-blue transition-colors">
            {t('category.backHome') || 'Ana Sayfaya Dön'}
          </Link>
        </div>
      </div>
    )
  }

  // 3. SEO & BREADCRUMBS (Ortak Katman)
  const canonicalUrl = (parentCategory && parentCategory.slug !== category.slug)
    ? `${origin}/category/${parentCategory.slug}/${category.slug}`
    : `${origin}/category/${category.slug}`

  const categoryImageUrl = category.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
    : null

  // 4. DİNAMİK RENDER (Dispatcher)
  const renderView = () => {
    const enrichedCategory = { ...category, metadata: (category.metadata as any) || {} }

    if (displayMode === 'showcase') {
      return <CategoryShowcase category={enrichedCategory} subCategories={subCategories} parentCategory={parentCategory} />
    }

    if (displayMode === 'series') {
      return <CategoryLanding category={enrichedCategory} products={products} subCategories={subCategories} parentCategory={parentCategory} />
    }

    // Default Grid View (With Hero & Filters)
    return (
      <>
        <CategoryHero 
          category={category} 
          parentCategory={parentCategory} 
          productCount={filteredProducts.length} 
        />
        <CategoryGridView 
          category={category}
          parentCategory={parentCategory}
          subCategories={subCategories}
          availableBrands={availableBrands}
          products={filteredProducts}
          filters={filters}
          onUpdateFilters={updateFilters}
          loading={loading}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Seo
        title={(category as any).seo_title || `${getCategoryDisplayName(category)} | VentHub`}
        description={(category as any).seo_desc || category.description || undefined}
        canonical={canonicalUrl || undefined}
        ogImage={categoryImageUrl || undefined}
      />
      
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('category.breadcrumbHome'), item: `${origin}/` },
              ...(parentCategory && parentCategory.slug !== category.slug ? [{ '@type': 'ListItem', position: 2, name: getCategoryDisplayName(parentCategory), item: `${origin}/category/${parentCategory.slug}` }] : []),
              { '@type': 'ListItem', position: (parentCategory && parentCategory.slug !== category.slug) ? 3 : 2, name: getCategoryDisplayName(category), item: canonicalUrl },
            ],
          }),
        }}
      />

      {/* SEO Breadcrumb Navigation (Visible) */}
      {displayMode === 'grid' && (
        <nav className="bg-white border-b border-slate-100">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-primary-navy transition-colors">{t('category.breadcrumbHome') || 'Ana Sayfa'}</Link>
              <ChevronRight size={14} className="text-slate-300" />
              {parentCategory && (
                <>
                  <Link href={`/category/${parentCategory.slug}`} className="hover:text-primary-navy transition-colors">
                    {getCategoryDisplayName(parentCategory)}
                  </Link>
                  <ChevronRight size={14} className="text-slate-300" />
                </>
              )}
              <span className="text-slate-900">{getCategoryDisplayName(category)}</span>
            </div>
          </div>
        </nav>
      )}

      {/* RENDER THE SELECTED SUB-VIEW */}
      <div className="flex-1">
        {renderView()}
      </div>
    </div>
  )
}

export default CategoryPage

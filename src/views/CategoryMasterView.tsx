'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

import { useCategoryGateway } from '../hooks/useCategoryGateway'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import type { DomainCategory } from '../lib/type-converters'
import { DomainProduct } from '../lib/type-converters'

const CategoryGridView = dynamic(() => import('./category/CategoryGridView'), { ssr: false })
const CategoryLandingView = dynamic(() => import('./category/CategoryLandingView'), { ssr: false })
const CategorySeriesView = dynamic(() => import('./category/CategorySeriesView'), { ssr: false })
const CategoryShowcaseView = dynamic(() => import('./category/CategoryShowcaseView'), { ssr: false })
const ProductsDiscoveryView = dynamic(() => import('./ProductsDiscoveryView'), { ssr: false })

interface CategoryMasterViewProps {
  initialCategory?: DomainCategory | null
  initialProducts?: DomainProduct[]
  initialSubCategories?: DomainCategory[]
}

const CategoryMasterView: React.FC<CategoryMasterViewProps> = ({ initialCategory, initialProducts, initialSubCategories }) => {
  // 1. Pure Data Layer (Gateway)
  const {
    category: rawCategory,
    parentCategory: rawParentCategory,
    subCategories: rawSubCategories,
    products,
    loading,
    filters,
    updateFilters
  } = useCategoryGateway(initialCategory, initialProducts, initialSubCategories)

  // 2. Presentation Layer (ViewModel)
  const { wrapCategory } = useCategoryViewModel()

  // 3. Derived UI State via ViewModel
  const category = useMemo(() => wrapCategory(rawCategory), [rawCategory, wrapCategory])
  const parentCategory = useMemo(() => wrapCategory(rawParentCategory), [rawParentCategory, wrapCategory])
  const availableBrands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products])



  if (!category && !loading) {
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy" /></div>}>
        <ProductsDiscoveryView products={products} isLoading={loading} />
      </React.Suspense>
    )
  }

  // Determine which view to render based on ViewModel's displayMode
  const renderView = () => {
    if (!category) return null

    switch (category.displayMode) {
      case 'showcase':
        return (
          <CategoryShowcaseView 
            category={category.raw} 
            subCategories={rawSubCategories}
          />
        )
      case 'landing':
        return (
          <CategoryLandingView 
            category={category.raw}
            subCategories={rawSubCategories}
            products={products as DomainProduct[]}
          />
        )
      case 'series':
        // Gelişmiş Beyaz Tasarım (Series)
        return (
          <CategorySeriesView 
            category={category.raw}
            parentCategory={parentCategory?.raw}
            products={products as DomainProduct[]}
          />
        )
      default:
        // Eğer alt kategoriyse Series, ana kategoriyse Grid (Fallback)
        if (category.parentId) {
            return (
                <CategorySeriesView 
                  category={category.raw}
                  parentCategory={parentCategory?.raw}
                  products={products as DomainProduct[]}
                />
            )
        }
        
        // Eğer ana kategori ise ve alt kategorileri varsa Landing görünümü (alt kategorileri göstermek için)
        if (rawSubCategories && rawSubCategories.length > 0) {
            return (
              <CategoryLandingView 
                category={category.raw}
                subCategories={rawSubCategories}
                products={products as DomainProduct[]}
              />
            )
        }

        return (
          <CategoryGridView 
            category={category.raw}
            parentCategory={parentCategory?.raw}
            subCategories={rawSubCategories}
            availableBrands={availableBrands}
            products={products}
            filters={filters}
            onUpdateFilters={updateFilters}
            loading={loading}
          />
        )
    }
  }

  return (
    <div className="min-h-screen">
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy" /></div>}>
        {renderView()}
      </React.Suspense>
    </div>
  )
}

export default CategoryMasterView

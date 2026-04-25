'use client'

import React, { useMemo } from 'react'
import { useCategoryGateway } from '../hooks/useCategoryGateway'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import CategoryShowcaseView from './category/CategoryShowcaseView'
import CategoryGridView from './category/CategoryGridView'
import CategoryLandingView from './category/CategoryLandingView'
import CategorySeriesView from './category/CategorySeriesView'
import ProductsDiscoveryView from './ProductsDiscoveryView'


import type { DomainCategory } from '../lib/type-converters'
import { DomainProduct } from '../lib/type-converters'

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
  const availableBrands = useMemo(() => {
    const brands = new Set<string>()
    for (const p of products) {
      if (p.brand) brands.add(p.brand)
    }
    return Array.from(brands)
  }, [products])



  if (!category && !loading) {
    return <ProductsDiscoveryView products={products} isLoading={loading} />
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
      {renderView()}
    </div>
  )
}

export default CategoryMasterView

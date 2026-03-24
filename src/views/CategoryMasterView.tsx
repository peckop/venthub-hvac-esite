'use client'

import React, { useMemo } from 'react'
import { useCategoryGateway } from '../hooks/useCategoryGateway'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import CategoryShowcaseView from './category/CategoryShowcaseView'
import CategoryGridView from './category/CategoryGridView'
import CategoryLandingView from './category/CategoryLandingView'
import { useIsMounted } from '../hooks/useIsMounted'
import ProductsSkeleton from '../components/products/ProductsSkeleton'
import { DomainCategory, DomainProduct } from '../lib/type-converters'

interface CategoryMasterViewProps {
  initialCategory?: DomainCategory | null
}

const CategoryMasterView: React.FC<CategoryMasterViewProps> = ({ initialCategory }) => {
  const isMounted = useIsMounted()
  
  // 1. Pure Data Layer (Gateway)
  const {
    category: rawCategory,
    parentCategory: rawParentCategory,
    subCategories: rawSubCategories,
    products,
    loading,
    filters,
    updateFilters
  } = useCategoryGateway(initialCategory)

  // 2. Presentation Layer (ViewModel)
  const { wrapCategory } = useCategoryViewModel()

  // 3. Derived UI State via ViewModel
  const category = useMemo(() => wrapCategory(rawCategory), [rawCategory, wrapCategory])
  const parentCategory = useMemo(() => wrapCategory(rawParentCategory), [rawParentCategory, wrapCategory])
  
  const availableBrands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products])

  if (!isMounted || loading || !category) {
    return <ProductsSkeleton />
  }

  // Determine which view to render based on ViewModel's displayMode
  const renderView = () => {
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
            products={products as unknown as DomainProduct[]}
          />
        )
      default:
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
    <div className="min-h-screen bg-white">
      {renderView()}
    </div>
  )
}

export default CategoryMasterView

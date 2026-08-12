'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

import Pagination from '../components/ui/Pagination'
import { useCategoryGateway } from '../hooks/useCategoryGateway'
import { useCategoryViewModel } from '../hooks/useCategoryViewModel'
import type { DomainCategory } from '../lib/type-converters'
import type { FamilyListItem } from '../types/ui-models'

const CategoryGridView = dynamic(() => import('./category/CategoryGridView'), { ssr: false })
const CategoryLandingView = dynamic(() => import('./category/CategoryLandingView'), { ssr: false })
const CategorySeriesView = dynamic(() => import('./category/CategorySeriesView'), { ssr: false })
const CategoryShowcaseView = dynamic(() => import('./category/CategoryShowcaseView'), { ssr: false })
const ProductsDiscoveryView = dynamic(() => import('./ProductsDiscoveryView'), { ssr: false })

interface CategoryMasterViewProps {
  initialCategory?: DomainCategory | null
  /** F5-B W2.1: liste birimi artık varyant değil AİLE satırıdır. */
  families?: FamilyListItem[]
  /** Sunucu sayfalaması: filtre setine göre toplam aile sayısı. */
  total?: number
  /** 1-tabanlı aktif sayfa (?page=). */
  page?: number
  /** Sunucu tarafındaki sayfa boyutu (24). */
  pageSize?: number
  initialSubCategories?: DomainCategory[]
}

const CategoryMasterView: React.FC<CategoryMasterViewProps> = ({
  initialCategory,
  families = [],
  total = 0,
  page = 1,
  pageSize = 24,
  initialSubCategories
}) => {
  // 1. Pure Data Layer (Gateway) — veri çekmez; kategori/alt kategori bağlamı + görünüm tercihleri
  const {
    category: rawCategory,
    parentCategory: rawParentCategory,
    subCategories: rawSubCategories,
    loading,
    filters,
    updateFilters
  } = useCategoryGateway(initialCategory, initialSubCategories)

  // 2. Presentation Layer (ViewModel)
  const { wrapCategory } = useCategoryViewModel()

  // 3. Derived UI State via ViewModel
  const category = useMemo(() => wrapCategory(rawCategory), [rawCategory, wrapCategory])
  const parentCategory = useMemo(() => wrapCategory(rawParentCategory), [rawParentCategory, wrapCategory])
  const availableBrands = useMemo(
    () => Array.from(new Set(families.map(f => f.brand_name).filter((b): b is string => !!b))),
    [families]
  )

  // Sayfa-içi (client) daraltma: sunucudan gelen 24'lük aile sayfası üzerinde çalışır.
  // Spec/fiyat filtreleri kaldırıldı — kalanlar aile satırında GERÇEKTEN uygulanabilir alanlar.
  const visibleFamilies = useMemo(() => {
    const query = filters.catSearch.trim().toLocaleLowerCase()
    let list = families

    if (query) {
      list = list.filter(f =>
        f.name.toLocaleLowerCase().includes(query) ||
        (f.brand_name ?? '').toLocaleLowerCase().includes(query) ||
        (f.series_code ?? '').toLocaleLowerCase().includes(query)
      )
    }
    if (filters.selectedBrands.length > 0) {
      list = list.filter(f => !!f.brand_name && filters.selectedBrands.includes(f.brand_name))
    }

    const sorted = [...list]
    if (filters.sortBy === 'variants') {
      sorted.sort((a, b) => b.variant_count - a.variant_count)
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [families, filters])

  const pagination = (
    <React.Suspense fallback={<div className="py-10" />}>
      <Pagination page={page} pageSize={pageSize} total={total} />
    </React.Suspense>
  )

  if (!category && !loading) {
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy" /></div>}>
        <ProductsDiscoveryView families={visibleFamilies} total={total} isLoading={loading} />
        {pagination}
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
            families={visibleFamilies}
          />
        )
      case 'series':
        // Gelişmiş Beyaz Tasarım (Series)
        return (
          <CategorySeriesView
            category={category.raw}
            parentCategory={parentCategory?.raw}
            families={visibleFamilies}
          />
        )
      default:
        // Eğer alt kategoriyse Series, ana kategoriyse Grid (Fallback)
        if (category.parentId) {
            return (
                <CategorySeriesView
                  category={category.raw}
                  parentCategory={parentCategory?.raw}
                  families={visibleFamilies}
                />
            )
        }

        // Eğer ana kategori ise ve alt kategorileri varsa Landing görünümü (alt kategorileri göstermek için)
        if (rawSubCategories && rawSubCategories.length > 0) {
            return (
              <CategoryLandingView
                category={category.raw}
                subCategories={rawSubCategories}
                families={visibleFamilies}
              />
            )
        }

        return (
          <CategoryGridView
            category={category.raw}
            parentCategory={parentCategory?.raw}
            subCategories={rawSubCategories}
            availableBrands={availableBrands}
            families={visibleFamilies}
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
        {category?.displayMode !== 'showcase' && pagination}
      </React.Suspense>
    </div>
  )
}

export default CategoryMasterView

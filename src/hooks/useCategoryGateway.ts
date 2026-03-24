'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Product, getProductsEnriched } from '../lib/supabase'
import { mapDatabaseCategoryToDomain, DomainCategory } from '../lib/type-converters'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { useIsMounted } from './useIsMounted'
import { useCategories } from '../contexts/CategoryContext'
import type { DbCategory } from '../types/db-rows'

export interface CategoryFilters {
  sortBy: string
  viewMode: 'grid' | 'list'
  priceRange: [number, number]
  selectedBrands: string[]
  airflowMin: string
  airflowMax: string
  pressureMin: string
  pressureMax: string
  noiseMax: string
  catSearch: string
}

const DEFAULT_FILTERS: CategoryFilters = {
  sortBy: 'name',
  viewMode: 'grid',
  priceRange: [0, 1000000],
  selectedBrands: [],
  airflowMin: '',
  airflowMax: '',
  pressureMin: '',
  pressureMax: '',
  noiseMax: '',
  catSearch: ''
}

/**
 * PURE DATA GATEWAY HOOK
 * 
 * Responsible ONLY for:
 * 1. Data retrieval from Supabase/Store
 * 2. URL State Synchronization
 * 3. Raw filtering and sorting of products
 */
export function useCategoryGateway(initialCategory?: DbCategory | null) {
  const isMounted = useIsMounted()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories: globalCategories, loading: categoriesLoading } = useCategories()

  const slug = (params?.slug || params?.subCategorySlug || params?.categorySlug) as string
  const parentSlug = (params?.parentSlug || (params?.subCategorySlug ? params?.categorySlug : undefined)) as string | undefined

  const [category, setCategory] = useState<DomainCategory | null>(initialCategory ? mapDatabaseCategoryToDomain(initialCategory) : null)
  const [parentCategory, setParentCategory] = useState<DomainCategory | null>(null)
  const [subCategories, setSubCategories] = useState<DomainCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS)

  useEffect(() => {
    if (!isMounted || !searchParams) return

    const spBrands = searchParams.get('brands')
    const viewModeParam = searchParams.get('viewMode')

    setFilters({
      sortBy: searchParams.get('sortBy') || 'name',
      viewMode: (viewModeParam === 'grid' || viewModeParam === 'list') ? viewModeParam : 'grid',
      priceRange: [
        Number(searchParams.get('priceMin')) || 0,
        Number(searchParams.get('priceMax')) || 1000000
      ],
      selectedBrands: spBrands ? spBrands.split(',') : [],
      airflowMin: searchParams.get('airflowMin') || '',
      airflowMax: searchParams.get('airflowMax') || '',
      pressureMin: searchParams.get('pressureMin') || '',
      pressureMax: searchParams.get('pressureMax') || '',
      noiseMax: searchParams.get('noiseMax') || '',
      catSearch: searchParams.get('catSearch') || ''
    })
  }, [isMounted, searchParams])

  const updateFilters = useCallback((updates: Partial<CategoryFilters>) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...updates }
      
      if (typeof window !== 'undefined' && pathname) {
        const urlParams = new URLSearchParams(window.location.search)
        
        if (newFilters.sortBy !== 'name') urlParams.set('sortBy', newFilters.sortBy); else urlParams.delete('sortBy');
        if (newFilters.viewMode !== 'grid') urlParams.set('viewMode', newFilters.viewMode); else urlParams.delete('viewMode');
        if (newFilters.priceRange[0] > 0) urlParams.set('priceMin', newFilters.priceRange[0].toString()); else urlParams.delete('priceMin');
        if (newFilters.priceRange[1] < 1000000) urlParams.set('priceMax', newFilters.priceRange[1].toString()); else urlParams.delete('priceMax');
        
        if (newFilters.selectedBrands.length > 0) urlParams.set('brands', newFilters.selectedBrands.join(',')); else urlParams.delete('brands');
        
        if (newFilters.airflowMin) urlParams.set('airflowMin', newFilters.airflowMin); else urlParams.delete('airflowMin');
        if (newFilters.airflowMax) urlParams.set('airflowMax', newFilters.airflowMax); else urlParams.delete('airflowMax');
        if (newFilters.pressureMin) urlParams.set('pressureMin', newFilters.pressureMin); else urlParams.delete('pressureMin');
        if (newFilters.pressureMax) urlParams.set('pressureMax', newFilters.pressureMax); else urlParams.delete('pressureMax');
        if (newFilters.noiseMax) urlParams.set('noiseMax', newFilters.noiseMax); else urlParams.delete('noiseMax');
        if (newFilters.catSearch) urlParams.set('catSearch', newFilters.catSearch); else urlParams.delete('catSearch');

        const newQueryString = urlParams.toString()
        router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ''}`, { scroll: false })
      }
      
      return newFilters
    })
  }, [pathname, router])

  useManualScrollRestoration(loading)

  useEffect(() => {
    async function fetchData() {
      if (categoriesLoading || globalCategories.length === 0) return

      try {
        let targetCategory: DomainCategory | null = null
        let targetParentCategory: DomainCategory | null = null

        if (slug) {
          if (parentSlug) {
            targetParentCategory = globalCategories.find(c => c.slug === parentSlug && !c.parent_id) || null
            targetCategory = globalCategories.find(c => c.slug === slug && c.parent_id === targetParentCategory?.id) || null
          } else {
            targetCategory = globalCategories.find(c => c.slug === slug && !c.parent_id) || 
                             globalCategories.find(c => c.slug === slug) || null
            
            if (targetCategory?.parent_id) {
              targetParentCategory = globalCategories.find(c => c.id === targetCategory!.parent_id) || null
            }
          }
        }

        if (!targetCategory && initialCategory) {
          targetCategory = mapDatabaseCategoryToDomain(initialCategory)
        }

        if (!targetCategory && slug) {
          setLoading(false)
          return
        }

        setCategory(targetCategory)
        setParentCategory(targetParentCategory)

        let subs: DomainCategory[] = []
        if (targetCategory && !targetCategory.parent_id) {
          subs = globalCategories
            .filter(c => c.parent_id === targetCategory!.id)
            .sort((a, b) => {
              const orderA = Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)
              const orderB = Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)
              return orderA !== orderB ? orderA - orderB : a.name.localeCompare(b.name)
            })
          setSubCategories(subs)
        }

        const categoryIds = (targetCategory && !targetCategory.parent_id && subs.length > 0)
          ? [targetCategory.id, ...subs.map(s => s.id)]
          : (targetCategory ? [targetCategory.id] : [])

        if (categoryIds.length > 0 || !slug) {
          const productsData = await getProductsEnriched({
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            limit: 100
          })
          
          setProducts(productsData)

          const prices = productsData.map(p => p.price).filter((v): v is number => v != null && Number.isFinite(v))
          if (prices.length > 0) {
            const maxPrice = Math.ceil(Math.max(...prices))
            setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Math.max(prev.priceRange[1], maxPrice)] }))
          }
        }

      } catch (error) {
        console.error('Category Gateway Fetch Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, parentSlug, initialCategory, globalCategories, categoriesLoading])

  return {
    category,
    parentCategory,
    subCategories,
    products,
    loading,
    filters,
    updateFilters
  }
}

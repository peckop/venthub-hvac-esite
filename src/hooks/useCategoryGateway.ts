'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Product } from '@/types/ui-models'
import { getProductsEnriched } from '@/lib/services/product.service'
import { DomainCategory } from '../lib/type-converters'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { useIsMounted } from './useIsMounted'
import { useCategories } from '../contexts/CategoryContext'

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
export function useCategoryGateway(initialCategory?: DomainCategory | null, initialProducts?: Product[], initialSubCategories?: DomainCategory[]) {
  const isMounted = useIsMounted()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories: globalCategories, loading: categoriesLoading } = useCategories()

  const slug = (params?.slug || params?.subCategorySlug || params?.categorySlug) as string
  const parentSlug = (params?.parentSlug || (params?.subCategorySlug ? params?.categorySlug : undefined)) as string | undefined

  const [category, setCategory] = useState<DomainCategory | null>(initialCategory ?? null)
  const [parentCategory, setParentCategory] = useState<DomainCategory | null>(null)
  const [subCategories, setSubCategories] = useState<DomainCategory[]>(initialSubCategories ?? [])
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  // Eğer slug yoksa (Örn: /products rotası), kategori yüklemeyeceğimiz için loading baştan false olmalıdır.
  // Aksi takdirde SSR'da boş ekran render edilir.
  const [loading, setLoading] = useState(!!slug && !initialCategory)

  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS)

  // SSR Hydration Guard: initialProducts yalnızca ilk render'da (hydration) skip için kullanılır.
  // Client-side navigation (slug değişimi) durumunda normal fetch yapılmalıdır.
  const isFirstRender = useRef(true)

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
        router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ''}` as import('next').Route, { scroll: false })
      }
      
      return newFilters
    })
  }, [pathname, router])

  useManualScrollRestoration(loading)


  const categoryMaps = useMemo(() => {
    const byId = new Map<string, DomainCategory>()
    const bySlug = new Map<string, DomainCategory>()
    const rootBySlug = new Map<string, DomainCategory>()
    const bySlugAndParent = new Map<string, DomainCategory>()
    const childrenByParentId = new Map<string, DomainCategory[]>()

    for (const c of globalCategories) {
      if (!byId.has(c.id)) byId.set(c.id, c)
      if (!bySlug.has(c.slug)) bySlug.set(c.slug, c)
      if (!c.parent_id && !rootBySlug.has(c.slug)) rootBySlug.set(c.slug, c)
      if (c.parent_id) {
        const key = `${c.slug}|${c.parent_id}`
        if (!bySlugAndParent.has(key)) bySlugAndParent.set(key, c)

        const children = childrenByParentId.get(c.parent_id) || []
        children.push(c)
        childrenByParentId.set(c.parent_id, children)
      }
    }
    return { byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId }
  }, [globalCategories])


  useEffect(() => {
    async function fetchData() {
      if (categoriesLoading || globalCategories.length === 0) return

      try {
        let targetCategory: DomainCategory | null = null
        let targetParentCategory: DomainCategory | null = null

        if (slug) {
          if (parentSlug) {
            targetParentCategory = categoryMaps.rootBySlug.get(parentSlug) || null
            targetCategory = targetParentCategory
              ? (categoryMaps.bySlugAndParent.get(`${slug}|${targetParentCategory.id}`) || null)
              : null
          } else {
            targetCategory = categoryMaps.rootBySlug.get(slug) || categoryMaps.bySlug.get(slug) || null
            
            if (targetCategory?.parent_id) {
              targetParentCategory = categoryMaps.byId.get(targetCategory.parent_id) || null
            }
          }
        }

        if (!targetCategory && initialCategory) {
          targetCategory = initialCategory
        }

        if (!targetCategory && slug) {
          setLoading(false)
          return
        }

        setCategory(targetCategory)
        setParentCategory(targetParentCategory)

        let subs: DomainCategory[] = []
        if (targetCategory && !targetCategory.parent_id) {
          subs = [...(categoryMaps.childrenByParentId.get(targetCategory!.id) || [])]
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

        if (isFirstRender.current && initialProducts && initialProducts.length > 0) {
          // İlk yükleme: SSR verisi geldi, API isteği atla, sadece fiyat aralığını hesapla
          isFirstRender.current = false
          let maxPrice = -Infinity
          for (let i = 0; i < initialProducts.length; i++) {
            const p = initialProducts[i].price
            if (p != null && Number.isFinite(p) && p > maxPrice) {
              maxPrice = p
            }
          }
          if (maxPrice !== -Infinity) {
            const ceilMax = Math.ceil(maxPrice)
            setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Math.max(prev.priceRange[1], ceilMax)] }))
          }
        } else if (categoryIds.length > 0 || !slug) {
          const productsData = await getProductsEnriched({
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            limit: 100
          })
          
          setProducts(productsData)

          let maxPrice = -Infinity
          for (let i = 0; i < productsData.length; i++) {
            const p = productsData[i].price
            if (p != null && Number.isFinite(p) && p > maxPrice) {
              maxPrice = p
            }
          }
          if (maxPrice !== -Infinity) {
            const ceilMax = Math.ceil(maxPrice)
            setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Math.max(prev.priceRange[1], ceilMax)] }))
          }
        }

      } catch (error) {
        console.error('Category Gateway Fetch Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, parentSlug, initialCategory, initialProducts, globalCategories, categoryMaps, categoriesLoading])

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

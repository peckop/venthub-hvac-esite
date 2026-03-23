'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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

  // 1. Always start with defaults for SSR compatibility
  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS)

  // 2. Hydrate filters from URL after mount (Prevent Mismatch)
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

  // Sync state changes back to URL
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

  // Scroll Restoration
  useManualScrollRestoration(loading)

  useEffect(() => {
    async function fetchData() {
      // If we are still loading categories globally, wait
      if (categoriesLoading || globalCategories.length === 0) return

      try {
        let targetCategory: DomainCategory | null = null
        let targetParentCategory: DomainCategory | null = null

        // Find Category from Central Store
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

        // If not found and we have an initialCategory, use it (Fallback)
        if (!targetCategory && initialCategory) {
          targetCategory = mapDatabaseCategoryToDomain(initialCategory)
        }

        if (!targetCategory && slug) {
          setLoading(false)
          return
        }

        setCategory(targetCategory)
        setParentCategory(targetParentCategory)

        // Subcategories logic (Centralized)
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

        // Enriched Product Fetching
        const categoryIds = (targetCategory && !targetCategory.parent_id && subs.length > 0)
          ? [targetCategory.id, ...subs.map(s => s.id)]
          : (targetCategory ? [targetCategory.id] : [])

        if (categoryIds.length > 0 || !slug) {
          const productsData = await getProductsEnriched({
            categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            limit: 100
          })
          
          setProducts(productsData)

          // Auto-calculate max price
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

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const term = filters.catSearch.trim().toLowerCase()
        if (term) {
          const hay = [product.name, product.brand, product.model_code, product.sku].map(v => String(v || '').toLowerCase())
          if (!hay.some(h => h.includes(term))) return false
        }

        const priceNum = product.price
        const matchesPrice = Number.isFinite(priceNum)
          ? priceNum! >= filters.priceRange[0] && priceNum! <= filters.priceRange[1]
          : true

        const matchesBrand = filters.selectedBrands.length === 0 || (product.brand ? filters.selectedBrands.includes(product.brand) : false)

        // Technical Specs Filters
        const af = product.airflow_capacity ?? null
        const pr = product.pressure_rating != null ? Number(product.pressure_rating) : null
        const nl = product.noise_level ?? null

        const matchesAirflow = (!filters.airflowMin || (af !== null && af >= Number(filters.airflowMin))) && 
                               (!filters.airflowMax || (af !== null && af <= Number(filters.airflowMax)))
        const matchesPressure = (!filters.pressureMin || (pr !== null && pr >= Number(filters.pressureMin))) && 
                                (!filters.pressureMax || (pr !== null && pr <= Number(filters.pressureMax)))
        const matchesNoise = (!filters.noiseMax || (nl !== null && nl <= Number(filters.noiseMax)))

        return matchesPrice && matchesBrand && matchesAirflow && matchesPressure && matchesNoise
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-low') return Number(a.price) - Number(b.price)
        if (filters.sortBy === 'price-high') return Number(b.price) - Number(a.price)
        return a.name.localeCompare(b.name)
      })
  }, [products, filters])

  const availableBrands = useMemo(() => 
    Array.from(new Set(products.map(p => p.brand).filter((b): b is string => !!b))),
    [products]
  )

  // 1. Group products by series for "Series View"
  const groupedSeries = useMemo(() => {
    const seriesMap: Record<string, { name: string; products: Product[]; image?: string; minPrice: number }> = {}
    
    filteredProducts.forEach(product => {
      // Get series name from metadata or first word of the name
      // Access metadata safely from the product object
      const meta = (product as unknown as { metadata?: Record<string, unknown> }).metadata || {}

      let seriesName = (meta.series as string) || product.name.split(' ')[0]
      
      // Clean up common prefixes like "Vortice", "Avens" if they are at the start
      if (seriesName === 'Vortice' || seriesName === 'Avens' || seriesName === 'Soler') {
        seriesName = product.name.split(' ')[1] || seriesName
      }

      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = {
          name: seriesName,
          products: [],
          image: product.image_url || undefined,
          minPrice: Infinity
        }
      }
      
      seriesMap[seriesName].products.push(product)
      if (product.price && product.price < seriesMap[seriesName].minPrice) {
        seriesMap[seriesName].minPrice = product.price
      }
    })

    return Object.values(seriesMap).sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredProducts])

  // --- SMART DISPLAY MODE ENGINE ---
  const displayMode = useMemo(() => {
    if (!category) return 'grid'
    const meta = (category.metadata as Record<string, unknown>) || {}
    
    // 1. Explicit override from Database (Source of Truth)
    if (meta.display_mode) return meta.display_mode as string;

    // 2. Special "Premium Landing" Categories (Showcase Mode)
    const premiumLandingSlugs = ['hava-perdesi', 'hava-perdeleri', 'sessiz-kanal-tipi-fanlar'];
    if (premiumLandingSlugs.includes(category.slug)) return 'showcase';

    // 3. Sub-Category or Series Level (Always Series/Grid)
    if (parentCategory) return 'series';

    // 4. Default for all other Top-Level categories (Grid Mode)
    // This ensures "Aksesuarlar" or "Filters" show products immediately,
    // with subcategories available in the sidebar as navigation.
    return 'grid';
  }, [category, parentCategory])

  return {
    category,
    parentCategory,
    subCategories,
    products,
    filteredProducts,
    availableBrands,
    loading,
    filters,
    updateFilters,
    displayMode,
    groupedSeries
  }
}

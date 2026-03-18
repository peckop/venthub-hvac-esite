'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { getCategories, Product, getProductsEnriched } from '../lib/supabase'
import { mapDatabaseCategoryToDomain, toUICategoryList, DomainCategory } from '../lib/type-converters'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
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

export function useCategoryGateway(initialCategory?: DbCategory | null) {
  const params = useParams()
  const slug = (params?.slug || params?.subCategorySlug || params?.categorySlug) as string
  const parentSlug = (params?.parentSlug || (params?.subCategorySlug ? params?.categorySlug : undefined)) as string | undefined

  const [category, setCategory] = useState<DomainCategory | null>(initialCategory ? mapDatabaseCategoryToDomain(initialCategory) : null)
  const [parentCategory, setParentCategory] = useState<DomainCategory | null>(null)
  const [subCategories, setSubCategories] = useState<DomainCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialCategory)

  // Filters State
  const [filters, setFilters] = useState<CategoryFilters>({
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
  })

  const updateFilters = (updates: Partial<CategoryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  // Scroll Restoration
  useManualScrollRestoration(loading)

  useEffect(() => {
    async function fetchData() {
      if (!slug) return

      try {
        let targetCategoryRow: DbCategory | null = initialCategory || null
        let targetParentCategoryRow: DbCategory | null = null
        let allCategories: DbCategory[] = []

        // Fetch categories if needed
        if (!targetCategoryRow || targetCategoryRow.slug !== slug) {
          setLoading(true)
          const rawCats = await getCategories()
          allCategories = rawCats as unknown as DbCategory[]

          if (parentSlug && slug) {
            targetParentCategoryRow = allCategories.find(c => c.slug === parentSlug && !c.parent_id) || null
            targetCategoryRow = allCategories.find(c => c.slug === slug && !!c.parent_id) || null
          } else {
            targetCategoryRow = allCategories.find(c => c.slug === slug && !c.parent_id) || null
          }
        } else if (!targetCategoryRow.parent_id) {
          const rawCats = await getCategories()
          allCategories = rawCats as unknown as DbCategory[]
        }

        if (!targetCategoryRow) {
          setLoading(false)
          return
        }

        const domainCat = mapDatabaseCategoryToDomain(targetCategoryRow)
        setCategory(domainCat)
        setParentCategory(targetParentCategoryRow ? mapDatabaseCategoryToDomain(targetParentCategoryRow) : null)

        // Subcategories logic
        let subs: DbCategory[] = []
        if (!targetCategoryRow.parent_id) {
          subs = allCategories
            .filter(c => c.parent_id === targetCategoryRow!.id)
            .sort((a, b) => {
              const orderA = (a.metadata as Record<string, any>)?.sort_order ?? 0
              const orderB = (b.metadata as Record<string, any>)?.sort_order ?? 0
              return orderA !== orderB ? orderA - orderB : a.name.localeCompare(b.name)
            })
          setSubCategories(toUICategoryList(subs))
        }

        // Enriched Product Fetching
        const categoryIds = (!targetCategoryRow.parent_id && subs.length > 0)
          ? [targetCategoryRow.id, ...subs.map(s => s.id)]
          : [targetCategoryRow.id]

        const productsData = await getProductsEnriched({
          categoryIds,
          limit: 100
        })
        
        setProducts(productsData)

        // Auto-calculate max price
        const prices = productsData.map(p => p.price).filter((v): v is number => v != null && Number.isFinite(v))
        if (prices.length > 0) {
          const maxPrice = Math.ceil(Math.max(...prices))
          setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Math.max(prev.priceRange[1], maxPrice)] }))
        }

      } catch (error) {
        console.error('Category Gateway Fetch Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, parentSlug, initialCategory])

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

  // Derived Display Mode logic
  const displayMode = useMemo(() => {
    if (!category) return 'grid'
    const meta = (category.metadata as Record<string, unknown>) || {}
    
    // Inheritance
    if (meta.hide_price === undefined && parentCategory?.metadata) {
      meta.hide_price = (parentCategory.metadata as Record<string, unknown>).hide_price
    }

    return (meta.display_mode as string) || (parentCategory ? 'series' : (subCategories.length > 0 ? 'showcase' : 'grid'))
  }, [category, parentCategory, subCategories])

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
    displayMode
  }
}

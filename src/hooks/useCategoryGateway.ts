'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCategories } from '../contexts/CategoryContext'
import { useManualScrollRestoration } from '../hooks/useManualScrollRestoration'
import { DomainCategory } from '../lib/type-converters'
import { useIsMounted } from './useIsMounted'

/**
 * F5-B W2.1 — Gateway artık VERİ ÇEKMEZ.
 *
 * Liste (aile satırları) sunucuda `getFamiliesEnriched` ile üretilir ve prop olarak iner;
 * istemci aynı listeyi bir daha fetch etmez (SSR/hydration zıplaması + çift sorgu kalktı).
 * Kategori çözümü de sunucudan gelir — bu yüzden eski HAM slug lookup'ı (yerelleştirilmiş
 * TR slug'ında yanlış kategori riski) tamamen SİLİNDİ. Burada yalnız:
 *   1) breadcrumb için üst kategori,
 *   2) sunucudan gelmediyse alt kategoriler,
 *   3) URL'e yansıyan görünüm/sıralama tercihleri
 * global kategori context'inden türetilir.
 *
 * Spec filtreleri (debi/basınç/ses) ve fiyat aralığı KALDIRILDI: listeye hiç uygulanmıyordu
 * (sahte filtre) ve aile satırında spec yoktur. Gerçek faceted-search ayrı plandır.
 */
export interface CategoryFilters {
  sortBy: string
  viewMode: 'grid' | 'list'
  selectedBrands: string[]
  catSearch: string
}

const DEFAULT_FILTERS: CategoryFilters = {
  sortBy: 'name',
  viewMode: 'grid',
  selectedBrands: [],
  catSearch: ''
}

export function useCategoryGateway(
  initialCategory?: DomainCategory | null,
  initialSubCategories?: DomainCategory[]
) {
  const isMounted = useIsMounted()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories: globalCategories, loading: categoriesLoading } = useCategories()

  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS)

  const category = initialCategory ?? null

  useEffect(() => {
    if (!isMounted || !searchParams) return

    const spBrands = searchParams.get('brands')
    const viewModeParam = searchParams.get('viewMode')

    setFilters({
      sortBy: searchParams.get('sortBy') || 'name',
      viewMode: (viewModeParam === 'grid' || viewModeParam === 'list') ? viewModeParam : 'grid',
      selectedBrands: spBrands ? spBrands.split(',') : [],
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
        if (newFilters.selectedBrands.length > 0) urlParams.set('brands', newFilters.selectedBrands.join(',')); else urlParams.delete('brands');
        if (newFilters.catSearch) urlParams.set('catSearch', newFilters.catSearch); else urlParams.delete('catSearch');

        const newQueryString = urlParams.toString()
        router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ''}` as import('next').Route, { scroll: false })
      }

      return newFilters
    })
  }, [pathname, router])

  useManualScrollRestoration(categoriesLoading)

  const categoryMaps = useMemo(() => {
    const byId = new Map<string, DomainCategory>()
    const childrenByParentId = new Map<string, DomainCategory[]>()

    for (const c of globalCategories) {
      if (!byId.has(c.id)) byId.set(c.id, c)
      if (c.parent_id) {
        const children = childrenByParentId.get(c.parent_id) || []
        children.push(c)
        childrenByParentId.set(c.parent_id, children)
      }
    }
    return { byId, childrenByParentId }
  }, [globalCategories])

  const parentCategory = useMemo(() => {
    if (!category?.parent_id) return null
    return categoryMaps.byId.get(category.parent_id) ?? null
  }, [category, categoryMaps])

  const subCategories = useMemo(() => {
    if (initialSubCategories && initialSubCategories.length > 0) return initialSubCategories
    if (!category || category.parent_id) return []
    return [...(categoryMaps.childrenByParentId.get(category.id) || [])].sort((a, b) => {
      const orderA = Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)
      const orderB = Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)
      return orderA !== orderB ? orderA - orderB : a.name.localeCompare(b.name)
    })
  }, [initialSubCategories, category, categoryMaps])

  return {
    category,
    parentCategory,
    subCategories,
    // Liste sunucudan geldiği için istemcide bekleme durumu yoktur; yalnız global kategori
    // context'i (breadcrumb/alt kategori süsü) yüklenirken true olur ve listeyi bloklamaz.
    loading: false,
    categoriesLoading,
    filters,
    updateFilters
  }
}

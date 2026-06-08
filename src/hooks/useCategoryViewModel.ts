'use client'

import { useMemo } from 'react'

import { useI18n } from '../i18n/I18nProvider'
import { DomainCategory, DomainProduct, mapCategoryWithLocale } from '../lib/type-converters'
import type { DbCategory } from '../types/db-rows'

export interface CategoryViewModel {
  id: string
  slug: string
  displayName: string
  marketingTitle: string
  description: string
  imageUrl: string | null
  parentId: string | null
  level: number
  displayMode: 'showcase' | 'landing' | 'series' | 'grid'
  raw: DomainCategory
}

export interface SeriesGroup {
  name: string
  products: DomainProduct[]
  image?: string
  minPrice: number
}

/**
 * ADVANCED SCALE VIEWMODEL HOOK
 * 
 * THE ONLY SOURCE OF TRUTH FOR UI REPRESENTATION
 */
export function useCategoryViewModel() {
  const { t, lang } = useI18n()

  const wrapCategory = useMemo(() => (category: DomainCategory | null | undefined): CategoryViewModel | null => {
    if (!category) return null

    // Proactively localize category metadata based on current language
    const localizedCategory = mapCategoryWithLocale(category as DbCategory, lang)

    // 1. i18n Resolution via translation_key (Advanced Standard)
    const tKey = localizedCategory.translation_key || localizedCategory.slug
    const translationPath = `common.categoryList.${tKey}`
    const translatedName = t(translationPath)
    
    // If translation fails, fallback to DB menu_label or original name
    const displayName = (translatedName && translatedName !== translationPath) 
      ? translatedName 
      : (localizedCategory.menu_label || localizedCategory.name)

    // 2. Marketing Title Logic
    const marketingTitle = localizedCategory.marketing_title || displayName

    // 3. DISPLAY MODE RESOLVER (TOTAL UNIFIED SHELL)
    // Priority: 1. DB Row (`display_mode`), 2. Metadata fallback (legacy), 3. Default ('series')
    const meta = (localizedCategory.metadata && typeof localizedCategory.metadata === 'object') ? (localizedCategory.metadata as Record<string, unknown>) : {}
    
    let displayMode: CategoryViewModel['displayMode'] = 'series' // VARSAYILAN ARTIK ESKİ GRID DEĞİL, YENİ BEYAZ TASARIM (SERIES)

    // Priority: 1. DB Column (`category.display_mode`), 2. Metadata JSON (legacy), 3. Default ('series')
    const rawDisplayMode = localizedCategory.display_mode || meta.display_mode
    
    if (rawDisplayMode === 'showcase' || rawDisplayMode === 'landing') {
      displayMode = rawDisplayMode
    } else if (rawDisplayMode === 'grid') { // Legacy fallback
      displayMode = 'series'
    }

    return {
      id: localizedCategory.id,
      slug: localizedCategory.slug,
      displayName,
      marketingTitle,
      description: localizedCategory.description || '',
      imageUrl: localizedCategory.image_url,
      parentId: localizedCategory.parent_id,
      level: localizedCategory.level || 0,
      displayMode,
      raw: localizedCategory
    }
  }, [t, lang])

  const groupProductsBySeries = useMemo(() => (products: DomainProduct[]): SeriesGroup[] => {
    const seriesMap: Record<string, SeriesGroup> = {}
    products.forEach(product => {
      const meta = ('metadata' in product && typeof product.metadata === 'object' && product.metadata !== null) ? (product.metadata as Record<string, unknown>) : {}
      let seriesName = (meta.series as string) || product.name.split(' ')[0]
      if (['Vortice', 'Avens', 'Soler', 'Casals', 'Vorticel'].includes(seriesName)) {
        seriesName = product.name.split(' ')[1] || seriesName
      }
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = { name: seriesName, products: [], image: product.image_url || undefined, minPrice: Infinity }
      }
      seriesMap[seriesName].products.push(product)
      if (product.price && product.price < seriesMap[seriesName].minPrice) seriesMap[seriesName].minPrice = product.price
    })
    return Object.values(seriesMap).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  return {
    wrapCategory,
    groupProductsBySeries
  }
}

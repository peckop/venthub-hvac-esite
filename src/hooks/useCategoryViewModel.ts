'use client'

import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { DomainCategory, DomainProduct } from '../lib/type-converters'

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
  const { t } = useI18n()

  const wrapCategory = useMemo(() => (category: DomainCategory | null | undefined): CategoryViewModel | null => {
    if (!category) return null

    // 1. i18n Resolution via translation_key (Advanced Standard)
    const tKey = (category as typeof category & { translation_key?: string }).translation_key || category.slug
    const translationPath = `common.categoryList.${tKey}`
    const translatedName = t(translationPath)
    
    // If translation fails, fallback to DB menu_label or original name
    const displayName = (translatedName && translatedName !== translationPath) 
      ? translatedName 
      : (category.menu_label || category.name)

    // 2. Marketing Title Logic
    const marketingTitle = category.marketing_title || displayName

    // 3. DISPLAY MODE RESOLVER (TOTAL UNIFIED SHELL)
    // Priority: 1. DB Row (`display_mode`), 2. Metadata fallback (legacy), 3. Default ('series')
    const typedCategory = category as typeof category & { display_mode?: string | null }
    const meta = (category.metadata as Record<string, unknown>) || {}
    
    let displayMode: CategoryViewModel['displayMode'] = 'series' // VARSAYILAN ARTIK ESKİ GRID DEĞİL, YENİ BEYAZ TASARIM (SERIES)

    const rawDisplayMode = typedCategory.display_mode || meta.display_mode
    
    if (rawDisplayMode === 'showcase' || rawDisplayMode === 'landing') {
      displayMode = rawDisplayMode
    } else if (rawDisplayMode === 'grid') { // Legacy fallback
      displayMode = 'series'
    }

    return {
      id: category.id,
      slug: category.slug,
      displayName,
      marketingTitle,
      description: category.description || '',
      imageUrl: category.image_url,
      parentId: category.parent_id,
      level: category.level || 0,
      displayMode,
      raw: category
    }
  }, [t])

  const groupProductsBySeries = useMemo(() => (products: DomainProduct[]): SeriesGroup[] => {
    const seriesMap: Record<string, SeriesGroup> = {}
    products.forEach(product => {
      const meta = (product as typeof product & { metadata?: Record<string, unknown> }).metadata || {}
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

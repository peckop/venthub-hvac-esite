'use client'

import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { DomainCategory, DomainProduct } from '../lib/type-converters'
import { getCategoryDisplayName, getCategoryMarketingTitle } from '../utils/categoryHelpers'

export interface CategoryViewModel {
  id: string
  slug: string
  displayName: string
  marketingTitle: string
  description: string
  imageUrl: string | null
  parentId: string | null
  level: number
  displayMode: string
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
 * Responsible for:
 * 1. i18n translation of category names (Presentation Layer)
 * 2. Determining UI display modes (Logic Layer)
 * 3. Grouping products for the UI (Transformation Layer)
 */
export function useCategoryViewModel() {
  const { t } = useI18n()

  // 1. Transform raw category to UI-ready ViewModel
  const wrapCategory = useMemo(() => (category: DomainCategory | null | undefined): CategoryViewModel | null => {
    if (!category) return null

    // I18n translation logic - Centralized here!
    const translationKey = `common.categoryList.${category.slug}`
    const translatedName = t(translationKey)
    const displayName = (translatedName && translatedName !== translationKey) 
      ? translatedName 
      : getCategoryDisplayName(category)

    // Marketing title logic
    const marketingTitle = getCategoryMarketingTitle(category)

    // UI Display Mode Logic - Moved from Gateway
    const meta = (category.metadata as Record<string, unknown>) || {}
    let displayMode = 'grid'
    
    if (meta.display_mode) {
      displayMode = meta.display_mode as string
    } else {
      const premiumLandingSlugs = ['hava-perdesi', 'hava-perdeleri', 'sessiz-kanal-tipi-fanlar']
      if (premiumLandingSlugs.includes(category.slug)) {
        displayMode = 'showcase'
      } else if (category.parent_id) {
        displayMode = 'series'
      }
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

  // 2. Transform raw products to Series Groups for the UI
  const groupProductsBySeries = useMemo(() => (products: DomainProduct[]): SeriesGroup[] => {
    const seriesMap: Record<string, SeriesGroup> = {}
    
    products.forEach(product => {
      const meta = (product as unknown as { metadata?: Record<string, unknown> }).metadata || {}
      let seriesName = (meta.series as string) || product.name.split(' ')[0]
      
      // Clean up common prefixes
      if (['Vortice', 'Avens', 'Soler', 'Casals', 'Vorticel'].includes(seriesName)) {
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
  }, [])

  return {
    wrapCategory,
    groupProductsBySeries
  }
}

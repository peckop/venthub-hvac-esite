'use client'

import { useMemo } from 'react'

import { useI18n } from '../i18n/I18nProvider'
import { DomainCategory, mapCategoryWithLocale } from '../lib/type-converters'
import type { DbCategory } from '../types/db-rows'
import { getCategoryDescription, getCategoryDisplayName } from '../utils/categoryHelpers'

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

/**
 * ADVANCED SCALE VIEWMODEL HOOK
 * 
 * THE ONLY SOURCE OF TRUTH FOR UI REPRESENTATION
 * Provides a memoized function to translate raw DomainCategory objects into full UI CategoryViewModels.
 * Handles localization, metadata fallbacks, and display mode resolution.
 *
 * @returns An object containing the `wrapCategory` function.
 *
 * @example
 * const { wrapCategory } = useCategoryViewModel()
 * const viewModel = wrapCategory(rawDbCategory)
 * console.log(viewModel?.displayName)
 */
export function useCategoryViewModel() {
  const { t, lang } = useI18n()

  const wrapCategory = useMemo(() => (category: DomainCategory | null | undefined): CategoryViewModel | null => {
    if (!category) return null

    // Proactively localize category metadata based on current language
    const localizedCategory = mapCategoryWithLocale(category as DbCategory, lang)

    // 1. Ad çözümü — TEK KAYNAK.
    //
    // ⭐REC-103 (2026-09-01): burada `common.categoryList.${tKey}` → menu_label → name
    // zinciri ELLE YAZILMIŞTI; yani `getCategoryDisplayName` ile BİREBİR aynı kural
    // ikinci kez, bağımsız olarak duruyordu. Mutlak Kural 7 "kategori ADI daima
    // getCategoryDisplayName" der — kopyalamak da ihlaldir, çünkü kuralın bir kolu
    // düzeltilince diğeri sessizce eski davranışta kalır. Menüler, showcase görünümleri
    // ve orbital karusel bu hook'tan besleniyor; yani kopya zincir müşteri yüzeyindeydi.
    const displayName = getCategoryDisplayName(localizedCategory as DbCategory, t)

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
      // ⭐REC-161: burası ham kolon okuyordu (`localizedCategory.description`) ve dile
      // KÖRDÜ. Emirde listelenmemişti; ölçtüm — CANLI kategori sayfasının GERÇEK yolu
      // burası: CategoryMasterView → CategoryShowcaseView → vm.description. (Emirde
      // gösterilen `components/category/CategoryShowcase.tsx`'i hiçbir dosya import
      // ETMİYOR = ölü kod.) Yalnız emirdeki üç yer düzeltilseydi katalog şeridinin
      // 23 paragrafı kategori sayfasında HİÇ görünmezdi.
      description: getCategoryDescription(localizedCategory, lang),
      imageUrl: localizedCategory.image_url,
      parentId: localizedCategory.parent_id,
      level: localizedCategory.level || 0,
      displayMode,
      raw: localizedCategory
    }
  }, [t, lang])

  return {
    wrapCategory
  }
}

import { cache } from 'react'
import { getProductBySlug } from '@/lib/services/product.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { mapDatabaseCategoryToDomain } from '../type-converters'
import type { DbCategory, CategoryMetadata, AuthorityContent } from '../../types/db-rows'

// Cached product fetcher
export const getCachedProductBySlug = cache(async (slug: string) => {
  return getProductBySlug(supabase, slug)
})

// Cached category fetcher
export const getCachedCategoryData = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content')
    .eq('slug', slug)
    .single()
  
  if (error || !data) return null
  return mapDatabaseCategoryToDomain({
    ...data,
    name: data.name || '',
    menu_label: data.menu_label as string | null,
    marketing_title: data.marketing_title as string | null,
    translation_key: data.translation_key as string | null,
    description: data.description as string | null,
    metadata: data.metadata as CategoryMetadata | null,
    authority_content: data.authority_content as AuthorityContent | null
  } as DbCategory)
})

// Preload pattern functions that can be called early in the render phase
export function preloadProduct(slug: string) {
  void getCachedProductBySlug(slug)
}

export function preloadCategory(slug: string) {
  void getCachedCategoryData(slug)
}

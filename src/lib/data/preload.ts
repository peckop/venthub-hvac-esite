import { cache } from 'react'

import { getProductBySlug } from '@/lib/services/product.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'

import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../types/db-rows'
import { mapDatabaseCategoryToDomain } from '../type-converters'

// Cached product fetcher
export const getCachedProductBySlug = cache(async (slug: string) => {
  return getProductBySlug(supabase, slug)
})

const CATEGORY_COLUMNS = 'id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content'

// PostgREST `.or()` filtreleri virgül/parantez ile ayrıştırılır; sadece güvenli
// slug karakterlerine izin ver, aksi halde yalnız kanonik eşleşmeye düş.
const SAFE_SLUG = /^[a-zA-Z0-9._~-]+$/

/**
 * Kategoriyi kanonik slug (EN kolon) VEYA dile göre yerelleştirilmiş
 * `metadata.slug.tr` / `metadata.slug.en` üzerinden çözer.
 * Migration uygulanmamışsa metadata yolları hiç eşleşmez, kanonik yol çalışır.
 */
export const getCachedCategoryData = cache(async (slug: string) => {
  const query = supabase.from('categories').select(CATEGORY_COLUMNS)

  const { data: rows, error } = SAFE_SLUG.test(slug)
    ? await query
        .or(`slug.eq.${slug},metadata->slug->>tr.eq.${slug},metadata->slug->>en.eq.${slug}`)
        .limit(2)
    : await query.eq('slug', slug).limit(1)

  if (error || !rows || rows.length === 0) return null
  // Birden fazla eşleşmede kanonik slug önceliklidir (deterministik seçim).
  const data = rows.find((row) => row.slug === slug) ?? rows[0]

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

import { cache } from 'react'

import { getFamilyDetail, getSeriesLanding } from '@/lib/services/family.service'
import { getProductBySlug } from '@/lib/services/product.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'

import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../types/db-rows'
import { mapDatabaseCategoryToDomain } from '../type-converters'

// Cached product fetcher
export const getCachedProductBySlug = cache(async (slug: string) => {
  return getProductBySlug(supabase, slug)
})

/**
 * F5-B W2.2 — PDP kanonik çözümü: AİLE detayı (aile + aktif varyantlar).
 * RSC ağacında generateMetadata + Page aynı veriyi ister; React.cache tekilleştirir.
 *
 * T138 K1: bu sarmalayıcı hatayı YUTAR (null döner) ve bu, metadata için doğrudur —
 * başlık üretilemedi diye sayfa patlamamalı. Ama ROTA KARARI için yanlıştır: yutulmuş
 * hata "aile yok" gibi görünür ve zincirin sonunda 404'e dönüşür; yani geçici bir RPC
 * arızası kalıcı bir yokluk beyanı üretir. Rota katmanı bu yüzden `fetchFamilyDetail`i
 * (fırlatan sürüm) kullanır — aynı React.cache anahtarı, tek RPC çağrısı.
 */
const fetchFamilyDetail = cache(async (slug: string, lang: string) => {
  return getFamilyDetail(supabase, slug, lang)
})

export const getCachedFamilyDetail = cache(async (slug: string, lang: string) => {
  try {
    return await fetchFamilyDetail(slug, lang)
  } catch (e) {
    console.warn('getCachedFamilyDetail error:', e)
    return null
  }
})

/** Rota zinciri için: hata YUTULMAZ (bkz. `productRoute.ts` → `unavailable`). */
export const getFamilyDetailForRoute = fetchFamilyDetail

/**
 * T138 K1 — seri landing verisi (seri + model kartları). Hata yutulmaz;
 * `resolveProductRoute` onu `unavailable` sınıfına çevirir.
 */
export const getCachedSeriesLanding = cache(async (slug: string) => {
  return getSeriesLanding(supabase, slug)
})

/**
 * Varyant slug'ından aile slug'ına köprü — yalnız 308 yönlendirmesi için kullanılır
 * (products.slug DB'de kalır, 308 penceresi). Aile bulunamazsa null.
 */
export const getCachedFamilySlugById = cache(async (familyId: string) => {
  const { data, error } = await supabase
    .from('product_families')
    .select('slug')
    .eq('id', familyId)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data.slug
})

export function preloadFamily(slug: string, lang: string) {
  void getCachedFamilyDetail(slug, lang)
}

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

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { FamilyListItem } from '../../types/ui-models'

// F5-B W2.x — Aile (product_families) servis katmanı.
// Vitrin listeleri varyant satırı değil AİLE satırı tüketir (PS-041);
// veri kaynağı DB tarafındaki iki RPC'dir (20260812_f5b_family_rpcs.sql).

export interface GetFamiliesParams {
  categoryIds?: string[]
  searchQuery?: string
  brand?: string
  /** RPC tarafında 96'ya kadar kırpılır. */
  limit?: number
  offset?: number
}

export interface FamiliesPage {
  items: FamilyListItem[]
  /** Sayfalama toplamı (window count) — filtre setine göre toplam aile sayısı. */
  total: number
}

export async function getFamiliesEnriched(
  supabase: SupabaseClient<Database>,
  params: GetFamiliesParams = {}
): Promise<FamiliesPage> {
  const { data, error } = await supabase.rpc('get_product_families_enriched', {
    p_category_ids: params.categoryIds,
    p_limit: params.limit ?? 24,
    p_offset: params.offset ?? 0,
    p_search_query: params.searchQuery,
    p_brand: params.brand,
  })

  if (error) throw error
  const items = (data ?? []) as FamilyListItem[]
  return { items, total: items[0]?.total_count ?? 0 }
}

/** get_family_detail RPC'sinin 'variants' eleman modeli. */
export interface FamilyVariant {
  id: string
  sku: string
  name: string
  slug: string | null
  model_code: string | null
  price: number | null
  stock_qty: number | null
  technical_specs: Record<string, string | number | boolean | null> | null
  /** Dil çözülmüş açıklama (varyant → aile fallback'i RPC'de). */
  description: string | null
  images: { path: string; alt: string | null; sort_order: number }[]
}

export interface FamilyDetail {
  family: {
    id: string
    name: string
    slug: string
    series_code: string | null
    description: { tr?: string | null; en?: string | null } | null
    brand_name: string | null
    category_id: string | null
    subcategory_id: string | null
    meta_title: { tr?: string | null; en?: string | null } | null
    meta_description: { tr?: string | null; en?: string | null } | null
  }
  variants: FamilyVariant[]
  /**
   * W4b: gösterilen fiyatların KDV semantiği. Bireysel/anon brüt (KDV dahil), bayi/kurumsal
   * net görür — etiket buna göre çizilir. RPC kök düzeyinde döndürür; alan taşınmazsa PDP
   * fiyatının KDV durumu hakkında hiçbir bilgi kalmaz (regresyon).
   */
  price_tax_included: boolean | null
}

/**
 * RPC Json dönüşünü FamilyDetail'e daraltan runtime guard.
 * Şema RPC tarafında bizim kontrolümüzde (jsonb_build_object) — burada yalnız
 * sözleşmenin iskeletini (family objesi + variants dizisi) doğrularız.
 */
function parseFamilyDetail(data: unknown): FamilyDetail | null {
  if (typeof data !== 'object' || data === null) return null
  const obj = data as Record<string, unknown>
  const family = obj.family
  const variants = obj.variants
  if (typeof family !== 'object' || family === null || !Array.isArray(variants)) return null
  const taxIncluded = typeof obj.price_tax_included === 'boolean' ? obj.price_tax_included : null
  return { family, variants, price_tax_included: taxIncluded } as FamilyDetail
}

export async function getFamilyDetail(
  supabase: SupabaseClient<Database>,
  slug: string,
  lang: string
): Promise<FamilyDetail | null> {
  const { data, error } = await supabase.rpc('get_family_detail', {
    p_slug: slug,
    p_lang: lang,
  })

  if (error) throw error
  return parseFamilyDetail(data)
}

/**
 * Sitemap/statik üretim için aile slug listesi — boş aile (aktif varyantsız)
 * RPC tarafından zaten gizlenir; ayrı bir sorgu tutmamak için liste RPC'si kullanılır.
 */
export async function getAllFamilySlugs(
  supabase: SupabaseClient<Database>
): Promise<{ slug: string }[]> {
  const { items } = await getFamiliesEnriched(supabase, { limit: 96 })
  return items.map((f) => ({ slug: f.slug }))
}

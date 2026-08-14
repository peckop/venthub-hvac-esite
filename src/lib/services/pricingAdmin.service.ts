import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { PricingProductInput, PricingRuleRow } from './pricing.service'

/**
 * W3 · Admin marj kuralı servis katmanı (T001-VH).
 *
 * DI ZORUNLU (CLAUDE.md kural 2): her fonksiyonun İLK parametresi `supabase`.
 * Modül düzeyinde statik client importu YOK — ESLint `no-restricted-imports` + AST testi zorlar.
 *
 * Sınır: bu dosya SADECE veri erişimi + saf çevrimler yapar.
 * `mutateWithAudit` sarmalaması UI katmanının işidir (CouponsTableBody deseni) —
 * audit kaydı "kim, hangi ekrandan" bağlamını taşır, servis onu bilmez.
 *
 * Fiyat hesabı burada TEKRARLANMAZ: `pricing.service.ts` (SSOT) yeniden kullanılır.
 */

type PricingRuleInsert = Database['public']['Tables']['pricing_rule']['Insert']
type PricingRuleUpdate = Database['public']['Tables']['pricing_rule']['Update']

/**
 * Yazma payload'ı: `tenant_id` TİP DÜZEYİNDE dışlanır.
 * DB kolonu `default public.jwt_tenant_id()` taşır; panelden gönderilen tenant
 * (yanlış/eski değer) çapraz-tenant sızıntısı riskidir (CLAUDE.md §12).
 * Yapı > talimat: göndermeyi imkânsız kılıyoruz.
 */
export type PricingRuleCreateInput = Omit<PricingRuleInsert, 'tenant_id'>
export type PricingRuleUpdateInput = Omit<PricingRuleUpdate, 'tenant_id' | 'id'>

/** Kapsam örneklemesi için gerekli minimum ürün alanları. */
export interface ProductScopeRow {
  id: string
  name: string
  sku: string
  brand: string
  category_id: string | null
  cost_in_base: number | null
}

/** Örnek ürün = fiyat motoru girdisi + panelde gösterilecek kimlik alanları. */
export type SampleProduct = PricingProductInput & { name: string; sku: string }

/** Fiyat motorunun ürün girdisi için gereken SSOT kolon listesi (materialize servisi de bunu kullanır). */
export const PRODUCT_SCOPE_COLUMNS = 'id, name, sku, brand, category_id, cost_in_base'

/** Panelde tek seferde listelenen kural üst sınırı (kural sayısı düzinelerle ölçülür). */
export const PRICING_RULE_LIST_LIMIT = 500

/* ─────────────────────────── CRUD ─────────────────────────── */

/**
 * Kuralları merdiven sırasıyla listeler (scope ASC → priority DESC).
 * RLS admin-only: yetkisiz kullanıcı hata değil BOŞ liste görür — çağıran taraf
 * "veri yok" yanılgısını önlemek için rol kapısını ayrıca uygular.
 */
export async function listPricingRules(supabase: SupabaseClient<Database>): Promise<PricingRuleRow[]> {
  const { data, error } = await supabase
    .from('pricing_rule')
    .select('*')
    .order('scope', { ascending: true })
    .order('priority', { ascending: false })
    .limit(PRICING_RULE_LIST_LIMIT)
  if (error) throw error
  return data ?? []
}

/** Yeni kural. `tenant_id` GÖNDERİLMEZ (DB default'u yazar). */
export async function createPricingRule(
  supabase: SupabaseClient<Database>,
  input: PricingRuleCreateInput,
): Promise<PricingRuleRow> {
  const { data, error } = await supabase.from('pricing_rule').insert(input).select('*').single()
  if (error) throw error
  return data
}

/**
 * Kural güncelleme. Tabloda `updated_at` trigger'ı YOK → damga ELLE basılır;
 * `updated_by` çağırandan gelir (oturum sahibi), servis auth'a gitmez (DI saflığı).
 */
export async function updatePricingRule(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: PricingRuleUpdateInput,
  updatedBy: string | null,
): Promise<PricingRuleRow> {
  const payload: PricingRuleUpdateInput = {
    ...patch,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  }
  const { data, error } = await supabase
    .from('pricing_rule')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deletePricingRule(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await supabase.from('pricing_rule').delete().eq('id', id)
  if (error) throw error
}

/** Toplu silme (panelde yalnız onaylı akışta çağrılır). */
export async function deletePricingRules(supabase: SupabaseClient<Database>, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await supabase.from('pricing_rule').delete().in('id', ids)
  if (error) throw error
}

/* ──────────────────── marka köprüsü (KRİTİK) ──────────────────── */

/**
 * `products.brand_id` KOLONU YOKTUR — ürün markası `products.brand` (TEXT) alanında durur,
 * kural ise `brand_id` (FK) tutar. Bu köprü olmadan marka kuralları SESSİZCE hiç eşleşmez.
 * Dönen harita: marka ADI → brands.id.
 */
export async function loadBrandIdByName(supabase: SupabaseClient<Database>): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('brands').select('id, name')
  if (error) throw error
  const map = new Map<string, string>()
  for (const row of data ?? []) {
    map.set(row.name, row.id)
  }
  return map
}

/** Saf: ürün satırı → fiyat motoru girdisi (marka metni FK'ye köprülenir). */
export function toPricingProductInput(row: ProductScopeRow, brandIdByName: Map<string, string>): SampleProduct {
  return {
    id: row.id,
    brandId: brandIdByName.get(row.brand) ?? brandIdByName.get(row.brand.trim()) ?? null,
    categoryId: row.category_id ?? null,
    costInBase: row.cost_in_base ?? null,
    name: row.name,
    sku: row.sku,
  }
}

/* ──────────────────── kapsam (etki paneli) ──────────────────── */

async function brandNameById(supabase: SupabaseClient<Database>, brandId: string): Promise<string | null> {
  const { data, error } = await supabase.from('brands').select('name').eq('id', brandId).maybeSingle()
  if (error) throw error
  return data?.name ?? null
}

/**
 * Kategori kuralı ata-cascade ile çalışır (resolvePrice §11) → kapsam sayısı da
 * alt kategorileri İÇERMELİDİR, yoksa panel gerçeğin altında sayı gösterir.
 */
async function categoryIdsWithDescendants(
  supabase: SupabaseClient<Database>,
  rootId: string,
): Promise<string[]> {
  const { data, error } = await supabase.from('categories').select('id, parent_id')
  if (error) throw error
  const childrenOf = new Map<string, string[]>()
  for (const row of data ?? []) {
    if (!row.parent_id) continue
    const bucket = childrenOf.get(row.parent_id)
    if (bucket) bucket.push(row.id)
    else childrenOf.set(row.parent_id, [row.id])
  }
  const collected = new Set<string>([rootId])
  const queue: string[] = [rootId]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    for (const child of childrenOf.get(current) ?? []) {
      if (collected.has(child)) continue
      collected.add(child)
      queue.push(child)
    }
  }
  return [...collected]
}

/** Aktif (silinmemiş, yayında) ürünler — kapsam ölçümünün ortak tabanı. */
function activeProductsQuery(supabase: SupabaseClient<Database>) {
  return supabase.from('products').select(PRODUCT_SCOPE_COLUMNS).is('deleted_at', null).eq('status', 'active')
}

/** "Bu kural N aktif ürünü kapsıyor" sayacı. Hedef seçilmemişse 0. */
export async function countProductsInScope(
  supabase: SupabaseClient<Database>,
  scope: number,
  targetId: string | null,
): Promise<number> {
  const countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status', 'active')

  if (scope === 0 || scope === 1) {
    if (!targetId) return 0
    const { count, error } = await countQuery.eq('id', targetId)
    if (error) throw error
    return count ?? 0
  }
  if (scope === 2) {
    if (!targetId) return 0
    const name = await brandNameById(supabase, targetId)
    if (!name) return 0
    const { count, error } = await countQuery.eq('brand', name)
    if (error) throw error
    return count ?? 0
  }
  if (scope === 3) {
    if (!targetId) return 0
    const ids = await categoryIdsWithDescendants(supabase, targetId)
    const { count, error } = await countQuery.in('category_id', ids)
    if (error) throw error
    return count ?? 0
  }
  const { count, error } = await countQuery
  if (error) throw error
  return count ?? 0
}

/** Kapsamdan N örnek ürün (ÖNCE/SONRA fiyat karşılaştırması için). */
export async function sampleProductsInScope(
  supabase: SupabaseClient<Database>,
  scope: number,
  targetId: string | null,
  n = 3,
): Promise<SampleProduct[]> {
  let rows: ProductScopeRow[] = []

  if (scope === 0 || scope === 1) {
    if (!targetId) return []
    const { data, error } = await activeProductsQuery(supabase).eq('id', targetId).limit(n)
    if (error) throw error
    rows = data ?? []
  } else if (scope === 2) {
    if (!targetId) return []
    const name = await brandNameById(supabase, targetId)
    if (!name) return []
    const { data, error } = await activeProductsQuery(supabase).eq('brand', name).limit(n)
    if (error) throw error
    rows = data ?? []
  } else if (scope === 3) {
    if (!targetId) return []
    const ids = await categoryIdsWithDescendants(supabase, targetId)
    const { data, error } = await activeProductsQuery(supabase).in('category_id', ids).limit(n)
    if (error) throw error
    rows = data ?? []
  } else {
    const { data, error } = await activeProductsQuery(supabase).limit(n)
    if (error) throw error
    rows = data ?? []
  }

  const brandIdByName = await loadBrandIdByName(supabase)
  return rows.map((row) => toPricingProductInput(row, brandIdByName))
}

/* ──────────────────── saf çevriciler ──────────────────── */

/**
 * Marj yüzdesi → katsayı (%40 → ×1,4).
 * `toFixed(4)` kalkanı float tuzağını keser: (1.4 − 1) × 100 = 40.000000000000006.
 */
export function marginPctToCoefficient(marginPct: number): number {
  if (!Number.isFinite(marginPct)) return Number.NaN
  return Number((1 + marginPct / 100).toFixed(4))
}

/** Katsayı → marj yüzdesi (×1,4 → %40). Kanonik saklama biçimi margin_pct'tir. */
export function coefficientToMarginPct(coefficient: number): number {
  if (!Number.isFinite(coefficient)) return Number.NaN
  return Number(((coefficient - 1) * 100).toFixed(4))
}

/**
 * @file Fiyat politikası katmanı — cetvel `docs/standards/pricing-standard.md` §8.2 + §8.3.
 *
 * KURAL ≠ POLİTİKA. `pricing_rule` fiyatın **nasıl hesaplanacağını** taşır. "Bu markanın
 * fiyatları kur değişiminden etkilenmesin" bir hesap yöntemi değil, bir **ayardır**.
 * `pricing_policy` bu ayarları aynı özgüllük merdiveniyle taşır.
 *
 * v1 KAPSAMI: yalnız `fx_lock` (fiyat dondurma). `display_currency` / `min_margin_pct`
 * bilerek yok — onları okuyan tüketici henüz yazılmadı ve bu depoda tam o hata tekrarlıyor
 * (`venthub_order_items` snapshot kolonları bir yıl boş durdu). Alan, tüketicisiyle gelir.
 *
 * NEDEN İKİ HALKA DA ATLAMAK ZORUNDA (cetvel §8.2). Yalnız materialize'i atlamak yetmez:
 * `refreshCostInBase` ertesi gün `cost_in_base`'i yeni kurla yazar ve sonraki herhangi bir
 * materialize (ya da elle "yeniden hesapla") fiyatı oynatır. Kilit, zincirin iki halkasında
 * da uygulanmazsa kilit değil gecikmedir.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import { scopeMatchesProduct } from './pricing.service'

export type PricingPolicyRow = Database['public']['Tables']['pricing_policy']['Row']

/** Politika çözümü için gereken en küçük ürün girdisi. */
export interface PolicyProductInput {
  id: string
  brandId?: string | null
  categoryId?: string | null
}

export interface FxLockDecision {
  /** Kur tazelemesi ve materialize bu ürünü ATLAMALI mı? */
  locked: boolean
  /** Kararı veren politika satırı (denetim izi). */
  policyId: string | null
  /** Kilidin dayandığı kur — "bu fiyat neden güncellenmedi" sorusunun cevabı. */
  frozenRate: number | null
  scope: number | null
}

const UNLOCKED: FxLockDecision = { locked: false, policyId: null, frozenRate: null, scope: null }

/**
 * Merdiven sıralaması: scope ASC (en özel önce) → priority DESC → id DESC.
 *
 * `sortRules`'un politika karşılığı. Kural-özel alanlar (`price_book_id`, `min_quantity`)
 * politikada YOK, o yüzden aynı fonksiyon değil — ama aynı ilkeyi izler ve hedef eşleşmesi
 * için ortak `scopeMatchesProduct` kullanılır (cetvel §8.3: *ikinci bir öncelik mantığı icat
 * edilmez*). Bekçisi INV-PRICE-7.
 */
export function sortPolicies(policies: readonly PricingPolicyRow[]): PricingPolicyRow[] {
  return [...policies].sort((a, b) => {
    if (a.scope !== b.scope) return a.scope - b.scope
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.id.localeCompare(a.id)
  })
}

/** Saf çekirdek: veri çekmez, verilen havuzdan karar üretir. */
export function resolveFxLockWithPolicies(
  product: PolicyProductInput,
  policies: readonly PricingPolicyRow[],
  categoryAncestors: ReadonlySet<string>,
): FxLockDecision {
  const candidates = policies.filter(
    (p) =>
      p.is_active &&
      scopeMatchesProduct(p, { id: product.id, brandId: product.brandId ?? null }, categoryAncestors),
  )
  if (candidates.length === 0) return UNLOCKED

  // En özel eşleşme kazanır — `fx_lock=false` bir politika, daha genel bir kilidi BOZAR.
  // Bu bilinçli: "global kilit ama şu ürün hariç" ifade edilebilmeli. Belirleyici olan
  // kilidin havuzda bulunması değil, en özel politikanın DEĞERİdir.
  const winner = sortPolicies(candidates)[0]
  if (!winner.fx_lock) return UNLOCKED

  const rate = winner.fx_frozen_rate == null ? null : Number(winner.fx_frozen_rate)
  return {
    locked: true,
    policyId: winner.id,
    frozenRate: rate != null && Number.isFinite(rate) ? rate : null,
    scope: winner.scope,
  }
}

/**
 * Aktif politika havuzunu TEK sorguda çeker.
 *
 * Ayrı export, çünkü `materializePrices` ürünleri SAYFALAYARAK dolaşıyor ve kendi kategori
 * ata-zincirini zaten kurmuş durumda; oraya `resolveFxLocks` çağırmak sayfa başına bir
 * `pricing_policy` + bir `categories` sorgusu daha eklerdi. Havuzu bir kez çekip saf
 * çekirdeği (`resolveFxLockWithPolicies`) çağırmak aynı kararı sıfır ek sorguyla verir.
 */
export async function fetchActivePolicies(
  supabase: SupabaseClient<Database>,
): Promise<PricingPolicyRow[]> {
  const { data, error } = await supabase.from('pricing_policy').select('*').eq('is_active', true)
  if (error) throw error
  return (data ?? []) as PricingPolicyRow[]
}

/**
 * Kategori ata-zincirleri (scope 3 cascade). Havuzda hiç scope-3 politika yoksa
 * `categories` HİÇ sorgulanmaz.
 */
async function buildCategoryAncestors(
  supabase: SupabaseClient<Database>,
  products: readonly PolicyProductInput[],
  policies: readonly PricingPolicyRow[],
): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>()
  if (!policies.some((p) => p.scope === 3)) return result

  const { data: cats } = await supabase.from('categories').select('id, parent_id')
  const parentOf = new Map<string, string | null>()
  for (const c of (cats ?? []) as { id: string; parent_id: string | null }[]) parentOf.set(c.id, c.parent_id)

  for (const p of products) {
    const set = new Set<string>()
    if (p.categoryId) {
      set.add(p.categoryId)
      let cursor: string | null | undefined = parentOf.get(p.categoryId)
      for (let depth = 0; cursor && depth < 10; depth++) {
        set.add(cursor)
        cursor = parentOf.get(cursor)
      }
    }
    result.set(p.id, set)
  }
  return result
}

/**
 * Ürün kümesi için fx-kilidi kararlarını TEK sorguda çözer (DI: ilk parametre client).
 *
 * Toplu çalışan iki çağıran var (`refreshCostInBase`, `materializePrices`) ve ikisi de
 * yüzlerce ürün dolaşıyor; ürün başına sorgu N+1 üretirdi.
 */
export async function resolveFxLocks(
  supabase: SupabaseClient<Database>,
  products: readonly PolicyProductInput[],
): Promise<Map<string, FxLockDecision>> {
  const out = new Map<string, FxLockDecision>()
  if (products.length === 0) return out

  const policies = await fetchActivePolicies(supabase)

  // Hiç politika yoksa hiçbir şey kilitli değildir — kategori sorgusu bile yapılmaz.
  if (policies.length === 0) {
    for (const p of products) out.set(p.id, UNLOCKED)
    return out
  }

  const ancestorsByProduct = await buildCategoryAncestors(supabase, products, policies)
  for (const p of products) {
    out.set(p.id, resolveFxLockWithPolicies(p, policies, ancestorsByProduct.get(p.id) ?? new Set()))
  }
  return out
}

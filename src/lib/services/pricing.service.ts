import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { Product } from '../../types/ui-models'

export type PricingRuleRow = Database['public']['Tables']['pricing_rule']['Row']

export type UserRole = 'individual' | 'dealer' | 'corporate' | 'admin'

export interface UserProfileLight {
  id: string
  role?: UserRole | null
  organization_id?: string | null
}

export interface OrganizationLight {
  id: string
  tier_level?: number | null
}

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Retrieves the effective unit price for a given product by evaluating user roles,
 * active price lists, and any applicable discounts.
 *
 * @param supabase - The active Supabase client instance.
 * @param product - The product object containing base price information.
 * @returns The resolved unit price as a number.
 */
export async function getEffectiveUnitPrice(supabase: SupabaseClient<Database>, product: Product): Promise<number> {
  const info = await getEffectivePriceInfo(supabase, product)
  return info.unitPrice
}

/**
 * Determines the most applicable pricing information for a product based on the current user's role.
 * It queries active price lists sorted by effective dates and applies the best valid price or discount.
 * If no matching price list is found or an error occurs, it returns a fallback based on the product's default price.
 *
 * @param supabase - The active Supabase client instance.
 * @param product - The product for which to determine the price.
 * @returns An object containing the calculated unit price and the ID of the applied price list (if any).
 */
export async function getEffectivePriceInfo(
  supabase: SupabaseClient<Database>,
  product: Product
): Promise<{ unitPrice: number, priceListId: string | null }> {
  const fallback = (() => {
    const v = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0))
    return Number.isFinite(v) ? v : 0
  })()

  try {
    const { data: authData, error: userErr } = await supabase.auth.getUser()
    const user = userErr ? null : authData?.user

    if (!user) return { unitPrice: fallback, priceListId: null }

    const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profErr) return { unitPrice: fallback, priceListId: null }

    const profile = (prof || {}) as UserProfileLight
    const role = (profile.role || 'individual') as UserRole

    const now = nowIso()
    const { data: lists, error: listErr } = await supabase
      .from('price_lists')
      .select('id, user_type, effective_from')
      .eq('is_active', true)
      .lte('effective_from', now)
      .or(`effective_to.is.null,effective_to.gte.${now}`)

    if (listErr || !Array.isArray(lists)) return { unitPrice: fallback, priceListId: null }

    interface PriceListRow { 
      id: string; 
      user_type: string | null; 
      effective_from: string | null;
    }

    const typedLists: PriceListRow[] = lists
    
    // Filter and sort lists
    const matchedLists = typedLists.filter(list => {
      let match = false
      if (list.user_type === role) match = true
      if (!match && !list.user_type) match = true // fallback to default (no user_type)
      return match
    })

    const sorted = matchedLists.sort((a, b) => {
      // Prioritize specific user_type match over fallback
      if (!a.user_type !== !b.user_type) return a.user_type ? -1 : 1
      const aTime = a.effective_from ? new Date(a.effective_from).getTime() : 0
      const bTime = b.effective_from ? new Date(b.effective_from).getTime() : 0
      return bTime - aTime
    })

    const chosen = sorted.length > 0 ? sorted[0] : null

    // Try price lists in order: chosen, then fallback (null)
    const priceListIds = chosen ? [chosen.id, null] : [null]

    for (const plId of priceListIds) {
      let query = supabase
        .from('product_prices')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (plId === null) {
        query = query.is('price_list_id', null)
      } else {
        query = query.eq('price_list_id', plId)
      }

      const { data: rows, error: prErr } = await query
      if (prErr || !Array.isArray(rows) || rows.length === 0) continue

      const pick = rows.find(r => {
        const fromOk = !r.valid_from || new Date(r.valid_from).getTime() <= Date.now()
        const toOk = !r.valid_until || new Date(r.valid_until).getTime() >= Date.now()
        return fromOk && toOk
      }) || rows[0]

      const base = Number(pick.base_price || 0)
      const sale = pick.sale_price != null ? Number(pick.sale_price) : null
      const disc = Number(pick.discount_percentage || 0)

      if (sale != null && Number.isFinite(sale) && sale > 0) return { unitPrice: sale, priceListId: plId }
      if (Number.isFinite(base) && base > 0) {
        if (disc > 0) {
          const val = base * (1 - disc / 100)
          return { unitPrice: Math.max(0, Number(val.toFixed(2))), priceListId: plId }
        }
        return { unitPrice: base, priceListId: plId }
      }
    }

    return { unitPrice: fallback, priceListId: chosen ? chosen.id : null }
  } catch (e) {
    console.error('getEffectivePriceInfo error', e)
    return { unitPrice: fallback, priceListId: null }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// W1 · Marj kural motoru — resolvePrice (pricing-standard §11, T001-VH)
//
// Fiyat TÜRETİLİR: pricing_rule SSOT'tur, product_prices sadece materialize cache.
// Merdiven: scope 0 varyant · 1 ürün · 2 marka · 3 kategori (ata-cascade) · 4 global;
// en-özel-kazanır + SAP stop-at-first-hit. Segment kitabı (price_book_id) W2'de
// org/tier_level'dan bağlanır — segment için user_profiles.role OKUNMAZ (INV-PRICE-2);
// bağlam çağırandan gelir. pricing_rule RLS admin-only'dir: motor admin/service
// bağlamında koşar, storefront yalnız cache okur.
// ─────────────────────────────────────────────────────────────────────────────

export interface PricingProductInput {
  id: string
  brandId?: string | null
  categoryId?: string | null
  /** Donmuş TL maliyet (products.cost_in_base). null → yalnız 'fixed' kural fiyatlayabilir. */
  costInBase?: number | null
}

export interface PricingContext {
  /** Segment kitabı (price_lists.id). W1'de null = base kitap; W2 org/tier bağlar. */
  priceBookId?: string | null
  quantity?: number
  /** Hedef para birimi; TRY dışıysa en güncel gösterim kuruyla çevrilir. */
  currency?: string
  /** ISO tarih (YYYY-MM-DD); test edilebilirlik için enjekte edilebilir. */
  today?: string
}

export interface ResolvedPrice {
  net: number
  gross: number
  currency: string
  vatRatePct: number
  ruleId: string
  ruleScope: number
}

export interface PriceResolution {
  /** null = fiyatlanamaz → "Teklif Alın" (maliyet yok / kural yok / kur yok). */
  price: ResolvedPrice | null
  /** "Hangi kural neden kazandı" izi — admin debug + güven (cetvel §11 zorunluluğu). */
  trace: string[]
}

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return value
  return Number((Math.round(value / step) * step).toFixed(6))
}

function round2(value: number): number {
  return Number(value.toFixed(2))
}

/** Kural, ürün hedefine uyar mı? (scope↔hedef; kategori ata-cascade destekler) */
export function ruleMatchesProduct(
  rule: PricingRuleRow,
  product: PricingProductInput,
  categoryAncestors: ReadonlySet<string>,
): boolean {
  switch (rule.scope) {
    case 0:
    case 1:
      return rule.product_id === product.id
    case 2:
      return rule.brand_id != null && rule.brand_id === product.brandId
    case 3:
      return rule.category_id != null && categoryAncestors.has(rule.category_id)
    case 4:
      return true
    default:
      return false
  }
}

/** Cetvel §11 sıralaması: scope ASC → kitap-özgüllüğü → min_quantity DESC → priority DESC → id DESC. */
export function sortRules(rules: PricingRuleRow[], priceBookId: string | null): PricingRuleRow[] {
  const bookRank = (r: PricingRuleRow): number => (r.price_book_id === priceBookId && priceBookId !== null ? 0 : 1)
  return [...rules].sort((a, b) => {
    if (a.scope !== b.scope) return a.scope - b.scope
    if (bookRank(a) !== bookRank(b)) return bookRank(a) - bookRank(b)
    if (a.min_quantity !== b.min_quantity) return b.min_quantity - a.min_quantity
    if (a.priority !== b.priority) return b.priority - a.priority
    return b.id.localeCompare(a.id)
  })
}

/**
 * Tek kuraldan net/gross hesabı (KDV + kelepçe + yuvarlama dahil). Hesaplanamazsa null.
 * 'percent_off_list' W1'de bilinçli kapsam dışı (liste-fiyat altyapısı W2) — null döner.
 */
export function computePriceFromRule(
  rule: PricingRuleRow,
  costInBase: number | null,
  trace: string[],
): { net: number; gross: number } | null {
  let p: number
  if (rule.method === 'cost_plus') {
    if (costInBase == null || rule.margin_pct == null) return null
    p = costInBase * (1 + rule.margin_pct / 100)
  } else if (rule.method === 'fixed') {
    if (rule.fixed_price == null) return null
    p = rule.fixed_price
  } else {
    trace.push(`kural ${rule.id}: method '${rule.method}' W1 kapsamı dışı — atlandı`)
    return null
  }
  p += rule.surcharge

  // Marj kelepçesi (mutlak TL) — yalnız maliyet biliniyorsa anlamlı
  if (costInBase != null) {
    const margin = p - costInBase
    if (rule.min_margin_abs != null && margin < rule.min_margin_abs) {
      p = costInBase + rule.min_margin_abs
      trace.push(`kural ${rule.id}: min marj kelepçesi uygulandı (${rule.min_margin_abs} TL)`)
    }
    if (rule.max_margin_abs != null && p - costInBase > rule.max_margin_abs) {
      p = costInBase + rule.max_margin_abs
      trace.push(`kural ${rule.id}: max marj kelepçesi uygulandı (${rule.max_margin_abs} TL)`)
    }
  }

  // KDV: NET kanonik saklanır; fixed kural KDV-dahil girildiyse net'e indirgenir
  const vatFactor = 1 + rule.vat_rate_pct / 100
  let net = rule.method === 'fixed' && rule.price_is_vat_inclusive ? p / vatFactor : p

  // Yuvarlama EN SON (cetvel §11): round_to net'e (varsayılan kuruş), charm gross'a
  net = roundToStep(net, rule.round_to ?? 0.01)
  let gross = round2(net * vatFactor)
  if (rule.charm_ending != null && rule.charm_ending >= 0 && rule.charm_ending < 1) {
    const charmed = Math.floor(gross) + rule.charm_ending
    gross = charmed > gross ? round2(charmed - 1) : round2(charmed)
    net = Number((gross / vatFactor).toFixed(4))
    trace.push(`kural ${rule.id}: charm uygulandı (,${String(rule.charm_ending).split('.')[1] ?? '0'})`)
  }

  if (!Number.isFinite(net) || net <= 0) return null
  return { net: Number(net.toFixed(4)), gross }
}

/**
 * Deterministik fiyat çözümü (cetvel §11). DI: ilk parametre SupabaseClient.
 * Kuralları çeker, merdivene göre sıralar, kazanan İLK hesaplanabilir kuralı uygular
 * (stop-at-first-hit; is_exclusive=false yığılması bilinçli W1 kapsamı dışı).
 */
export async function resolvePrice(
  supabase: SupabaseClient<Database>,
  product: PricingProductInput,
  context: PricingContext = {},
): Promise<PriceResolution> {
  const trace: string[] = []
  const qty = context.quantity ?? 1
  const currency = (context.currency ?? 'TRY').toUpperCase()
  const today = context.today ?? new Date().toISOString().slice(0, 10)
  const priceBookId = context.priceBookId ?? null
  const cost = product.costInBase ?? null
  trace.push(`girdi: ürün=${product.id} adet=${qty} para=${currency} kitap=${priceBookId ?? 'base'} maliyet=${cost ?? 'YOK'}`)

  const { data: ruleRows, error: rulesError } = await supabase.from('pricing_rule').select('*')
  if (rulesError) {
    trace.push(`pricing_rule okunamadı: ${rulesError.message}`)
    return { price: null, trace }
  }
  const allRules = (ruleRows ?? []) as PricingRuleRow[]
  trace.push(`kural havuzu: ${allRules.length}`)

  // Kategori ata-zinciri (scope 3 cascade) — yalnız gerektiğinde çekilir
  const categoryAncestors = new Set<string>()
  if (product.categoryId && allRules.some(r => r.scope === 3)) {
    categoryAncestors.add(product.categoryId)
    const { data: cats } = await supabase.from('categories').select('id, parent_id')
    const parentOf = new Map<string, string | null>()
    for (const c of (cats ?? []) as { id: string; parent_id: string | null }[]) parentOf.set(c.id, c.parent_id)
    let cursor: string | null | undefined = parentOf.get(product.categoryId)
    for (let depth = 0; cursor && depth < 10; depth++) {
      categoryAncestors.add(cursor)
      cursor = parentOf.get(cursor)
    }
  }

  const candidates = allRules.filter(rule =>
    (rule.price_book_id === null || rule.price_book_id === priceBookId) &&
    (rule.currency === null || rule.currency.toUpperCase() === currency) &&
    rule.min_quantity <= qty &&
    (rule.valid_from === null || rule.valid_from <= today) &&
    (rule.valid_to === null || rule.valid_to >= today) &&
    ruleMatchesProduct(rule, product, categoryAncestors),
  )
  trace.push(`eşleşen aday: ${candidates.length}`)
  if (candidates.length === 0) {
    trace.push('sonuç: kural yok → Teklif Alın')
    return { price: null, trace }
  }

  for (const rule of sortRules(candidates, priceBookId)) {
    const computed = computePriceFromRule(rule, cost, trace)
    if (!computed) continue
    trace.push(
      `KAZANAN: kural ${rule.id} (scope=${rule.scope} method=${rule.method}` +
        (rule.margin_pct != null ? ` marj=%${rule.margin_pct}` : '') +
        ` öncelik=${rule.priority}) → net ${computed.net} TRY`,
    )

    let { net, gross } = computed
    if (currency !== 'TRY') {
      // Gösterim çevirisi: en güncel kur (effective_date ≤ bugün; currency_rates append-only)
      const { data: rates } = await supabase
        .from('currency_rates')
        .select('rate, effective_date')
        .eq('quote_ccy', currency)
        .lte('effective_date', today)
        .order('effective_date', { ascending: false })
        .order('fetched_at', { ascending: false })
        .limit(1)
      const rate = rates && rates.length > 0 ? Number(rates[0].rate) : null
      if (!rate || !Number.isFinite(rate) || rate <= 0) {
        trace.push(`sonuç: ${currency} kuru yok → Teklif Alın`)
        return { price: null, trace }
      }
      net = Number((net / rate).toFixed(4))
      gross = round2(gross / rate)
      trace.push(`gösterim çevirisi: TRY→${currency} kur=${rate} (${rates?.[0]?.effective_date})`)
    }

    return {
      price: { net, gross, currency, vatRatePct: rule.vat_rate_pct, ruleId: rule.id, ruleScope: rule.scope },
      trace,
    }
  }

  trace.push('sonuç: hesaplanabilir kural yok → Teklif Alın')
  return { price: null, trace }
}

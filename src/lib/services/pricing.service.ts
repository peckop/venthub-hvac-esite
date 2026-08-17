import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import type { Product } from '../../types/ui-models'

export type PricingRuleRow = Database['public']['Tables']['pricing_rule']['Row']

export type UserRole = 'individual' | 'dealer' | 'corporate' | 'admin'

export interface OrganizationLight {
  id: string
  tier_level?: number | null
}

export type PriceSegment = 'individual' | 'dealer' | 'corporate'

/**
 * Fiyat segmenti kaynağı = JWT `app_metadata.price_segment` (W2 tek sözleşme).
 * Profil rolü/kullanıcı-düzenleyebilir metadata OKUNMAZ (CLAUDE.md §12, INV-PRICE-2).
 * Claim atanmamışsa güvenli varsayılan: 'individual' (public fiyat) — bayi/kurumsal
 * ataması admin tarafından yapılır; RLS tarafındaki eşi `public.jwt_price_segment()`.
 */
export function getUserPriceSegment(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
): PriceSegment {
  const raw = user?.app_metadata?.price_segment
  return raw === 'dealer' || raw === 'corporate' ? raw : 'individual'
}

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Ürünün etkin birim fiyatı. Fiyat çözülemezse `null` döner — 0 DEĞİL (W4b).
 *
 * @param supabase - The active Supabase client instance.
 * @param product - The product object containing base price information.
 * @returns Çözülen birim fiyat; fiyatlanamıyorsa null ("Teklif Alın").
 */
export async function getEffectiveUnitPrice(
  supabase: SupabaseClient<Database>,
  product: Product,
): Promise<number | null> {
  const info = await getEffectivePriceInfo(supabase, product)
  return info.unitPrice
}

/**
 * Determines the most applicable pricing information for a product based on the current user's role.
 * It queries active price lists sorted by effective dates and applies the best valid price or discount.
 *
 * W4b (T001-VH): ham `products.price` FALLBACK'İ KALDIRILDI. O kolon Kademe-2'de emekli
 * edildi ve 374 üründe NULL — ona düşmek sepete/ödemeye sessizce 0 TL yazıyordu. Fiyat
 * çözülemiyorsa artık AÇIKÇA "fiyat yok" döner; "fiyat yok" ile "sıfır fiyat" birbirine
 * karıştırılamaz. Çağıran taraf null'ı "Teklif Alın" gösterir, toplama katmaz, ödemeye sokmaz.
 *
 * @param supabase - The active Supabase client instance.
 * @param product - The product for which to determine the price.
 * @returns An object containing the calculated unit price and the ID of the applied price list (if any).
 */
export interface EffectivePriceInfo {
  /** null = fiyat çözülemedi → "Teklif Alın". ASLA 0'a düşürülmez. */
  unitPrice: number | null
  priceListId: string | null
  /**
   * unitPrice'ın KDV semantiği: true = KDV dahil (B2C gross), false = KDV hariç (B2B net),
   * null = bilinmiyor (legacy sale/base_price yolu). Denetim bulgusu:
   * segment-bağımlı semantik taşıyıcı bayrak olmadan sipariş hattında çift-KDV riski yaratır.
   */
  taxIncluded: boolean | null
}

export async function getEffectivePriceInfo(
  supabase: SupabaseClient<Database>,
  product: Product
): Promise<EffectivePriceInfo> {
  /** Tek "fiyat yok" çıkışı — her çağrıda taze nesne (paylaşılan referans mutasyonu olmasın). */
  const unpriced = (): EffectivePriceInfo => ({ unitPrice: null, priceListId: null, taxIncluded: null })

  try {
    // W2 tek sözleşme: user → app_metadata.price_segment → price_list → product_prices → (yoksa) null.
    // Anonim kullanıcı da 'individual' segmentiyle public liste fiyatını görür (RLS zaten kısıtlar).
    const { data: authData, error: userErr } = await supabase.auth.getUser()
    const user = userErr ? null : authData?.user
    const segment = getUserPriceSegment(user)

    const now = nowIso()
    const { data: lists, error: listErr } = await supabase
      .from('price_lists')
      .select('id, user_type, effective_from')
      .eq('is_active', true)
      .lte('effective_from', now)
      .or(`effective_to.is.null,effective_to.gte.${now}`)

    // Liste okunamadıysa fiyat bilinmiyordur — ham fiyata düşmek yerine "Teklif Alın".
    if (listErr || !Array.isArray(lists)) return unpriced()

    interface PriceListRow { 
      id: string; 
      user_type: string | null; 
      effective_from: string | null;
    }

    const typedLists: PriceListRow[] = lists
    
    // Filter and sort lists
    const matchedLists = typedLists.filter(list => {
      let match = false
      if (list.user_type === segment) match = true
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

    // W4b: `price_list_id IS NULL` turu ÖLÜ daldı — canlı şemada kolon NOT NULL
    // (dealer_layer_baseline), yani o sorgu her zaman 0 satır dönüp her sepet
    // mutasyonunda ürün başına boş bir round-trip üretiyordu. Segmentine uyan aktif
    // liste yoksa ürün doğrudan "Teklif Alın"a düşer.
    const priceListIds = chosen ? [chosen.id] : []

    for (const plId of priceListIds) {
      let query = supabase
        .from('product_prices')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        // Sepet/ödeme hattı TL çalışır. Bu koşul olmadan çok para birimli satır geldiğinde
        // rastgele biri (ör. EUR net) seçilip TL sanılıyordu — tutar sessizce bozuluyordu.
        .eq('currency', 'TRY')

      query = query.eq('price_list_id', plId)

      const { data: rows, error: prErr } = await query
      if (prErr || !Array.isArray(rows) || rows.length === 0) continue

      const pick = rows.find(r => {
        const fromOk = !r.valid_from || new Date(r.valid_from).getTime() <= Date.now()
        const toOk = !r.valid_until || new Date(r.valid_until).getTime() >= Date.now()
        return fromOk && toOk
      }) || rows[0]

      // W2 cache sözleşmesi: motor materialize çıktısı varsa o kazanır —
      // B2C (individual) KDV-dahil gross, B2B (dealer/corporate) KDV-hariç net (cetvel §5).
      // (W4b: tipler yeniden üretildi; net_price/gross_price artık doğrudan okunur.)
      const derivedNet = pick.net_price != null ? Number(pick.net_price) : null
      const derivedGross = pick.gross_price != null ? Number(pick.gross_price) : null
      const derived = segment === 'individual' ? (derivedGross ?? derivedNet) : (derivedNet ?? derivedGross)
      if (derived != null && Number.isFinite(derived) && derived > 0) {
        const usedGross = segment === 'individual' ? derivedGross != null : derivedNet == null
        return { unitPrice: derived, priceListId: plId, taxIncluded: usedGross }
      }

      const base = Number(pick.base_price || 0)
      const sale = pick.sale_price != null ? Number(pick.sale_price) : null
      const disc = Number(pick.discount_percentage || 0)

      if (sale != null && Number.isFinite(sale) && sale > 0) return { unitPrice: sale, priceListId: plId, taxIncluded: null }
      if (Number.isFinite(base) && base > 0) {
        if (disc > 0) {
          const val = base * (1 - disc / 100)
          return { unitPrice: Math.max(0, Number(val.toFixed(2))), priceListId: plId, taxIncluded: null }
        }
        return { unitPrice: base, priceListId: plId, taxIncluded: null }
      }
    }

    // Hiçbir listede geçerli cache satırı yok → ürün fiyatlanamıyor ("Teklif Alın").
    // priceListId de null bırakılır: fiyatı olmayan kaleme liste iliştirmek yanıltıcıdır.
    return unpriced()
  } catch (e) {
    console.error('getEffectivePriceInfo error', e)
    return unpriced()
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

/**
 * Özgüllük merdiveninin HEDEF EŞLEŞMESİ — tek yer.
 *
 * `pricing_rule` (fiyat NASIL hesaplanır) ve `pricing_policy` (hangi AYAR geçerli) aynı
 * merdiveni kullanır: scope 0 varyant · 1 ürün · 2 marka · 3 kategori · 4 global.
 * Cetvel §8.3 bunu açıkça şart koşuyor: *"Merdiven §3.1 ile birebir aynıdır — ikinci bir
 * öncelik mantığı icat edilmez."*
 *
 * Bu yüzden eşleşme satır TİPİNDEN bağımsız, ortak bir alan üçlüsü üzerinden yapılır. İki
 * tablo için iki kopya yazmak, ikisinin bir gün ayrışacağı anlamına gelirdi — ve ayrıştığı
 * gün "kural bu ürüne uyuyor ama politika uymuyor" gibi teşhisi zor bir durum doğardı.
 * Bekçisi: INV-PRICE-7.
 */
export interface ScopedTarget {
  scope: number
  product_id: string | null
  brand_id: string | null
  category_id: string | null
}

/**
 * Evaluates whether a pricing scope configuration matches a given product.
 * Supports exact product, brand, and hierarchical category matching.
 *
 * @param row - The scope configuration containing the target IDs and scope level (0-4)
 * @param product - The product attributes to match against
 * @param categoryAncestors - A set containing the IDs of all ancestor categories for the product
 * @returns True if the product satisfies the scope conditions, false otherwise
 *
 * @example
 * scopeMatchesProduct({ scope: 1, product_id: 'p1', brand_id: null, category_id: null }, { id: 'p1', brandId: null, categoryId: null }, new Set()) // returns true
 */
export function scopeMatchesProduct(
  row: ScopedTarget,
  product: PricingProductInput,
  categoryAncestors: ReadonlySet<string>,
): boolean {
  switch (row.scope) {
    case 0:
    case 1:
      return row.product_id === product.id
    case 2:
      return row.brand_id != null && row.brand_id === product.brandId
    case 3:
      return row.category_id != null && categoryAncestors.has(row.category_id)
    case 4:
      return true
    default:
      return false
  }
}

/** Kural, ürün hedefine uyar mı? (scope↔hedef; kategori ata-cascade destekler) */
export function ruleMatchesProduct(
  rule: PricingRuleRow,
  product: PricingProductInput,
  categoryAncestors: ReadonlySet<string>,
): boolean {
  return scopeMatchesProduct(rule, product, categoryAncestors)
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
 * resolvePriceWithRules'a girdi: dış-dünya (DB) sorgularının SONUCU — çağıran
 * (resolvePrice veya materializePrices) verileri bir kez çeker, saf çekirdeğe verir.
 * SAF: içeride DB erişimi / yan etki YOK, aynı girdi → aynı çıktı (test edilebilirlik + W3 toplu-hesap).
 */
export interface RuleEvaluationInputs {
  rules: PricingRuleRow[]
  categoryAncestors: ReadonlySet<string>
  /** currency !== 'TRY' ise gösterim kuru; TRY için null. */
  fxRate: { rate: number; effectiveDate: string } | null
}

/**
 * Fiyat çözümünün SAF çekirdeği (cetvel §11). DB erişimi yok — kural havuzu,
 * kategori ata-kümesi ve (gerekiyorsa) gösterim kuru çağırandan `inputs` ile gelir.
 * Kuralları merdivene göre sıralar, kazanan İLK hesaplanabilir kuralı uygular
 * (stop-at-first-hit; is_exclusive=false yığılması bilinçli W1 kapsamı dışı).
 */
export function resolvePriceWithRules(
  product: PricingProductInput,
  context: PricingContext,
  inputs: RuleEvaluationInputs,
): PriceResolution {
  const trace: string[] = []
  const qty = context.quantity ?? 1
  const currency = (context.currency ?? 'TRY').toUpperCase()
  const today = context.today ?? new Date().toISOString().slice(0, 10)
  const priceBookId = context.priceBookId ?? null
  const cost = product.costInBase ?? null
  trace.push(`girdi: ürün=${product.id} adet=${qty} para=${currency} kitap=${priceBookId ?? 'base'} maliyet=${cost ?? 'YOK'}`)

  const allRules = inputs.rules
  trace.push(`kural havuzu: ${allRules.length}`)

  const candidates = allRules.filter(rule =>
    (rule.price_book_id === null || rule.price_book_id === priceBookId) &&
    (rule.currency === null || rule.currency.toUpperCase() === currency) &&
    rule.min_quantity <= qty &&
    (rule.valid_from === null || rule.valid_from <= today) &&
    (rule.valid_to === null || rule.valid_to >= today) &&
    ruleMatchesProduct(rule, product, inputs.categoryAncestors),
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
      // Gösterim çevirisi: kur çağırandan gelir (TRY için asla sorgulanmaz).
      const fx = inputs.fxRate
      if (!fx) {
        trace.push(`sonuç: ${currency} kuru yok → Teklif Alın`)
        return { price: null, trace }
      }
      net = Number((net / fx.rate).toFixed(4))
      gross = round2(gross / fx.rate)
      trace.push(`gösterim çevirisi: TRY→${currency} kur=${fx.rate} (${fx.effectiveDate})`)
    }

    return {
      price: { net, gross, currency, vatRatePct: rule.vat_rate_pct, ruleId: rule.id, ruleScope: rule.scope },
      trace,
    }
  }

  trace.push('sonuç: hesaplanabilir kural yok → Teklif Alın')
  return { price: null, trace }
}

/**
 * Deterministik fiyat çözümü (cetvel §11). DI: ilk parametre SupabaseClient.
 * İNCE SARMALAYICI: veriyi çeker (pricing_rule, gerekiyorsa categories, currency !== 'TRY'
 * ise currency_rates) ve saf çekirdek `resolvePriceWithRules`'a delege eder — hesap mantığı
 * burada TEKRARLANMAZ.
 */
export async function resolvePrice(
  supabase: SupabaseClient<Database>,
  product: PricingProductInput,
  context: PricingContext = {},
): Promise<PriceResolution> {
  const qty = context.quantity ?? 1
  const currency = (context.currency ?? 'TRY').toUpperCase()
  const today = context.today ?? new Date().toISOString().slice(0, 10)
  const priceBookId = context.priceBookId ?? null
  const cost = product.costInBase ?? null

  const { data: ruleRows, error: rulesError } = await supabase.from('pricing_rule').select('*')
  if (rulesError) {
    // Çekirdek çağrılmadan erken çıkış — 'girdi:' satırı yine de üretilir (trace birebir aynı kalır).
    return {
      price: null,
      trace: [
        `girdi: ürün=${product.id} adet=${qty} para=${currency} kitap=${priceBookId ?? 'base'} maliyet=${cost ?? 'YOK'}`,
        `pricing_rule okunamadı: ${rulesError.message}`,
      ],
    }
  }
  const allRules = (ruleRows ?? []) as PricingRuleRow[]

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

  // Gösterim kuru: TRY dışıysa önce çekilip çekirdeğe verilir; TRY için HİÇ sorgulanmaz.
  let fxRate: RuleEvaluationInputs['fxRate'] = null
  if (currency !== 'TRY') {
    const { data: rates } = await supabase
      .from('currency_rates')
      .select('rate, effective_date')
      .eq('quote_ccy', currency)
      .lte('effective_date', today)
      .order('effective_date', { ascending: false })
      .order('fetched_at', { ascending: false })
      .limit(1)
    const rateRow = rates && rates.length > 0 ? rates[0] : null
    const rate = rateRow ? Number(rateRow.rate) : null
    if (rateRow && rate && Number.isFinite(rate) && rate > 0) {
      fxRate = { rate, effectiveDate: rateRow.effective_date }
    }
  }

  return resolvePriceWithRules(product, context, { rules: allRules, categoryAncestors, fxRate })
}

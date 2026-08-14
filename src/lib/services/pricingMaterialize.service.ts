import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import { type PricingRuleRow, resolvePriceWithRules, type RuleEvaluationInputs } from './pricing.service'
import {
  loadBrandIdByName,
  PRODUCT_SCOPE_COLUMNS,
  type ProductScopeRow,
  toPricingProductInput,
} from './pricingAdmin.service'

/**
 * W1b · Materialize servisi (T001-VH).
 *
 * Fiyat TÜRETİLİR: pricing_rule SSOT'tur (pricing.service.ts). Bu dosya iki bağımsız
 * arka-plan işi sunar:
 *  - refreshCostInBase: products.cost_in_base'i güncel TCMB efektif satış kuruyla tazeler
 *    (katalog fiyatları EUR/… cinsinden LİSTE fiyatıdır, kur her gün değişir).
 *  - materializePrices: aktif ürün × aktif fiyat listesi (segment) için resolvePriceWithRules'ı
 *    SAF çağırır ve sonucu product_prices'a cache olarak yazar (vitrin bu cache'i okur).
 *
 * DI ZORUNLU (CLAUDE.md kural 2): her fonksiyonun İLK parametresi `supabase`.
 * Modül düzeyinde statik client importu YOK.
 */

/** Materialize edilen satırların sabit `valid_from` sentinel'i — yeniden-hesaplama aynı
 *  satırı günceller (onConflict: product_id,price_list_id,valid_from), tekrar tekrar satır üretmez. */
export const DERIVED_VALID_FROM = '2026-01-01T00:00:00.000Z'

export interface CostRefreshSummary {
  scanned: number
  updated: number
  skippedNoRate: number
  skippedNoPurchasePrice: number
  ratesUsed: { currency: string; rate: number; effectiveDate: string }[]
}

export interface MaterializeSampleRow {
  sku: string
  name: string
  userType: string
  net: number
  gross: number
  ruleId: string
}

export interface MaterializeSegmentSummary {
  priceListId: string
  userType: string
  priced: number
  quoteOnly: number
}

export interface MaterializeSummary {
  dryRun: boolean
  productsScanned: number
  /** EN AZ BİR segmentte fiyatlanan ürün sayısı (segment kırılımı için `bySegment`e bak —
   *  bir ürün individual'da fiyatlanıp dealer'da fiyatlanamayabilir, bu yüzden
   *  `pricedProducts + quoteOnlyProducts = productsScanned` ama segment toplamlarıyla eşit değildir). */
  pricedProducts: number
  /** HİÇBİR segmentte fiyatlanamayan ürün sayısı → vitrinde "Teklif Alın". */
  quoteOnlyProducts: number
  rowsUpserted: number
  /** Elle ezilmiş (`is_derived=false`) olduğu için DOKUNULMAYAN satır sayısı — cetvel §8.1/§8.2. */
  skippedManual: number
  /** Bu koşuda üretilmediği için pasifleştirilen bayat türetilmiş satır sayısı. */
  deactivated: number
  bySegment: MaterializeSegmentSummary[]
  samples: MaterializeSampleRow[]
  totalNetTry: number
}

export interface MaterializeOptions {
  dryRun?: boolean
  today?: string
  sampleSize?: number
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function round4(value: number): number {
  return Number(value.toFixed(4))
}

/** Maliyet tazelemesinde eşzamanlı PATCH sayısı (sıralı koşu yüzlerce round-trip demek). */
const COST_UPDATE_CONCURRENCY = 20

/**
 * `products.cost_in_base`'i (donmuş TL maliyet) tazeler. Katalog satın-alma fiyatı
 * (purchase_price) genelde EUR/USD LİSTE fiyatıdır; kur her gün değiştiği için
 * cost_in_base donuk kalamaz — bu fonksiyon TCMB efektif satış kuruyla TL'ye çevirir.
 *
 * Yalnız gerçekten DEĞİŞEN satırlar güncellenir (gereksiz yazma yapılmaz).
 * Varsayılan dryRun=true: açıkça `dryRun:false` verilmeden HİÇ yazma yapılmaz.
 */
export async function refreshCostInBase(
  supabase: SupabaseClient<Database>,
  options?: { dryRun?: boolean; today?: string },
): Promise<CostRefreshSummary> {
  const dryRun = options?.dryRun ?? true
  const today = options?.today ?? todayIso()

  const { data: productsData, error: productsErr } = await supabase
    .from('products')
    .select('id, purchase_price, purchase_currency, cost_in_base, purchase_rate_to_base')
    .is('deleted_at', null)
    .eq('status', 'active')
  if (productsErr) throw productsErr
  const products = productsData ?? []

  // Her para birimi için EN GÜNCEL kur bir kez çekilir (bellekte önbelleklenir).
  const rateByCcy = new Map<string, { rate: number; effectiveDate: string } | null>()
  const ratesUsed: CostRefreshSummary['ratesUsed'] = []

  async function getRateFor(ccyRaw: string): Promise<{ rate: number; effectiveDate: string } | null> {
    const ccy = ccyRaw.toUpperCase()
    if (rateByCcy.has(ccy)) return rateByCcy.get(ccy) ?? null

    if (ccy === 'TRY') {
      const val = { rate: 1, effectiveDate: today }
      rateByCcy.set(ccy, val)
      ratesUsed.push({ currency: ccy, rate: val.rate, effectiveDate: val.effectiveDate })
      return val
    }

    const { data: rates, error: ratesErr } = await supabase
      .from('currency_rates')
      .select('rate, effective_date')
      .eq('quote_ccy', ccy)
      .lte('effective_date', today)
      .order('effective_date', { ascending: false })
      .order('fetched_at', { ascending: false })
      .limit(1)
    if (ratesErr) throw ratesErr

    const row = rates && rates.length > 0 ? rates[0] : null
    const rate = row ? Number(row.rate) : null
    const val = rate != null && Number.isFinite(rate) && rate > 0 && row
      ? { rate, effectiveDate: row.effective_date }
      : null
    rateByCcy.set(ccy, val)
    if (val) ratesUsed.push({ currency: ccy, rate: val.rate, effectiveDate: val.effectiveDate })
    return val
  }

  let updated = 0
  let skippedNoRate = 0
  let skippedNoPurchasePrice = 0
  const toWrite: { id: string; costInBase: number; purchaseRateToBase: number }[] = []

  for (const p of products) {
    const purchasePrice = Number(p.purchase_price)
    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      skippedNoPurchasePrice++
      continue
    }

    const fx = await getRateFor(p.purchase_currency)
    if (!fx) {
      skippedNoRate++
      continue
    }

    const newCostInBase = round4(purchasePrice * fx.rate)
    const newRate = fx.rate
    const sameCost = p.cost_in_base != null && Math.abs(Number(p.cost_in_base) - newCostInBase) < 1e-9
    const sameRate = p.purchase_rate_to_base != null && Math.abs(Number(p.purchase_rate_to_base) - newRate) < 1e-9
    if (sameCost && sameRate) continue

    updated++
    toWrite.push({ id: p.id, costInBase: newCostInBase, purchaseRateToBase: newRate })
  }

  if (!dryRun) {
    // Ürün başına ayrı PATCH gerekiyor (Update tipi toplu upsert'e girmiyor: name/sku/brand zorunlu),
    // ama sıralı koşarsak yüzlerce ardışık round-trip olur → sınırlı eşzamanlılıkla gruplanır.
    for (let i = 0; i < toWrite.length; i += COST_UPDATE_CONCURRENCY) {
      const chunk = toWrite.slice(i, i + COST_UPDATE_CONCURRENCY)
      const results = await Promise.all(
        chunk.map(row =>
          supabase
            .from('products')
            .update({ cost_in_base: row.costInBase, purchase_rate_to_base: row.purchaseRateToBase })
            .eq('id', row.id),
        ),
      )
      const failed = results.find(r => r.error)
      if (failed?.error) throw failed.error
    }
  }

  return { scanned: products.length, updated, skippedNoRate, skippedNoPurchasePrice, ratesUsed }
}

type ProductPriceUpsertRow = Database['public']['Tables']['product_prices']['Insert']

const PRODUCTS_PAGE_SIZE = 1000
const UPSERT_BATCH_SIZE = 500
const DEACTIVATE_BATCH_SIZE = 200
/** Cetvel §8.1: tekil anahtar para birimini İÇERİR. */
const CACHE_CONFLICT_TARGET = 'product_id,price_list_id,currency,valid_from'
const MATERIALIZE_CURRENCY = 'TRY'

/** Cache satırının kimliği (elle-ezme koruması ve bayat-satır tespiti bunun üstünden yürür). */
function cacheKey(productId: string, priceListId: string, currency: string): string {
  return `${productId}|${priceListId}|${currency}`
}

/**
 * Aktif ürün × aktif fiyat listesi (segment) için fiyatı SAF çekirdekle (resolvePriceWithRules)
 * hesaplar ve product_prices'a materialize eder (cache). Fiyatlanamayan ürün için satır
 * YAZILMAZ — vitrin "Teklif Alın" görür.
 *
 * VERİMLİLİK: pricing_rule + categories + price_lists BİR KEZ çekilir; ürün başına DB
 * sorgusu yapılmaz (348 ürün × 3 liste = 1044 sorgu yerine sabit sayıda sorgu).
 * Varsayılan dryRun=true.
 */
export async function materializePrices(
  supabase: SupabaseClient<Database>,
  options?: MaterializeOptions,
): Promise<MaterializeSummary> {
  const dryRun = options?.dryRun ?? true
  const today = options?.today ?? todayIso()
  const sampleSize = options?.sampleSize ?? 10

  // 1) Kural havuzu — bir kez.
  const { data: ruleRows, error: rulesErr } = await supabase.from('pricing_rule').select('*')
  if (rulesErr) throw rulesErr
  const allRules = (ruleRows ?? []) as PricingRuleRow[]
  const hasScope3Rules = allRules.some(r => r.scope === 3)

  // 2) Kategori ata-haritası — yalnız scope=3 kural varsa çekilir (bir kez).
  const parentOf = new Map<string, string | null>()
  if (hasScope3Rules) {
    const { data: cats, error: catsErr } = await supabase.from('categories').select('id, parent_id')
    if (catsErr) throw catsErr
    for (const c of (cats ?? []) as { id: string; parent_id: string | null }[]) parentOf.set(c.id, c.parent_id)
  }
  const EMPTY_ANCESTORS: ReadonlySet<string> = new Set()
  function ancestorsFor(categoryId: string | null | undefined): ReadonlySet<string> {
    if (!categoryId || !hasScope3Rules) return EMPTY_ANCESTORS
    const ancestors = new Set<string>([categoryId])
    let cursor: string | null | undefined = parentOf.get(categoryId)
    for (let depth = 0; cursor && depth < 10; depth++) {
      ancestors.add(cursor)
      cursor = parentOf.get(cursor)
    }
    return ancestors
  }

  // 3) Aktif fiyat listeleri (segment kitapları) — bir kez.
  const { data: priceListRows, error: listsErr } = await supabase
    .from('price_lists')
    .select('id, user_type')
    .eq('is_active', true)
  if (listsErr) throw listsErr
  const priceLists = (priceListRows ?? []) as { id: string; user_type: string | null }[]

  const segmentAcc = new Map<string, MaterializeSegmentSummary>()
  for (const list of priceLists) {
    segmentAcc.set(list.id, { priceListId: list.id, userType: list.user_type ?? 'individual', priced: 0, quoteOnly: 0 })
  }

  // 4) Marka köprüsü — bir kez (products.brand TEXT → brands.id, scope=2 kuralları buna bağlı).
  const brandIdByName = await loadBrandIdByName(supabase)

  // 5) Mevcut cache fotoğrafı — bir kez. İki şey için gerekli:
  //    (a) ELLE EZME DOKUNULMAZ (cetvel §8.1/§8.2): is_derived=false satır motorun konusu değildir,
  //        fiyat dondurmanın taşıyıcısı odur; üstüne yazmak kullanıcının kararını sessizce siler.
  //    (b) BAYAT SATIR: kural silinince/süresi dolunca ürün "Teklif Alın"a düşmeli; eski satır
  //        is_active=true kalırsa çözücü onu okuyup ESKİ fiyatı göstermeye devam eder.
  const { data: existingRows, error: existingErr } = await supabase
    .from('product_prices')
    .select('id, product_id, price_list_id, currency, is_derived, is_active')
    .eq('valid_from', DERIVED_VALID_FROM)
  if (existingErr) throw existingErr

  const manualKeys = new Set<string>()
  const derivedActiveIdByKey = new Map<string, string>()
  for (const row of existingRows ?? []) {
    const key = cacheKey(row.product_id, row.price_list_id, row.currency)
    if (row.is_derived === false) manualKeys.add(key)
    else if (row.is_active !== false) derivedActiveIdByKey.set(key, row.id)
  }

  // Materialize daima TRY yazar (product_prices.currency='TRY') → gösterim kuru gerekmez.
  const fxRate: RuleEvaluationInputs['fxRate'] = null

  let productsScanned = 0
  let pricedProducts = 0
  let quoteOnlyProducts = 0
  let rowsUpserted = 0
  let skippedManual = 0
  let totalNetTry = 0
  const samples: MaterializeSampleRow[] = []
  const upsertBuffer: ProductPriceUpsertRow[] = []
  /** Bu koşuda üretilen anahtarlar — kalanlar bayattır (pasifleştirilir). */
  const writtenKeys = new Set<string>()

  async function flushUpsertBatch(rows: ProductPriceUpsertRow[]) {
    if (dryRun || rows.length === 0) return
    const { error } = await supabase
      .from('product_prices')
      .upsert(rows, { onConflict: CACHE_CONFLICT_TARGET })
    if (error) throw error
  }

  let offset = 0
  for (;;) {
    const { data: pageRows, error: productsErr } = await supabase
      .from('products')
      .select(PRODUCT_SCOPE_COLUMNS)
      .is('deleted_at', null)
      .eq('status', 'active')
      .order('id', { ascending: true })
      .range(offset, offset + PRODUCTS_PAGE_SIZE - 1)
    if (productsErr) throw productsErr
    const rows: ProductScopeRow[] = pageRows ?? []
    if (rows.length === 0) break

    for (const row of rows) {
      productsScanned++
      const productInput = toPricingProductInput(row, brandIdByName)
      const ancestors = ancestorsFor(productInput.categoryId)

      let productPriced = false
      for (const list of priceLists) {
        const acc = segmentAcc.get(list.id)
        if (!acc) continue

        const resolution = resolvePriceWithRules(
          productInput,
          { priceBookId: list.id, quantity: 1, currency: 'TRY', today },
          { rules: allRules, categoryAncestors: ancestors, fxRate },
        )

        if (!resolution.price) {
          acc.quoteOnly++
          continue
        }

        const key = cacheKey(productInput.id, list.id, MATERIALIZE_CURRENCY)

        // Elle ezilmiş satır motorun konusu DEĞİLDİR (cetvel §8.1) — üstüne yazma, bayat da sayma.
        if (manualKeys.has(key)) {
          skippedManual++
          writtenKeys.add(key)
          continue
        }

        acc.priced++
        productPriced = true
        rowsUpserted++
        writtenKeys.add(key)
        upsertBuffer.push({
          product_id: productInput.id,
          price_list_id: list.id,
          currency: MATERIALIZE_CURRENCY,
          net_price: resolution.price.net,
          gross_price: resolution.price.gross,
          is_derived: true,
          is_active: true,
          valid_from: DERIVED_VALID_FROM,
          // computed_at DB trigger'ı tarafından yazılır (cetvel §8.1) — uygulama unutamaz.
          base_price: acc.userType === 'individual' ? resolution.price.gross : resolution.price.net,
        })

        if (acc.userType === 'individual') {
          totalNetTry += resolution.price.net
          if (samples.length < sampleSize) {
            samples.push({
              sku: productInput.sku,
              name: productInput.name,
              userType: acc.userType,
              net: resolution.price.net,
              gross: resolution.price.gross,
              ruleId: resolution.price.ruleId,
            })
          }
        }

        if (upsertBuffer.length >= UPSERT_BATCH_SIZE) {
          await flushUpsertBatch(upsertBuffer.splice(0, UPSERT_BATCH_SIZE))
        }
      }

      if (productPriced) pricedProducts++
      else quoteOnlyProducts++
    }

    if (rows.length < PRODUCTS_PAGE_SIZE) break
    offset += PRODUCTS_PAGE_SIZE
  }

  await flushUpsertBatch(upsertBuffer.splice(0, upsertBuffer.length))

  // BAYAT SATIR TASFİYESİ: bu koşuda üretilmeyen türetilmiş satırlar artık motorun cevabı
  // değildir (kural silinmiş / süresi dolmuş / maliyet kalkmış olabilir). Aktif bırakılırsa
  // çözücü onları okuyup ESKİ fiyatı göstermeye devam eder — "Teklif Alın" hiç görünmez.
  const staleIds: string[] = []
  for (const [key, id] of derivedActiveIdByKey) {
    if (!writtenKeys.has(key)) staleIds.push(id)
  }
  if (!dryRun) {
    for (let i = 0; i < staleIds.length; i += DEACTIVATE_BATCH_SIZE) {
      const chunk = staleIds.slice(i, i + DEACTIVATE_BATCH_SIZE)
      const { error } = await supabase.from('product_prices').update({ is_active: false }).in('id', chunk)
      if (error) throw error
    }
  }

  return {
    dryRun,
    productsScanned,
    pricedProducts,
    quoteOnlyProducts,
    rowsUpserted,
    skippedManual,
    deactivated: staleIds.length,
    bySegment: [...segmentAcc.values()],
    samples,
    totalNetTry,
  }
}

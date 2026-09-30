import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import { type DegisiklikYontemi, yontemli } from '../pricing/degisiklikYontemi'
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
  // Yöntem başlığı (fiyat günlüğü, INV-FIYAT-GUNLUGU-1): kural ekranı = 'panel'.
  const { data, error } = await yontemli(supabase.from('pricing_rule').insert(input).select('*').single(), 'panel')
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
  const { data, error } = await yontemli(
    supabase.from('pricing_rule').update(payload).eq('id', id).select('*').single(),
    'panel',
  )
  if (error) throw error
  return data
}

export async function deletePricingRule(supabase: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await yontemli(supabase.from('pricing_rule').delete().eq('id', id), 'panel')
  if (error) throw error
}

/** Toplu silme (panelde yalnız onaylı akışta çağrılır). */
export async function deletePricingRules(supabase: SupabaseClient<Database>, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await yontemli(supabase.from('pricing_rule').delete().in('id', ids), 'panel')
  if (error) throw error
}

/* ──────────────────── tek ürün sabit fiyat (REC-412 Faz 1) ──────────────────── */

/** Tek ürün fiyat girişinin geldiği yüzey (günlük yöntem etiketi): yan panel = `panel`, tablo satırı = `liste`. */
export type ProductFixedPriceYontem = Extract<DegisiklikYontemi, 'panel' | 'liste'>

export interface ProductFixedPriceInput {
  /** Girilen TRY tutarı; anlamı `vatIncluded` ile belirlenir. */
  amount: number
  /**
   * true → tutar KDV DAHİL girildi: kural `price_is_vat_inclusive=true` ile yazılır, çözücü NET'e indirger
   * (NET kanonik saklanır, cetvel §11). false → tutar KDV HARİÇ (net) girildi.
   */
  vatIncluded: boolean
}

/** Makul üst sınır: yapıştırma/ölçek hatasını (fazladan sıfır) kaydetmeden önce yakalar. */
export const PRODUCT_FIXED_PRICE_MAX = 1_000_000_000

/** Saf: girilen tutar kaydedilebilir mi? Panel aynı işlevi anlık doğrulamada kullanır (tek kural). */
export function isValidFixedPriceAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= PRODUCT_FIXED_PRICE_MAX
}

/**
 * "Ürünün TEK sabit fiyat kuralı": ürün kapsamlı (scope 1), `fixed`, tüm kitaplar (price_book_id NULL), adet 1.
 * Adet>1 kademeli kural bu işin konusu DEĞİL (cetvel §8.1.4 yasağı) — kural sayfasında kalır.
 */
function isProductFixedRule(rule: PricingRuleRow): boolean {
  return rule.method === 'fixed' && rule.price_book_id === null && rule.min_quantity === 1
}

/**
 * Bir ürüne sabit satış fiyatı yazar: ürünün sabit kuralı VARSA günceller, YOKSA oluşturur (ürün başına tek kural).
 *
 *  · Yeni kural, ürünün diğer ürün-kapsamlı kurallarının (ör. kural sayfasındaki marj override'ı) ÜSTÜNDE
 *    kazansın diye `priority = mevcut en yüksek + 1` alır: paneldeki açık fiyat girişi sessizce ezilmemeli.
 *  · Güncellerken geçerlilik penceresi TEMİZLENİR: süresi dolmuş bir kural güncellenip yine devreye girmezse
 *    "kaydettim ama vitrin değişmedi" sessiz başarısı doğardı.
 *  · Aynı üründe birden çok sabit kural VERİ ANOMALİSİDİR: hangisini güncelleyeceğimizi tahmin etmek yerine HATA.
 *  · `tenant_id` gönderilmez (DB default'u yazar, CLAUDE.md §12).
 *
 * Yalnız KURALI yazar; vitrin (`product_prices`) yeniden hesabı `pricingProductPrice.service.ts` içindedir.
 */
export async function setProductFixedPrice(
  supabase: SupabaseClient<Database>,
  productId: string,
  input: ProductFixedPriceInput,
  yontem: ProductFixedPriceYontem,
  updatedBy: string | null,
): Promise<PricingRuleRow> {
  if (!isValidFixedPriceAmount(input.amount)) {
    throw new RangeError(`setProductFixedPrice: geçersiz tutar (${String(input.amount)}); 0 < tutar ≤ ${PRODUCT_FIXED_PRICE_MAX}.`)
  }

  const { data: existing, error: listErr } = await supabase
    .from('pricing_rule')
    .select('*')
    .eq('scope', 1)
    .eq('product_id', productId)
  if (listErr) throw listErr
  const productRules = existing ?? []

  const fixedRules = productRules.filter(isProductFixedRule)
  if (fixedRules.length > 1) {
    throw new Error(
      `setProductFixedPrice: ürün ${productId} için ${fixedRules.length} sabit kural var (en fazla 1 olmalı). ` +
        'Hangisinin güncelleneceği belirsiz; kural sayfasından fazlalıkları temizleyin.',
    )
  }

  const current = fixedRules[0]
  if (current) {
    // Kural sayfasından sonradan eklenen, daha yüksek öncelikli ürün-kapsamlı bir kural sabit fiyatı ezmesin.
    const otherMax = productRules
      .filter((rule) => rule.id !== current.id)
      .reduce((max, rule) => Math.max(max, rule.priority), Number.NEGATIVE_INFINITY)
    const { data, error } = await yontemli(
      supabase
        .from('pricing_rule')
        .update({
          fixed_price: input.amount,
          price_is_vat_inclusive: input.vatIncluded,
          priority: Number.isFinite(otherMax) ? Math.max(current.priority, otherMax + 1) : current.priority,
          // Panelde girilen tutar VİTRİNDE görülecek tutardır: eski kuraldan kalan ek ücret, marj kelepçesi, yuvarlama,
          // charm ve para birimi kısıtı fiyatı sessizce değiştirir (ya da TRY adayı olmaktan çıkarır). Hepsi sıfırlanır.
          // `vat_rate_pct` KORUNUR: ürünün KDV oranı bilinçli bir veridir (fiyat girişi onu değiştirmez).
          surcharge: 0,
          min_margin_abs: null,
          max_margin_abs: null,
          round_to: null,
          charm_ending: null,
          currency: null,
          valid_from: null,
          valid_to: null,
          // Tabloda `updated_at` trigger'ı YOK → damga ELLE basılır (updatePricingRule ile aynı sözleşme).
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq('id', current.id)
        .select('*')
        .single(),
      yontem,
    )
    if (error) throw error
    return data
  }

  const highestPriority = productRules.reduce((max, rule) => Math.max(max, rule.priority), Number.NEGATIVE_INFINITY)
  const { data, error } = await yontemli(
    supabase
      .from('pricing_rule')
      .insert({
        scope: 1,
        product_id: productId,
        method: 'fixed',
        fixed_price: input.amount,
        price_is_vat_inclusive: input.vatIncluded,
        min_quantity: 1,
        priority: Number.isFinite(highestPriority) ? highestPriority + 1 : 0,
        updated_by: updatedBy,
      })
      .select('*')
      .single(),
    yontem,
  )
  if (error) throw error
  return data
}

/**
 * Ürünün sabit fiyat kuralını kaldırır (ürün genel kurala döner). Kaldırılan kural sayısını döndürür
 * (0 = zaten yoktu, hata değil). Vitrin yeniden hesabı çağıranın (pricingProductPrice.service) işidir.
 */
export async function clearProductFixedPrice(
  supabase: SupabaseClient<Database>,
  productId: string,
  yontem: ProductFixedPriceYontem,
): Promise<number> {
  const { data, error } = await yontemli(
    supabase
      .from('pricing_rule')
      .delete()
      .eq('scope', 1)
      .eq('product_id', productId)
      .eq('method', 'fixed')
      .is('price_book_id', null)
      .eq('min_quantity', 1)
      .select('id'),
    yontem,
  )
  if (error) throw error
  return (data ?? []).length
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

/**
 * Kapsam çözümünün SSOT'u: `(scope, targetId)` → ürün filtresi tarifi.
 *
 * NİÇİN AYRI BİR ADIM: kapsam semantiği önemsiz değil — scope 2 markayı **adıyla**
 * eşler (`products.brand` metin kolonu, FK değil), scope 3 kategori **alt-ağacını**
 * gezer (`resolvePrice` §11 ata-cascade'iyle aynı küme). Bu mantık her yeni ölçüm
 * fonksiyonunda tekrar yazılırsa ikinci kopya doğar; kopyalar sessizce ayrışır ve
 * panel gerçeğin altında/üstünde sayı gösterir — bu depoda iki kez yaşanan sınıf.
 * Sayaç, örnekleyici ve para birimi ölçümü ÜÇÜ de buradan beslenir.
 *
 * `empty`, "hedef seçilmemiş" ile "hedef bulunamadı"yı aynı yere taşır: her ikisinde
 * de kapsam boştur, kapsam boşken TÜM ürünlere düşmek (fail-open) yasaktır.
 */
type ScopeFilter =
  | { kind: 'empty' }
  | { kind: 'all' }
  | { kind: 'id'; value: string }
  | { kind: 'brand'; value: string }
  | { kind: 'categories'; values: string[] }

async function resolveScopeFilter(
  supabase: SupabaseClient<Database>,
  scope: number,
  targetId: string | null,
): Promise<ScopeFilter> {
  if (scope === 0 || scope === 1) {
    return targetId ? { kind: 'id', value: targetId } : { kind: 'empty' }
  }
  if (scope === 2) {
    if (!targetId) return { kind: 'empty' }
    const name = await brandNameById(supabase, targetId)
    return name ? { kind: 'brand', value: name } : { kind: 'empty' }
  }
  if (scope === 3) {
    if (!targetId) return { kind: 'empty' }
    return { kind: 'categories', values: await categoryIdsWithDescendants(supabase, targetId) }
  }
  return { kind: 'all' }
}

/** Çözülmüş kapsamı bir PostgREST sorgusuna uygular. `empty` çağrılmadan önce elenmiş olmalıdır. */
function withScopeFilter<Q extends ScopeFilterableQuery<Q>>(query: Q, filter: ScopeFilter): Q {
  switch (filter.kind) {
    case 'id':
      return query.eq('id', filter.value)
    case 'brand':
      return query.eq('brand', filter.value)
    case 'categories':
      return query.in('category_id', filter.values)
    default:
      return query
  }
}

interface ScopeFilterableQuery<Q> {
  eq(column: 'id' | 'brand', value: string): Q
  in(column: 'category_id', values: string[]): Q
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
  const filter = await resolveScopeFilter(supabase, scope, targetId)
  if (filter.kind === 'empty') return 0

  const countQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status', 'active')

  const { count, error } = await withScopeFilter(countQuery, filter)
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
  const filter = await resolveScopeFilter(supabase, scope, targetId)
  if (filter.kind === 'empty') return []

  const { data, error } = await withScopeFilter(activeProductsQuery(supabase), filter).limit(n)
  if (error) throw error
  const rows: ProductScopeRow[] = data ?? []

  const brandIdByName = await loadBrandIdByName(supabase)
  return rows.map((row) => toPricingProductInput(row, brandIdByName))
}

/** Kapsam taramasında tek sayfa boyu — PostgREST'in varsayılan satır tavanı da 1000'dir. */
const SCOPE_SCAN_PAGE = 1000
/** Sayfa üst sınırı. Aşılırsa SESSİZCE KESMEYİZ, hata atarız (bkz. fonksiyon notu). */
const SCOPE_SCAN_MAX_PAGES = 50

/**
 * Kapsamdaki **DISTINCT** alış para birimleri — fx-kilidi kaydı için.
 *
 * SÖZLEŞME (fx-lock [D] kararı: kapsamda tek para birimi varsa enstantane kur
 * kilitlenir, birden çoksa kayıt REDDEDİLİR):
 *  · **ÖRNEKLEME YOK** — kapsamın TAMAMI taranır. `sampleProductsInScope` bu iş için
 *    yanlış araçtır: ilk 3 ürün EUR, dördüncüsü USD olabilir ve örnek "tek para birimi"
 *    yanıtı üretip yanlış kuru kilitler.
 *  · Aktif + silinmemiş ürünler (diğer kapsam ölçümleriyle aynı taban).
 *  · Dönen değerler trim+BÜYÜK harf, tekil ve sıralıdır.
 *  · **Boş dizi = kapsamda aktif ürün YOK.** Bu okuma kesindir çünkü
 *    `products.purchase_currency` NOT NULL'dır — "ürün var ama para birimi yok" hâli
 *    doğmaz, dolayısıyla boş dizi belirsiz değildir.
 *
 * SESSİZ KESME YASAĞI: PostgREST tek istekte en çok 1000 satır döndürür. Tek sorguyla
 * okumak, 1000'inci üründen sonrasını sessizce yok sayardı — distinct kümesi eksik
 * çıkar, panel "tek para birimi" deyip yanlış kuru kilitlerdi. Bu yüzden sayfalanır ve
 * sayfa sınırı aşılırsa eksik sonuç dönmek yerine HATA atılır.
 */
export async function distinctPurchaseCurrenciesInScope(
  supabase: SupabaseClient<Database>,
  scope: number,
  targetId: string | null,
): Promise<string[]> {
  const filter = await resolveScopeFilter(supabase, scope, targetId)
  if (filter.kind === 'empty') return []

  const found = new Set<string>()
  for (let page = 0; page < SCOPE_SCAN_MAX_PAGES; page += 1) {
    const from = page * SCOPE_SCAN_PAGE
    const baseQuery = supabase
      .from('products')
      .select('purchase_currency')
      .is('deleted_at', null)
      .eq('status', 'active')

    const { data, error } = await withScopeFilter(baseQuery, filter)
      // Sayfalar arası kararlılık: sırasız `range` aynı satırı iki kez/hiç döndürebilir.
      .order('id', { ascending: true })
      .range(from, from + SCOPE_SCAN_PAGE - 1)
    if (error) throw error

    const rows = data ?? []
    for (const row of rows) {
      const currency = (row.purchase_currency ?? '').trim().toUpperCase()
      if (currency) found.add(currency)
    }
    if (rows.length < SCOPE_SCAN_PAGE) return [...found].sort()
  }

  throw new Error(
    `distinctPurchaseCurrenciesInScope: kapsam ${SCOPE_SCAN_MAX_PAGES * SCOPE_SCAN_PAGE} üründen büyük. ` +
      'Eksik para birimi kümesi döndürmek yanlış kur kilitlenmesine yol açacağı için hata atıldı.',
  )
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

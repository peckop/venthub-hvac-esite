import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import { type DegisiklikYontemi, yeniOturumKimligi, yontemli } from '../pricing/degisiklikYontemi'
import { tumSatirlariCek, VARSAYILAN_SAYFA_BOYU } from '../supabase/tumSatirlar'
import { resolveFxRate } from './fxRate.service'
import { type PricingRuleRow, resolvePriceWithRules, type RuleEvaluationInputs } from './pricing.service'
import {
  loadBrandIdByName,
  PRODUCT_SCOPE_COLUMNS,
  type ProductScopeRow,
  toPricingProductInput,
} from './pricingAdmin.service'
import { fetchActivePolicies, resolveFxLocks, resolveFxLockWithPolicies } from './pricingPolicy.service'

/** `refreshCostInBase`'in okuduğu ürün kolonları (products.Row'un alt kümesi). */
type CostRefreshProductRow = Pick<
  Database['public']['Tables']['products']['Row'],
  'id' | 'brand' | 'category_id' | 'purchase_price' | 'purchase_currency' | 'cost_in_base' | 'purchase_rate_to_base'
>

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
 *  satırı günceller (onConflict: product_id,price_list_id,currency,valid_from), tekrar satır üretmez. */
export const DERIVED_VALID_FROM = '2026-01-01T00:00:00.000Z'

export interface CostRefreshSummary {
  scanned: number
  updated: number
  skippedNoRate: number
  skippedNoPurchasePrice: number
  /**
   * W5 — `pricing_policy.fx_lock` yüzünden ATLANAN ürün sayısı (cetvel §8.2).
   * Rapora ayrı sayaç olarak çıkar: "kur değişti ama 40 ürünün maliyeti güncellenmedi"
   * bir arıza değil bir KARARdır ve panelde öyle görünmelidir. Sessiz atlama, bir gün
   * "neden bu fiyat değişmedi" sorusunu cevapsız bırakırdı.
   */
  skippedFxLocked: number
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
  /**
   * Marka metni `brands` tablosuna köprülenemeyen ürün sayısı (cetvel §8.3 zorunluluğu).
   * `products.brand` TEXT olduğu için isim/boşluk/harf farkı marka kuralını SESSİZCE ıskalatır;
   * bu sayaç görünmezse "marka kuralı neden işlemedi?" sorusu cevapsız kalır.
   */
  unbridgedBrand: number
  /**
   * W5 — `pricing_policy.fx_lock` yüzünden yeniden hesaplanmayan ürün sayısı (cetvel §8.2).
   * Rapora ayrı sayaç olarak çıkar: dondurma bir KARARdır, sessiz atlama değil.
   */
  skippedFxLocked: number
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
  /**
   * Cache fotoğrafının sayfa boyu. YALNIZ SINAV İÇİN dışarı açıldı: sayfalama yolunun
   * gerçekten koştuğunu kanıtlamak için sınav bunu tablodan küçük bir değere çeker
   * (500'lük sayfa 375 satırlık bir tabloda ilk sayfada biter, sabotaj hiçbir yere
   * değmez). Üretimde verilmez; varsayılan `VARSAYILAN_SAYFA_BOYU`.
   */
  cacheSayfaBoyu?: number
  /**
   * TEK/BİRKAÇ ÜRÜN kapsamı (REC-412 Faz 1): verilirse yalnız bu ürünler taranır VE bayat-satır tasfiyesi
   * yalnız BU ürünlerin cache satırlarına uygulanır. ⛔Tasfiye kapsamı daraltılmazsa taranmayan 347 ürünün
   * satırı "bu koşuda üretilmedi" sayılıp pasifleştirilirdi — bu yüzden cache fotoğrafı da aynı süzgeçle okunur.
   * `undefined` = katalog geneli (mevcut davranış). BOŞ dizi = HİÇBİR ürün (fail-open yasak: "kapsam boş"
   * asla "hepsi" demek değildir).
   */
  productIds?: string[]
  /**
   * Fiyat günlüğü yöntem etiketi (INV-FIYAT-GUNLUGU-1). Varsayılan `yeniden_hesap` (katalog yeniden hesabı);
   * panelden tek ürün yansıtılırken çağıran `panel`/`liste` verir ki günlükte kaynağı doğru okunsun.
   */
  yontem?: DegisiklikYontemi
}

/** `productIds` üst sınırı: id'ler URL'e `in.(...)` olarak gider; sınırsız liste PostgREST adres tavanına çarpar. */
export const MATERIALIZE_URUN_TAVANI = 200

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function round4(value: number): number {
  return Number(value.toFixed(4))
}

/** `maliyet_yenile` RPC'sinin parti sınırıyla AYNI (supabase/migrations/20260929143000_maliyet_yenileme_gunlugu.sql). */
const MALIYET_PARTI_TAVANI = 5000

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
  // `sayfaBoyu` YALNIZ SINAV İÇİN dışarı açıldı: sayfalama yolunun gerçekten koştuğunu
  // kanıtlamak için sınav onu tablodan küçük bir değere çeker. Üretimde verilmez.
  options?: { dryRun?: boolean; today?: string; sayfaBoyu?: number },
): Promise<CostRefreshSummary> {
  const dryRun = options?.dryRun ?? true
  const today = options?.today ?? todayIso()
  const sayfaBoyu = options?.sayfaBoyu ?? VARSAYILAN_SAYFA_BOYU

  // ⛔SAYFALAMA ŞART (INV-TAVAN-1). Burası bir YAZMA yolu: aşağıda `cost_in_base`
  // güncellenir. Sayfalanmamış tek okuma PostgREST'in 1000 satır tavanına takılır ve
  // tavanın dışında kalan ürünler HİÇ görülmez — yani maliyetleri eski kurla donmuş
  // kalır ve hiçbir hata verilmez. Ölçüldü (2026-09-07, prod): aktif ürün 375, yani
  // tavan BUGÜN ısırmıyor; ama sınır yoktu ve katalog büyüdüğü gün sessizce ısıracaktı.
  // Kardeş halka (materialize) zaten sayfalıydı; bu halka atlanmıştı.
  const products = await tumSatirlariCek<CostRefreshProductRow>(
    'products (aktif, cost_in_base tazeleme)',
    (bas, son) =>
      supabase
        .from('products')
        // `brand` + `category_id` ŞART: fx-lock merdiveni scope 2 (marka) ve 3 (kategori)
        // için bu alanları ister. Eskiden çekilmiyordu ve kilit çözümüne yalnız `id`
        // geçiyordu — iki kapsam bu halkada SESSİZCE yok sayılıyordu (aşağıya bak).
        .select(
          'id, brand, category_id, purchase_price, purchase_currency, cost_in_base, purchase_rate_to_base',
          { count: 'exact' },
        )
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('id', { ascending: true })
        .range(bas, son),
    sayfaBoyu,
  )

  // Her para birimi için EN GÜNCEL kur bir kez çekilir (bellekte önbelleklenir).
  const rateByCcy = new Map<string, { rate: number; effectiveDate: string } | null>()
  const ratesUsed: CostRefreshSummary['ratesUsed'] = []

  async function getRateFor(ccyRaw: string): Promise<{ rate: number; effectiveDate: string } | null> {
    const ccy = ccyRaw.toUpperCase()
    if (rateByCcy.has(ccy)) return rateByCcy.get(ccy) ?? null

    // Kur seçimi TEK yerde: `fxRate.service.resolveFxRate` (cetvel §8.2.1, INV-PRICE-8).
    // Buradaki sorgunun bir kopyası `resolvePrice`'ta da vardı ve `base_ccy` filtresi
    // EKSİKTİ — maliyet ile gösterim farklı kurdan hesaplanabiliyordu. Önbellek ve
    // `ratesUsed` defteri çağıranın (bu fonksiyonun) sorumluluğunda kalır.
    const val = await resolveFxRate(supabase, ccy, today)
    rateByCcy.set(ccy, val)
    if (val) ratesUsed.push({ currency: ccy, rate: val.rate, effectiveDate: val.effectiveDate })
    return val
  }

  let updated = 0
  let skippedNoRate = 0
  let skippedNoPurchasePrice = 0
  let skippedFxLocked = 0
  // `purchasePrice`/`purchaseCurrency`: maliyetin HESAPLANDIĞI alış fiyatı. RPC bunu güncel satırla karşılaştırır:
  // okuma ile yazma arasında fiyat değiştiyse eski fiyattan üretilmiş maliyet YAZILMAZ, tüm parti geri alınır.
  const toWrite: {
    id: string
    costInBase: number
    purchaseRateToBase: number
    purchasePrice: number
    purchaseCurrency: string
  }[] = []

  // W5 — fiyat kilidi (cetvel §8.2). Kilitli kapsamın `cost_in_base`'i TAZELENMEZ.
  //
  // Neden burada da: kilidi yalnız materialize'e koymak yetmez. `cost_in_base` yeni kurla
  // güncellenirse, sonraki herhangi bir materialize (ya da paneldeki "yeniden hesapla")
  // fiyatı oynatır. Zincirin iki halkasında da uygulanmayan kilit, kilit değil gecikmedir.
  //
  // ⚠️ 2026-08-17'de DÜZELTİLDİ (ADMIN-CUSTOMER buldu): buraya yalnız `{ id }` geçiyordu.
  // `scopeMatchesProduct` scope 2'de `brandId`, scope 3'te `categoryId` arar; ikisi de
  // `undefined` gelince o kapsamlar HİÇ eşleşmiyordu. Yani yukarıdaki ilke doğru yazılmış
  // ve çağrı eklenmişti, ama GİRDİ FAKİR olduğu için marka/kategori kilitleri bu halkada
  // sessizce yok sayılıyordu — kilitli görünen fiyatın `cost_in_base`'i kurla kayıyordu.
  // Marka bir metin alanıdır, FK'ye köprülenir (materialize halkası da aynısını yapar).
  const brandIdForLocks = await loadBrandIdByName(supabase)
  const fxLocks = await resolveFxLocks(
    supabase,
    products.map((p) => ({
      id: p.id,
      brandId: brandIdForLocks.get(p.brand) ?? brandIdForLocks.get(p.brand.trim()) ?? null,
      categoryId: p.category_id ?? null,
    })),
  )

  for (const p of products) {
    if (fxLocks.get(p.id)?.locked) {
      skippedFxLocked++
      continue
    }
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
    // Sütun duyarlığına (numeric(18,6)) yuvarla: fazla ondalıklı kur her koşuda "değişti" görünüp satırı boşuna
    // yeniden yazmasın (DB de aynı duyarlığa yuvarlar; günlük yazılmaz ama satır ve sayaç şişerdi).
    const newRate = Math.round(fx.rate * 1e6) / 1e6
    const sameCost = p.cost_in_base != null && Math.abs(Number(p.cost_in_base) - newCostInBase) < 1e-9
    const sameRate = p.purchase_rate_to_base != null && Math.abs(Number(p.purchase_rate_to_base) - newRate) < 1e-9
    if (sameCost && sameRate) continue

    updated++
    toWrite.push({
      id: p.id,
      costInBase: newCostInBase,
      purchaseRateToBase: newRate,
      purchasePrice,
      purchaseCurrency: p.purchase_currency,
    })
  }

  if (!dryRun && toWrite.length > 0) {
    // TEK ATOMİK YAZIM (REC-412 Faz 0.5b, karar 186). Eskiden ürün başına ayrı PATCH (20 paralel) yazılıyordu:
    // ortada hata olursa katalog YARI yenilenmiş kalırdı ve DB günlüğü ayrı istekleri tek özete toplayamazdı.
    // `maliyet_yenile` tüm partiyi TEK UPDATE ifadesiyle yazar: ya hepsi ya hiçbiri, ve günlükte parti başına
    // TEK özet satırı (eski→yeni dizisi) düşer. Yönetici kapısı RPC içinde (JWT app_metadata).
    if (toWrite.length > MALIYET_PARTI_TAVANI) {
      // Bölmek atomikliği bozar (ilk parça yazılır, ikincisi düşerse yarım yenileme) → BÖLMEDEN dur.
      // `code`: RPC'nin kendi 54000 hatasıyla AYNI; arayüz iki kaynağı tek mesajla gösterir (CostRefreshModal).
      throw Object.assign(
        new Error(
          `Maliyet yenileme partisi ${toWrite.length} satır; sınır ${MALIYET_PARTI_TAVANI}. ` +
            `Yarım yenileme yapılmaz — katalog bu sınırı aştıysa parti sınırı (maliyet_yenile migration'ı) yükseltilmelidir.`,
        ),
        { code: '54000' },
      )
    }
    const { error } = await yontemli(
      supabase.rpc('maliyet_yenile', {
        p_satirlar: toWrite.map(row => ({
          id: row.id,
          cost_in_base: row.costInBase,
          purchase_rate_to_base: row.purchaseRateToBase,
          purchase_price: row.purchasePrice,
          purchase_currency: row.purchaseCurrency,
        })),
      }),
      'maliyet_yenileme',
      yeniOturumKimligi(),
    )
    if (error) throw error
  }

  return { scanned: products.length, updated, skippedNoRate, skippedNoPurchasePrice, skippedFxLocked, ratesUsed }
}

type ProductPriceUpsertRow = Database['public']['Tables']['product_prices']['Insert']

/** `product_prices` cache fotoğrafının okunan kolonları. */
type CachedPriceRow = Pick<
  Database['public']['Tables']['product_prices']['Row'],
  'id' | 'product_id' | 'price_list_id' | 'currency' | 'is_derived' | 'is_active'
>

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
  const cacheSayfaBoyu = options?.cacheSayfaBoyu ?? VARSAYILAN_SAYFA_BOYU
  const yontem: DegisiklikYontemi = options?.yontem ?? 'yeniden_hesap'
  // Kapsam: `undefined` = tüm katalog; dizi = yalnız o ürünler (tekilleştirilir, tavanlanır, BOŞ = hiçbiri).
  const urunKapsami = options?.productIds === undefined ? null : [...new Set(options.productIds)]
  if (urunKapsami !== null && urunKapsami.length > MATERIALIZE_URUN_TAVANI) {
    throw new Error(
      `materializePrices: productIds ${urunKapsami.length} > ${MATERIALIZE_URUN_TAVANI}. ` +
        'Sınırsız liste adres tavanına çarpar; katalog geneli için productIds verme.',
    )
  }
  // Fiyat günlüğü (INV-FIYAT-GUNLUGU-1): bu koşunun tüm partileri (upsert 500'lük, pasifleştirme 200'lük) aynı
  // oturum kimliğini taşır → günlükte birden çok özet satırı tek koşuya bağlanır.
  const oturum = yeniOturumKimligi()
  if (urunKapsami !== null && urunKapsami.length === 0) {
    // Boş kapsam: hiçbir okuma/yazma yapma (kapsam boşken "hepsi"ne düşmek yasak).
    return {
      dryRun,
      productsScanned: 0,
      pricedProducts: 0,
      quoteOnlyProducts: 0,
      rowsUpserted: 0,
      skippedManual: 0,
      unbridgedBrand: 0,
      skippedFxLocked: 0,
      deactivated: 0,
      bySegment: [],
      samples: [],
      totalNetTry: 0,
    }
  }

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
  //    SAYFALAMA ZORUNLU: bu iş 348 ürün × 3 segment = 1044 satır YAZIYOR; sayfalanmamış tek
  //    okuma PostgREST satır tavanına (varsayılan 1000) takılır ve koruma SESSİZCE çöker
  //    (tavanın dışında kalan elle-ezme satırı ezilir, bayat satır aktif kalır). Sıra da şart:
  //    order olmadan hangi satırların düştüğü belirsizdir, hata tekrarlanamaz olur.
  //
  // ⛔SAYFALAMA VARDI, DOĞRULAMA YOKTU (INV-TAVAN-1). Döngü sayfalıyordu ama "çektiğim
  // satır sayısı sunucunun bildirdiği kesin sayıya eşit mi" diye HİÇ sormuyordu. Sayfalayan
  // bir döngü de eksik çekebilir (kısa sayfa erken kırar, eşzamanlı yazma sayfaları kaydırır)
  // ve sonuç yine sessizce yanlış olur. Ölçüldü (2026-09-07, prod): product_prices = 1044
  // satır, yani bu tablo tavanı ZATEN aşıyor — burası varsayımsal değil, canlı bir yüzey.
  const manualKeys = new Set<string>()
  const derivedActiveIdByKey = new Map<string, string>()
  const existingRows = await tumSatirlariCek<CachedPriceRow>(
    'product_prices (cache fotoğrafı)',
    (bas, son) => {
      const sorgu = supabase
        .from('product_prices')
        .select('id, product_id, price_list_id, currency, is_derived, is_active', { count: 'exact' })
        .eq('valid_from', DERIVED_VALID_FROM)
      // Tek/birkaç ürün kapsamında fotoğraf da AYNI süzgeçle okunur: bayat-satır tasfiyesi bu fotoğraftan
      // beslendiği için, süzülmeyen fotoğraf taranmayan ürünlerin satırlarını pasifleştirirdi.
      return (urunKapsami === null ? sorgu : sorgu.in('product_id', urunKapsami))
        .order('id', { ascending: true })
        .range(bas, son)
    },
    cacheSayfaBoyu,
  )
  for (const row of existingRows) {
    const key = cacheKey(row.product_id, row.price_list_id, row.currency)
    // Pasifleştirilmiş elle-ezme satırı dokunulmaz DEĞİLDİR: admin onu kapattıysa
    // türetilmiş fiyat devralmalı, yoksa ürün o segmentte kalıcı olarak fiyatsız kalır.
    if (row.is_derived === false && row.is_active !== false) manualKeys.add(key)
    else if (row.is_derived !== false && row.is_active !== false) derivedActiveIdByKey.set(key, row.id)
  }

  // Materialize daima TRY yazar (product_prices.currency='TRY') → gösterim kuru gerekmez.
  const fxRate: RuleEvaluationInputs['fxRate'] = null

  let productsScanned = 0
  let pricedProducts = 0
  let quoteOnlyProducts = 0
  let rowsUpserted = 0
  let skippedManual = 0
  let skippedFxLocked = 0
  let unbridgedBrand = 0
  let totalNetTry = 0
  const samples: MaterializeSampleRow[] = []
  const upsertBuffer: ProductPriceUpsertRow[] = []
  /** Bu koşuda üretilen anahtarlar — kalanlar bayattır (pasifleştirilir). */
  const writtenKeys = new Set<string>()

  /**
   * W5 — fiyat kilidi havuzu (cetvel §8.2). Ürünler SAYFALANARAK dolaşılıyor; havuzu burada
   * bir kez çekip saf çekirdeği çağırmak, sayfa başına ek sorgu üretmeden aynı kararı verir.
   */
  const fxPolicies = await fetchActivePolicies(supabase)

  async function flushUpsertBatch(rows: ProductPriceUpsertRow[]) {
    if (dryRun || rows.length === 0) return
    const { error } = await yontemli(
      supabase.from('product_prices').upsert(rows, { onConflict: CACHE_CONFLICT_TARGET }),
      yontem,
      oturum,
    )
    if (error) throw error
  }

  let offset = 0
  for (;;) {
    const urunSorgusu = supabase
      .from('products')
      .select(PRODUCT_SCOPE_COLUMNS)
      .is('deleted_at', null)
      .eq('status', 'active')
    const { data: pageRows, error: productsErr } = await (
      urunKapsami === null ? urunSorgusu : urunSorgusu.in('id', urunKapsami)
    )
      .order('id', { ascending: true })
      .range(offset, offset + PRODUCTS_PAGE_SIZE - 1)
    if (productsErr) throw productsErr
    const rows: ProductScopeRow[] = pageRows ?? []
    if (rows.length === 0) break

    for (const row of rows) {
      productsScanned++
      const productInput = toPricingProductInput(row, brandIdByName)
      if (productInput.brandId === null && row.brand.trim() !== '') unbridgedBrand++
      const ancestors = ancestorsFor(productInput.categoryId)

      // W5 — fiyat kilidi (cetvel §8.2). Kilitli kapsamın cache satırı YENİDEN HESAPLANMAZ.
      // Mevcut satır olduğu gibi kalır: silinmez, bayat sayılmaz, deaktive edilmez —
      // "dondurulmuş" tam olarak bu demek. Havuz döngü DIŞINDA bir kez çekildi.
      if (resolveFxLockWithPolicies(productInput, fxPolicies, ancestors).locked) {
        skippedFxLocked++
        for (const list of priceLists) writtenKeys.add(cacheKey(productInput.id, list.id, MATERIALIZE_CURRENCY))
        continue
      }

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
  // Yalnız BU koşunun para biriminde tasfiye yapılır: writtenKeys sadece TRY anahtarları taşır,
  // kapsamı daraltmazsak TRY-dışı türetilmiş satırlar her koşuda pasifleşir (migration'ın açtığı
  // çok-para-birimli kapıyı kod kapatmış olurdu).
  const staleIds: string[] = []
  for (const [key, id] of derivedActiveIdByKey) {
    if (!key.endsWith(`|${MATERIALIZE_CURRENCY}`)) continue
    if (!writtenKeys.has(key)) staleIds.push(id)
  }
  if (!dryRun) {
    for (let i = 0; i < staleIds.length; i += DEACTIVATE_BATCH_SIZE) {
      const chunk = staleIds.slice(i, i + DEACTIVATE_BATCH_SIZE)
      const { error } = await yontemli(
        supabase.from('product_prices').update({ is_active: false }).in('id', chunk),
        yontem,
        oturum,
      )
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
    unbridgedBrand,
    skippedFxLocked,
    deactivated: staleIds.length,
    bySegment: [...segmentAcc.values()],
    samples,
    totalNetTry,
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import { computePriceFromRule, type PricingRuleRow } from './pricing.service'
import {
  clearProductFixedPrice,
  isProductFixedRule,
  isValidFixedPriceAmount,
  type ProductFixedPriceInput,
  type ProductFixedPriceYontem,
  setProductFixedPrice,
} from './pricingAdmin.service'
import { materializePrices, type MaterializeSummary } from './pricingMaterialize.service'

/**
 * REC-412 Faz 1 · Tek ürün fiyat girişi: kural yaz → YALNIZ o ürünü yeniden hesapla → vitrin satırını GERİ OKU.
 *
 * Sözleşme (plan docs/plans/rec412-tek-urun-fiyat-girisi-2026-09-29.md §3): "Sessiz başarı YOK". Kural yazıldı ama
 * yeniden hesap düştüyse bu AÇIKÇA söylenir (`recalc: 'hata'`), fiyatın vitrine yansıdığı ise yalnız geri okuma
 * `dogrulandi` derse söylenir. Fiyat hesabı BURADA TEKRARLANMAZ: `materializePrices` (saf çekirdek
 * `resolvePriceWithRules`) yeniden kullanılır; ikinci hesap kopyası yoktur.
 *
 * DI ZORUNLU (CLAUDE.md kural 2): her fonksiyonun İLK parametresi `supabase`.
 */

/** Vitrin fiyatı karşılaştırma toleransı (TL): gross 2 hane, net 4 hane yuvarlanır — yarım kuruş altı fark yuvarlamadır. */
const FIYAT_TOLERANSI = 0.005

export interface ExpectedStorefrontPrice {
  net: number
  gross: number
}

/**
 * Vitrin geri okumasının sonucu (bireysel liste, TRY, aktif satır):
 *  · `dogrulandi`    — vitrindeki satır beklenenle aynı.
 *  · `farkli`        — aktif satır var ama beklenenden farklı (ör. elle ezilmiş satır türetilmişin önünde).
 *  · `yok`           — aktif satır YOK → vitrin "Teklif Alın" görür.
 *  · `belirsiz`      — birden çok aktif satır (hangisinin okunduğu belirsiz), bireysel liste bulunamadı ya da tek satırın fiyatı boş.
 *  · `beklenen-yok`  — yeniden hesap bir beklenen fiyat üretmedi (kilitli/elle ezilmiş/fiyatlanamaz); satır okunur, kıyas yapılmaz.
 */
export type StorefrontVerification =
  | { status: 'dogrulandi'; net: number; gross: number; isDerived: boolean | null }
  | { status: 'farkli'; net: number; gross: number; isDerived: boolean | null; expected: ExpectedStorefrontPrice }
  | { status: 'yok' }
  | { status: 'belirsiz'; rows: number }
  | { status: 'beklenen-yok'; net: number; gross: number; isDerived: boolean | null }

/**
 * Bir ürünün VİTRİNDE görünen fiyatını okur (bireysel liste, TRY, aktif satır) ve `expected` ile karşılaştırır.
 * Yalnız okur; yazmaz. RLS: okuma herkese açık vitrin verisidir (maliyet/liste alanı çekilmez, karar 95).
 */
export async function verifyProductStorefrontPrice(
  supabase: SupabaseClient<Database>,
  productId: string,
  expected: ExpectedStorefrontPrice | null,
): Promise<StorefrontVerification> {
  const { data: lists, error: listsErr } = await supabase.from('price_lists').select('id, user_type').eq('is_active', true)
  if (listsErr) throw listsErr
  // materializePrices ile AYNI varsayım: user_type boşsa liste "individual" sayılır.
  const individualListIds = (lists ?? []).filter((l) => (l.user_type ?? 'individual') === 'individual').map((l) => l.id)
  if (individualListIds.length === 0) return { status: 'belirsiz', rows: 0 }

  const { data: rows, error } = await supabase
    .from('product_prices')
    .select('net_price, gross_price, is_derived')
    .eq('product_id', productId)
    .in('price_list_id', individualListIds)
    .eq('currency', 'TRY')
    .eq('is_active', true)
  if (error) throw error

  const active = rows ?? []
  if (active.length === 0) return { status: 'yok' }
  if (active.length > 1) return { status: 'belirsiz', rows: active.length }

  const row = active[0]
  if (!row) return { status: 'yok' }
  const { net_price: net, gross_price: gross, is_derived: isDerived } = row
  // Tek aktif satır ama fiyat kolonlarından biri boş: vitrinin ne göstereceği belirsiz (bozuk satır) — "doğrulandı" denmez.
  if (net === null || gross === null) return { status: 'belirsiz', rows: 1 }
  if (expected === null) return { status: 'beklenen-yok', net, gross, isDerived }
  const same = Math.abs(gross - expected.gross) <= FIYAT_TOLERANSI && Math.abs(net - expected.net) <= FIYAT_TOLERANSI
  return same ? { status: 'dogrulandi', net, gross, isDerived } : { status: 'farkli', net, gross, isDerived, expected }
}

/** Yeniden hesabın durumu: `yapilmadi` (istenmedi ya da yetki yok), `tamam`, `hata` (kural yazıldı, vitrin yansıtılamadı). */
export type RecalcState = 'yapilmadi' | 'tamam' | 'hata'

export interface ProductPriceChangeResult {
  recalc: RecalcState
  /** `recalc === 'hata'` iken kullanıcıya "tekrar dene" ile gösterilecek neden. */
  recalcError?: string
  /** Yeniden hesabın sayaçları (`skippedManual`/`skippedFxLocked` "neden yansımadı" sorusunun cevabıdır). */
  summary?: MaterializeSummary
  /** Vitrin geri okuması; `recalc !== 'tamam'` ise null (okunacak yeni durum yok). */
  verification: StorefrontVerification | null
  /**
   * true → yazılan kural motorun seçtiği kural DEĞİL (başka bir kural vitrini belirliyor). `kazananKuralId` o kuraldır;
   * panel "vitrinde X kuralı kazanıyor" uyarısını bundan üretir. Kaldırma sonucunda anlamsızdır (false).
   */
  golgelendi?: boolean
  /** Motorun bu ürün için bireysel segmentte seçtiği kuralın id'si (örnek yoksa null). */
  kazananKuralId?: string | null
}

export interface ProductPriceChangeOptions {
  /** Günlük yöntem etiketi: yan panel `panel`, tablo satırı `liste`. */
  yontem: ProductFixedPriceYontem
  /**
   * Yeniden hesap istensin mi? MODERATÖR için `false`: kural yazabilir ama `product_prices` yazamaz (RLS);
   * panel "vitrine yansıtmayı yönetici yapar" der (plan §5.2). Yetkisiz yeniden hesabı denemek yerine hiç çalıştırmayız.
   */
  recalculate: boolean
  /** Oturum sahibi; kural `updated_by` alanına yazılır. */
  updatedBy: string | null
}

/**
 * Hata → kullanıcıya gösterilecek metin. ⚠supabase-js hataları `Error` DEĞİL, `{ message, code, ... }` düz nesnesi
 * olarak fırlar; `String(err)` onlara "[object Object]" yazardı ve "tekrar dene" mesajı anlamsız kalırdı.
 */
function hataMetni(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') return err.message
  return String(err)
}

/**
 * Tek ürünü yeniden hesaplar ve vitrini geri okur. Yeniden hesap hatası ATILMAZ; sonuca `recalc:'hata'` yazılır.
 *
 * `beklenen`: vitrinde GÖRÜLMESİ GEREKEN fiyat. Sabit fiyat girişinde bu, YAZILAN KURALDAN hesaplanır (yöneticinin
 * girdiği tutar) — motorun ürettiği örnekten DEĞİL: örnekten türetilen beklenen, başka bir kural (varyant/kitaba özel/
 * daha öncelikli) kazandığında da vitrinle "eşleşir" ve sessiz başarı üretirdi (security-reviewer YÜKSEK bulgusu).
 * `undefined` = kural yok (kaldırma): "genel kurala dönüş" motorun kendi cevabıdır, örnekten alınır.
 */
async function recalculateAndVerify(
  supabase: SupabaseClient<Database>,
  productId: string,
  yontem: ProductFixedPriceYontem,
  beklenen?: ExpectedStorefrontPrice | null,
  yazilanKuralId?: string,
): Promise<ProductPriceChangeResult> {
  let summary: MaterializeSummary
  try {
    summary = await materializePrices(supabase, { dryRun: false, productIds: [productId], yontem })
  } catch (err) {
    return { recalc: 'hata', recalcError: hataMetni(err), verification: null }
  }

  // Motorun bu ürün için bireysel segmentte ürettiği örnek (tek ürün kapsamında en çok 1 örnek).
  const sample = summary.samples[0]
  const expected: ExpectedStorefrontPrice | null =
    beklenen !== undefined ? beklenen : sample ? { net: sample.net, gross: sample.gross } : null
  // "Başka kural kazandı": yazdığımız kural motorun seçtiği kural değil (scope 0 varyant kuralı, kitaba özel kural,
  // daha yüksek öncelikli kural...). Fiyat yine de tutabilir; kullanıcıya hangi kuralın vitrini belirlediği gösterilir.
  const golgelendi = yazilanKuralId !== undefined && sample !== undefined && sample.ruleId !== yazilanKuralId
  const kazananKuralId = sample?.ruleId ?? null
  try {
    const verification = await verifyProductStorefrontPrice(supabase, productId, expected)
    return { recalc: 'tamam', summary, verification, golgelendi, kazananKuralId }
  } catch (err) {
    // Yazma başarılı, yalnız geri okuma düştü: yansıma DOĞRULANAMADI — sessizce "tamam" demeyiz.
    return { recalc: 'hata', recalcError: hataMetni(err), summary, verification: null, golgelendi, kazananKuralId }
  }
}

export interface SetProductPriceResult extends ProductPriceChangeResult {
  /** Yazılan kural (kural yazımı düşerse fonksiyon ATAR ve hiçbir şey yazılmamış olur). */
  rule: PricingRuleRow
}

/**
 * Sabit fiyatı yazar; istenirse yalnız o ürünü yeniden hesaplar ve vitrini doğrular.
 * Kural yazımı düşerse HATA atılır (yarım durum yok). Kural yazıldı ama yeniden hesap düştüyse sonuç
 * `recalc:'hata'` taşır: kısmi başarı AÇIK yazılır, çağıran "tekrar dene" gösterir.
 */
export async function setProductPrice(
  supabase: SupabaseClient<Database>,
  productId: string,
  input: ProductFixedPriceInput,
  options: ProductPriceChangeOptions,
): Promise<SetProductPriceResult> {
  const rule = await setProductFixedPrice(supabase, productId, input, options.yontem, options.updatedBy)
  if (!options.recalculate) return { rule, recalc: 'yapilmadi', verification: null }
  // Beklenen = YÖNETİCİNİN GİRDİĞİ fiyat: yazılan kuraldan, çözücünün AYNI saf işleviyle (maliyet yok → kelepçe yok;
  // güncelleme yolu kelepçe/ek ücret/yuvarlama/charm alanlarını sıfırladığı için sonuç girilen tutardır).
  const computed = computePriceFromRule(rule, null, [])
  const beklenen: ExpectedStorefrontPrice | null = computed ? { net: computed.net, gross: computed.gross } : null
  return { rule, ...(await recalculateAndVerify(supabase, productId, options.yontem, beklenen, rule.id)) }
}

export interface ClearProductPriceResult extends ProductPriceChangeResult {
  /** Kaldırılan sabit kural sayısı (0 = zaten yoktu). */
  removed: number
}

/** Sabit fiyat kuralını kaldırır (ürün genel kurala döner); istenirse yeniden hesaplar ve vitrini doğrular. */
export async function clearProductPrice(
  supabase: SupabaseClient<Database>,
  productId: string,
  options: Pick<ProductPriceChangeOptions, 'yontem' | 'recalculate'>,
): Promise<ClearProductPriceResult> {
  const removed = await clearProductFixedPrice(supabase, productId, options.yontem)
  if (!options.recalculate) return { removed, recalc: 'yapilmadi', verification: null }
  return { removed, ...(await recalculateAndVerify(supabase, productId, options.yontem)) }
}

/* ──────────────────── yan panelin okuduğu durum (REC-412 Faz 2a) ──────────────────── */

/** Yeni sabit kuralın KDV oranı: `pricing_rule.vat_rate_pct` sütun varsayılanıyla AYNI (tabloda %20). */
export const DEFAULT_VAT_RATE_PCT = 20

/** Ürünün mevcut "TEK sabit kuralı"nın panele gereken alanları (marj/maliyet alanı YOK, karar 95). */
export interface ProductFixedRuleView {
  id: string
  /** Kuralda saklanan tutar: `vatIncluded` true ise KDV DAHİL girilen, false ise KDV HARİÇ (net) girilen. */
  fixedPrice: number
  vatIncluded: boolean
  vatRatePct: number
}

export interface ProductPricePanelState {
  /** Vitrinde şu an görünen (bireysel liste, TRY, aktif satır); `beklenen-yok` = okundu, kıyas yapılmadı. */
  storefront: StorefrontVerification
  /** Ürünün TEK sabit kuralı; yoksa null (genel kural uygulanıyor). */
  fixedRule: ProductFixedRuleView | null
  /** Ürünün bu panelin yönetmediği sabit kuralları (para birimli, dönemli/kampanya, kitaba özel, kademeli): kural sayfasında yönetilir. */
  otherFixedRules: number
}

/**
 * Yan panel açılırken okunur. YALNIZ okur; kural satırından yalnız panelin gösterdiği dar alanlar seçilir
 * (`select('*')` marj alanlarını da döndürürdü — moderatör maliyet/marj görmez, karar 95).
 * Kural sorgusu ürünün TÜM sabit kurallarını çeker; "tek kural" ayrımı `isProductFixedRule` ile yapılır (indeks koşuluyla
 * aynı tanım). Birden çok eşleşen kural veri anomalisidir: panel yanlış birini göstermesin diye HATA atılır (servis de aynını yapar).
 */
export async function loadProductPricePanelState(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<ProductPricePanelState> {
  const [storefront, rules] = await Promise.all([
    verifyProductStorefrontPrice(supabase, productId, null),
    supabase
      .from('pricing_rule')
      .select('id, method, price_book_id, min_quantity, currency, valid_from, valid_to, fixed_price, price_is_vat_inclusive, vat_rate_pct')
      .eq('scope', 1)
      .eq('product_id', productId)
      .eq('method', 'fixed'),
  ])
  if (rules.error) throw rules.error

  const all = rules.data ?? []
  const own = all.filter(isProductFixedRule)
  if (own.length > 1) {
    throw new Error(
      `loadProductPricePanelState: ürün ${productId} için ${own.length} sabit kural var (en fazla 1 olmalı); kural sayfasından fazlalıkları temizleyin.`,
    )
  }
  const current = own[0]
  const fixedRule: ProductFixedRuleView | null =
    current && current.fixed_price !== null
      ? {
          id: current.id,
          fixedPrice: current.fixed_price,
          vatIncluded: current.price_is_vat_inclusive,
          vatRatePct: current.vat_rate_pct,
        }
      : null
  return { storefront, fixedRule, otherFixedRules: all.length - own.length }
}

/**
 * Saf: girilen tutarın VİTRİNDE görüneceği net/brüt. Panel önizlemesi ile kaydın "beklenen" fiyatı AYNI çözücü işlevinden
 * (`computePriceFromRule`) gelir: gösterilen sayı ile vitrinde görülecek sayı ayrışamaz. KDV DAHİL girişte net yuvarlanıp
 * brüt yeniden hesaplandığı için girilen brüt kuruş düzeyinde değişebilir (ör. 999,99 → 1.000,00); çağıran bunu gösterir.
 * Geçersiz tutarda null (kayıt zaten reddeder).
 */
export function previewProductFixedPrice(
  amount: number,
  vatIncluded: boolean,
  vatRatePct: number = DEFAULT_VAT_RATE_PCT,
): { net: number; gross: number } | null {
  if (!isValidFixedPriceAmount(amount)) return null
  const rule: PricingRuleRow = {
    id: 'onizleme',
    tenant_id: 'onizleme',
    price_book_id: null,
    scope: 1,
    product_id: 'onizleme',
    brand_id: null,
    category_id: null,
    method: 'fixed',
    base: 'cost',
    margin_pct: null,
    surcharge: 0,
    fixed_price: amount,
    vat_rate_pct: vatRatePct,
    price_is_vat_inclusive: vatIncluded,
    min_margin_abs: null,
    max_margin_abs: null,
    round_to: null,
    charm_ending: null,
    min_quantity: 1,
    priority: 0,
    is_exclusive: true,
    currency: null,
    valid_from: null,
    valid_to: null,
    created_at: '',
    updated_at: '',
    updated_by: null,
  }
  return computePriceFromRule(rule, null, [])
}

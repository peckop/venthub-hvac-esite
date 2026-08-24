import type { SupabaseClient } from '@supabase/supabase-js'

import { resolveFxRate } from '@/lib/services/fxRate.service'
import { distinctPurchaseCurrenciesInScope } from '@/lib/services/pricingAdmin.service'
import type { Database } from '@/types/database.types'

/**
 * KUR KİLİDİ KAYDEDİLİRKEN VERİLEN KARAR (FX-LOCK 2/2b · pricing-standard §8).
 *
 * Cetvel kararı [D]: bir kilit, kapsamın kurunu DONDURUR. Ama "kapsamın kuru"
 * ancak kapsamda TEK bir alış para birimi varsa anlamlıdır. İki farklı para birimi
 * içeren bir kapsama tek bir kur yazmak, ürünlerin yarısını YANLIŞ kurdan
 * dondurmak demektir — ve bu sessiz olur, çünkü kilit "çalışıyor" görünür.
 *
 * Bu yüzden karar ÜÇ dala ayrılır ve ikisi REDDEDER:
 *   0 para birimi  → kapsamda aktif ürün yok, kilit anlamsız → RED
 *   1 para birimi  → o anki kur çözülür ve dondurulur       → KABUL
 *   2+ para birimi → tek kur yanlış olurdu                   → RED (listelenir)
 *
 * DÖRDÜNCÜ DAL — kur bulunamazsa: `fx_lock=true` ama `fx_frozen_rate=null` bir
 * satır zaten DB CHECK'ine (`pricing_policy_lock_provenance`) takılır. Ham DB
 * hatası yerine burada adlandırılmış bir ret üretilir; admin "neden olmadı"yı
 * ekranda okur, sunucu günlüğünde aramaz.
 *
 * NİÇİN AYRI DOSYA: karar, kendisini gösteren modal'dan bağımsız olarak
 * sınanabilir olmalı. Modalın içine gömülseydi "iki para birimi reddedilir mi"
 * sorusu ancak DOM üzerinden sorulabilirdi ve kural, render değişince kırılırdı.
 */

export type FxLockFreezeDecision =
  /** Kapsamda aktif ürün yok — kilitlenecek bir şey yok. */
  | { kind: 'noProducts' }
  /** Birden çok alış para birimi — tek kur yanlış olur, kayıt reddedilir. */
  | { kind: 'multiCurrency'; currencies: string[] }
  /** Para birimi tek ama o kur için kayıt yok — künyesiz kilit yazılamaz. */
  | { kind: 'rateUnavailable'; currency: string }
  /** Kilit yazılabilir: bu kur dondurulacak. */
  | { kind: 'ok'; currency: string; rate: number; effectiveDate: string }

/**
 * Verilen kapsam için kilidin dondurabileceği kuru çözer.
 *
 * `today` DIŞARIDAN geçilir (çağıranın saati) — böylece karar saf kalır ve testte
 * sabit bir güne sabitlenebilir; içeride `new Date()` çağırmak testi takvime bağlardı.
 */
export async function resolveFxLockFreeze(
  supabase: SupabaseClient<Database>,
  scope: number,
  targetId: string | null,
  today: string,
): Promise<FxLockFreezeDecision> {
  const currencies = await distinctPurchaseCurrenciesInScope(supabase, scope, targetId)

  /*
    Boş dizi TEK anlama gelir: kapsamda aktif ürün yok. Bu okuma kesindir çünkü
    `purchase_currency` NOT NULL'dır — yani "ürün var ama para birimi boş" hâli
    doğmaz. (Yardımcı örnekleme YAPMAZ ve sayfa sınırını aşarsa eksik sonuç
    dönmek yerine hata atar; eksik küme burada "tek para birimi" yanılsaması
    üretirdi.)
  */
  if (currencies.length === 0) return { kind: 'noProducts' }
  if (currencies.length > 1) return { kind: 'multiCurrency', currencies }

  const currency = currencies[0]
  const resolved = await resolveFxRate(supabase, currency, today)
  if (!resolved) return { kind: 'rateUnavailable', currency }

  return {
    kind: 'ok',
    currency,
    rate: resolved.rate,
    effectiveDate: resolved.effectiveDate,
  }
}

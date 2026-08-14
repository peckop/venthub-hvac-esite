import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

/**
 * W4b · Vitrin fiyatı köprüsü (T001-VH).
 *
 * Fiyat TÜRETİLİR (cetvel §1): müşteri yüzeyi ham `products.price` OKUMAZ — o alan
 * Kademe-2'de emekli edildi. Motorun ürettiği fiyat `product_prices` cache'inde durur ve
 * SQL tarafında `display_price(products)` computed column'ı ile çözülür.
 *
 * Bu servis onun TS köprüsüdür. `get_display_prices` RPC'si aynı SQL tanımını çağırır —
 * yani burada ikinci bir fiyat hesabı YOKTUR, olamaz (INV-PRICE-1).
 *
 * Segment: RPC SECURITY INVOKER'dır, `product_prices` RLS'i çağıranın segmentine göre
 * süzer (anon → yalnız bireysel liste). Bireysel/anon BRÜT (KDV dahil), bayi/kurumsal NET
 * görür; `taxIncluded` bunu taşır ve etiket ("KDV Dahil" / "+KDV") ona göre çizilir.
 */

/** Tek ürünün vitrin fiyatı. `amount` yoksa ürün fiyatlanamaz → "Teklif Alın". */
export interface DisplayPriceInfo {
  amount: number
  taxIncluded: boolean
}

/** Vitrin fiyatı iliştirilmiş satır. `displayPrice === null` → "Teklif Alın". */
export type WithDisplayPrice<T> = T & {
  displayPrice: number | null
  displayPriceTaxIncluded: boolean | null
}

/** RPC argümanı uuid[]; çok uzun listede istek şişmesin diye parçalanır. */
const PRICE_LOOKUP_CHUNK = 200

/**
 * Ürün kimliklerine göre vitrin fiyatlarını çeker.
 * Fiyatı olmayan ürün haritada YER ALMAZ (null yerine yokluk) — çağıran taraf
 * "fiyat yok" ile "sıfır fiyat"ı karıştıramasın.
 */
export async function fetchDisplayPrices(
  supabase: SupabaseClient<Database>,
  productIds: string[],
): Promise<Map<string, DisplayPriceInfo>> {
  const result = new Map<string, DisplayPriceInfo>()
  const unique = [...new Set(productIds.filter(id => typeof id === 'string' && id.length > 0))]
  if (unique.length === 0) return result

  for (let i = 0; i < unique.length; i += PRICE_LOOKUP_CHUNK) {
    const chunk = unique.slice(i, i + PRICE_LOOKUP_CHUNK)
    const { data, error } = await supabase.rpc('get_display_prices', { p_product_ids: chunk })
    // Fiyat çözülemezse vitrin "Teklif Alın" gösterir — sayfayı düşürmek yanlış olur.
    if (error || !data) continue
    for (const row of data) {
      const amount = Number(row.display_price)
      if (!Number.isFinite(amount) || amount <= 0) continue
      result.set(row.product_id, { amount, taxIncluded: row.tax_included === true })
    }
  }

  return result
}

/** Saf: satırlara vitrin fiyatını iliştirir (fiyatsız satır null taşır). */
export function attachDisplayPrices<T extends { id: string }>(
  rows: T[],
  prices: Map<string, DisplayPriceInfo>,
): WithDisplayPrice<T>[] {
  return rows.map(row => {
    const info = prices.get(row.id)
    return {
      ...row,
      displayPrice: info ? info.amount : null,
      displayPriceTaxIncluded: info ? info.taxIncluded : null,
    }
  })
}

/**
 * Kısayol: satırları çekip fiyatlarını tek çağrıda iliştirir.
 * DI zorunlu (CLAUDE.md kural 2) — ilk parametre supabase.
 */
export async function withDisplayPrices<T extends { id: string }>(
  supabase: SupabaseClient<Database>,
  rows: T[],
): Promise<WithDisplayPrice<T>[]> {
  if (rows.length === 0) return []
  const prices = await fetchDisplayPrices(supabase, rows.map(r => r.id))
  return attachDisplayPrices(rows, prices)
}

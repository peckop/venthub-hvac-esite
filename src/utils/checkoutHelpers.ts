import type { CartItem } from '@/types/cart'

/**
 * Safely converts a number to 2 decimal places.
 */
const to2 = (n: number) => Number(Number(n).toFixed(2))

/**
 * Fiyat yoksa `null` — 0 DEĞİL (W4b). İki taraf da bu normalizasyonu kullanır ki
 * "fiyat bekleniyor" durumu yerelde null / sunucuda 0 görünüp sonsuz uyuşmazlığa düşmesin.
 */
const normUnit = (value: unknown): number | null => {
  const v = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(v) ? to2(v) : null
}

/**
 * Generates a consistent hash string for the local cart items by normalizing product IDs, quantities, and unit prices.
 * Used to detect changes during the checkout process and ensure local state matches server expectations.
 * Unpriced items are correctly hashed with a null unit to prevent false positive matches with zero-price fallbacks.
 *
 * @param items - The list of cart items in the user's local session
 * @returns A JSON stringified representation of the normalized and sorted cart items
 *
 * @example
 * const items = [{ id: 'p1', quantity: 2, unitPrice: 150.5 }];
 * getPriceHashLocal(items) // returns '[{"id":"p1","qty":2,"unit":150.5}]'
 */
export const getPriceHashLocal = (items: CartItem[]) => {
  const norm = items.map(i => ({
    id: i.id,
    qty: i.quantity,
    unit: normUnit(i.unitPrice)
  })).sort((a, b) => a.id.localeCompare(b.id))

  return JSON.stringify(norm)
}

/**
 * Generates a consistent hash string for the server cart items to compare against the local cart hash.
 * Falls back to local item quantities if the server response omits them, ensuring structural parity for comparison.
 * Unpriced items are correctly hashed with a null unit, matching the local normalization logic.
 *
 * @param serverItems - The list of cart items returned from the server (e.g., from a pricing calculation)
 * @param localItems - The list of cart items in the user's local session to use as a fallback for missing quantities
 * @returns A JSON stringified representation of the normalized and sorted server cart items
 *
 * @example
 * const serverItems = [{ product_id: 'p1', unit_price: 150.5 }];
 * const localItems = [{ id: 'p1', quantity: 2, unitPrice: 150.5 }];
 * getPriceHashServer(serverItems, localItems) // returns '[{"id":"p1","qty":2,"unit":150.5}]'
 */
export const getPriceHashServer = (
  serverItems: Array<{ product_id: string; quantity?: number; unit_price: number | null }> | undefined | null,
  localItems: CartItem[]
) => {
  const arr = Array.isArray(serverItems) ? serverItems : []
  const norm = arr.map(i => ({
    id: String(i.product_id),
    qty: Number(i.quantity ?? localItems.find(it => it.id === String(i.product_id))?.quantity ?? 0),
    unit: normUnit(i.unit_price)
  })).sort((a, b) => a.id.localeCompare(b.id))

  return JSON.stringify(norm)
}

/**
 * Resolves a translation key using the provided translation function, returning a fallback string if the key is missing or an error occurs.
 * This ensures the UI remains stable even when specific dictionary entries are unavailable.
 *
 * @param t - The translation function (e.g., from i18next or custom hook)
 * @param key - The translation key to look up
 * @param fallback - The string to return if the translation is missing or fails
 * @returns The translated string, or the fallback string if the key equals the result or an error is thrown
 *
 * @example
 * // When "checkout.title" exists
 * getTranslationWithFallback(t, "checkout.title", "Secure Checkout") // returns "Güvenli Ödeme"
 *
 * @example
 * // When "checkout.missing_key" does not exist
 * getTranslationWithFallback(t, "checkout.missing_key", "Default Title") // returns "Default Title"
 */
export const getTranslationWithFallback = (t: (key: string) => string, key: string, fallback: string) => {
  try {
    const v = t(key)
    return v === key ? fallback : v
  } catch {
    return fallback
  }
}

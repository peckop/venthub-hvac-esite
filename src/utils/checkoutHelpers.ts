import { CartItem } from '../contexts/CartContext'

/**
 * Safely converts a number to 2 decimal places.
 */
const to2 = (n: number) => Number(Number(n).toFixed(2))

/**
 * Generates a deterministic hash string representing the pricing state of the local cart items.
 * Used to detect changes during the checkout process and synchronize with the server.
 *
 * @param items - The array of cart items currently in local state
 * @returns A JSON string hash of the normalized item IDs, quantities, and unit prices
 *
 * @example
 * getPriceHashLocal([{ id: '123', quantity: 2, unitPrice: 15.50 }]) // returns "[{\"id\":\"123\",\"qty\":2,\"unit\":15.5}]"
 */
export const getPriceHashLocal = (items: CartItem[]) => {
  const norm = items.map(i => ({
    id: i.id,
    qty: i.quantity,
    unit: to2(Number((typeof i.unitPrice === 'number' ? i.unitPrice : Number(i.product.price))))
  })).sort((a, b) => a.id.localeCompare(b.id))
  
  return JSON.stringify(norm)
}

/**
 * Generates a deterministic hash string representing the pricing state of the server-side cart items.
 * Merges server-provided items with local cart quantities as fallbacks for accurate comparison.
 *
 * @param serverItems - The array of items returned by the server, containing product IDs and unit prices
 * @param localItems - The array of local cart items, used as a fallback for missing quantities
 * @returns A JSON string hash of the normalized item IDs, quantities, and unit prices
 *
 * @example
 * getPriceHashServer([{ product_id: '123', unit_price: 15.50 }], localItems) // returns "[{\"id\":\"123\",\"qty\":2,\"unit\":15.5}]"
 */
export const getPriceHashServer = (
  serverItems: Array<{ product_id: string; quantity?: number; unit_price: number }> | undefined | null,
  localItems: CartItem[]
) => {
  const arr = Array.isArray(serverItems) ? serverItems : []
  const norm = arr.map(i => ({
    id: String(i.product_id),
    qty: Number(i.quantity ?? localItems.find(it => it.id === String(i.product_id))?.quantity ?? 0),
    unit: to2(Number(i.unit_price))
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

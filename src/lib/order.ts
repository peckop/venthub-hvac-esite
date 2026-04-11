export interface ValidationItem { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }
export interface StockIssue { product_id: string; requested: number; available: number }
interface PriceMismatch {
  product_id: string;
  expected_price: number;
  actual_price: number;
}

export interface ValidationResult { ok: boolean; items: ValidationItem[]; mismatches: PriceMismatch[]; stock_issues?: StockIssue[]; totals: { subtotal: number }; cart_id: string }

/**
 * Validates the current cart contents (prices, stock, subtotal) against the authoritative server data via a Supabase edge function.
 * This ensures that local tampering or stale client state does not result in an invalid order during checkout.
 *
 * @param input - The cart and optional user identification payload
 * @param input.cartId - The local session cart ID (if unauthenticated)
 * @param input.userId - The authenticated user's Supabase UUID (if logged in)
 * @returns A promise resolving to the server's validation result containing current authoritative pricing and any stock/price mismatches
 * @throws {Error} If Supabase environment variables are missing, or if the edge function request fails
 *
 * @example
 * const validation = await validateServerCart({ userId: '123e4567-e89b-12d3-a456-426614174000' });
 * if (!validation.ok) {
 *   console.warn("Price mismatch found", validation.mismatches);
 * }
 */
export async function validateServerCart(input: { cartId?: string; userId?: string }): Promise<ValidationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!url || !anon) throw new Error('Missing Supabase envs')
  const resp = await fetch(`${url}/functions/v1/order-validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ cart_id: input.cartId, user_id: input.userId })
  })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}




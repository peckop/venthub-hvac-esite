export interface ValidationItem { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }
export interface StockIssue { product_id: string; requested: number; available: number }
interface PriceMismatch {
  product_id: string;
  expected_price: number;
  actual_price: number;
}

export interface ValidationResult { ok: boolean; items: ValidationItem[]; mismatches: PriceMismatch[]; stock_issues?: StockIssue[]; totals: { subtotal: number }; cart_id: string }

/**
 * Validates a user's shopping cart against the server to ensure prices and stock are current.
 * Makes a request to the Supabase Edge Function `order-validate`.
 *
 * @param input - The identifiers required to validate the cart
 * @param input.cartId - The unique identifier of the user's cart
 * @param input.userId - The unique identifier of the authenticated user
 * @returns A promise that resolves to the validation result, detailing stock issues, price mismatches, and calculated totals
 * @throws {Error} If Supabase environment variables are missing
 * @throws {Error} If the validation API endpoint returns a non-200 response
 *
 * @example
 * const result = await validateServerCart({ cartId: 'cart-123', userId: 'user-456' });
 * if (!result.ok) {
 *   console.log('Price mismatches:', result.mismatches);
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




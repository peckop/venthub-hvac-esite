export interface ValidationItem { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }
export interface ValidationResult { ok: boolean; items: ValidationItem[]; mismatches: any[]; totals: { subtotal: number }; cart_id: string }

export async function validateServerCart(input: { cartId?: string; userId?: string }): Promise<ValidationResult> {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || ''
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
  if (!url || !anon) throw new Error('Missing Supabase envs')
  const resp = await fetch(`${url}/functions/v1/order-validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ cart_id: input.cartId, user_id: input.userId })
  })
  if (!resp.ok) throw new Error(await resp.text())
  return await resp.json()
}

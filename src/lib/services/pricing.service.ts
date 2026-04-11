import { supabase } from '../supabase'
import type { Product } from '../supabase'

export type UserRole = 'individual' | 'dealer' | 'corporate' | 'admin'

export interface UserProfileLight {
  id: string
  role?: UserRole | null
  organization_id?: string | null
}

export interface OrganizationLight {
  id: string
  tier_level?: number | null
}

function nowIso(): string {
  return new Date().toISOString()
}

export async function getEffectiveUnitPrice(product: Product): Promise<number> {
  const info = await getEffectivePriceInfo(product)
  return info.unitPrice
}

export async function getEffectivePriceInfo(product: Product): Promise<{ unitPrice: number, priceListId: string | null }> {
  const fallback = (() => {
    const v = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0))
    return Number.isFinite(v) ? v : 0
  })()

  try {
    const { data: authData, error: userErr } = await supabase.auth.getUser()
    const user = userErr ? null : authData?.user

    if (!user) return { unitPrice: fallback, priceListId: null }

    const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profErr) return { unitPrice: fallback, priceListId: null }

    const profile = (prof || {}) as UserProfileLight
    const role = (profile.role || 'individual') as UserRole

    const now = nowIso()
    const { data: lists, error: listErr } = await supabase
      .from('price_lists')
      .select('id, user_type, effective_from')
      .eq('is_active', true)
      .lte('effective_from', now)
      .or(`effective_to.is.null,effective_to.gte.${now}`)

    if (listErr || !Array.isArray(lists)) return { unitPrice: fallback, priceListId: null }

    interface PriceListRow { 
      id: string; 
      user_type: string | null; 
      effective_from: string | null;
    }

    const typedLists: PriceListRow[] = lists
    
    // Filter and sort lists
    const matchedLists = typedLists.filter(list => {
      let match = false
      if (list.user_type === role) match = true
      if (!match && !list.user_type) match = true // fallback to default (no user_type)
      return match
    })

    const sorted = matchedLists.sort((a, b) => {
      // Prioritize specific user_type match over fallback
      if (!a.user_type !== !b.user_type) return a.user_type ? -1 : 1
      const aTime = a.effective_from ? new Date(a.effective_from).getTime() : 0
      const bTime = b.effective_from ? new Date(b.effective_from).getTime() : 0
      return bTime - aTime
    })

    const chosen = sorted.length > 0 ? sorted[0] : null

    // Try price lists in order: chosen, then fallback (null)
    const priceListIds = chosen ? [chosen.id, null] : [null]

    for (const plId of priceListIds) {
      let query = supabase
        .from('product_prices')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (plId === null) {
        query = query.is('price_list_id', null)
      } else {
        query = query.eq('price_list_id', plId)
      }

      const { data: rows, error: prErr } = await query
      if (prErr || !Array.isArray(rows) || rows.length === 0) continue

      const pick = rows.find(r => {
        const fromOk = !r.valid_from || new Date(r.valid_from).getTime() <= Date.now()
        const toOk = !r.valid_until || new Date(r.valid_until).getTime() >= Date.now()
        return fromOk && toOk
      }) || rows[0]

      const base = Number(pick.base_price || 0)
      const sale = pick.sale_price != null ? Number(pick.sale_price) : null
      const disc = Number(pick.discount_percentage || 0)

      if (sale != null && Number.isFinite(sale) && sale > 0) return { unitPrice: sale, priceListId: plId }
      if (Number.isFinite(base) && base > 0) {
        if (disc > 0) {
          const val = base * (1 - disc / 100)
          return { unitPrice: Math.max(0, Number(val.toFixed(2))), priceListId: plId }
        }
        return { unitPrice: base, priceListId: plId }
      }
    }

    return { unitPrice: fallback, priceListId: chosen ? chosen.id : null }
  } catch (e) {
    console.error('getEffectivePriceInfo error', e)
    return { unitPrice: fallback, priceListId: null }
  }
}

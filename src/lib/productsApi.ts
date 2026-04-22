// Lightweight product fetcher using Supabase REST (no supabase-js)
// This avoids pulling the large supabase-js bundle on initial route.

export interface LiteProduct {
  id: string
  name: string
  image_url?: string | null
  brand?: string | null
  sku?: string | null
  slug?: string | null
}

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function srf(path: string, params: Record<string, string | number | boolean | string[]>): Promise<Response> {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      for (const vv of v) usp.append(k, String(vv))
    } else {
      usp.append(k, String(v))
    }
  }
  const url = `${BASE}/rest/v1/${path}?${usp.toString()}`
  return fetch(url, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Accept': 'application/json',
    },
  })
}

/**
 * Fetches the initial product lists required for the home page using Supabase REST API directly.
 * It retrieves both featured products (up to 6) and a general list of active products.
 * This function bypasses the full `supabase-js` client to reduce the initial bundle size for the home route.
 *
 * @param limit - The maximum number of general list products to retrieve (defaults to 36)
 * @returns An object containing `featured` (array of up to 6 featured products) and `list` (array of general active products)
 * @throws {Error} If the HTTP request for featured products or the general list fails
 *
 * @example
 * const { featured, list } = await fetchHomeProducts(12);
 * console.log(`Got ${featured.length} featured and ${list.length} general products`);
 */
export async function fetchHomeProducts(limit: number = 36) {
  // 1) featured
  const featuredRes = await srf('products', {
    select: 'id,name,slug,image_url,brand,sku,is_featured,status',
    'is_featured': 'eq.true',
    'status': 'eq.active',
    'order': ['is_featured.desc', 'name.asc'],
    'limit': 6,
  })
  if (!featuredRes.ok) throw new Error('Featured fetch failed')
  const featured = (await featuredRes.json()) as LiteProduct[]

  // 2) general list
  const listRes = await srf('products', {
    select: 'id,name,slug,image_url,brand,sku,is_featured,status',
    'status': 'eq.active',
    'order': ['is_featured.desc', 'name.asc'],
    'limit': limit,
  })
  if (!listRes.ok) throw new Error('Products fetch failed')
  const list = (await listRes.json()) as LiteProduct[]

  return { featured, list }
}



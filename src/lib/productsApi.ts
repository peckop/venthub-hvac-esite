// Lightweight product fetcher using Supabase REST (no supabase-js)
// This avoids pulling the large supabase-js bundle on initial route.

export interface LiteProduct {
  id: string
  name: string
  image_url?: string | null
  brand?: string | null
  sku?: string | null
}

function getEnv(key: string): string {
  // Vite exposes env via import.meta.env
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {}
  const val = env[key]
  if (!val) throw new Error(`Missing env ${key}`)
  return val
}

const BASE = getEnv('VITE_SUPABASE_URL')
const KEY = getEnv('VITE_SUPABASE_ANON_KEY')

async function srf(path: string, params: Record<string, string | number | boolean>): Promise<Response> {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) usp.append(k, String(v))
  const url = `${BASE}/rest/v1/${path}?${usp.toString()}`
  return fetch(url, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Accept': 'application/json',
    },
  })
}

export async function fetchHomeProducts(limit: number = 36) {
  // 1) featured
  const featuredRes = await srf('products', {
select: 'id,name,image_url,brand,sku,is_featured,status',
    'is_featured': 'eq.true',
    'status': 'eq.active',
    'order': 'is_featured.desc',
    'order2': 'name.asc', // PostgREST supports multiple order keys via order,order2 in URLSearchParams
    'limit': 6,
  })
  if (!featuredRes.ok) throw new Error('Featured fetch failed')
  const featured = (await featuredRes.json()) as LiteProduct[]

  // 2) general list
  const listRes = await srf('products', {
select: 'id,name,image_url,brand,sku,is_featured,status',
    'status': 'eq.active',
    'order': 'is_featured.desc',
    'order2': 'name.asc',
    'limit': limit,
  })
  if (!listRes.ok) throw new Error('Products fetch failed')
  const list = (await listRes.json()) as LiteProduct[]

  return { featured, list }
}
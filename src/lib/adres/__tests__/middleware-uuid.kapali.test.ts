// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * REC-300 Faz 3 madde 6 (REC-289) — bayrak KAPALIYKEN (bugün) UUID ürün adresi middleware'de Edge DB
 * sorgusuyla çözülür: davranış BİREBİR. Açık kip: `middleware-uuid.acik.test.ts`.
 */
const db = vi.hoisted(() => ({ istemci: vi.fn(), tek: vi.fn() }))
vi.mock('@supabase/ssr', () => ({
  createServerClient: (...a: unknown[]) => {
    db.istemci(...a)
    return { from: () => ({ select: () => ({ eq: () => ({ single: db.tek }) }) }) }
  },
}))

const UUID = '0b0e6a52-6d0c-4f4f-9d5d-2f7a9b6b1c11'
const eskiEnv = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, anahtar: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ornek.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
})
afterAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = eskiEnv.url
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = eskiEnv.anahtar
})

describe('middleware UUID — ADRES_SEMASI_K3B = false', () => {
  it('bugünkü gibi Edge DB sorgusu → /<dil>/products/<slug> 308', async () => {
    db.tek.mockResolvedValue({ data: { slug: 'storm-10' } })
    const { middleware } = await import('@/middleware')
    const res = await middleware(new NextRequest(new URL(`/tr/products/${UUID}`, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } }))
    expect(db.istemci).toHaveBeenCalled()
    expect(res.status).toBe(308)
    expect(new URL(res.headers.get('location') ?? '').pathname).toBe('/tr/products/storm-10')
  })
})

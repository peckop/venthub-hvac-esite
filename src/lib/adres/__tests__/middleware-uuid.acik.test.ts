// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * REC-300 Faz 3 madde 6 (REC-289) — bayrak AÇIKKEN UUID ürün adresi için middleware Edge'de DB'ye
 * GİTMEZ (kural 12); istek sayfaya geçer, `resolveProductRoute` 0. adımı çözer
 * (`src/utils/__tests__/yuzeyAdresleri.test.ts` UUID dalları).
 */
const db = vi.hoisted(() => ({ istemci: vi.fn(), tek: vi.fn() }))
vi.mock('@supabase/ssr', () => ({
  createServerClient: (...a: unknown[]) => {
    db.istemci(...a)
    return { from: () => ({ select: () => ({ eq: () => ({ single: db.tek }) }) }), auth: { getUser: vi.fn() } }
  },
}))
vi.mock('@/config/features', async (asil) => ({ ...(await asil<typeof import('@/config/features')>()), ADRES_SEMASI_K3B: true }))
vi.mock('@/lib/adres/haritaKaynagi', async () => ({ ESKI_ADRES_HARITASI: (await import('./fikstur')).FIKSTUR_DOSYASI }))

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

describe('middleware UUID — ADRES_SEMASI_K3B = true', () => {
  it.each([`/tr/products/${UUID}`, `/en/products/${UUID}`])('%s: Edge DB sorgusu YOK, yönlendirme YOK (sayfa çözer)', async (yol) => {
    db.tek.mockResolvedValue({ data: { slug: 'storm-10' } })
    const { middleware } = await import('@/middleware')
    const res = await middleware(new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } }))
    expect(db.istemci).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBeNull()
  })
})

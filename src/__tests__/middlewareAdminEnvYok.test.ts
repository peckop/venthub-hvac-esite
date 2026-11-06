// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { middleware } from '@/middleware'

/**
 * K6 (güvenlik karnesi 2026-11) — Supabase env yokken `/admin` FAIL-CLOSED yönlendirilir.
 *
 * NİÇİN VAR: env boşken middleware admin kapısına gelmeden erken dönüyordu; `/admin` kabuğu
 * yetki denetimi olmadan açılıyordu. Kural: env yoksa admin rotası `/?auth_error=server_misconfigured`
 * adresine 302 alır; vitrin rotası eskisi gibi geçer.
 */
async function kos(yol: string) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } })
  const res = await middleware(req)
  const l = res.headers.get('location')
  return { durum: res.status, yer: l ? new URL(l).pathname + new URL(l).search : null }
}

describe('middleware — Supabase env yokken admin kapısı (K6)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it.each(['/admin', '/admin/', '/admin/orders/123'])('%s → 302 server_misconfigured', async (yol) => {
    const r = await kos(yol)
    expect(r.durum).toBe(302)
    expect(r.yer).toBe('/?auth_error=server_misconfigured')
  })

  it('vitrin rotası env yokken de geçer (yönlendirme yok)', async () => {
    const r = await kos('/tr/urunler')
    expect(r.yer).toBeNull()
  })
})

// @vitest-environment node
import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { encryptClaims, onbellekClaimGecerli, resolveUserClaims } from '@/utils/router'

/**
 * INV-AUTH-3 R5 · K1 (güvenlik karnesi 2026-11) — süresi dolmuş claim önbellekten kabul edilmez.
 *
 * NİÇİN VAR: `resolveUserClaims` önbellek çerezinde yalnız `user_role`'e bakıyordu. Çerez AES-GCM ile
 * mühürlü olduğu için sahtesi üretilemez, ama AYNI değer süresiz yeniden gönderilebiliyordu: rolü
 * düşürülen admin eski çerezle `/admin` kabuğuna girmeye devam ediyordu (veri RLS ile korunuyor).
 * Kural: JWT `exp`, `sub` ve önbelleğin kendi bitiş damgası denetlenir; biri tutmazsa `getClaims`.
 *
 * Testler davranışı ölçer: gerçek şifreleme, gerçek NextRequest, `getClaims` sahte.
 */
const SIR = 'test-claims-cache-sirri'
const SIMDI = Math.floor(Date.now() / 1000)

function istek(cerez: string): NextRequest {
  return new NextRequest(new URL('https://venthub.com.tr/admin'), {
    headers: { cookie: `sb-claims-cache=${cerez}` },
  })
}

function sahteSupabase(claims: Record<string, unknown> | null) {
  const getClaims = vi.fn(async () => ({ data: { claims }, error: null }))
  return { client: { auth: { getClaims } }, getClaims }
}

const TAZE = { sub: 'kullanici-1', user_role: 'viewer', exp: SIMDI + 3600 }

describe('INV-AUTH-3 R5 · claims önbelleği süre ve kimlik denetimi (K1)', () => {
  it('geçerli önbellek çerezi getClaims çağırmadan döner; iç damga sıyrılır', async () => {
    const cerez = await encryptClaims({ sub: 'u1', user_role: 'admin', exp: SIMDI + 600, vh_cache_exp: SIMDI + 600 }, SIR)
    const { client, getClaims } = sahteSupabase(TAZE)
    const r = await resolveUserClaims(istek(cerez), NextResponse.next(), client, SIR)
    expect(r.source).toBe('cache')
    expect(r.claims?.user_role).toBe('admin')
    expect(r.claims).not.toHaveProperty('vh_cache_exp')
    expect(getClaims).not.toHaveBeenCalled()
  })

  it.each([
    ['JWT exp geçmiş', { sub: 'u1', user_role: 'admin', exp: SIMDI - 1, vh_cache_exp: SIMDI + 600 }],
    ['JWT exp yok', { sub: 'u1', user_role: 'admin', vh_cache_exp: SIMDI + 600 }],
    ['önbellek damgası geçmiş', { sub: 'u1', user_role: 'admin', exp: SIMDI + 600, vh_cache_exp: SIMDI - 1 }],
    ['önbellek damgası yok (eski biçim çerez)', { sub: 'u1', user_role: 'admin', exp: SIMDI + 600 }],
    ['sub yok', { user_role: 'admin', exp: SIMDI + 600, vh_cache_exp: SIMDI + 600 }],
    ['sub boş', { sub: '', user_role: 'admin', exp: SIMDI + 600, vh_cache_exp: SIMDI + 600 }],
    ['exp metin', { sub: 'u1', user_role: 'admin', exp: String(SIMDI + 600), vh_cache_exp: SIMDI + 600 }],
  ])('%s → önbellek reddedilir, akış getClaims’e düşer', async (_ad, yuk) => {
    const cerez = await encryptClaims(yuk, SIR)
    const { client, getClaims } = sahteSupabase(TAZE)
    const res = NextResponse.next()
    const r = await resolveUserClaims(istek(cerez), res, client, SIR)
    expect(getClaims).toHaveBeenCalledTimes(1)
    expect(r.source).toBe('client')
    expect(r.claims?.user_role).toBe('viewer')
    // Taze çerez yazıldı ve yeni çerez de geçerli damga taşıyor.
    const yeni = res.cookies.get('sb-claims-cache')?.value
    expect(yeni).toBeTruthy()
    const { client: c2, getClaims: g2 } = sahteSupabase(null)
    const r2 = await resolveUserClaims(istek(yeni ?? ''), NextResponse.next(), c2, SIR)
    expect(r2.source).toBe('cache')
    expect(g2).not.toHaveBeenCalled()
  })

  it('onbellekClaimGecerli sınır: exp tam şimdi → geçersiz', () => {
    expect(onbellekClaimGecerli({ sub: 'u', user_role: 'a', exp: SIMDI, vh_cache_exp: SIMDI + 1 }, SIMDI)).toBe(false)
    expect(onbellekClaimGecerli({ sub: 'u', user_role: 'a', exp: SIMDI + 1, vh_cache_exp: SIMDI }, SIMDI)).toBe(false)
    expect(onbellekClaimGecerli({ sub: 'u', user_role: 'a', exp: SIMDI + 1, vh_cache_exp: SIMDI + 1 }, SIMDI)).toBe(true)
  })
})

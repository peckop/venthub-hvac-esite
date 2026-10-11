// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Rota dili anahtarı KAPALIYKEN middleware davranışı BUGÜNKÜYLE BİREBİR (OPS-52 PR-C2): dilsiz kol hiç
 * çalışmaz. Tablo `/about` ve `/contact` satırlarını taşısa da (varsayılan veri) anahtar kapalıyken
 * `/about` bugünkü dil öneki 307'sine düşer. Tablo aşağıdaki tabloda "master davranışı"dır.
 */
const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]
const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.resetModules()
})

async function istek(anahtar: string | undefined, yol: string, basliklar: Record<string, string> = {}) {
  if (anahtar === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = anahtar
  vi.resetModules()
  const { middleware } = await import('@/middleware')
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', ...basliklar } })
  const res = await middleware(req)
  const konum = res.headers.get('location')
  return { durum: res.status, konum: konum ? new URL(konum).pathname + new URL(konum).search : null, res }
}

describe('middleware — rota dili anahtarı KAPALI: bugünkü akış', () => {
  it.each([undefined, '0', 'true', ''])('anahtar %j: dilsiz /about ve /contact bugünkü 307 dil öneki (sorgu korunur)', async (anahtar) => {
    expect(await istek(anahtar, '/about', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/about' })
    expect(await istek(anahtar, '/about', { 'accept-language': 'en-US,en;q=0.9' })).toMatchObject({ durum: 307, konum: '/en/about' })
    expect(await istek(anahtar, '/contact?dept=satis', { 'accept-language': TR_CHROME })).toMatchObject({
      durum: 307,
      konum: '/tr/contact?dept=satis',
    })
  })

  it('kol çalışmadığı için kalıcı önbellek başlığı da EKLENMEZ (bugünkü 307 başlıksız)', async () => {
    const r = await istek(undefined, '/about', { 'accept-language': TR_CHROME })
    expect(r.res.headers.get('cache-control')).toBeNull()
  })

  it('dilli adresler ve Aşama 2 yüzeyleri bugünkü akışta (yönlendirme yok / bugünkü dil öneki)', async () => {
    for (const yol of ['/tr/about', '/en/contact', '/tr/hakkimizda', '/tr/cart', '/tr/account/orders']) {
      expect((await istek(undefined, yol)).konum, yol).toBeNull()
    }
    expect(await istek(undefined, '/cart', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/cart' })
    expect(await istek(undefined, '/account', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/account' })
  })
})

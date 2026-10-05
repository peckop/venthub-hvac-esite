// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { middleware } from '@/middleware'

/**
 * Bayrak KAPALIYKEN middleware davranışı BUGÜNKÜYLE BİREBİR (REC-300 Faz 3 m.4): eşleyici hiç
 * çağrılmaz; aşağıdaki tablo master'daki (e4b7e4e22) middleware'in davranışıdır.
 */
const esleyiciCagrisi = vi.hoisted(() => vi.fn())
vi.mock('@/lib/adres/eslestirici', () => ({ eskiAdresEsle: esleyiciCagrisi }))

const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'

async function istek(yol: string, basliklar: Record<string, string> = {}) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', ...basliklar } })
  const res = await middleware(req)
  const konum = res.headers.get('location')
  return { durum: res.status, konum: konum ? new URL(konum).pathname + new URL(konum).search : null, res }
}

describe('middleware — ADRES_SEMASI_K3B = false', () => {
  it.each([
    ['/', {}, 308, '/tr'],
    ['/category/fanlar', { 'accept-language': TR_CHROME }, 307, '/tr/category/fanlar'],
    ['/category/fans', { 'accept-language': 'en-US,en;q=0.9' }, 307, '/en/category/fans'],
    ['/products/storm-serisi?sku=SEA-61143003', { 'accept-language': TR_CHROME }, 307, '/tr/products/storm-serisi?sku=SEA-61143003'],
    // `/tr/admin/…` → 308 `/admin/…` dalı bu tabloda YOK: bugün `/en/admin/products` → `/admindmin/products`
    // üretiyor (substring hesabı, bu işten bağımsız kusur; ayrı kayda raporlandı).
  ])('%s → %s %s', async (yol, basliklar, durum, konum) => {
    const r = await istek(yol, basliklar)
    expect(r.durum).toBe(durum)
    expect(r.konum).toBe(konum)
  })

  it.each([
    '/tr/category/fans',
    '/tr/category/fans/duct-fans',
    '/tr/products/storm-serisi?sku=SEA-61143003',
    '/en/products/vortice-lineo-100-quiet',
    '/tr/cart',
    '/robots.txt',
    '/api/health',
  ])('%s → yönlendirme yok (bugünkü akış)', async (yol) => {
    const r = await istek(yol)
    expect(r.konum).toBeNull()
    expect(r.res.headers.get('x-middleware-next')).toBe('1')
  })

  it('eşleyici hiçbir istekte çağrılmadı', () => {
    expect(esleyiciCagrisi).not.toHaveBeenCalled()
  })
})

/**
 * INV-DIL-TESPITI-1 middleware kolu — Türkçe Chrome'un varsayılan başlığı TR'ye gider. Onarım master'da
 * (#1336, `tercihEdilenDil`); bu test onu middleware'in GERÇEK çıktısında ölçer (birim testi
 * `src/test/dil-tespiti.test.ts` yalnız yardımcıyı ölçüyor).
 */
describe('middleware — dil tespiti (q değeri esas)', () => {
  it('Türkçe Chrome varsayılanı dilsiz adreste /tr/\'ye', async () => {
    expect((await istek('/category/fans', { 'accept-language': TR_CHROME })).konum).toBe('/tr/category/fans')
  })

  it('İngilizce birincil dil /en/\'e; NEXT_LOCALE çerezi başlıktan önce gelir', async () => {
    expect((await istek('/category/fans', { 'accept-language': 'en-GB,en;q=0.9,tr;q=0.8' })).konum).toBe('/en/category/fans')
    expect((await istek('/category/fans', { 'accept-language': TR_CHROME, cookie: 'NEXT_LOCALE=en' })).konum).toBe('/en/category/fans')
  })
})

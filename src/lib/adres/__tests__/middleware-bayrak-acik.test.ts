// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { middleware } from '@/middleware'

/**
 * Bayrak AÇIKKEN (Faz 3-C benzetimi) middleware eşleyiciyi dil öneğinden ÖNCE çağırır: dilsiz eski
 * adres tek hop, dilli eski adres tek 308, hedefte query yok, kalıcı önbelleğe karşı başlık var.
 */
vi.mock('@/config/features', async (asil) => ({ ...(await asil<typeof import('@/config/features')>()), ADRES_SEMASI_K3B: true }))
vi.mock('@/lib/adres/haritaKaynagi', async () => ({ ESKI_ADRES_HARITASI: (await import('./fikstur')).FIKSTUR_DOSYASI }))

const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'

async function istek(yol: string, basliklar: Record<string, string> = {}) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', ...basliklar } })
  const res = await middleware(req)
  const konum = res.headers.get('location')
  return { durum: res.status, konum: konum ? new URL(konum).pathname + new URL(konum).search : null, res }
}

describe('middleware — ADRES_SEMASI_K3B = true (fikstür harita)', () => {
  it('dilsiz Türkçe slug: bugünkü 4 hop yerine TEK 308 → /tr/kategori/…; önbellek başlığı + kiracı çerezi', async () => {
    const r = await istek('/category/fanlar', { 'accept-language': 'en-US,en;q=0.9' })
    expect(r.durum).toBe(308)
    expect(r.konum).toBe('/tr/kategori/fanlar')
    expect(r.res.headers.get('cache-control')).toBe('max-age=0, must-revalidate')
    expect(r.res.cookies.get('tenant_id')?.value).toBe('d3b07384-d113-495f-a558-8c38634e0000')
  })

  it('dilsiz, dilden bağımsız slug: TEK 307, dil tespitiyle', async () => {
    expect(await istek('/category/fans', { 'accept-language': 'en-US,en;q=0.9' })).toMatchObject({ durum: 307, konum: '/en/category/fans' })
    expect(await istek('/category/fans', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/kategori/fanlar' })
  })

  it('dilli eski adres + ?sku= + utm: TEK 308, hedefte query yok', async () => {
    const r = await istek('/tr/products/storm-serisi?sku=sea-61143003&utm_source=bulten')
    expect(r).toMatchObject({ durum: 308, konum: '/tr/urun/storm-serisi' })
  })

  it('kanonik ve eşleşmeyen yollar bugünkü akışa devam eder', async () => {
    for (const yol of ['/en/category/fans', '/tr/cart', '/tr/kategori/fanlar']) {
      const r = await istek(yol)
      expect(r.konum, yol).toBeNull()
    }
    // Eşleşmeyen dilsiz yol: bugünkü dil öneki 307'si.
    expect(await istek('/about', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/about' })
  })
})

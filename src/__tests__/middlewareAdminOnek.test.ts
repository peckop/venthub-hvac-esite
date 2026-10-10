// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { middleware } from '@/middleware'

/**
 * Dil önekli yönetici adresi önek SÖKÜLEREK `/admin…`'e 308 ile gider (REC-127 dalı).
 *
 * NİÇİN VAR (2026-09-25, canlıda ölçüldü): `/tr/admin` → 308 `/admindmin`, `/en/admin/products` →
 * 308 `/admindmin/products`. Önek hesabı iki karakter fazla yiyordu. 308 tarayıcıda kalıcı
 * önbelleklendiği için kırık hedef ziyaretçide kalır; bu tablo hedefi birebir sabitler.
 */
async function konum(yol: string) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } })
  const res = await middleware(req)
  const l = res.headers.get('location')
  return { durum: res.status, yol: l ? new URL(l).pathname + new URL(l).search : null }
}

describe('middleware — dil önekli yönetici adresi', () => {
  it.each([
    ['/tr/admin', '/admin'],
    ['/en/admin', '/admin'],
    ['/tr/admin/', '/admin/'],
    ['/en/admin/products', '/admin/products'],
    ['/tr/admin/orders/123', '/admin/orders/123'],
    ['/tr/admin/products?sayfa=2', '/admin/products?sayfa=2'],
  ])('%s → 308 %s', async (gelen, hedef) => {
    const r = await konum(gelen)
    expect(r.durum).toBe(308)
    expect(r.yol).toBe(hedef)
  })
})

// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { INDEXNOW_ANAHTARI } from '@/config/indexnow'
import { middleware } from '@/middleware'

/**
 * INV-INDEXNOW-1 (REC-405) · doğrulama dosyası `/<anahtar>.txt` middleware'de YÖNLENDİRİLMEZ.
 *
 * NİÇİN: IndexNow anahtarın sahipliğini `https://<site>/<anahtar>.txt` isteğiyle doğrular. Middleware
 * dilsiz yolları `/tr/…`'ye 307'ler; kök `.txt` muafiyeti (REC-127) olmasa doğrulama isteği
 * `/tr/<anahtar>.txt`'ye gider, orada dosya yoktur → 404 → IndexNow 403.
 */
async function istek(yol: string) {
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr' } })
  const res = await middleware(req)
  return { durum: res.status, konum: res.headers.get('location') }
}

describe('middleware — IndexNow doğrulama dosyası', () => {
  it(`/${INDEXNOW_ANAHTARI}.txt yönlendirilmez`, async () => {
    const r = await istek(`/${INDEXNOW_ANAHTARI}.txt`)
    expect(r.konum, `doğrulama dosyası yönlendirildi → ${r.konum}`).toBeNull()
    expect(r.durum).toBe(200)
  })

  it('karşı örnek: dilsiz sayfa yolu yönlendirilir (test gerçekten middleware\'i ölçüyor)', async () => {
    const r = await istek('/bilgi-merkezi')
    expect(r.durum).toBe(307)
    expect(r.konum).not.toBeNull()
  })
})

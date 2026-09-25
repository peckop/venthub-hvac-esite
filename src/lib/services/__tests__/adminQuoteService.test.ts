// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import type { Database } from '../../../types/database.types'
import { derivePublishHeader, type PublishItem,publishQuote } from '../adminQuoteService'

/**
 * Teklif yayım yolu (REC-54). Kusur 2026-09-24'te canlıda ölçüldü: admin ekranı yayımı düz
 * `status` UPDATE'iyle yapıyordu ve tetiğin yayım kapısı (başlıkta valid_until + currency)
 * yüzünden HER ZAMAN düşüyordu; başlığı yazabilen tek yol admin_publish_quote RPC'siydi.
 */
const SIMDI = new Date('2026-09-24T10:00:00Z')
const kalem = (p: Partial<PublishItem> = {}): PublishItem => ({
  unit_price: 100,
  currency: 'TRY',
  valid_until: '2026-10-24T00:00:00.000Z',
  ...p,
})

describe('derivePublishHeader — kalemlerden yayım başlığı', () => {
  it('kabul: tek para birimi, fiyatlı, gelecekteki süre → en erken süre + para birimi', () => {
    const r = derivePublishHeader(
      [kalem({ valid_until: '2026-11-01T00:00:00.000Z' }), kalem({ valid_until: '2026-10-05T00:00:00.000Z', currency: 'try' })],
      SIMDI,
    )
    expect(r).toEqual({ ok: true, validUntil: '2026-10-05T00:00:00.000Z', currency: 'TRY' })
  })

  it('red: kalemsiz belge', () => {
    expect(derivePublishHeader([], SIMDI)).toEqual({ ok: false, reason: 'no-items' })
  })

  it('red: fiyatsız kalem', () => {
    expect(derivePublishHeader([kalem(), kalem({ unit_price: null })], SIMDI)).toEqual({ ok: false, reason: 'price' })
  })

  it('red: karışık para birimi — tek başlık yalan söylerdi', () => {
    expect(derivePublishHeader([kalem(), kalem({ currency: 'EUR' })], SIMDI)).toEqual({ ok: false, reason: 'currency' })
  })

  it('red: boş ya da ISO olmayan para birimi', () => {
    expect(derivePublishHeader([kalem({ currency: null })], SIMDI)).toEqual({ ok: false, reason: 'currency' })
    expect(derivePublishHeader([kalem({ currency: 'TL' })], SIMDI)).toEqual({ ok: false, reason: 'currency' })
  })

  it('red: süresiz kalem', () => {
    expect(derivePublishHeader([kalem(), kalem({ valid_until: null })], SIMDI)).toEqual({ ok: false, reason: 'validity' })
  })

  it('red: en erken süre geçmişte ya da tam şimdi (§6 ek kural)', () => {
    expect(derivePublishHeader([kalem(), kalem({ valid_until: '2026-09-01T00:00:00.000Z' })], SIMDI)).toEqual({
      ok: false,
      reason: 'validity',
    })
    expect(derivePublishHeader([kalem({ valid_until: SIMDI.toISOString() })], SIMDI)).toEqual({ ok: false, reason: 'validity' })
  })
})

describe('publishQuote — RPC isteği (gerçek istemci, taklit ağ katmanı)', () => {
  const istemci = (yanit: Response) => {
    const fetchSahte = vi.fn(async (_girdi: RequestInfo | URL, _ayar?: RequestInit) => yanit)
    const client = createClient<Database>('http://yerel.invalid', 'anon-anahtar', {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchSahte },
    })
    return { client, fetchSahte }
  }

  it('admin_publish_quote uç noktasına doğru gövdeyle POST eder', async () => {
    const { client, fetchSahte } = istemci(new Response(null, { status: 204 }))
    await publishQuote(client, 'q-1', { validUntil: '2026-10-05T00:00:00.000Z', currency: 'TRY' })
    expect(fetchSahte).toHaveBeenCalledTimes(1)
    const [girdi, ayar] = fetchSahte.mock.calls[0]
    expect(String(girdi)).toContain('/rest/v1/rpc/admin_publish_quote')
    expect(ayar?.method).toBe('POST')
    expect(JSON.parse(String(ayar?.body))).toEqual({
      p_quote_id: 'q-1',
      p_valid_until: '2026-10-05T00:00:00.000Z',
      p_currency: 'TRY',
    })
  })

  it('DB reddini yutmaz, fırlatır (ekran başarısızlık bildirir)', async () => {
    const govde = JSON.stringify({ code: '42501', message: 'yetkisiz: teklif yayimlama admin gerektirir' })
    const { client } = istemci(new Response(govde, { status: 403, headers: { 'Content-Type': 'application/json' } }))
    await expect(publishQuote(client, 'q-1', { validUntil: 'x', currency: 'TRY' })).rejects.toMatchObject({ code: '42501' })
  })
})

describe('Admin ekranı yayımı RPC\'den yapar (geri kaçış bekçisi)', () => {
  const kaynak = fs.readFileSync(
    path.join(process.cwd(), 'src', 'views', 'admin', 'quotes', 'QuotesTableBody.tsx'),
    'utf8',
  )

  it('yayım yolu publishQuote çağırıyor ve başlık kalemlerden türetiliyor', () => {
    expect(kaynak).toMatch(/derivePublishHeader\(row\.items\)/)
    expect(kaynak).toMatch(/await publishQuote\(supabaseBrowserClient, row\.id, yayim\)/)
  })

  it('fiyat girişi taslakta da açık — taslağa alınan teklif fiyatsız kilitlenmez', () => {
    expect(kaynak).toMatch(/row\.status === 'requested' \|\| row\.status === 'draft'/)
  })

  it('başlıkta valid_until/currency\'yi doğrudan yazan istemci UPDATE\'i yok (yetkisi de yok)', () => {
    const baslikYazimi = /from\('venthub_quotes'\)\s*\.update\(\{[^}]*\b(valid_until|currency)\b/
    expect(kaynak).not.toMatch(baslikYazimi)
  })
})

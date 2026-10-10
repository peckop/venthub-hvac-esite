// @vitest-environment node
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import { getSiteSayaclari } from '../siteSayaclari.service'

/**
 * URN-75 — Hakkımızda sayaçları. Cast'siz DI stub'ı (pricing.resolve.test.ts ile aynı desen): GERÇEK supabase-js
 * istemcisi, PostgREST cevabını taklit eden sahte fetch ile kurulur. Böylece sorgu zinciri gerçekten çalışır ve
 * üretilen İSTEK ADRESİ (iç içe süzgeçler) sınanır; canlıda aynı istek 6 / 47 / 441 döndü (2026-10-09).
 * Sunucu tarafı süzgeç taklit EDİLMEZ: süzgecin doğruluğunu adres testi, toplamayı cevap testleri korur.
 */
function istemci(cevap: { durum: number; govde: unknown }, istekler: URL[] = []): SupabaseClient<Database> {
  const sahteFetch: typeof fetch = (girdi) => {
    const href = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.toString() : girdi.url
    istekler.push(new URL(href))
    return Promise.resolve(
      new Response(JSON.stringify(cevap.govde), {
        status: cevap.durum,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
  return createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: sahteFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const urunler = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `u${i}` }))

describe('getSiteSayaclari', () => {
  it('marka, aile ve aktif ürünü AYNI satır kümesinden toplar', async () => {
    const supabase = istemci({
      durum: 200,
      govde: [
        { id: 'b1', product_families: [{ id: 'f1', products: urunler(3) }, { id: 'f2', products: urunler(2) }] },
        { id: 'b2', product_families: [{ id: 'f3', products: urunler(5) }] },
      ],
    })
    await expect(getSiteSayaclari(supabase)).resolves.toEqual({ markaSayisi: 2, aileSayisi: 3, aktifUrunSayisi: 10 })
  })

  it('sorgu vitrinin süzgecini taşır: markadan başlar, aile ve ürün iç birleşimli, silinmemiş + aktif', async () => {
    const istekler: URL[] = []
    const supabase = istemci({ durum: 200, govde: [{ id: 'b1', product_families: [{ id: 'f1', products: urunler(1) }] }] }, istekler)
    await getSiteSayaclari(supabase)
    expect(istekler).toHaveLength(1)
    const adres = istekler[0]
    expect(adres.pathname).toBe('/rest/v1/brands')
    expect(adres.searchParams.get('select')).toBe('id,product_families!inner(id,products!inner(id))')
    expect(adres.searchParams.get('product_families.deleted_at')).toBe('is.null')
    expect(adres.searchParams.get('product_families.products.status')).toBe('eq.active')
    expect(adres.searchParams.get('product_families.products.deleted_at')).toBe('is.null')
    expect(adres.searchParams.get('limit')).toBe('1000')
  })

  it('sorgu hatası FIRLATILIR (sıfır sayıya çevrilmez)', async () => {
    const supabase = istemci({ durum: 500, govde: { message: 'canceling statement due to statement timeout', code: '57014' } })
    await expect(getSiteSayaclari(supabase)).rejects.toMatchObject({ code: '57014' })
  })

  it('boş sonuç FIRLATILIR: "0 marka" yanlış bir vaat olurdu', async () => {
    await expect(getSiteSayaclari(istemci({ durum: 200, govde: [] }))).rejects.toThrow(/ürünü olan marka bulunamadı/)
  })

  it('üst satır sınırına ulaşan sonuç FIRLATILIR (sessiz eksilme yok)', async () => {
    const cok = Array.from({ length: 1000 }, (_, i) => ({ id: `b${i}`, product_families: [{ id: `f${i}`, products: urunler(1) }] }))
    await expect(getSiteSayaclari(istemci({ durum: 200, govde: cok }))).rejects.toThrow(/sınırına ulaştı/)
  })
})

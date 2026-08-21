/**
 * INV-FAMILY-SLUGS-1 — sitemap/SSG aile listesi SESSİZCE KIRPILAMAZ.
 *
 * Ölçüm (2026-08-21, T138 ön-koşulu): `getAllFamilySlugs` sabit `limit: 96` ile TEK sayfa
 * çekiyor ve RPC'nin `total_count` değerini yok sayıyordu. Bugün 32 aile olduğu için görünmüyor;
 * model katmanıyla (~260 aile) sitemap ve `generateStaticParams` 96'da sessizce kesilecek —
 * 160+ sayfa ne site haritasında ne ön-üretimde olacak ve hiçbir test kırmızı vermeyecekti.
 * Bu, "sessiz-boş" sınıfının ta kendisi; bekçisi bu dosyadır.
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: pricing.resolve.test.ts) —
 * tip hilesi yok, RPC gövdesi gerçekten HTTP üzerinden çözülür.
 *
 * Cetvel: docs/standards/rendering-cache-standard.md · docs/plans/render-dalga1-plan-2026-08-17.md §W5
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect,it } from 'vitest'

import type { Database } from '@/types/database.types'

import { getAllFamilySlugs } from '../family.service'

/**
 * get_product_families_enriched RPC'sini taklit eden istemci.
 * @param total  toplam aile sayısı (her satırda total_count olarak döner)
 * @param serverCap  sunucunun sayfa başına döndürebildiği azami satır (kırpan uç senaryosu)
 */
function stubClient(total: number, serverCap = Number.POSITIVE_INFINITY) {
  const all = Array.from({ length: total }, (_, i) => ({
    slug: 'aile-' + (i + 1),
    total_count: total,
  }))
  const calls: Array<{ limit: number; offset: number }> = []

  const fakeFetch: typeof fetch = async (_input, init) => {
    const bodyText = typeof init?.body === 'string' ? init.body : '{}'
    const body: { p_limit?: number; p_offset?: number } = JSON.parse(bodyText)
    const offset = body.p_offset ?? 0
    const limit = Math.min(body.p_limit ?? 24, serverCap)
    calls.push({ limit, offset })
    const rows = all.slice(offset, offset + limit)
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { client, calls }
}

describe('INV-FAMILY-SLUGS-1: aile slug listesi kırpılmaz', () => {
  it('tek sayfaya sığmayan aile sayısında TÜM sayfaları tüketir', async () => {
    const { client, calls } = stubClient(250)
    const slugs = await getAllFamilySlugs(client)
    expect(slugs).toHaveLength(250)
    expect(slugs[0]).toEqual({ slug: 'aile-1' })
    expect(slugs[249]).toEqual({ slug: 'aile-250' })
    // Tek atış = kırpma. Birden fazla sayfa istenmiş ve offset ilerlemiş olmalı.
    expect(calls.length).toBeGreaterThan(1)
    expect(calls[1].offset).toBeGreaterThan(0)
  })

  it('tek sayfaya sığan durumda tek çağrı yeter (bugünkü 32 aile)', async () => {
    const { client, calls } = stubClient(32)
    const slugs = await getAllFamilySlugs(client)
    expect(slugs).toHaveLength(32)
    expect(calls).toHaveLength(1)
  })

  it('liste eksik kalırsa SESSİZ kalmaz, hata fırlatır', async () => {
    // Sunucu sayfa başına 5 satır döndürüyor → sayfalama tavanı aşılır, liste eksik kalır.
    const { client } = stubClient(100000, 5)
    await expect(getAllFamilySlugs(client)).rejects.toThrow(/getAllFamilySlugs: \d+\/\d+/)
  })
})

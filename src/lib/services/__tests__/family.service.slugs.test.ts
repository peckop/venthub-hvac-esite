/**
 * INV-FAMILY-SLUGS-1 — sitemap/SSG aile listesi SESSİZCE KIRPILAMAZ ve SERİ sayfalarını
 * dışarıda bırakamaz.
 *
 * Ölçüm (2026-08-21, T138 ön-koşulu): `getAllFamilySlugs` sabit `limit: 96` ile TEK sayfa
 * çekiyor ve RPC'nin `total_count` değerini yok sayıyordu. Bugün 32 aile olduğu için görünmüyor;
 * model katmanıyla (~260 aile) sitemap ve `generateStaticParams` 96'da sessizce kesilecek —
 * 160+ sayfa ne site haritasında ne ön-üretimde olacak ve hiçbir test kırmızı vermeyecekti.
 * Bu, "sessiz-boş" sınıfının ta kendisi; bekçisi bu dosyadır.
 *
 * K1 EKİ (2026-08-21): SERİ satırlarının doğrudan aktif varyantı yoktur, bu yüzden
 * `get_product_families_enriched` onları inner-join ile eler. Yalnız RPC'ye dayanan bir
 * liste, açılan her seri landing sayfasını sitemap'in ve ön-üretimin DIŞINDA bırakırdı —
 * aynı sessiz-boş sınıfı, başka kılıkta.
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: pricing.resolve.test.ts) —
 * tip hilesi yok, hem RPC hem tablo sorgusu gerçekten HTTP üzerinden çözülür.
 *
 * Cetvel: docs/standards/rendering-cache-standard.md · docs/plans/render-dalga1-plan-2026-08-17.md §W5
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect,it } from 'vitest'

import type { Database } from '@/types/database.types'

import { getAllFamilySlugs } from '../family.service'

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * get_product_families_enriched RPC'sini + `product_families` tablo sorgularını taklit eder.
 * @param total      RPC'nin döndürdüğü toplam aile sayısı (her satırda total_count)
 * @param serverCap  sunucunun sayfa başına döndürebildiği azami satır (kırpan uç senaryosu)
 * @param series     seri (parent) slug'ları — her biri en az bir modele sahip sayılır
 */
function stubClient(total: number, serverCap = Number.POSITIVE_INFINITY, series: string[] = []) {
  const all = Array.from({ length: total }, (_, i) => ({
    slug: 'aile-' + (i + 1),
    total_count: total,
  }))
  const calls: Array<{ limit: number; offset: number }> = []

  const fakeFetch: typeof fetch = async (input, init) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

    // 1) Liste RPC'si (POST /rest/v1/rpc/...)
    if (url.includes('/rpc/')) {
      const bodyText = typeof init?.body === 'string' ? init.body : '{}'
      const body: { p_limit?: number; p_offset?: number } = JSON.parse(bodyText)
      const offset = body.p_offset ?? 0
      const limit = Math.min(body.p_limit ?? 24, serverCap)
      calls.push({ limit, offset })
      return jsonResponse(all.slice(offset, offset + limit))
    }

    // 2) Model satırları: hangi ailelerin bir üstü var (select=parent_family_id)
    if (url.includes('select=parent_family_id')) {
      return jsonResponse(series.map((s) => ({ parent_family_id: 'parent-of-' + s })))
    }

    // 3) O üstlerin slug'ları (select=slug)
    if (url.includes('select=slug')) {
      return jsonResponse(series.map((s) => ({ slug: s })))
    }

    return jsonResponse([])
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

  it('tek sayfaya sığan durumda tek RPC çağrısı yeter (bugünkü 32 aile)', async () => {
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

describe('INV-FAMILY-SLUGS-1: SERİ slug’ları listeye girer', () => {
  it('RPC’de görünmeyen seri slug’ları listeye EKLENİR', async () => {
    const { client } = stubClient(32, Number.POSITIVE_INFINITY, ['lineo-quiet', 'jet-serisi'])
    const slugs = await getAllFamilySlugs(client)
    const values = slugs.map((s) => s.slug)

    expect(values).toContain('lineo-quiet')
    expect(values).toContain('jet-serisi')
    expect(slugs).toHaveLength(34) // 32 RPC ailesi + 2 seri
  })

  it('seri bir şekilde RPC’de de görünüyorsa MÜKERRER üretmez', async () => {
    // 'aile-1' hem RPC'den hem seri sorgusundan gelirse liste iki kez basmamalı:
    // mükerrer slug = sitemap'te çift kayıt, generateStaticParams'ta çakışan yol.
    const { client } = stubClient(32, Number.POSITIVE_INFINITY, ['aile-1'])
    const slugs = await getAllFamilySlugs(client)

    expect(slugs).toHaveLength(32)
    expect(slugs.filter((s) => s.slug === 'aile-1')).toHaveLength(1)
  })

  it('hiç seri yoksa liste değişmez (bugünkü hâl)', async () => {
    const { client } = stubClient(32, Number.POSITIVE_INFINITY, [])
    const slugs = await getAllFamilySlugs(client)
    expect(slugs).toHaveLength(32)
  })
})

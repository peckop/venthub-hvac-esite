/**
 * INV-MARKA-KATALOG-OZETI-1 (URN-79) — marka sayfasının "ürün aileleri ve kategorileri" cümlesinin ham girdisi DB'den gelir.
 *
 * `getBrandCatalogSummary`: marka adıyla aile RPC'si (`get_product_families_enriched`, marka sayfası vitrininde kart olan
 * aileler) + yalnız o ailelerin AKTİF kategori satırları. Sözleşme: aile yoksa kategori sorgusu atılmaz; alt kategori ana
 * kategoriye tercih edilir; pasif kategori anılmaz; hata YUTULMAZ (sıfıra/boşa çevrilmez — çağıran karar verir).
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: family.service.vitrin-sozlesmesi.test.ts).
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '@/types/database.types'

import { BRAND_CATALOG_FAMILY_LIMIT, getBrandCatalogSummary } from '../family.service'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

interface SahteDb {
  aileler: Array<Record<string, unknown>>
  kategoriler: Array<Record<string, unknown>>
  rpcHata?: boolean
  kategoriHata?: boolean
}

function istemci(db: SahteDb) {
  const istekler: { url: string; govde: unknown }[] = []
  const fakeFetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    istekler.push({ url, govde: init?.body ? JSON.parse(String(init.body)) : null })
    if (url.includes('/rpc/get_product_families_enriched')) {
      return db.rpcHata ? jsonResponse({ message: 'statement timeout', code: '57014' }, 500) : jsonResponse(db.aileler)
    }
    if (url.includes('/product_families')) {
      // `getFamiliesEnriched` ad çevirilerini ayrı sorguyla gömer.
      return jsonResponse(db.aileler.map((a) => ({ id: a.id, name_i18n: a.name_i18n ?? null })))
    }
    if (url.includes('/categories')) {
      return db.kategoriHata ? jsonResponse({ message: 'permission denied', code: '42501' }, 403) : jsonResponse(db.kategoriler)
    }
    throw new Error('beklenmeyen istek: ' + url)
  }
  const sahte = createClient<Database>('https://ornek.supabase.co', 'anon-anahtar', { global: { fetch: fakeFetch } })
  return { sahte, istekler }
}

const aile = (id: string, name: string, ek: Record<string, unknown> = {}) => ({
  id,
  name,
  slug: id,
  series_code: null,
  description: null,
  brand_name: 'Vortice',
  category_id: null,
  subcategory_id: null,
  cover_image_path: null,
  variant_count: 1,
  min_price: null,
  total_count: 3,
  ...ek,
})

const kategori = (id: string, name: string, ek: Record<string, unknown> = {}) => ({
  id,
  name,
  slug: name.toLowerCase(),
  menu_label: null,
  translation_key: null,
  ...ek,
})

describe('getBrandCatalogSummary: servis sözleşmesi', () => {
  it('marka adıyla ve aile sınırıyla RPC çağırır; toplam pencere sayımından, aileler ad + ad çevirisiyle gelir', async () => {
    const { sahte, istekler } = istemci({
      aileler: [
        aile('f1', 'Aksiyel', { name_i18n: { tr: 'Aksiyel Fanlar', en: 'Axial Fans' } }),
        aile('f2', 'Plug'),
        aile('f3', 'Kanal'),
      ],
      kategoriler: [],
    })
    const ozet = await getBrandCatalogSummary(sahte, 'Vortice')
    expect(ozet.total).toBe(3)
    expect(ozet.families).toEqual([
      { name: 'Aksiyel', name_i18n: { tr: 'Aksiyel Fanlar', en: 'Axial Fans' } },
      { name: 'Plug', name_i18n: null },
      { name: 'Kanal', name_i18n: null },
    ])
    const rpc = istekler.find((i) => i.url.includes('/rpc/get_product_families_enriched'))
    expect(rpc?.govde).toMatchObject({ p_brand: 'Vortice', p_limit: BRAND_CATALOG_FAMILY_LIMIT })
  })

  it('alt kategori ana kategoriye tercih edilir; kategoriler ilk görünme sırasıyla ve tekil gelir', async () => {
    const { sahte, istekler } = istemci({
      aileler: [
        aile('f1', 'A', { category_id: 'k-ust', subcategory_id: 'k-alt-1' }),
        aile('f2', 'B', { category_id: 'k-ust', subcategory_id: 'k-alt-2' }),
        aile('f3', 'C', { category_id: 'k-ust', subcategory_id: 'k-alt-1' }),
        aile('f4', 'D', { category_id: 'k-ust', subcategory_id: null }),
      ],
      kategoriler: [
        kategori('k-alt-2', 'Plug', { menu_label: 'Plug Fanlar' }),
        kategori('k-ust', 'Fans'),
        kategori('k-alt-1', 'Axial', { translation_key: 'axial' }),
      ],
    })
    const ozet = await getBrandCatalogSummary(sahte, 'Vortice')
    // PostgREST sırası rastgele (burada tersten verildi); özet aile sırasını izler: alt-1, alt-2, ust.
    expect(ozet.categories.map((c) => c.name)).toEqual(['Axial', 'Plug', 'Fans'])
    expect(ozet.categories[1]).toEqual({ name: 'Plug', slug: 'plug', menu_label: 'Plug Fanlar', translation_key: null })
    const sorgu = istekler.find((i) => i.url.includes('/categories'))
    expect(sorgu?.url).toContain('is_active=eq.true')
    expect(decodeURIComponent(sorgu?.url ?? '')).toContain('id=in.(k-alt-1,k-alt-2,k-ust)')
  })

  it('aktif olmayan (sorguda dönmeyen) kategori atlanır; hiç kategorisi olmayan ailelerde kategori sorgusu ATILMAZ', async () => {
    const { sahte, istekler } = istemci({
      aileler: [aile('f1', 'A', { subcategory_id: 'k-pasif' }), aile('f2', 'B')],
      kategoriler: [],
    })
    expect((await getBrandCatalogSummary(sahte, 'Vortice')).categories).toEqual([])
    const bos = istemci({ aileler: [aile('f1', 'A'), aile('f2', 'B')], kategoriler: [] })
    expect((await getBrandCatalogSummary(bos.sahte, 'Vortice')).categories).toEqual([])
    expect(bos.istekler.some((i) => i.url.includes('/categories'))).toBe(false)
    expect(istekler.some((i) => i.url.includes('/categories'))).toBe(true)
  })

  it('marka ürünsüzse (aile yok) boş özet döner ve kategori/ad-çeviri sorgusu hiç atılmaz', async () => {
    const { sahte, istekler } = istemci({ aileler: [], kategoriler: [] })
    await expect(getBrandCatalogSummary(sahte, 'Flexiva')).resolves.toEqual({ total: 0, families: [], categories: [], models: 0 })
    expect(istekler.map((i) => i.url).filter((u) => u.includes('/categories') || u.includes('/product_families'))).toEqual([])
  })

  it('RPC hatası FIRLATILIR (boş özete çevrilmez); kategori sorgusu hatası da FIRLATILIR', async () => {
    const rpc = istemci({ aileler: [], kategoriler: [], rpcHata: true })
    await expect(getBrandCatalogSummary(rpc.sahte, 'Vortice')).rejects.toMatchObject({ message: 'statement timeout' })
    const kat = istemci({ aileler: [aile('f1', 'A', { category_id: 'k1' })], kategoriler: [], kategoriHata: true })
    await expect(getBrandCatalogSummary(kat.sahte, 'Vortice')).rejects.toMatchObject({ message: 'permission denied' })
  })
})

describe('getBrandCatalogSummary: model sayısı (URN-82, marka sayfası "Katalogda" kutusu)', () => {
  it('liste TAM geldiyse (öğe sayısı = toplam) aile başına aktif model sayısının toplamıdır', async () => {
    const { sahte } = istemci({
      aileler: [
        aile('f1', 'A', { variant_count: 5, total_count: 3 }),
        aile('f2', 'B', { variant_count: 2, total_count: 3 }),
        aile('f3', 'C', { variant_count: 10, total_count: 3 }),
      ],
      kategoriler: [],
    })
    const ozet = await getBrandCatalogSummary(sahte, 'Vortice')
    expect(ozet.total).toBe(3)
    expect(ozet.models).toBe(17)
  })

  it('liste KESİLMİŞSE (toplam öğeden büyük) eksik toplam basılmaz: models null', async () => {
    const { sahte } = istemci({
      aileler: [aile('f1', 'A', { variant_count: 5, total_count: 120 }), aile('f2', 'B', { variant_count: 2, total_count: 120 })],
      kategoriler: [],
    })
    const ozet = await getBrandCatalogSummary(sahte, 'Vortice')
    expect(ozet.total).toBe(120)
    expect(ozet.models).toBeNull()
  })
})

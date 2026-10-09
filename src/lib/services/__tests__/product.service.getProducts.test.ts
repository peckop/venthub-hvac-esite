/**
 * REC-493 — ana sayfa kartları AİLE adresine bağlanır: `getProducts` ailenin slug'ını aynı sorguda getirir.
 *
 * NİÇİN (canlı kapı 2026-10-09): ana sayfadaki 4 ürün kartının 4'ü `/tr/products/<model-slug>` adresine
 * bağlıydı ve her biri `/tr/products/<aile>?sku=<kod>` adresine 308 alıyordu. `products.slug` MODEL slug'ıdır;
 * PDP aile adresidir. Kaynak: satırda aile slug'ı taşınmıyordu.
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: family.service.slugs.test.ts) —
 * tip hilesi yok; sorgunun GERÇEK URL'i ve yanıtın işlenişi ölçülür.
 *
 * Bu dosyanın KİLİTLEDİĞİ dört şey:
 *   1. sorgu `product_families(slug)` gömmesini ister, `VARIANT_DETAIL_COLUMNS` kümesini DÜŞÜRMEZ ve
 *      maliyet kolonu eklemez;
 *   2. gömme ürün nesnesine SIZMAZ (ham iç yapı ana sayfa RSC yüküne binmesin) — yalnız `family_slug` kalır;
 *   3. aile görünmüyorsa (family_id boş / RLS / silinmiş) satır DÜŞMEZ, `family_slug: null` taşır;
 *   4. hata yolları: yetki/ağ hatası fırlatır (sessiz boş liste DEĞİL), boş veri boş liste verir.
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '@/types/database.types'

import { getProducts } from '../product.service'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface UrunSatiri {
  id: string
  name: string
  sku: string
  slug: string
  family_id: string | null
  is_featured: boolean
  product_families: { slug: string } | null
}

const MODEL: UrunSatiri = {
  id: 'p-12kw',
  name: '12 kW Elektrikli Isıtıcı',
  sku: 'AVE-13034',
  slug: '12-kw-elektrikli-isitici-13034',
  family_id: 'f-avens',
  is_featured: true,
  product_families: { slug: 'avens-elektrikli-kanal-isiticilari' },
}

/** `products` sorgusuna `satirlar` ya da `durum` ile cevap verir; çağrılan URL'leri kaydeder. */
function sahteIstemci(satirlar: unknown[], durum = 200) {
  const urller: string[] = []
  const fakeFetch: typeof fetch = async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    urller.push(decodeURIComponent(url))
    if (url.includes('/rpc/')) return jsonResponse([]) // fiyat katmanı: fiyat yok → "Teklif İste"
    if (durum !== 200) return jsonResponse({ message: 'JWT expired', code: 'PGRST301' }, durum)
    return jsonResponse(satirlar)
  }
  const client = createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { client, urller }
}

describe('getProducts · REC-493 aile slug\'ı', () => {
  it('sorgu product_families(slug) gömmesini ister, vitrin kümesini korur, maliyet kolonu eklemez', async () => {
    const { client, urller } = sahteIstemci([MODEL])
    await getProducts(client, 12)

    const urunSorgusu = urller.find((u) => u.includes('/rest/v1/products?'))
    expect(urunSorgusu, 'products sorgusu hiç gitmedi').toBeDefined()
    expect(urunSorgusu).toContain('product_families(slug)')
    // Eski küme duruyor: aile için kimlik ve kart alanları hâlâ isteniyor.
    for (const kolon of ['family_id', 'model_code', 'slug', 'sku', 'is_featured']) {
      expect(urunSorgusu, kolon).toMatch(new RegExp(`select=[^&]*\\b${kolon}\\b`))
    }
    // Maliyet/tedarik kolonu yok (REC-140).
    expect(urunSorgusu).not.toMatch(/purchase_price|supplier_name|warehouse_location/)
    expect(urunSorgusu).toContain('limit=12')
  })

  it('aile slug\'ı ürüne family_slug olarak taşınır; gömme nesnesi ürüne SIZMAZ', async () => {
    const { client } = sahteIstemci([MODEL])
    const [urun] = await getProducts(client, 12)

    expect(urun.family_slug).toBe('avens-elektrikli-kanal-isiticilari')
    // Model slug'ı kayıpsız duruyor: aile bulunamazsa kart buna düşer.
    expect(urun.slug).toBe('12-kw-elektrikli-isitici-13034')
    expect(urun.sku).toBe('AVE-13034')
    expect(urun).not.toHaveProperty('product_families')
  })

  it('aile görünmüyorsa (gömme null) satır DÜŞMEZ; family_slug null olur', async () => {
    const aileSiz: UrunSatiri = { ...MODEL, id: 'p-aile-yok', family_id: null, product_families: null }
    const { client } = sahteIstemci([MODEL, aileSiz])
    const urunler = await getProducts(client, 12)

    expect(urunler).toHaveLength(2)
    expect(urunler[0].family_slug).toBe('avens-elektrikli-kanal-isiticilari')
    expect(urunler[1].id).toBe('p-aile-yok')
    expect(urunler[1].family_slug).toBeNull()
    expect(urunler[1].slug).toBe('12-kw-elektrikli-isitici-13034')
  })

  it('fiyatı olmayan ürün de aile slug\'ını korur (displayPrice null)', async () => {
    const { client } = sahteIstemci([MODEL])
    const [urun] = await getProducts(client)
    expect(urun.displayPrice).toBeNull()
    expect(urun.family_slug).toBe('avens-elektrikli-kanal-isiticilari')
  })

  it('boş veri → boş liste (hata değil)', async () => {
    const { client } = sahteIstemci([])
    await expect(getProducts(client, 12)).resolves.toEqual([])
  })

  it('yetki/ağ hatası SESSİZ boş liste değil, fırlatma olarak görünür', async () => {
    const { client } = sahteIstemci([], 401)
    await expect(getProducts(client, 12)).rejects.toMatchObject({ code: 'PGRST301' })
  })
})

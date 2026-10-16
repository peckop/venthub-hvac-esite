/**
 * URN-135 (U3) — sessiz fan serisinin SİTEDE CANLI model kodları.
 *
 * Kategori sayfasındaki ses sayıları, ses veri modülünün bu kodlarla KESİŞİMİNDEN türer; veri modülünde olup
 * sitede satılmayan kod sayıya girmemelidir. Servis: aile slug'ı → `family_id`, yalnız `status='active'` ve silinmemiş
 * ürünlerin SKU'ları; `VRT-17164` → `17164`. Hata YUTULMAZ (çağıran "okunamadı" kararını verir).
 * Sorgu gerçek supabase-js istemcisi + sahte `fetch` ile çözülür (repo deseni: wizard.service.test.ts).
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { skudanModelKodlari } from '@/data/sessizFan/sesOzeti'
import type { Database } from '@/types/database.types'

import { getSessizFanCanliKodlari } from '../sessizFanKodlari.service'

function json(govde: unknown, status = 200) {
  return new Response(JSON.stringify(govde), { status, headers: { 'Content-Type': 'application/json' } })
}

type Yanit = { aile: unknown; urunler: unknown; aileDurum?: number; urunDurum?: number }

function istemci(yanit: Yanit, istekler: string[] = []) {
  const fakeFetch: typeof fetch = async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    istekler.push(decodeURIComponent(url))
    if (url.includes('/rest/v1/product_families')) return json(yanit.aile, yanit.aileDurum ?? 200)
    if (url.includes('/rest/v1/products')) return json(yanit.urunler, yanit.urunDurum ?? 200)
    return json([])
  }
  return createClient<Database>('http://localhost:54321', 'anon-test-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

describe('skudanModelKodlari', () => {
  it('VRT-<rakam> kodlara çevrilir; sıra korunur, tekrar atılır', () => {
    expect(skudanModelKodlari(['VRT-17164', 'VRT-17160', 'VRT-17164'])).toEqual(['17164', '17160'])
  })

  it('kalıba uymayan, boş ve eksik SKU kod sayılmaz (fail-closed)', () => {
    expect(skudanModelKodlari(['SEA-51203001', 'VRT-CA-IL-4020-ES-RECT', 'VRT-', '', null, undefined, 'vrt-17164'])).toEqual([])
  })

  it('kenardaki boşluk temizlenir', () => {
    expect(skudanModelKodlari([' VRT-17170 '])).toEqual(['17170'])
  })
})

describe('getSessizFanCanliKodlari', () => {
  it('aile → family_id; yalnız aktif ve silinmemiş ürünlerin SKU\'ları, kod olarak döner', async () => {
    const istekler: string[] = []
    const kodlar = await getSessizFanCanliKodlari(
      istemci({ aile: [{ id: 'fam-1' }], urunler: [{ sku: 'VRT-17160' }, { sku: 'VRT-17164' }, { sku: null }] }, istekler),
      'vortice-lineo-quiet-sessiz-kanal-fanlari',
    )
    expect(kodlar).toEqual(['17160', '17164'])

    const aileIstegi = istekler.find((u) => u.includes('/rest/v1/product_families'))
    const urunIstegi = istekler.find((u) => u.includes('/rest/v1/products'))
    expect(aileIstegi).toContain('slug=eq.vortice-lineo-quiet-sessiz-kanal-fanlari')
    expect(urunIstegi).toContain('family_id=eq.fam-1')
    expect(urunIstegi).toContain('status=eq.active')
    expect(urunIstegi).toContain('deleted_at=is.null')
  })

  it('aile bulunamazsa boş liste döner (ürün sorgusu atılmaz)', async () => {
    const istekler: string[] = []
    const kodlar = await getSessizFanCanliKodlari(istemci({ aile: [], urunler: [{ sku: 'VRT-17160' }] }, istekler), 'yok')
    expect(kodlar).toEqual([])
    expect(istekler.some((u) => u.includes('/rest/v1/products'))).toBe(false)
  })

  it('aile sorgusu hata verirse FIRLATIR (yutulmaz)', async () => {
    await expect(
      getSessizFanCanliKodlari(istemci({ aile: { message: 'boom' }, urunler: [], aileDurum: 500 }), 'x'),
    ).rejects.toBeTruthy()
  })

  it('ürün sorgusu hata verirse FIRLATIR (yutulmaz)', async () => {
    await expect(
      getSessizFanCanliKodlari(istemci({ aile: [{ id: 'fam-1' }], urunler: { message: 'boom' }, urunDurum: 500 }), 'x'),
    ).rejects.toBeTruthy()
  })
})

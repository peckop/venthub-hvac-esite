/**
 * INV-AILE-VITRIN-METNI-1 — ürün detayı istemciye aile metninin YALNIZ vitrin anahtarlarını
 * (`tr`, `en`) taşır; içerik hattının depo anahtarları sayfaya gömülmez.
 *
 * NİÇİN VAR (REC-206 / karar 42, 2026-09-17 canlı ölçüm):
 * `product_families.description` jsonb'si `tr`/`en`'in yanında `bloklar_tr` ve `maddeler_tr`
 * taşıyor (içerik hattı DEPODA tutuyor, render REC-164'ün işi). Servis bu alanı yalnız TİP
 * olarak daraltıyordu; nesnenin kendisi istemci bileşenine (`'use client'`) olduğu gibi
 * serileştiriliyordu. Ölçüm: 16 ailenin blok metnindeki iç editör notları müşteri ekranında
 * 0 kez, sayfanın HTML'indeki gömülü veride ise görünüyordu (jet-serisi TR sayfasında 77 geçiş).
 *
 * Tip sistemi bunu GÖREMEZ: `{ tr, en }` tipi, çalışma anındaki fazla anahtarları yasaklamaz.
 * Bu yüzden ölçüm nesnenin GERÇEK anahtarlarına bakar.
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: family.service.detail-category.test.ts).
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '@/types/database.types'

import { getFamiliesEnriched, getFamilyDetail } from '../family.service'

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const IC_NOT = 'Gövde · Çark · Kontrol — kaynakta karşılığı yok, boş bırakıldı (K7).'

function stubClient(aileAlanlari: Record<string, unknown>) {
  const fakeFetch: typeof fetch = async (input) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

    if (url.includes('/rpc/get_family_detail')) {
      return jsonResponse({
        family: {
          id: 'fam-1',
          name: 'JET Serisi',
          slug: 'jet-serisi',
          series_code: 'JET',
          brand_name: 'SEAT',
          category_id: null,
          subcategory_id: null,
          ...aileAlanlari,
        },
        variants: [],
        price_tax_included: true,
      })
    }
    if (url.includes('/product_families')) return jsonResponse([{ name_i18n: null }])
    throw new Error('beklenmeyen istek: ' + url)
  }
  return createClient<Database>('https://ornek.supabase.co', 'anon-anahtar', {
    global: { fetch: fakeFetch },
  })
}

describe('INV-AILE-VITRIN-METNI-1 — aile metni istemciye yalnız tr/en taşır', () => {
  it('description içindeki bloklar_tr ve maddeler_tr istemci nesnesine GİRMEZ', async () => {
    const supabase = stubClient({
      description: {
        tr: 'Çatı ve duvar uygulamaları için santrifüj çatı fanları.',
        en: null,
        bloklar_tr: { Motor: 'Monofaze 220 V.', Gövde: IC_NOT },
        maddeler_tr: ['Yatay ve dikey montaja uygun'],
      },
      meta_title: { tr: 'JET Serisi', taslak_notu: IC_NOT },
      meta_description: null,
    })
    const detay = await getFamilyDetail(supabase, 'jet-serisi', 'tr')

    expect(detay).not.toBeNull()
    expect(Object.keys(detay?.family.description ?? {}).sort()).toEqual(['en', 'tr'])
    expect(detay?.family.description?.tr).toBe('Çatı ve duvar uygulamaları için santrifüj çatı fanları.')
    expect(detay?.family.description?.en).toBeNull()
    expect(Object.keys(detay?.family.meta_title ?? {})).toEqual(['tr'])
    expect(detay?.family.meta_description).toBeNull()
    // Asıl iddia: serileştirilmiş nesnede iç not HİÇ geçmez (sayfaya gömülen şey budur).
    expect(JSON.stringify(detay)).not.toContain('boş bırakıldı')
  })

  it('metin olmayan değerleri (sayı, nesne, dizi) vitrin anahtarına sızdırmaz', async () => {
    const supabase = stubClient({
      description: { tr: 42, en: { ic: IC_NOT } },
      meta_title: ['dizi'],
      meta_description: 'düz dize (nesne değil)',
    })
    const detay = await getFamilyDetail(supabase, 'jet-serisi', 'tr')

    expect(detay?.family.description).toEqual({})
    expect(detay?.family.meta_title).toBeNull()
    expect(detay?.family.meta_description).toBeNull()
    expect(JSON.stringify(detay)).not.toContain('boş bırakıldı')
  })

  // Bağımsız çürütücü yakaladı (2026-09-17): detay yolu kapanmıştı ama LİSTE yolu
  // (`get_product_families_enriched` → /products, kategori sayfası, marka sayfası) aynı jsonb'yi
  // süzmeden 'use client' bileşenlere veriyordu. Canlı /tr/products HTML'inde `bloklar_tr` 37 kez.
  it('LİSTE yolu da (getFamiliesEnriched) description içindeki depo anahtarlarını taşımaz', async () => {
    const fakeFetch: typeof fetch = async (input) => {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (url.includes('/rpc/get_product_families_enriched')) {
        return jsonResponse([
          {
            id: 'fam-1',
            name: 'JET Serisi',
            slug: 'jet-serisi',
            total_count: 1,
            description: { tr: 'Santrifüj çatı fanları.', bloklar_tr: { Gövde: IC_NOT }, maddeler_tr: ['x'] },
          },
        ])
      }
      if (url.includes('/product_families')) return jsonResponse([{ id: 'fam-1', name_i18n: null }])
      throw new Error('beklenmeyen istek: ' + url)
    }
    const supabase = createClient<Database>('https://ornek.supabase.co', 'anon-anahtar', {
      global: { fetch: fakeFetch },
    })
    const sayfa = await getFamiliesEnriched(supabase, {})

    expect(sayfa.items).toHaveLength(1)
    expect(Object.keys(sayfa.items[0]?.description ?? {})).toEqual(['tr'])
    expect(JSON.stringify(sayfa)).not.toContain('boş bırakıldı')
  })
})

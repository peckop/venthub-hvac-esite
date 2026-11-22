import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCostPayload } from '../productForm.payload'
import ProductFormModal from '../ProductFormModal'

/**
 * YÖNETİCİ FORMU MALİYETİ EZMEZ — REC-140 (2026-09-24), ALT-123 okuyucu geçişi.
 *
 * Maliyet alanları `products`'tan değil `product_costs`'tan okunur (RLS: yalnız yönetici). Moderatör için o satır
 * görünmez, form alanı 0 ile doldurur; her kayıtta alanı yüke geri koyan form maliyeti 0'a çekerdi. Kural:
 * güncelleme/ekleme yükünde maliyet kolonu YALNIZ (a) kullanıcı yönetici ise VE (b) alan değiştiyse bulunur.
 * Sahte istemci PostgREST gibi davranır: YALNIZ istenen kolonları (ve gömmeyi) döndürür.
 */

const KOLONLAR = [
  'purchase_price',
  'purchase_currency',
  'purchase_rate_to_base',
  'cost_in_base',
  'last_purchase_cost',
  'last_purchase_currency',
  'last_purchased_at',
  'supplier_name',
]

const TAM_SATIR: Record<string, unknown> = {
  id: 'p1',
  name: 'Test Fanı',
  brand: 'Vortice',
  sku: 'VRT-001',
  slug: 'test-fani',
  model_code: 'M1',
  category_id: 'c1',
  subcategory_id: null,
  status: 'active',
  is_featured: false,
  description_i18n: { tr: 'açıklama', en: 'description' },
  family_id: null,
  stock_qty: 3,
  low_stock_threshold: 5,
  low_stock_override: null,
  technical_specs: { airflow_m3h: 1200 },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  warehouse_location: 'A-1',
  // Maliyet products'ta DEĞİL, gömülü product_costs'ta (sahte küçük sayı).
  product_costs: { purchase_price: 7 },
}

const sb = vi.hoisted(() => {
  const kayit: {
    secilen: string[]
    guncelleme: Record<string, unknown> | null
    ekleme: Record<string, unknown> | null
  } = { secilen: [], guncelleme: null, ekleme: null }
  const satir: { deger: Record<string, unknown> } = { deger: {} }
  const rol: { deger: string } = { deger: 'admin' }
  const client = {
    from: (tablo: string) => {
      if (tablo === 'categories') {
        return {
          select: () => ({
            order: () => ({
              returns: () => Promise.resolve({ data: [{ id: 'c1', name: 'Fanlar' }], error: null }),
            }),
          }),
        }
      }
      return {
        select: (kolonlar: string) => {
          kayit.secilen.push(kolonlar)
          // Üst düzey virgüllerle böl: `product_costs(purchase_price)` gömmesi tek parça kalır.
          const istenen: string[] = []
          let derin = 0
          let aktif = ''
          for (const c of kolonlar) {
            if (c === '(') derin++
            if (c === ')') derin--
            if (c === ',' && derin === 0) {
              istenen.push(aktif.trim())
              aktif = ''
            } else aktif += c
          }
          istenen.push(aktif.trim())
          const donen: Record<string, unknown> = {}
          for (const k of istenen) {
            const gomme = /^product_costs\(([^)]*)\)$/.exec(k)
            if (gomme) {
              const kaynak = satir.deger.product_costs
              donen.product_costs =
                kaynak && typeof kaynak === 'object'
                  ? Object.fromEntries(
                      gomme[1].split(',').map((a) => a.trim()).filter((a) => a in kaynak).map((a) => [a, (kaynak as Record<string, unknown>)[a]]),
                    )
                  : null
            } else if (k in satir.deger) donen[k] = satir.deger[k]
          }
          return { eq: () => ({ single: () => Promise.resolve({ data: donen, error: null }) }) }
        },
        update: (payload: Record<string, unknown>) => {
          kayit.guncelleme = payload
          return { eq: () => Promise.resolve({ error: null }) }
        },
        insert: (payload: Record<string, unknown>[]) => {
          kayit.ekleme = payload[0] ?? null
          return Promise.resolve({ error: null })
        },
      }
    },
  }
  return { client, kayit, satir, rol }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
// `t` KARARLI olmalı (gerçek sağlayıcıda useMemo): her çağrıda yeni fonksiyon, formun yükleme efektini her
// çizimde yeniden tetikleyip yeni-ürün kolunda sonsuz döngü kurar.
vi.mock('@/i18n/I18nProvider', () => {
  const t = (k: string) => k
  return { useI18n: () => ({ t, lang: 'tr' }) }
})
vi.mock('@/hooks/useRole', () => ({ useRole: () => ({ role: sb.rol.deger, loading: false }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function gonder() {
  const form = document.querySelector('form')
  if (!(form instanceof HTMLFormElement)) throw new Error('form bulunamadı')
  fireEvent.submit(form)
}

beforeEach(() => {
  Object.assign(sb.kayit, { secilen: [], guncelleme: null, ekleme: null })
  sb.rol.deger = 'admin'
  sb.satir.deger = TAM_SATIR
})

describe('ProductFormModal — maliyet yükü', () => {
  it('moderatör kaydı maliyet kolonu GÖNDERMEZ (0 yazıp maliyeti sıfırlamaz)', async () => {
    sb.rol.deger = 'moderator'
    // Moderatör için product_costs satırı RLS ile görünmez → gömme null döner.
    sb.satir.deger = { ...TAM_SATIR, product_costs: null }
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId="p1" open onClose={() => {}} onSuccess={onSuccess} />)

    await waitFor(() => expect(screen.getByDisplayValue('Test Fanı')).toBeInTheDocument())
    gonder()
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    expect(sb.kayit.guncelleme).not.toBeNull()
    const yazilan = Object.keys(sb.kayit.guncelleme ?? {})
    expect(yazilan.filter((k) => KOLONLAR.includes(k))).toEqual([])
  })

  it('admin değiştirmeden kaydı maliyet kolonu GÖNDERMEZ', async () => {
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId="p1" open onClose={() => {}} onSuccess={onSuccess} />)

    await waitFor(() => expect(screen.getByDisplayValue('Test Fanı')).toBeInTheDocument())
    gonder()
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    const yazilan = Object.keys(sb.kayit.guncelleme ?? {})
    expect(yazilan.length).toBeGreaterThan(0)
    expect(yazilan.filter((k) => KOLONLAR.includes(k))).toEqual([])
    // Okuma product_costs gömmesinden yapılır; products'tan düz maliyet kolonu istenmez.
    expect(sb.kayit.secilen.some((k) => k.includes('product_costs(purchase_price)'))).toBe(true)
    const duzOkunan = sb.kayit.secilen.flatMap((k) => k.replace(/product_costs\([^)]*\)/g, '').split(',').map((s) => s.trim()))
    expect(duzOkunan.filter((k) => KOLONLAR.includes(k))).toEqual([])
  })

  it('yeni ürün (insert) yükünde de maliyet kolonu yoktur', async () => {
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId={null} open onClose={() => {}} onSuccess={onSuccess} />)

    fireEvent.change(document.querySelector('input[name="name"]') as HTMLInputElement, { target: { value: 'Yeni Fan' } })
    fireEvent.change(document.querySelector('input[name="sku"]') as HTMLInputElement, { target: { value: 'YNI-001' } })
    fireEvent.change(document.querySelector('input[name="brand"]') as HTMLInputElement, { target: { value: 'Vortice' } })
    await waitFor(() => expect(screen.getByRole('option', { name: 'Fanlar' })).toBeInTheDocument())
    fireEvent.change(document.querySelector('select[name="category_id"]') as HTMLSelectElement, { target: { value: 'c1' } })
    gonder()
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    expect(sb.kayit.ekleme).not.toBeNull()
    expect(Object.keys(sb.kayit.ekleme ?? {}).filter((k) => KOLONLAR.includes(k))).toEqual([])
  })

  it('güncelleme yüküne giden HER alan önce okunmuştur — okunmayan alan boşla ezilemez', async () => {
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId="p1" open onClose={() => {}} onSuccess={onSuccess} />)

    await waitFor(() => expect(screen.getByDisplayValue('Test Fanı')).toBeInTheDocument())
    gonder()
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    const okunan = new Set(sb.kayit.secilen.flatMap((k) => k.split(',').map((s) => s.trim())))
    const yazilan = Object.keys(sb.kayit.guncelleme ?? {})
    expect(yazilan.filter((k) => !okunan.has(k))).toEqual([])
    // Vitrin listesinden bağımsızlığın kanıtı: iki JSONB alan da AYNEN geri gider.
    expect(sb.kayit.guncelleme?.technical_specs).toEqual({ airflow_m3h: 1200 })
    expect(sb.kayit.guncelleme?.description_i18n).toEqual({ tr: 'açıklama', en: 'description' })
  })
})

describe('buildCostPayload — maliyet yükü kuralı', () => {
  it('yönetici + alan değişti → yalnız o alan girer', () => {
    expect(buildCostPayload({ isAdmin: true, purchasePriceDirty: true, purchasePrice: 9 })).toEqual({ purchase_price: 9 })
  })

  it('yönetici ama alan değişmedi → boş', () => {
    expect(buildCostPayload({ isAdmin: true, purchasePriceDirty: false, purchasePrice: 9 })).toEqual({})
    expect(buildCostPayload({ isAdmin: true, purchasePriceDirty: undefined, purchasePrice: 0 })).toEqual({})
  })

  it('yönetici değil → alan değişmiş görünse bile boş', () => {
    expect(buildCostPayload({ isAdmin: false, purchasePriceDirty: true, purchasePrice: 9 })).toEqual({})
  })

  it('geçersiz değer (NaN/undefined) → boş; sessiz 0 yazılmaz', () => {
    expect(buildCostPayload({ isAdmin: true, purchasePriceDirty: true, purchasePrice: Number.NaN })).toEqual({})
    expect(buildCostPayload({ isAdmin: true, purchasePriceDirty: true, purchasePrice: undefined })).toEqual({})
  })
})

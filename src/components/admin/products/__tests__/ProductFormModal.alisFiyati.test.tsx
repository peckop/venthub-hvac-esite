import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ProductFormModal from '../ProductFormModal'

/**
 * YÖNETİCİ FORMU ALIŞ FİYATINI EZMEZ — REC-140 (2026-09-24).
 *
 * Vitrin kolon listesinden (VARIANT_DETAIL_COLUMNS) `purchase_price` çıkarıldı; form o
 * listeyle okumaya devam etseydi alan hiç gelmez, `Number(undefined) || 0` ile 0'a düşer
 * ve kaydet tuşu ürünün alış fiyatını 0'a yazardı — fiyat motorunun girdisi sessizce
 * silinirdi. Sahte istemci PostgREST gibi davranır: YALNIZ istenen kolonları döndürür;
 * yani form yanlış listeyle okursa bu test kırmızı yanar.
 */

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
  supplier_name: 'Tedarikçi',
  purchase_price: 1234.5,
}

const sb = vi.hoisted(() => {
  const kayit: { secilen: string[]; guncelleme: Record<string, unknown> | null } = { secilen: [], guncelleme: null }
  const satir: { deger: Record<string, unknown> } = { deger: {} }
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
          const istenen = kolonlar.split(',').map(k => k.trim())
          const donen = Object.fromEntries(istenen.filter(k => k in satir.deger).map(k => [k, satir.deger[k]]))
          return { eq: () => ({ single: () => Promise.resolve({ data: donen, error: null }) }) }
        },
        update: (payload: Record<string, unknown>) => {
          kayit.guncelleme = payload
          return { eq: () => Promise.resolve({ error: null }) }
        },
        insert: () => Promise.resolve({ error: null }),
      }
    },
  }
  return { client, kayit, satir }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/i18n/I18nProvider', () => ({ useI18n: () => ({ t: (k: string) => k, lang: 'tr' }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('ProductFormModal — düzenle ve kaydet alış fiyatını korur', () => {
  it('yüklenen purchase_price güncelleme yüküne AYNEN gider (0 ya da null değil)', async () => {
    sb.satir.deger = TAM_SATIR
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId="p1" open onClose={() => {}} onSuccess={onSuccess} />)

    await waitFor(() => expect(screen.getByDisplayValue('Test Fanı')).toBeInTheDocument())
    const form = document.querySelector('form')
    if (!(form instanceof HTMLFormElement)) throw new Error('form bulunamadı')
    fireEvent.submit(form)

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(sb.kayit.secilen.some(k => k.split(',').map(s => s.trim()).includes('purchase_price'))).toBe(true)
    expect(sb.kayit.guncelleme).not.toBeNull()
    expect(sb.kayit.guncelleme?.purchase_price).toBe(1234.5)
  })

  it('güncelleme yüküne giden HER alan önce okunmuştur — okunmayan alan boşla ezilemez', async () => {
    sb.satir.deger = TAM_SATIR
    // Object.assign: doğrudan `= null` ataması TS'te alanı `null`a daraltır, sonraki okumalar `never` olur.
    Object.assign(sb.kayit, { secilen: [], guncelleme: null })
    const onSuccess = vi.fn()
    render(<ProductFormModal _productId="p1" open onClose={() => {}} onSuccess={onSuccess} />)

    await waitFor(() => expect(screen.getByDisplayValue('Test Fanı')).toBeInTheDocument())
    const form = document.querySelector('form')
    if (!(form instanceof HTMLFormElement)) throw new Error('form bulunamadı')
    fireEvent.submit(form)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    const okunan = new Set(sb.kayit.secilen.flatMap(k => k.split(',').map(s => s.trim())))
    const yazilan = Object.keys(sb.kayit.guncelleme ?? {})
    expect(yazilan.filter(k => !okunan.has(k))).toEqual([])
    // Vitrin listesinden bağımsızlığın kanıtı: iki JSONB alan da AYNEN geri gider.
    expect(sb.kayit.guncelleme?.technical_specs).toEqual({ airflow_m3h: 1200 })
    expect(sb.kayit.guncelleme?.description_i18n).toEqual({ tr: 'açıklama', en: 'description' })
  })
})

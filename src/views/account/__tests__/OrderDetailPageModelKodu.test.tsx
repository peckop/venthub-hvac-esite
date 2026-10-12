/**
 * URN-32 — sipariş detayında kalem başına GÜNCEL katalog model kodu (`products.model_code`) görünür;
 * ham SKU (sipariş-anı `product_sku_snapshot` dahil) ASLA görünmez (INV-SKU-GORUNMEZ-1).
 *
 * Hata yolları kilitli: ürün satırı gelmediyse (`products: null`, RLS/boş), kod boş/boşluksa ya da
 * gömme dizi döndüyse satır HİÇ çizilmez ve SKU'ya düşülmez.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tr } from '@/i18n/dictionaries/tr'

const secimler: string[] = []
let kalemler: Record<string, unknown>[] = []

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: (k: string) => (k === 'id' ? 'ord1' : null) }),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'u@u.com', user_metadata: {} }, loading: false }),
}))

vi.mock('../../../hooks/useCartHook', () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}))

vi.mock('../../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({
    legacyProduct: (pid: string) => `/tr/products/${pid}`,
    cart: () => '/tr/cart',
    account: { orders: () => '/tr/account/orders', orderDetail: (o: string) => `/tr/account/orders/detail?id=${o}`, returns: () => '/tr/account/returns' },
    auth: { login: (n: string) => `/tr/auth/login?next=${n}` },
  }),
}))

// Gerçek TR sözlüğü: anahtar yoksa ham anahtar görünür ve test kırılır.
vi.mock('../../../i18n/I18nProvider', () => {
  const coz = (yol: string): string => {
    let d: unknown = tr
    for (const parca of yol.split('.')) d = (d as Record<string, unknown> | undefined)?.[parca]
    return typeof d === 'string' ? d : yol
  }
  return {
    useI18n: () => ({
      lang: 'tr',
      t: (k: string, p?: Record<string, string | number>) =>
        Object.entries(p ?? {}).reduce((m, [a, b]) => m.replaceAll(`{{${a}}}`, String(b)), coz(k)),
    }),
  }
})

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {
    from: () => ({
      select: (kolonlar: string) => {
        secimler.push(kolonlar)
        return {
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'ord1',
                  total_amount: 500,
                  status: 'paid',
                  created_at: '2026-10-01T10:00:00Z',
                  customer_name: 'Ayşe',
                  customer_email: 'ayse@example.com',
                  shipping_address: {},
                  order_number: 'VH-1',
                  venthub_order_items: kalemler,
                },
                error: null,
              }),
          }),
        }
      },
    }),
  },
}))

import OrderDetailPage from '../OrderDetailPage'

const kalem = (id: string, ad: string, urunler: unknown): Record<string, unknown> => ({
  id,
  product_id: `pid-${id}`,
  quantity: 1,
  product_image_url: null,
  product_name_snapshot: ad,
  unit_price_snapshot: 100,
  // Sorgu bunu artık İSTEMİYOR; yine de gelse ekrana basılmamalı (savunma).
  product_sku_snapshot: `VRT-${id}`,
  products: urunler,
})

async function kalemlerSekmesi() {
  render(<OrderDetailPage />)
  fireEvent.click(await screen.findByRole('button', { name: tr.orders.tabs.items }))
  return screen.findAllByRole('row')
}

beforeEach(() => {
  secimler.length = 0
  kalemler = []
})

describe('OrderDetailPage: kalemde model kodu, SKU yok (URN-32)', () => {
  it('kodu olan kalemde "Model Kodu: …" ad altında görünür; SKU hiçbir yerde yok', async () => {
    kalemler = [kalem('1', 'Vortice QE 60 LL T', { model_code: 'QE 60 LL' })]
    const satirlar = await kalemlerSekmesi()

    const satir = satirlar.find((s) => s.textContent?.includes('Vortice QE 60 LL T'))
    expect(satir?.textContent).toContain(`${tr.orders.modelCodeLabel.replace('{{code}}', 'QE 60 LL')}`)
    expect(satir?.textContent).toContain('Model Kodu: QE 60 LL')
    expect(document.body.textContent).not.toMatch(/VRT-/)
    expect(document.body.textContent).not.toMatch(/SKU/i)
  })

  it('sorgu ürünün model_code kolonunu gömer ve product_sku_snapshot kolonunu İSTEMEZ', async () => {
    kalemler = [kalem('1', 'Ürün A', { model_code: 'MC-1' })]
    await kalemlerSekmesi()
    expect(secimler.join('\n')).toMatch(/products\s*\(\s*model_code\s*\)/)
    expect(secimler.join('\n')).not.toMatch(/sku/i)
  })

  it.each([
    ['ürün satırı gelmedi (null: RLS/boş)', null],
    ['kod null', { model_code: null }],
    ['kod boş dize', { model_code: '' }],
    ['kod yalnız boşluk', { model_code: '   ' }],
    ['gömme beklenmedik dizi ve boş', []],
    ['gömme düz dize (bozuk veri)', 'x'],
  ])('kod yok → satır HİÇ çizilmez, SKU\'ya düşülmez: %s', async (_ad, urunler) => {
    kalemler = [kalem('2', 'Ürün B', urunler)]
    const satirlar = await kalemlerSekmesi()

    const satir = satirlar.find((s) => s.textContent?.includes('Ürün B'))
    expect(satir).toBeTruthy()
    expect(satir?.textContent).not.toContain('Model Kodu')
    expect(document.body.textContent).not.toMatch(/VRT-/)
  })

  it('gömme dizi gelirse ilk elemanın kodu kullanılır; karışık kalemler bağımsız çizilir', async () => {
    kalemler = [
      kalem('3', 'Ürün C', [{ model_code: 'MC-DIZI' }]),
      kalem('4', 'Ürün D', null),
    ]
    const satirlar = await kalemlerSekmesi()
    const c = satirlar.find((s) => s.textContent?.includes('Ürün C'))
    const d = satirlar.find((s) => s.textContent?.includes('Ürün D'))
    expect(c?.textContent).toContain('Model Kodu: MC-DIZI')
    expect(d?.textContent).not.toContain('Model Kodu')
  })
})

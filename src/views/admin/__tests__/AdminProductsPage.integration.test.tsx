import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'
import { testA11y } from '@/utils/testA11y'

import AdminProductsPage from '../AdminProductsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  // terim-yok yolu (varsayılan): products select→order→range → {data,count,error}
  const productsData = [
    {
      id: 'p1aaaa11bbbb2222',
      name: 'Kanal Tipi Fan',
      sku: 'FAN-001',
      model_code: 'KTF-900',
      brand: 'AVenS',
      status: 'active',
      category_id: 'c1',
      stock_qty: 42,
      low_stock_threshold: 10,
      is_featured: true,
      slug: 'kanal-tipi-fan',
    },
    {
      id: 'p2cccc33dddd4444',
      name: 'Hız Kontrol Cihazı',
      sku: 'HKC-200',
      model_code: 'HK-2',
      brand: 'AVenS',
      status: 'inactive',
      category_id: 'c2',
      stock_qty: 3,
      low_stock_threshold: 10,
      is_featured: false,
      slug: 'hiz-kontrol-cihazi',
    },
  ]
  const categoriesData = [
    { id: 'c1', name: 'Fanlar' },
    { id: 'c2', name: 'Kontrol' },
  ]

  // products server-mode zinciri: select(...).eq/.in/.order(...).range() → {data,count,error}
  const productsChain = {
    eq() {
      return productsChain
    },
    in() {
      return productsChain
    },
    order() {
      return productsChain
    },
    range() {
      return Promise.resolve({ data: productsData, count: productsData.length, error: null })
    },
  }

  // categories tek-seferlik fetch: select('id,name').order('name',{ascending}) → doğrudan await
  const categoriesChain = {
    order() {
      return Promise.resolve({ data: categoriesData, count: categoriesData.length, error: null })
    },
  }

  // product_images kapak fetch: select(...).in(...).order(...) → {data}
  const productImagesChain = {
    in() {
      return productImagesChain
    },
    order() {
      return Promise.resolve({ data: [], error: null })
    },
  }

  // products technical_specs (expanded row): select('technical_specs').eq(...).maybeSingle()
  const techSpecsChain = {
    eq() {
      return techSpecsChain
    },
    maybeSingle() {
      return Promise.resolve({ data: { technical_specs: {} }, error: null })
    },
  }

  // product_prices satış fiyatı: select(...).in(...).eq(...)x3 → await {data,error}.
  // p1 → Standart listede satış satırı VAR; p2 → YOK (teklif). `fiyatHatasi` okunamama yolunu açar.
  const durum = { fiyatHatasi: false, productsSelect: [] as string[], fiyatSelect: [] as string[] }
  const productPricesChain = {
    in() {
      return productPricesChain
    },
    eq() {
      return productPricesChain
    },
    then(res: (v: unknown) => unknown) {
      return Promise.resolve(
        durum.fiyatHatasi
          ? { data: null, error: { message: 'izin yok' } }
          : {
              data: [{ product_id: 'p1aaaa11bbbb2222', gross_price: 2399.88, price_lists: { user_type: 'individual' } }],
              error: null,
            },
      ).then(res)
    },
  }

  const client = {
    from(table: string) {
      if (table === 'product_prices') {
        return {
          select(cols: string) {
            durum.fiyatSelect.push(cols)
            return productPricesChain
          },
        }
      }
      if (table === 'categories') {
        return {
          select() {
            return categoriesChain
          },
        }
      }
      if (table === 'product_images') {
        return {
          select() {
            return productImagesChain
          },
        }
      }
      // products — terim-yok liste zinciri; technical_specs ayrı select string'i de aynı
      return {
        select(cols: string) {
          if (cols === 'technical_specs') return techSpecsChain
          durum.productsSelect.push(cols)
          return productsChain
        },
        update() {
          return { in: () => Promise.resolve({ error: null }), eq: () => Promise.resolve({ error: null }) }
        },
        delete() {
          return { in: () => Promise.resolve({ error: null }), eq: () => Promise.resolve({ error: null }) }
        },
      }
    },
  }
  return { productsData, categoriesData, client, durum }
})

vi.mock('@/lib/services/product.service', () => ({
  adminSearchProducts: () => Promise.resolve([]),
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/products',
}))

describe('AdminProductsPage (kit göçü) — integration + a11y', () => {
  it('ürünleri render eder + varsayılan sıralı başlıkta aria-sort taşır', async () => {
    render(
    <ConfirmProvider>
      <AdminProductsPage />
    </ConfirmProvider>
  )
    // server fetcher (terim-yok) çözülünce ürün adı satırları görünür
    await screen.findByText('Kanal Tipi Fan')
    await screen.findByText('Hız Kontrol Cihazı')

    const headers = screen.getAllByRole('columnheader')
    // initialSort name:asc → 'name' başlığı aria-sort='ascending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'ascending')).toBe(true)
    // diğer sıralanabilir başlık aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  /* ⭐FİYAT SÜTUNU SATIŞ SATIRINDAN (2026-09-24). Emekli `products.price` gösteriliyor ve ona
     yazılıyordu; vitrin onu okumuyor. Bu üç test o kusurun üç yüzünü ayrı ayrı kilitler. */
  it('fiyat sütunu Standart listenin KDV dahil satış fiyatını gösterir; satırı olmayan ürün "teklif"', async () => {
    sb.durum.fiyatHatasi = false
    render(
      <ConfirmProvider>
        <AdminProductsPage />
      </ConfirmProvider>,
    )
    await screen.findByText('Kanal Tipi Fan')
    // p1: 2399.88 satış satırından (formatCurrency tr → "2.399,88")
    expect(await screen.findByText(/2\.399,88/)).toBeTruthy()
    // p2: satış satırı yok → teklif; "0" ya da emekli değer DEĞİL
    expect(screen.getByText('admin.products.table.priceQuote')).toBeTruthy()
    // fiyat okuması bireysel listeye süzülmüş olmalı (display_price'ın herkese açık kolu)
    expect(sb.durum.fiyatSelect.at(-1)).toContain('price_lists!inner(user_type)')
  })

  it('ürün sorgusu emekli price ve maliyet kolonlarını ÇEKMEZ', async () => {
    render(
      <ConfirmProvider>
        <AdminProductsPage />
      </ConfirmProvider>,
    )
    await screen.findByText('Kanal Tipi Fan')
    const cols = (sb.durum.productsSelect.at(-1) ?? '').split(',').map((c) => c.trim())
    expect(cols).not.toContain('price')
    expect(cols).not.toContain('purchase_price')
    expect(cols).toContain('stock_qty')
  })

  it('fiyat okunamazsa hücre "okunamadı" der — "teklif" DEMEZ (yanlış bilgi olurdu)', async () => {
    sb.durum.fiyatHatasi = true
    render(
      <ConfirmProvider>
        <AdminProductsPage />
      </ConfirmProvider>,
    )
    await screen.findByText('Kanal Tipi Fan')
    expect((await screen.findAllByText('admin.products.table.priceUnreadable')).length).toBe(2)
    expect(screen.queryByText('admin.products.table.priceQuote')).toBeNull()
    sb.durum.fiyatHatasi = false
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(
    <ConfirmProvider>
      <AdminProductsPage />
    </ConfirmProvider>
  )
    await screen.findByText('Kanal Tipi Fan')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

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
      price: 1999.9,
      purchase_price: 1499.5,
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
      price: 850,
      purchase_price: 600,
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

  const client = {
    from(table: string) {
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
  return { productsData, categoriesData, client }
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

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminMovementsPage from '../AdminMovementsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  // embedded inner-join satırları: products tek-nesne (to-one), kit'te product'a düzleşir
  const movementsData = [
    {
      id: 'm1',
      product_id: 'p1',
      delta: 12,
      reason: 'po_receipt',
      order_id: 'ORDER-AAAA1111BBBB2222',
      created_at: '2026-06-12T09:00:00.000Z',
      batch_id: null,
      products: { id: 'p1', name: 'Kanal Tipi Fan', sku: 'FAN-001', category_id: 'c1' },
    },
    {
      id: 'm2',
      product_id: 'p2',
      delta: -5,
      reason: 'sale',
      order_id: null,
      created_at: '2026-06-11T09:00:00.000Z',
      batch_id: null,
      products: { id: 'p2', name: 'Hız Kontrol Cihazı', sku: 'HKC-200', category_id: 'c2' },
    },
  ]
  const categoriesData = [
    { id: 'c1', name: 'Fanlar' },
    { id: 'c2', name: 'Kontrol' },
  ]

  // movements server-mode zinciri: select(...).order(...).or/.eq(foreignTable)/.in/.gte/.lte(...).range() → {data,count,error}
  const movementsChain = {
    order() {
      return movementsChain
    },
    or() {
      return movementsChain
    },
    eq() {
      return movementsChain
    },
    in() {
      return movementsChain
    },
    gte() {
      return movementsChain
    },
    lte() {
      return movementsChain
    },
    range() {
      return Promise.resolve({ data: movementsData, count: movementsData.length, error: null })
    },
  }

  // categories tek-seferlik fetch: select('id,name').order('name',{ascending}) → doğrudan await
  const categoriesChain = {
    order() {
      return Promise.resolve({ data: categoriesData, count: categoriesData.length, error: null })
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
      return {
        select() {
          return movementsChain
        },
      }
    },
    channel() {
      const channel = {
        on() {
          return channel
        },
        subscribe() {
          return channel
        },
      }
      return channel
    },
    removeChannel() {},
  }
  return { movementsData, categoriesData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/hooks/useTenant', () => ({ useTenant: () => ({ id: 'tenant-1' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => false, canAccess: () => true, isReadOnly: true, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/movements',
}))

describe('AdminMovementsPage (kit göçü) — integration + a11y', () => {
  it('hareketleri render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminMovementsPage />)
    // server fetcher çözülünce satırlar (embedded product.name) görünür
    await screen.findByText('Kanal Tipi Fan')
    await screen.findByText('Hız Kontrol Cihazı')

    const headers = screen.getAllByRole('columnheader')
    // initialSort date:desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlık (product) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminMovementsPage />)
    await screen.findByText('Kanal Tipi Fan')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

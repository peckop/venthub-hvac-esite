import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminReturnsPage from '../AdminReturnsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const returnsData = [
    {
      id: 'r1',
      order_id: 'o-aaaaaaaa1111',
      user_id: 'u1',
      reason: 'Hasarlı ürün',
      description: 'Kutu ezik geldi',
      status: 'requested',
      created_at: '2026-06-10T08:00:00.000Z',
      updated_at: '2026-06-10T08:00:00.000Z',
      venthub_orders: {
        order_number: 'VH-100200',
        customer_name: 'Ayşe Yılmaz',
        customer_email: 'ayse@example.com',
        total_amount: 4500,
      },
    },
    {
      id: 'r2',
      order_id: 'o-bbbbbbbb2222',
      user_id: 'u2',
      reason: 'Yanlış ürün',
      description: null,
      status: 'approved',
      created_at: '2026-06-09T08:00:00.000Z',
      updated_at: '2026-06-09T08:00:00.000Z',
      venthub_orders: {
        order_number: 'VH-100201',
        customer_name: 'Mehmet Demir',
        customer_email: 'mehmet@example.com',
        total_amount: 1200,
      },
    },
  ]
  // client-mode / server-mode zinciri
  const selectChain: any = {
    eq() { return selectChain },
    in() { return selectChain },
    or() { return selectChain },
    order() { return selectChain },
    range() { return Promise.resolve({ data: returnsData, error: null, count: returnsData.length }) },
    limit() { return Promise.resolve({ data: returnsData, error: null }) },
    then(onfulfilled: any) {
      return Promise.resolve({ data: returnsData, error: null, count: returnsData.length }).then(onfulfilled)
    }
  }
  const updateChain = {
    eq() {
      return Promise.resolve({ error: null })
    },
  }
  const client = {
    from() {
      return {
        select(projection?: string) {
          if (projection === 'status') {
            return Promise.resolve({ data: returnsData.map(r => ({ status: r.status })), error: null })
          }
          return selectChain
        },
        update() {
          return updateChain
        },
      }
    },
    functions: {
      invoke() {
        return Promise.resolve({ data: null, error: null })
      },
    },
    auth: {
      getSession() {
        return Promise.resolve({ data: { session: { user: { id: 'u1' } } } })
      },
      getUser() {
        return Promise.resolve({ data: { user: { id: 'u1' } } })
      },
    },
  }
  return { returnsData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/supabase', () => ({ supabase: sb.client }))
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
  usePathname: () => '/admin/returns',
}))

describe('AdminReturnsPage (kit göçü) — integration + a11y', () => {
  it('iade satırlarını render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminReturnsPage />)
    // client fetcher çözülünce satırlar görünür (düzleştirilmiş join alanları)
    await screen.findByText('Ayşe Yılmaz')
    await screen.findByText('Mehmet Demir')

    const headers = screen.getAllByRole('columnheader')
    // initialSort created_at:desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlıklar (order/customer/...) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminReturnsPage />)
    await screen.findByText('Ayşe Yılmaz')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

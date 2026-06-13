import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminOrdersPage from '../AdminOrdersPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const ordersData = [
    {
      id: 'o1aaaa11bbbb2222',
      status: 'confirmed',
      conversation_id: 'conv-1',
      total_amount: 1500,
      created_at: '2026-06-12T09:00:00.000Z',
      order_number: 'VH-2026-0001',
      customer_name: 'Ahmet Yılmaz',
      customer_email: 'ahmet@example.com',
      customer_phone: '+90 555 111 2233',
    },
    {
      id: 'o2cccc33dddd4444',
      status: 'shipped',
      conversation_id: 'conv-2',
      total_amount: 3200,
      created_at: '2026-06-11T09:00:00.000Z',
      order_number: 'VH-2026-0002',
      customer_name: 'Ayşe Demir',
      customer_email: 'ayse@example.com',
      customer_phone: '+90 555 444 5566',
    },
  ]

  // view_admin_orders server-mode zinciri:
  // select(...).order(...).ilike/.eq/.in/.is/.gte/.lte(...).range() → {data,count,error}
  const ordersChain = {
    order() {
      return ordersChain
    },
    ilike() {
      return ordersChain
    },
    eq() {
      return ordersChain
    },
    in() {
      return ordersChain
    },
    is() {
      return ordersChain
    },
    gte() {
      return ordersChain
    },
    lte() {
      return ordersChain
    },
    range() {
      return Promise.resolve({ data: ordersData, count: ordersData.length, error: null })
    },
  }

  // venthub_orders prefill: select('carrier, tracking_number').eq('id', ...).maybeSingle()
  const venthubChain = {
    eq() {
      return venthubChain
    },
    maybeSingle() {
      return Promise.resolve({ data: { carrier: null, tracking_number: null }, error: null })
    },
  }

  const client = {
    from(table: string) {
      if (table === 'venthub_orders') {
        return {
          select() {
            return venthubChain
          },
        }
      }
      return {
        select() {
          return ordersChain
        },
      }
    },
    functions: { invoke: vi.fn().mockResolvedValue({ error: null }) },
  }
  return { ordersData, client }
})

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
  usePathname: () => '/admin/orders',
}))

describe('AdminOrdersPage (kit göçü) — integration + a11y', () => {
  it('siparişleri render eder + varsayılan sıralı başlıkta aria-sort taşır', async () => {
    render(<AdminOrdersPage />)
    // server fetcher çözülünce order_number satırları görünür
    await screen.findByText('VH-2026-0001')
    await screen.findByText('VH-2026-0002')

    const headers = screen.getAllByRole('columnheader')
    // initialSort created:desc → 'created' başlığı aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlık aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminOrdersPage />)
    await screen.findByText('VH-2026-0001')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

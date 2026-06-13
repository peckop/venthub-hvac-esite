import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminErrorGroupsPage from '../AdminErrorGroupsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const groupsData = [
    {
      id: 'g1111111-aaaa',
      signature: 'TypeError: x is undefined',
      level: 'error',
      last_message: 'Cannot read properties of undefined',
      url_sample: '/checkout',
      env: 'production',
      release: 'v1.2.3',
      first_seen: '2026-06-01T08:00:00.000Z',
      last_seen: '2026-06-10T08:00:00.000Z',
      count: 42,
      status: 'open',
      assigned_to: null,
      notes: null,
    },
    {
      id: 'g2222222-bbbb',
      signature: 'Warning: slow render',
      level: 'warn',
      last_message: 'Render took 1200ms',
      url_sample: '/cart',
      env: 'production',
      release: 'v1.2.3',
      first_seen: '2026-06-02T08:00:00.000Z',
      last_seen: '2026-06-09T08:00:00.000Z',
      count: 7,
      status: 'resolved',
      assigned_to: null,
      notes: null,
    },
  ]
  // server-mode zinciri: select(...).order(...).eq/is/gte/lte/or(...).range() → {data, count, error}
  const queryChain = {
    order() {
      return queryChain
    },
    eq() {
      return queryChain
    },
    is() {
      return queryChain
    },
    gte() {
      return queryChain
    },
    lte() {
      return queryChain
    },
    or() {
      return queryChain
    },
    range() {
      return Promise.resolve({ data: groupsData, count: groupsData.length, error: null })
    },
  }
  const updateChain = {
    eq() {
      return Promise.resolve({ error: null })
    },
    in() {
      return Promise.resolve({ error: null })
    },
  }
  // genişleyen satır client_errors zinciri
  const clientErrorsChain = {
    eq() {
      return clientErrorsChain
    },
    order() {
      return clientErrorsChain
    },
    limit() {
      return Promise.resolve({ data: [], error: null })
    },
  }
  const channel = {
    on() {
      return channel
    },
    subscribe() {
      return channel
    },
  }
  const client = {
    from(table: string) {
      return {
        select() {
          return table === 'client_errors' ? clientErrorsChain : queryChain
        },
        update() {
          return updateChain
        },
      }
    },
    rpc() {
      return Promise.resolve({ data: [], error: null })
    },
    channel() {
      return channel
    },
    removeChannel() {},
  }
  return { groupsData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/hooks/useTenant', () => ({ useTenant: () => ({ id: 'tenant-1' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/error-groups',
}))

describe('AdminErrorGroupsPage (kit göçü) — integration + a11y', () => {
  it('hata gruplarını render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminErrorGroupsPage />)
    // server fetcher çözülünce satırlar görünür
    await screen.findByText('TypeError: x is undefined')
    await screen.findByText('Warning: slow render')

    const headers = screen.getAllByRole('columnheader')
    // initialSort last_seen:desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlık (count) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminErrorGroupsPage />)
    await screen.findByText('TypeError: x is undefined')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})

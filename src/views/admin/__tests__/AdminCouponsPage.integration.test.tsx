import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminCouponsPage from '../AdminCouponsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const couponsData = [
    {
      id: 'c1',
      code: 'VENT25',
      discount_type: 'percentage',
      discount_value: 25,
      valid_from: null,
      valid_until: null,
      is_active: true,
      usage_limit: null,
      used_count: 0,
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'c2',
      code: 'KIS10',
      discount_type: 'fixed_amount',
      discount_value: 100,
      valid_from: null,
      valid_until: '2026-12-31T00:00:00.000Z',
      is_active: false,
      usage_limit: 50,
      used_count: 5,
      created_at: '2026-02-01T00:00:00.000Z',
    },
  ]
  const selectChain = {
    order() {
      return selectChain
    },
    limit() {
      return Promise.resolve({ data: couponsData, error: null })
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
  const channelMock = {
    on() {
      return channelMock
    },
    subscribe() {
      return channelMock
    },
  }
  const client = {
    channel() {
      return channelMock
    },
    removeChannel() {
      return Promise.resolve()
    },
    from() {
      return {
        select() {
          return selectChain
        },
        update() {
          return updateChain
        },
      }
    },
    functions: {
      invoke() {
        return Promise.resolve({ data: couponsData[0], error: null })
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
  return { couponsData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/hooks/useTenant', () => ({
  useTenant: () => ({ id: 'tenant-test-id', name: 'Test Tenant', subdomain: 'test', custom_domain: null, is_active: true, features: {}, styles: {} }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/coupons',
}))

describe('AdminCouponsPage (kit göçü) — integration + a11y', () => {
  it('kuponları render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminCouponsPage />)
    // fetcher çözülünce satır görünür
    await screen.findByText('VENT25')
    await screen.findByText('KIS10')

    const headers = screen.getAllByRole('columnheader')
    // initialSort created_at desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlıklar (code/value) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminCouponsPage />)
    await screen.findByText('VENT25')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
